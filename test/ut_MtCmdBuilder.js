'use strict'

var _ = require('lodash'),
    should = require('should'),
    Chance = require('chance'),
    chance = new Chance(),
    DChunks = require('dissolve-chunks'),
    ru = DChunks().Rule();

var mtCmdConcentrater = require('../lib/mt/MtCmdBuilder'),
    mtMeta = require('../lib/mt/MtMeta');

describe('Constructor Testing', function () {
    it('cmdName check', function () {
        _.forEach(mtMeta, function (cmd, subsys) {
            for (var key in mtMeta[subsys]) {
                var argObj = mtCmdConcentrater.getCmdInst(subsys, key);
                (argObj.cmdName).should.be.equal(key);
            }
        });
    });

    _.forEach(mtMeta, function (cmd, subsys) {
        _.forEach(mtMeta[subsys], function (cmdMeta, cmdName) {
            var argObj = instWrapper(mtCmdConcentrater.getCmdInst(subsys, cmdName)),
                reqParams = argObj.getReqParams(),
                type = argObj.getType(),
                payload;

            if (type === 'SREQ') {   //SREQ
                _.forEach(reqParams, function (paramMeta, key) {
                    argObj[paramMeta.name] = randomArg(paramMeta.type);
                });

                payload = argObj.getCmdBuf();

                if (payload.length !== 0) {
                    it(argObj.cmdName + ' framer check', function () {
                        return argObj.parseCmdFrame(payload, function (result) {
                            delete argObj.subSys;
                            delete argObj.cmdName;
                            delete argObj.parseCmdFrame;
                            return argObj.should.be.deepEqual(result);
                        });
                    });
                }                
            }
        });
    });
});

function randomArg(type) {
    var testBuf,
        testArr,
        k;

    switch (type) {
        case 'uint8':
            return chance.integer({min: 0, max: 255});
        case 'uint16':
            return chance.integer({min: 0, max: 65535});
        case 'uint32':
            return chance.integer({min: 0, max: 4294967295});
        case 'buffer':
        case 'dynbuffer':            
            testBuf = new Buffer(6);
            for (k = 0; k < 6; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            return testBuf;
        case 'longaddr':
            return '0x00124b00019c2ee9';
        case 'listbuffer':
            testArr = [];
            for (k = 0; k < 3; k += 1) {
                testArr[k] = '0x' + chance.integer({min: 0, max: 65535}).toString(16);
            }
            return testArr;
        default:
            break;
    }

    return;
}

function instWrapper (cmdInst) {
    cmdInst.parseCmdFrame = function (zBuf, callback) {
        var rspParams = this.getReqParams(),
            chunkRules = [],
            parser;

        _.forEach(rspParams, function (paramMeta) {
            chunkRules.push(ru[paramMeta.type](paramMeta.name, 6));
        });

        parser = DChunks().join(chunkRules).compile();

        parser.once('parsed', function (result) {
            parser = undefined;
            callback(result);
        });

        parser.write(zBuf);
    };

    return cmdInst;
}

function buf2Str(buf) {
    var bufLen = buf.length,
        strChunk = '0x',
        val;        

    for (var i = 0; i < bufLen; i += 1) {
        val = buf.readUInt8(bufLen-i-1);
        if (val <= 15) {
            strChunk += '0' + val.toString(16);
        } else {
            strChunk += val.toString(16);
        }
    }

    return strChunk;
}

function bufToArray(buf) {
    var nipArr = [],
        i;        

    for (i = 0; i < buf.length; i += 2) {
        nipArr.push('0x' + buf.readUInt16LE(i).toString(16));
    }

    return nipArr;
}

/*************************************************************************************************/
/*** Specific Chunk Rules                                                                      ***/
/*************************************************************************************************/
ru.clause('longaddr', function (name) {
    this.buffer(name, 8).tap(function () {
        var origBuf = this.vars[name],
            longaddr;

        longaddr = buf2Str(origBuf);
        this.vars[name] = longaddr;
    });
});

ru.clause('listbuffer', function (name) {
    this.buffer(name, 2 * 3).tap(function () {
        this.vars[name] = bufToArray(this.vars[name]);
    });
});

ru.clause('dynbuffer', function (name) {
    this.buffer(name, 6);
});
