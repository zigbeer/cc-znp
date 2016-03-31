/* jshint node: true */
'use strict';

var should = require('should'),
    Chance = require('chance'),
    chance = new Chance();

var zmeta = require('../zmeta'),
    ZpiObject = require('../zpiObject');

var Unpi = require('unpi'),
    Concentrate = Unpi.Concentrate,
    DChunks = Unpi.DChunks,
    ru = DChunks().Rule();

/*************************************************************************************************/
/*** Add Parsing Rules for ZpiObject frame Test                                                ***/
/*************************************************************************************************/
/*ru.clause('listbuffer', function (name) {
    this.buffer(name, 2 * 3).tap(function () {
        this.vars[name] = bufToArray(this.vars[name]);
    });
});

ru.clause('dynbuffer', function (name) {
    this.buffer(name, 6);
});*/

/*************************************************************************************************/
/*** ZpiObject Class Test                                                                      ***/
/*************************************************************************************************/
describe('ZpiObject Class Testing', function () {
    it('zpiInstance check', function () {
        zmeta.Subsys.enums.forEach(function (subsysObj) {
            var Subsys = subsysObj.key;

            if (Subsys === 'RES0' || Subsys === 'NWK') return;

            zmeta[Subsys].enums.forEach(function (zpiObject) {
                var cmd = zpiObject.key,
                    argObj;

                argObj = new ZpiObject(Subsys, cmd);
                (argObj.cmd).should.be.equal(cmd);
            });
        });
    });
});

/*************************************************************************************************/
/*** ZpiObject 'frame' Method Test                                                             ***/
/*************************************************************************************************/
/*describe('ZpiObject frame Testing', function () {
    zmeta.Subsys.enums.forEach(function (subsysObj) {
        var Subsys = subsysObj.key;

        if (Subsys === 'RES0' || Subsys === 'NWK') return;

        zmeta[Subsys].enums.forEach(function (zpiObject) {
            var cmd = zpiObject.key,
                argObj,
                reqParams,
                payload;

            argObj = new ZpiObject(Subsys, cmd);
            argObj.parser = parser;
            argObj.cmdName = argObj.cmd; // zpiMete APIs: 1)interPanCtl, 2)sendData, 3)nwkAddrOfInterestReq, reqParams have [{name: 'cmd', ...}]
            delete argObj.cmd;

            if (argObj.type === 'SREQ') {
                reqParams = zmeta.getReqParams(Subsys, cmd);

                reqParams.forEach(function (arg) {
                    arg.value = randomArgForFrame(arg.type);
                    argObj[arg.name] = arg.value;
                });

                argObj.args = reqParams;
                payload = argObj.frame();

                if (payload.length !== 0) {
                    argObj.parser(payload, function (err, result) {
                        it(argObj.cmdName + ' framer check', function () {
                            delete argObj.type;
                            delete argObj.subsys;
                            delete argObj.cmdName;
                            delete argObj.cmdId;
                            delete argObj.args;
                            delete argObj.parser;
                            return argObj.should.be.deepEqual(result);
                        });
                    });
                }
            }
        });
    });
});*/

/*************************************************************************************************/
/*** ZpiObject 'parse' Method Test                                                             ***/
/*************************************************************************************************/
describe('ZpiObject parse Testing', function () {
    zmeta.Subsys.enums.forEach(function (subsysObj) {
        var Subsys = subsysObj.key;

        if (Subsys === 'RES0' || Subsys === 'NWK') return;

        zmeta[Subsys].enums.forEach(function (zpiObject) {
            var cmd = zpiObject.key,
                argObj,
                rspParams,
                payload;

            if (Subsys === 'SYS' && cmd === 'resetReq') return; // AREQ from host
            if (Subsys === 'DBG' && cmd === 'msg') return;      // AREQ from host

            argObj = new ZpiObject(Subsys, cmd);
            argObj.framer = framer;

            if (argObj.type === 'SREQ') {        // SRSP
                rspParams = zmeta.getRspParams(Subsys, cmd);
                argObj.type = 'SRSP';
            } else if (argObj.type === 'AREQ') { // AREQ
                rspParams = zmeta.getReqParams(Subsys, cmd);
            }

            rspParams.forEach(function (arg) {
                arg.value = randomArgForParse(arg.type);
                argObj[arg.name] = arg.value;
            });

            argObj.args = rspParams;
            payload = argObj.framer();

            if (payload.length !== 0) {
                argObj.parse(argObj.type, payload.length, payload, function (err, result) {
                    it(argObj.cmd + ' parser check', function () {
                        delete argObj.type;
                        delete argObj.subsys;
                        delete argObj.cmd;
                        delete argObj.cmdId;
                        delete argObj.args;
                        delete argObj.framer;
                        return argObj.should.be.deepEqual(result);
                    });
                });
            }   
        });
    });
});

/*************************************************************************************************/
/*** Functions for ZpiObject frame Test                                                        ***/
/*************************************************************************************************/
function randomArgForFrame(type) {
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

function parser(zBuf, callback) {
    var chunkRules = [],
        err,
        rspParams,
        parser;

    rspParams = zmeta.getReqParams(this.subsys, this.cmdName);

    if (rspParams) {    // [ { name, type }, ... ]
        rspParams.forEach(function (arg) {
            var rule = ru[arg.type];
            if (rule) {
                rule = rule(arg.name, 6);
                chunkRules.push(rule);
            } else {
                err = new Error('Parsing rule for ' + arg.type + ' is not found.');
            }
        });
    } else {
        err = new Error('Response parameter definitions not found.');
    }

    if (!err) {
        parser = DChunks().join(chunkRules).compile();

        parser.once('parsed', function (result) {
            parser = null;
            callback(null, result);
        });
    }

    if (!parser)    // error occurs, no parser created
        callback(err);
    else
        parser.end(zBuf);
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
/*** Functions for ZpiObject parse Test                                                        ***/
/*************************************************************************************************/
var preBufLen;

function randomArgForParse(type) {
    var bufLen,
        testBuf,
        testArr,
        k;

    switch (type) {
        case 'uint8':
        case 'uint8ZdoInd':
            return chance.integer({min: 0, max: 255});
        case 'uint16':
            return chance.integer({min: 0, max: 65535});
        case 'uint32':
        case 'uint32be':
            return chance.integer({min: 0, max: 4294967295});
        case 'buffer8':
        case 'buffer16':
        case 'buffer18':
        case 'buffer32':
        case 'buffer42':
        case 'buffer100':
            bufLen = parseInt(type.slice(6));
            testBuf = new Buffer(bufLen);
            for (k = 0; k < bufLen; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            return testBuf;
        case 'buffer':
        case 'devlistbuffer':
        case 'nwklistbuffer':
        case 'zdomsgcb':
            bufLen = chance.integer({min: 0, max: 200}); // MT CMD Max 256bytes
            testBuf = new Buffer(bufLen);
            for (k = 0; k < bufLen; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            return testBuf;
        case 'longaddr':
            return '0x00124b00019c2ee9';
        case 'preLenUint8':
        case 'preLenUint16':
            preBufLen = chance.integer({min: 0, max: 200});
            return preBufLen;
        case 'preLenList':
            preBufLen = chance.integer({min: 1, max: 100}) * 2;
            return preBufLen / 2;
        case 'preLenBeaconlist':
            preBufLen = chance.integer({min: 1, max: 2}) * 21;
            return preBufLen / 21;
        case 'uint8ZdoInd':
            return chance.integer({min: 0, max: 255});
        case 'dynbuffer':            
            testBuf = new Buffer(preBufLen);
            for (k = 0; k < preBufLen; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            preBufLen = 0;
            return testBuf;
        default:
            break;
    }

    return;
}

function framer() {
    if (!Array.isArray(this.args))  // no args, cannot build frame
        return null;

    var dataBuf = Concentrate();

    this.args.forEach(function (arg, idx) { // arg: { name, type, value }
        var type = arg.type,
            val = arg.value;

        switch (type) {
            case 'uint8':
            case 'uint16':
            case 'uint32':
            case 'uint32be':
                dataBuf = dataBuf[type](val);
                break;
            case 'buffer':
            case 'buffer8':
            case 'buffer16':
            case 'buffer18':
            case 'buffer32':
            case 'buffer42':
            case 'buffer100':
            case 'zdomsgcb':
            case 'dynbuffer':
            case 'nwklistbuffer':
                dataBuf = dataBuf.buffer(new Buffer(val));
                break;
            case 'uint8ZdoInd':
            case 'preLenUint8':
            case 'preLenList':
            case 'preLenBeaconlist':
                dataBuf = dataBuf.uint8(val);
                break;
            case 'preLenUint16':
                dataBuf = dataBuf.uint16(val);
                break;
            case 'longaddr':
                var msb = parseInt(val.slice(2,10), 16),
                    lsb = parseInt(val.slice(10), 16);

                dataBuf = dataBuf.uint32le(lsb).uint32le(msb);
                break;
            case 'devlistbuffer':
                dataBuf = dataBuf.buffer(new Buffer(val));
                break;
            default:
                throw new Error('Unknown Data Type');
        }
    });

    return dataBuf.result();
}
