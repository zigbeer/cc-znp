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

    var sp,
        unpi,
        self = this;

    this._sp = null;
    this._unpi = null;
    this._spinLock = false;
    this._txQueue = [];

    this.close = null;  // close method will be attached in init()

    this.callZpi = function (subsys, cmdId, valObj, callback) {
        var deferred = Q.defer(),
            cmdName;

        if (this._spinLock) {
            this._txQueue.push(function () {
                self.callZpi(subsys, cmdId, valObj, callback);
            });
            return;
        }

        if (!_.isObject(valObj) || _.isArray(valObj)) { deferred.reject(new TypeError('valObj should be an object')); }
        if (!_.isFunction(callback) && !_.isUndefined(callback)) { deferred.reject(new TypeError('callback should be a function')); }

        if (typeof cmdId === 'string') {
            cmdName = cmdId;
            cmdId = ZMT[subsys].get(cmdName).value;
        } else {
            cmdName = ZMT[subsys].get(cmdId).key;
        }

        var argObj = framer.getCmdInst(subsys, cmdName).transToArgObj(valObj),
            payload = argObj.getCmdBuf(),
            type = argObj.getType();

        /*unpi.once('flushed', function (cmdInfo) {
            console.log(cmdInfo);
        });*/

        /*unpi.once('error', function (err, parsedData) {
            deferred.reject(err);
        });*/


        this._spinLock = true;

        if (type === 'SREQ') {
            self.once('SRSP',function (result) {
                deferred.resolve(result);
                self._spinLock = false;
                if (self._txQueue.length !== 0){
                    process.nextTick(function () {
                        self._txQueue.shift()();
                    });
                }
            });
        } else if (type === 'AREQ') {
            if ( cmdName === 'resetReq' || cmdName === 'systemReset') {
                self.once('AREQ', function () {
                    self._spinLock = false;
                    if (self._txQueue.length !== 0){
                        process.nextTick(function () {
                            self._txQueue.shift()();
                        });
                    }
                });
            } else {
                this._spinLock = false;
                if (self._txQueue.length !== 0){
                    process.nextTick(function () {
                        self._txQueue.shift()();
                    });
                }
            }
        }

        unpi.send(type, subsys, cmdId, payload);

        return deferred.promise.nodeify(callback);
    };
}


util.inherits(CcZnp, EventEmitter);

var ccznp = new CcZnp();

CcZnp.prototype.init = function (spCfg, callback) {
    var self = this,
        sp = this._sp = new Serialport(spCfg.path, spCfg.options, false),
        unpi = this._unpi = new Unpi({ lenBytes: 1, phy: sp });

    if (!sp)
        throw new Error('Cannot initialize serial port.');

    if (!unpi)
        throw new Error('Cannot initialize unpi.');

    this.close = sp.close;  // attach close method

    unpi.removeListener('data', mtEvtHandler);
    unpi.on('data', mtEvtHandler);

    sp.once('open', function () {
        console.log('The serialport ' + sp.path + ' is opened.');
        console.log('>> ZigBee Server is starting...');
        console.log(' ');
    });

    sp.open(function (err) {
        if (err)
            return callback(err);

        sp.on('error', function (err) {
            sp.close();
        });

        sp.on('close', function () {
            self._txQueue = null;
            self._txQueue = [];
            self.emit('close');
            sp.flush(function () {
                console.log('The serialport ' + sp.path + ' is closed.');
            });
        });

        self.emit('ready');
    });
};

CcZnp.prototype.callZpi = function (subsys, cmdId, valObj, callback) {
    var deferred = Q.defer(),
        cmdName;

    if (this._spinLock) {
        this._txQueue.push(function () {
            self.callZpi(subsys, cmdId, valObj, callback);
        });
        return;
    }

    if (!_.isObject(valObj) || _.isArray(valObj))
        deferred.reject(new TypeError('valObj should be an object'));

    if (!_.isFunction(callback) && !_.isUndefined(callback))
        deferred.reject(new TypeError('callback should be a function'));

    if (typeof cmdId === 'string') {
        cmdName = cmdId;
        cmdId = ZMT[subsys].get(cmdName).value;
    } else {
        cmdName = ZMT[subsys].get(cmdId).key;
    }

    var argObj = framer.getCmdInst(subsys, cmdName).transToArgObj(valObj),
        payload = argObj.getCmdBuf(),
        type = argObj.getType();

    // start transmission
    this._spinLock = true;

    if (type === 'SREQ') {
        var self = this;

        var srspEvt = 'SRSP:' + subsys + ':' + cmdName;

        var timeoutCtrl = setTimeout(function () {
            if (self.listenerCount(srspEvt))
                self.emit(srspEvt, '__timeout__');

            timeoutCtrl = null;
        }, 3000);

        this.once(srspEvt, function (result) {
            self._spinLock = false;

            if (timeoutCtrl) {
                clearTimeout(timeoutCtrl);
                timeoutCtrl = null;
            }

            if (self._txQueue.length) {
                process.nextTick(function () {
                    self._txQueue.shift()();
                });
            }

            if (result === '__timeout__')
                callback(new Error('request timeout.'));
            else
                callback(null, result);
        });

    } else if (type === 'AREQ') {

        if ( cmdName === 'resetReq' || cmdName === 'systemReset') {
            self.once('AREQ', function () {
                self._spinLock = false;
                if (self._txQueue.length !== 0){
                    process.nextTick(function () {
                        self._txQueue.shift()();
                    });
                }
            });
        } else {
            this._spinLock = false;
            if (self._txQueue.length !== 0){
                process.nextTick(function () {
                    self._txQueue.shift()();
                });
            }
        }

    }

    unpi.send(type, subsys, cmdId, payload);

    return deferred.promise.nodeify(callback);
};


CcZnp.prototype.mtCommand = function (subsys, cmdId, valObj, callback) {
    return this.callZpi('SYS', cmdId, valObj, callback);
};

// CcZnp.prototype.sys = function (cmdId, valObj, callback) {
//     this.callZpi('SYS', cmdId, valObj, callback);
// };

// CcZnp.prototype.mac = function (cmdId, valObj, callback) {
//     this.callZpi('MAC', cmdId, valObj, callback);
// };

// CcZnp.prototype.nwk = function (cmdId, valObj, callback) {
//     this.callZpi('NWK', cmdId, valObj, callback);
// };

// CcZnp.prototype.af = function (cmdId, valObj, callback) {
//     this.callZpi('AF', cmdId, valObj, callback);
// };

// CcZnp.prototype.zdo = function (cmdId, valObj, callback) {
//     this.callZpi('ZDO', cmdId, valObj, callback);
// };

// CcZnp.prototype.sapi = function (cmdId, valObj, callback) {
//     this.callZpi('SAPI', cmdId, valObj, callback);
// };

// CcZnp.prototype.util = function (cmdId, valObj, callback) {
//     this.callZpi('UTIL', cmdId, valObj, callback);
// };

// CcZnp.prototype.dbg = function (cmdId, valObj, callback) {
//     this.callZpi('DBG', cmdId, valObj, callback);
// };

// CcZnp.prototype.app = function (cmdId, valObj, callback) {
//     this.callZpi('APP', cmdId, valObj, callback);
// };

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
                result.subsys = subsys;
                result.cmdName = cmdName;
            }

            if (rxEvt)  // emit only if data.type is 'SRSP' or 'AREQ'
                ccznp.emit(rxEvt, result);
        });
    }
}

module.exports = ccznp;
