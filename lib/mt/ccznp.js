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

        unpi.once('flushed', function (cmdInfo) {
            console.log(cmdInfo);
        });

        unpi.once('error', function (err, parsedData) {
            deferred.reject(err);
        });

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

    this.sys = function (cmdId, valObj, callback) {
        this.callZpi(1, cmdId, valObj, callback);
    };

    this.mac = function (cmdId, valObj, callback) {
        this.callZpi(2, cmdId, valObj, callback);
    };

    this.nwk = function (cmdId, valObj, callback) {
        this.callZpi(3, cmdId, valObj, callback);
    };

    this.af = function (cmdId, valObj, callback) {
        this.callZpi(4, cmdId, valObj, callback);
    };

    this.zdo = function (cmdId, valObj, callback) {
        this.callZpi(5, cmdId, valObj, callback);
    };

    this.sapi = function (cmdId, valObj, callback) {
        this.callZpi(6, cmdId, valObj, callback);
    };

    this.util = function (cmdId, valObj, callback) {
        this.callZpi(7, cmdId, valObj, callback);
    };

    this.dbg = function (cmdId, valObj, callback) {
        this.callZpi(8, cmdId, valObj, callback);
    };

    this.app = function (cmdId, valObj, callback) {
        this.callZpi(9, cmdId, valObj, callback);
    };
}

util.inherits(CcZnp, EventEmitter);
var ccznp = new CcZnp();

function mtEvtHandler(data) {
    //console.log(data);
    var cmdName = ZMT[data.subsys].get(data.cmd).key,
        argObj = parser.getEvtInst(data.subsys, cmdName);

    argObj.getMtEvtPacket(data.type, data.len, data.payload, function (result) {
        if (data.type === 3) {
            ccznp.emit('SRSP', result);
            //console.log(result);
        } else {
            ccznp.emit('AREQ', result);
            //console.log(result);
        }
    });
}

module.exports = ccznp;
