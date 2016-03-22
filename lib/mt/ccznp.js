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
    var sp,
        unpi,
        spinLock = false,
        self = this;

    this.txQueue = [];

    this.lockSpin = function () {
        spinLock = true;
    };

    this.unlockSpin = function () {
        spinLock = false;
    };

    this.isSpining = function () {  
        return spinLock;
    };

    this.init = function (spConfig, callback) {
        sp = new Serialport(spConfig.path, spConfig.options, false);
        unpi = new Unpi({
            lenBytes: 1,
            phy: sp
        });

        unpi.on('data', mtEvtHandler);

        /*sp.on('data', function (data) {
            console.log(data);
        });*/

        sp.once('open', function () {
            console.log('The serialport ' + sp.path + ' is opened.');
            console.log('>> ZigBee Server is starting...');
            console.log(' ');
        });

        sp.open(function (error) {
            if (error) {
                console.log('Failed to open: ' + error); 
                callback(error);
            } else {
                sp.on('error', function (err) {
                    sp.close();
                });

                sp.on('close', function () {
                    self.txQueue = [];
                    self.emit('close');
                    sp.flush(function () {
                        console.log('The serialport ' + sp.path + ' is closed.');
                    });
                });

                self.emit('ready');
            }            
        });      
    };

    this.close = function () {      
        sp.close();
    };

    this.callZpi = function (subsys, cmdId, valObj, callback) {
        var deferred = Q.defer(),
            cmdName;

        if (this.isSpining()) {
            this.txQueue.push(function () {
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

        this.lockSpin();

        if (type === 'SREQ') {
            self.once('SRSP',function (result) {
                deferred.resolve(result);
                self.unlockSpin();
                if (self.txQueue.length !== 0){
                    process.nextTick(function () {
                        self.txQueue.shift()();
                    });
                }
            });
        } else if (type === 'AREQ') {
            if ( cmdName === 'resetReq' || cmdName === 'systemReset') {
                self.once('AREQ', function () {
                    self.unlockSpin();
                    if (self.txQueue.length !== 0){
                        process.nextTick(function () {
                            self.txQueue.shift()();
                        });
                    }
                });
            } else {
                self.unlockSpin();
                if (self.txQueue.length !== 0){
                    process.nextTick(function () {
                        self.txQueue.shift()();
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

CcZnp.prototype.sys = function (cmdId, valObj, callback) {
    this.callZpi('SYS', cmdId, valObj, callback);
};

CcZnp.prototype.mac = function (cmdId, valObj, callback) {
    this.callZpi('MAC', cmdId, valObj, callback);
};

CcZnp.prototype.nwk = function (cmdId, valObj, callback) {
    this.callZpi('NWK', cmdId, valObj, callback);
};

CcZnp.prototype.af = function (cmdId, valObj, callback) {
    this.callZpi('AF', cmdId, valObj, callback);
};

CcZnp.prototype.zdo = function (cmdId, valObj, callback) {
    this.callZpi('ZDO', cmdId, valObj, callback);
};

CcZnp.prototype.sapi = function (cmdId, valObj, callback) {
    this.callZpi('SAPI', cmdId, valObj, callback);
};

CcZnp.prototype.util = function (cmdId, valObj, callback) {
    this.callZpi('UTIL', cmdId, valObj, callback);
};

CcZnp.prototype.dbg = function (cmdId, valObj, callback) {
    this.callZpi('DBG', cmdId, valObj, callback);
};

CcZnp.prototype.app = function (cmdId, valObj, callback) {
    this.callZpi('APP', cmdId, valObj, callback);
};

function mtEvtHandler(data) {
    //console.log(data);
    var subsys = ZMT.SubSys.get(data.subsys).key,
        cmdName = ZMT[subsys].get(data.cmd).key,
        argObj = parser.getEvtInst(subsys, cmdName);

    argObj.getMtEvtPacket(data.type, data.len, data.payload, function (result) {
        if (data.type === 3) {
            ccznp.emit('SRSP', result);
            //console.log(result);
        } else {
            result.subsys = subsys;
            result.cmdName = cmdName;
            ccznp.emit('AREQ', result);
            //console.log(result);
        }
    });
}

module.exports = ccznp;
