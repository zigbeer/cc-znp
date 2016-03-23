/* jshint node: true */
'use strict';

var Q = require('q'),
    _ = require('lodash'),
    util = require('util'),
    Unpi = require('unpi'),
    Serialport = require('serialport').SerialPort,
    EventEmitter = require('events').EventEmitter;

var framer = require('./MtCmdBuilder'),
    parser = require('./MtEvtDiscriminator'),
    ZMT = require('../defs/zmtdefs');

function CcZnp () {
    EventEmitter.call(this);

    var self = this;

    this._init = false;
    this._sp = null;
    this._unpi = null;
    this._spinLock = false;
    this._txQueue = [];

    this.close = null;  // close method will be attached in init()

    this.on('_ready', function () {
        self._init = true;
        self.emit('ready');
    });
}

util.inherits(CcZnp, EventEmitter);

var ccznp = new CcZnp();

/*************************************************************************************************/
/*** Public APIs                                                                               ***/
/*************************************************************************************************/
CcZnp.prototype.init = function (spCfg, callback) {
    this._sp = this._sp || new Serialport(spCfg.path, spCfg.options, false);
    this._unpi = this._unpi || new Unpi({ lenBytes: 1, phy: sp });

    var self = this,
        sp = this._sp,
        unpi = this._unpi;

    // Listeners for inner use
    var spOpenListener,
        spErrListener,
        spCloseListener;

    if (!sp)
        throw new Error('Cannot initialize serial port.');

    if (!unpi)
        throw new Error('Cannot initialize unpi.');

    this.close = sp.close;  // attach close method

    spOpenListener = function () {
        console.log('The serialport ' + sp.path + ' is opened.');
        console.log('>> ZigBee Server is starting...');
        console.log(' ');
    };

    spErrListener = function (err) {
        sp.close();
    };

    spCloseListener = function () {
        self._txQueue = null;
        self._txQueue = [];
        self.emit('close');
        sp.flush(function () {
            console.log('The serialport ' + sp.path + ' is closed.');
        });
    };

    // remove all listeners were attached on last init
    unpi.removeListener('data', mtEvtHandler);
    sp.removeListener('open', spOpenListener);
    sp.removeListener('error', spErrListener);
    sp.removeListener('close', spCloseListener);

    unpi.on('data', mtEvtHandler);
    sp.once('open', spOpenListener);

    sp.open(function (err) {
        if (err)
            return callback(err);

        sp.on('error', spErrListener);
        sp.on('close', spCloseListener);
        self.emit('_ready');
    });

    return this;
};

CcZnp.prototype.request = function (subsys, cmdId, valObj, callback) {
    var self = this,
        subsystem,
        cmd,
        argObj,
        payload,
        type,
        sendReq;

    if (!this._init)
        throw new Error('ccznp has not been initialized yet');

    if (this._spinLock) {
        this._txQueue.push(function () {
            self.request(subsys, cmdId, valObj, callback);
        });
        return;
    }

    // arguments validation
    if (!_.isPlainObject(valObj))
        return callback(new TypeError('valObj should be an object'));

    if (!_.isFunction(callback) && !_.isUndefined(callback))
        return callback(new TypeError('callback should be a function'));

    subsystem = ZMT.SubSys.get(subsys);

    if (!subsystem)
        return callback(new Error('Subsystem not found'));

    cmd = ZMT[subsystem.key].get(cmdId);

    if (!cmd)
        return callback(new Error('Command not found'));

    // prepare for transmission
    argObj = framer.getCmdInst(subsystem.key, cmd.key).transToArgObj(valObj);
    payload = argObj.getCmdBuf();
    type = argObj.getType();

    // start transmission
    this._spinLock = true;

    if (type === 'SREQ')
        sendReq = this._sendSREQ;
    else if (type === 'AREQ')
        sendReq = this._sendAREQ;

    if (!sendReq)
        return callback(new Error('Invalid type of request'));

    return sendReq(subsystem, cmd, payload, callback);
};

/**************************/
/*** Request Shorthands ***/
/**************************/
CcZnp.prototype.sysRequest = function (cmdId, valObj, callback) {
    return this.request('SYS', cmdId, valObj, callback);
};

CcZnp.prototype.macRequest = function (cmdId, valObj, callback) {
    return this.request('MAC', cmdId, valObj, callback);
};

CcZnp.prototype.nwkRequest = function (cmdId, valObj, callback) {
    return this.request('NWK', cmdId, valObj, callback);
};

CcZnp.prototype.afRequest = function (cmdId, valObj, callback) {
    return this.request('AF', cmdId, valObj, callback);
};

CcZnp.prototype.zdoRequest = function (cmdId, valObj, callback) {
    return this.request('ZDO', cmdId, valObj, callback);
};

CcZnp.prototype.sapiRequest = function (cmdId, valObj, callback) {
    return this.request('SAPI', cmdId, valObj, callback);
};

CcZnp.prototype.utilRequest = function (cmdId, valObj, callback) {
    return this.request('UTIL', cmdId, valObj, callback);
};

CcZnp.prototype.dbgRequest = function (cmdId, valObj, callback) {
    return this.request('DBG', cmdId, valObj, callback);
};

CcZnp.prototype.appRequest = function (cmdId, valObj, callback) {
    return this.request('APP', cmdId, valObj, callback);
};

/*************************************************************************************************/
/*** Protected Methods                                                                         ***/
/*************************************************************************************************/
CcZnp.prototype._sendSREQ = function (subsysEnum, cmdEum, payload, callback) {
    var self = this,
        sreqTimeout,
        srspEvt = 'SRSP:' + subsysEnum.key + ':' + cmdEum.key;

    sreqTimeout = setTimeout(function () {
        if (self.listenerCount(srspEvt))
            self.emit(srspEvt, '__timeout__');

        sreqTimeout = null;
    }, 3000);

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
        if (result === '__timeout__')
            callback(new Error('request timeout'));
        else
            callback(null, result);
    });

    this._unpi.send('SREQ', subsysEnum.key, cmdEum.value, payload);
};

CcZnp.prototype._sendAREQ = function (subsysEnum, cmdEum, payload, callback) {
    var self = this;

    if (cmdEum.key === 'resetReq' || cmdEum.key === 'systemReset') {
        this.once('AREQ:SYS:RESET', function () {
            self._spinLock = false;
            self._scheduleNextSend();
        });
    } else {
        this._spinLock = false;
        this._scheduleNextSend();
    }
};

CcZnp.prototype._scheduleNextSend = function () {
    var txQueue = this._txQueue;

    if (txQueue.length) {
        process.nextTick(function () {
            txQueue.shift()();
        });
    }
};

/*************************************************************************************************/
/*** Private Functions                                                                         ***/
/*************************************************************************************************/
function mtEvtHandler(data) {
    var subsys = ZMT.SubSys.get(data.subsys),
        cmdName,
        argObj;

    if (subsys) {
        subsys = subsys.key;
        cmdName = ZMT[subsys].get(data.cmd);
    }

    if (cmdName) {
        cmdName = cmdName.key;
        argObj = parser.getEvtInst(subsys, cmdName);
    }

    if (argObj) {
        argObj.getMtEvtPacket(data.type, data.len, data.payload, function (result) {
            var rxEvt;

            if (data.type === 3 || data.type === 'SRSP') {
                rxEvt = 'SRSP:' + subsys + ':' + cmdName;
            } else if (data.type === 2 || data.type === 'AREQ') {
                rxEvt = 'AREQ';
                result.subsys = subsys;
                result.cmdName = cmdName;

                if ((subsys === 'SYS' && cmdName === 'resetReq') || (subsys === 'SAPI' && cmdName === 'systemReset'))
                    rxEvt = 'AREQ:SYS:RESET';
            }

            if (rxEvt)  // emit only if data.type is 'SRSP' or 'AREQ'
                ccznp.emit(rxEvt, result);
        });
    }
}

/*************************************************************************************************/
/*** Export as a singleton                                                                     ***/
/*************************************************************************************************/
module.exports = ccznp;
