const util = require('util');
const EventEmitter = require('events').EventEmitter;

const Unpi = require('unpi');
const Serialport = require('serialport');
const debug = require('debug')('cc-znp');
const logSreq = require('debug')('cc-znp:SREQ');
const logSrsp = require('debug')('cc-znp:SRSP');
const logAreq = require('debug')('cc-znp:AREQ');

const zmeta = require('./zmeta');
const ZpiObject = require('./zpiObject');

const MT = {
    CMDTYPE: zmeta.CmdType,
    SUBSYS: zmeta.Subsys,
    SYS: zmeta.SYS,
    MAC: zmeta.MAC,
    AF: zmeta.AF,
    ZDO: zmeta.ZDO,
    SAPI: zmeta.SAPI,
    UTIL: zmeta.UTIL,
    DBG: zmeta.DBG,
    APP: zmeta.APP,
};

/*
    Polyfill
*/
if (!EventEmitter.prototype.listenerCount ) {
    EventEmitter.prototype.listenerCount = function(type) {
        const events = this._events;

        if (events) {
            const evlistener = events[type];

            if (typeof evlistener === 'function') {
                return 1;
            }

            if (evlistener) {
                return evlistener.length;
            }
        }

        return 0;
    };
}

/*
    CcZnp Class
*/
function CcZnp() {
    EventEmitter.call(this);

    const self = this;

    // export constant
    this.MT = MT;

    this._init = false;
    this._resetting = false;
    this._sp = null;
    this._unpi = null;
    this._spinLock = false;
    this._txQueue = [];

    this.on('_ready', function() {
        self._init = true;
        self.emit('ready');
    });

    this._innerListeners = {
        spOpen: function() {
            debug('The serialport ' + self._sp.path + ' is opened.');
            self.emit('_ready');
        },
        spErr: function(err) {
            self._sp.close();
        },
        spClose: function() {
            debug('The serialport ' + self._sp.path + ' is closed.');
            self._txQueue = null;
            self._txQueue = [];
            self._sp = null;
            self._unpi = null;
            self._init = false;
            self.emit('close');
        },
        parseMtIncomingData: function(result) {
            self._parseMtIncomingData(result);
        },
    };
}

util.inherits(CcZnp, EventEmitter);

const ccznp = new CcZnp();

/*
    Public APIs
*/
CcZnp.prototype.init = function(spCfg, callback) {
    if (typeof spCfg !== 'object' || Array.isArray(spCfg)) {
        throw new TypeError('spCfg should be a plain object.');
    }

    if (!spCfg.options) {
        spCfg.options = {
            autoOpen: false,
        };
    } else {
        spCfg.options.autoOpen = false;
    }

    callback = callback || function() {};

    const sp = this._sp = (this._sp instanceof Serialport) ? this._sp : new Serialport(spCfg.path, spCfg.options);
    const unpi = this._unpi = (this._unpi instanceof Unpi) ? this._unpi : new Unpi({
        lenBytes: 1,
        phy: sp,
    });

    // Listeners for inner use
    const parseMtIncomingData = this._innerListeners.parseMtIncomingData;
    const spOpenLsn = this._innerListeners.spOpen;
    const spErrLsn = this._innerListeners.spErr;
    const spCloseLsn = this._innerListeners.spClose;

    if (!sp) {
        throw new Error('Cannot initialize serial port.');
    }

    if (!unpi) {
        throw new Error('Cannot initialize unpi.');
    }

    // remove all inner listeners were attached on last init
    unpi.removeListener('data', parseMtIncomingData);
    sp.removeListener('open', spOpenLsn);
    sp.removeListener('error', spErrLsn);
    sp.removeListener('close', spCloseLsn);

    // re-attach inner listeners
    unpi.on('data', parseMtIncomingData);
    sp.once('open', spOpenLsn);

    sp.open(function(err) {
        if (err) return callback(err);

        sp.on('error', spErrLsn);
        sp.on('close', spCloseLsn);
        callback(null);
    });
};

CcZnp.prototype.close = function(callback) {
    const self = this;

    if (this._init) {
        this._sp.flush(function() {
            self._sp.close(callback);
        });
    } else {
        callback(null);
    }
};

CcZnp.prototype.request = function(subsys, cmd, valObj, callback) {
    // subsys: String | Number, cmd: String | Number, valObj: Object | Array
    const self = this;
    let argObj;

    if (!this._init) {
        throw new Error('ccznp has not been initialized yet');
    }

    if (this._spinLock) {
        this._txQueue.push(function() {
            self.request(subsys, cmd, valObj, callback);
        });
        return;
    }

    // prepare for transmission
    this._spinLock = true;

    // validations
    if (!valObj || typeof valObj !== 'object') {
        throw new TypeError('valObj should be an object');
    } else if ((typeof callback !== 'function') && (typeof callback !== 'undefined')) {
        throw new TypeError('callback should be a function');
    } else {
        argObj = new ZpiObject(subsys, cmd, valObj);
    }

    if (argObj.type === 'SREQ') {
        logSreq('--> %s, %o', argObj.subsys + ':' + argObj.cmd, valObj);
        return this._sendSREQ(argObj, callback);
    } else if (argObj.type === 'AREQ') {
        logAreq('--> %s, %o', argObj.subsys + ':' + argObj.cmd, valObj);
        return this._sendAREQ(argObj, callback);
    }
};

CcZnp.prototype.sendCmd = function(type, subsys, cmdId, payload) {
    return this._unpi.send(type, subsys, cmdId, payload);
};

/*
    Create Request Shorthands
*/
// example: ccznp.sysRequest(), ccznp.zdoRequest()
const namespaces = [
    'SYS',
    'MAC',
    'NWK',
    'AF',
    'ZDO',
    'SAPI',
    'UTIL',
    'DBG',
    'APP',
    'DEBUG',
];

namespaces.forEach(function(subsys) {
    const reqMethod = subsys.toLowerCase() + 'Request';
    CcZnp.prototype[reqMethod] = function(cmdId, valObj, callback) {
        return this.request(subsys, cmdId, valObj, callback);
    };
});

/*
    Protected Methods
*/
CcZnp.prototype._sendSREQ = function(argObj, callback) {
    // subsys: String, cmd: String
    const self = this;
    const payload = argObj.frame();
    let sreqTimeout;
    const srspEvt = 'SRSP:' + argObj.subsys + ':' + argObj.cmd;

    if (!payload) {
        callback(new Error('Fail to build frame'));
        return;
    }

    sreqTimeout = setTimeout(function() {
        if (self.listenerCount(srspEvt)) {
            self.emit(srspEvt, '__timeout__');
        }

        sreqTimeout = null;
    }, 3000);

    // attach response listener
    this.once(srspEvt, function(result) {
        self._spinLock = false;

        // clear timeout controller if it is there
        if (sreqTimeout) {
            clearTimeout(sreqTimeout);
            sreqTimeout = null;
        }

        // schedule next transmission if something in txQueue
        self._scheduleNextSend();

        // check if this event is fired by timeout controller
        if (result === '__timeout__') {
            logSrsp('<-- %s, __timeout__', argObj.subsys + ':' + argObj.cmd);
            callback(new Error('request timeout'));
        } else {
            self._resetting = false;
            callback(null, result);
        }
    });

    this._unpi.send('SREQ', argObj.subsys, argObj.cmdId, payload);
};

CcZnp.prototype._sendAREQ = function(argObj, callback) {
    // subsys: String, cmd: String
    const self = this;
    const payload = argObj.frame();

    if (!payload) {
        callback(new Error('Fail to build frame'));
        return;
    }

    if (argObj.cmd === 'resetReq' || argObj.cmd === 'systemReset') {
        this._resetting = true;
        // clear all pending requests, since the system is reset
        this._txQueue = null;
        this._txQueue = [];

        this.once('AREQ:SYS:RESET', function() {
            // hold the lock until coordinator reset completed
            self._resetting = false;
            self._spinLock = false;
            callback(null);
        });

        // if AREQ:SYS:RESET does not return in 30 sec
        // release the lock to avoid the requests from enqueuing
        setTimeout(function() {
            if (self._resetting) {
                self._spinLock = false;
            }
        }, 30000);
    } else {
        this._spinLock = false;
        this._scheduleNextSend();
        callback(null);
    }

    this._unpi.send('AREQ', argObj.subsys, argObj.cmdId, payload);
};

CcZnp.prototype._scheduleNextSend = function() {
    const txQueue = this._txQueue;

    if (txQueue.length) {
        process.nextTick(function() {
            txQueue.shift()();
        });
    }
};

CcZnp.prototype._parseMtIncomingData = function(data) {
    // data = { sof, len, type, subsys, cmd, payload, fcs, csum }
    const self = this;
    let argObj;

    this.emit('data', data);

    try {
        if (data.fcs !== data.csum) {
            throw new Error('Invalid checksum');
        }

        argObj = new ZpiObject(data.subsys, data.cmd);
        // make sure data.type will be string
        data.type = zmeta.CmdType.get(data.type).key;
        // make sure data.subsys will be string
        data.subsys = argObj.subsys;
        // make sure data.cmd will be string
        data.cmd = argObj.cmd;

        argObj.parse(data.type, data.len, data.payload, function(err, result) {
            data.payload = result;

            process.nextTick(function() {
                self._mtIncomingDataHdlr(err, data);
            });
        });
    } catch (e) {
        self._mtIncomingDataHdlr(e, data);
    }
};

CcZnp.prototype._mtIncomingDataHdlr = function(err, data) {
    // data = { sof, len, type, subsys, cmd, payload = result, fcs, csum }
    if (err) {
        debug(err); // just print out. do nothing if incoming data is invalid
        return;
    }

    let rxEvt;
    let msg;
    const subsys = data.subsys;
    const cmd = data.cmd;
    const result = data.payload;

    if (data.type === 'SRSP') {
        logSrsp('<-- %s, %o', subsys + ':' + cmd, result);
        rxEvt = 'SRSP:' + subsys + ':' + cmd;
        this.emit(rxEvt, result);
    } else if (data.type === 'AREQ') {
        logAreq('<-- %s, %o', subsys + ':' + cmd, result);
        rxEvt = 'AREQ';
        msg = {
            subsys: subsys,
            ind: cmd,
            data: result,
        };

        this.emit(rxEvt, msg);

        if (subsys === 'SYS' && cmd === 'resetInd') {
            rxEvt = 'AREQ:SYS:RESET';
            this.emit(rxEvt, result);
        }
    }
};

/*
    Export as a singleton
*/
module.exports = ccznp;