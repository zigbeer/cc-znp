/* jshint node: true */
'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter;

var Unpi = require('unpi'),
    Serialport = require('serialport').SerialPort;

var zmeta = require('./zmeta'),
    ZpiObject = require('./zpiObject');

var MT = {
    CMDTYPE: zmeta.CmdType,
    SUBSYS: zmeta.Subsys,
    SYS: zmeta.SYS,
    MAC: zmeta.MAC,
    AF: zmeta.AF,
    ZDO: zmeta.ZDO,
    SAPI: zmeta.SAPI,
    UTIL: zmeta.UTIL,
    DBG: zmeta.DBG,
    APP: zmeta.APP
};

function CcZnp () {
    EventEmitter.call(this);

    var self = this;

    this.MT = MT;       // export constant

    this._init = false;
    this._resetting = false;
    this._sp = null;
    this._unpi = null;
    this._spinLock = false;
    this._txQueue = [];

    this.close = null;  // close method will be attached in init()

    this.on('_ready', function () {
        self._init = true;
        self.emit('ready');
    });

    this._innerListeners = {
        spOpen: function () {
            console.log('The serialport ' + self._sp.path + ' is opened.');
            console.log('>> ZigBee Server is starting...');
            console.log(' ');
        },
        spErr: function (err) {
            self._sp.close();
        },
        spClose: function () {
            self._txQueue = null;
            self._txQueue = [];
            self.emit('close');

            self._sp.flush(function () {
                console.log('The serialport ' + self._sp.path + ' is closed.');
            });
        }
    };
}

util.inherits(CcZnp, EventEmitter);

var ccznp = new CcZnp();

/*************************************************************************************************/
/*** Public APIs                                                                               ***/
/*************************************************************************************************/
CcZnp.prototype.init = function (spCfg, callback) {
    var self = this,
        sp = this._sp = (this._sp instanceof Serialport) ? this._sp : new Serialport(spCfg.path, spCfg.options, false),
        unpi = this._unpi = (this._unpi instanceof Unpi) || new Unpi({ lenBytes: 1, phy: sp });

    // Listeners for inner use
    var parseMtIncomingData = this._parseMtIncomingData.bind(this),
        spOpenLsn = this._innerListeners.spOpen,
        spErrLsn = this._innerListeners.spErr,
        spCloseLsn = this._innerListeners.spClose;

    if (!sp)
        throw new Error('Cannot initialize serial port.');

    if (!unpi)
        throw new Error('Cannot initialize unpi.');

    this.close = sp.close;  // attach close method

    // remove all inner listeners were attached on last init
    unpi.removeListener('data', parseMtIncomingData);
    sp.removeListener('open', spOpenLsn);
    sp.removeListener('error', spErrLsn);
    sp.removeListener('close', spCloseLsn);

    // re-attach inner listeners
    unpi.on('data', parseMtIncomingData);
    sp.once('open', spOpenLsn);

    sp.open(function (err) {
        if (err)
            return callback(err);

        sp.on('error', spErrLsn);
        sp.on('close', spCloseLsn);
        self.emit('_ready');
    });

    return this;
};

CcZnp.prototype.request = function (subsys, cmd, valObj, callback) {
    // subsys: String | Number, cmd: String | Number, valObj: Object | Array
    var self = this,
        err,
        argObj,
        payload;

    if (!this._init)
        throw new Error('ccznp has not been initialized yet');

    if (this._spinLock) {
        this._txQueue.push(function () {
            self.request(subsys, cmd, valObj, callback);
        });
        return;
    }

    // prepare for transmission
    this._spinLock = true;

    // validations
    if (!valObj || typeof valObj !== 'object')
        err = new TypeError('valObj should be an object');
    else if ((typeof callback !== 'function') && (typeof callback !== 'undefined'))
        err = new TypeError('callback should be a function');
    else
        argObj = new ZpiObject(subsys, cmd, valObj);

    if (err) {
        this._spinLock = false;
        return callback(err);
    } else if (argObj.type === 'SREQ') {
        return this._sendSREQ(argObj, callback);
    } else if (argObj.type === 'AREQ') {
        return this._sendAREQ(argObj, callback);
    }
};

CcZnp.prototype.sendCmd = function (type, subsys, cmdId, payload) {
    return this._unpi.send(type, subsys, cmdId, payload);
};

/*********************************/
/*** Create Request Shorthands ***/
/*********************************/
// example: ccznp.sysRequest(), ccznp.zdoRequest()
var namespaces = [ 'SYS', 'MAC', 'NWK', 'AF', 'ZDO', 'SAPI', 'UTIL', 'DBG', 'APP' ];

namespaces.forEach(function (subsys) {
    var reqMethod = subsys.toLowerCase() + 'Request';
    CcZnp.prototype[reqMethod] = function (cmdId, valObj, callback) {
        return this.request(subsys, cmdId, valObj, callback);
    };
});

/*************************************************************************************************/
/*** Protected Methods                                                                         ***/
/*************************************************************************************************/

CcZnp.prototype._sendSREQ = function (argObj, callback) {
    // subsys: String, cmd: String
    var self = this,
        payload = argObj.frame(),
        sreqTimeout,
        srspEvt = 'SRSP:' + argObj.subsys + ':' + argObj.cmd;

    if (!payload) {
        callback(new Error('Fail to build frame'));
        return;
    }

    sreqTimeout = setTimeout(function () {
        if (self.listenerCount(srspEvt))
            self.emit(srspEvt, '__timeout__');

        sreqTimeout = null;
    }, 20000);

    // attach response listener
    this.once(srspEvt, function (result) {
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
            callback(new Error('request timeout'));
        } else {
            self._resetting = false;
            callback(null, result);
        }
    });

    this._unpi.send('SREQ', argObj.subsys, argObj.cmdId, payload);
};

CcZnp.prototype._sendAREQ = function (argObj, callback) {
    // subsys: String, cmd: String
    var self = this,
        payload = argObj.frame();

    if (!payload) {
        callback(new Error('Fail to build frame'));
        return;
    }

    if (argObj.cmd === 'resetReq' || argObj.cmd === 'systemReset') {
        this._resetting = true;
        // clear all pending requests, since the system is reset
        this._txQueue = null;
        this._txQueue = [];

        this.once('AREQ:SYS:RESET', function () {
            // hold the lock until coordinator reset completed
            self._resetting = false;
            self._spinLock = false;
        });

        // if AREQ:SYS:RESET does not return in 30 sec
        // release the lock to avoid the requests from enqueuing
        setTimeout(function () {
            if (self._resetting)
                self._spinLock = false;
        }, 30000);

    } else {
        this._spinLock = false;
        this._scheduleNextSend();
    }

    this._unpi.send('AREQ', argObj.subsys, argObj.cmdId, payload);
};

CcZnp.prototype._scheduleNextSend = function () {
    var txQueue = this._txQueue;

    if (txQueue.length) {
        process.nextTick(function () {
            txQueue.shift()();
        });
    }
};

CcZnp.prototype._parseMtIncomingData = function (data) {
    // data = { sof, len, type, subsys, cmd, payload, fcs, csum }
    var self = this,
        argObj;

    this.emit('data', data);

    try {
        if (data.fcs !== data.csum)
            throw new Error('Invalid checksum');

        argObj = new ZpiObject(data.subsys, data.cmd);
        data.type = zmeta.CmdType.get(data.type).key;    // make sure data.type will be string
        data.subsys = argObj.subsys;                     // make sure data.subsys will be string
        data.cmd = argObj.cmd;                           // make sure data.cmd will be string

        argObj.parse(data.type, data.len, data.payload, function (err, result) {
            data.payload = result;

            // process.nextTick(function () {    // XXX, process.nextTick hang in here
                self._mtIncomingDataHdlr(err, data);
            // });
        });
    } catch (e) {
        self._mtIncomingDataHdlr(e, data);
    }
};

CcZnp.prototype._mtIncomingDataHdlr = function (err, data) {
    // data = { sof, len, type, subsys, cmd, payload = result, fcs, csum }
    if (err) {
        console.log(err); // just print out. do nothing if incoming data is invalid
        return;
    }

    var rxEvt,
        msg,
        subsys = data.subsys,
        cmd = data.cmd,
        result = data.payload;

    if (data.type === 'SRSP') {
        rxEvt = 'SRSP:' + subsys + ':' + cmd;
        this.emit(rxEvt, result);
    } else if (data.type === 'AREQ') {
        rxEvt = 'AREQ';
        msg = {
            subsys: subsys,
            ind: cmd,
            data: result
        };

        this.emit(rxEvt, msg);

        if (subsys === 'SYS' && cmd === 'resetInd') {
            rxEvt = 'AREQ:SYS:RESET';
            this.emit(rxEvt, result);
        }
    }
};

/*************************************************************************************************/
/*** Export as a singleton                                                                     ***/
/*************************************************************************************************/
module.exports = ccznp;
