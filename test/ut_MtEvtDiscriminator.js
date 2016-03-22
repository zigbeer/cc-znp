'use strict'

var _ = require('lodash'),
    should = require('should'),
    Chance = require('chance'),
    chance = new Chance(),
    Concentrate = require('concentrate');;

var mtEvtParser = require('../lib/mt/MtEvtDiscriminator'),
    mtMetaCmd = require('../lib/mt/MtMetaCmd'),
    mtMeta = require('../lib/mt/MtMeta');

describe('Constructor Testing', function () {
    it('cmdName check', function () {
        _.forEach(mtMeta, function (cmd, subsys) {
            for (var key in mtMeta[subsys]) {
                var argObj = mtEvtParser.getEvtInst(subsys, key);
                (argObj.cmdName).should.be.equal(key);
            }
        });
    });

    _.forEach(mtMeta, function (cmd, subsys) {
        _.forEach(mtMeta[subsys], function (cmdMeta, cmdName) {
            if (subsys === 'DBG' && cmdName === 'msg') {
                return;
            }

            var argObj = instWrapper(mtEvtParser.getEvtInst(subsys, cmdName)),
                type = argObj.getType(),
                rspParams,
                payload;

            if (type === 'SREQ') { // SRSP
                rspParams = argObj.getRspParams();
                type = 3;
            } else { // AREQ
                rspParams = argObj.getReqParams();
            }

            _.forEach(rspParams, function (paramMeta, key) {
                argObj[paramMeta.name] = randomArg(paramMeta.type);
            });

            payload = argObj.getCmdBuf();

            if (payload.length !== 0) {
                it(argObj.cmdName + ' parser check', function () {
                    return argObj.getMtEvtPacket(type, payload.length, payload, function (result) {
                        delete argObj.subSys;
                        delete argObj.cmdName;
                        delete argObj.getType;
                        delete argObj.getCmdBuf;
                        return argObj.should.be.deepEqual(result);
                    });
                });
            }
        });
    });
});

var preBufLen;

function randomArg(type) {
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
            bufLen = _.parseInt(type.slice(6));
            testBuf = new Buffer(bufLen);
            for (k = 0; k < bufLen; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            return testBuf;
        case 'buffer':
        case 'devlistbuffer':
        case 'nwklistbuffer':
        case 'zdomsgcb':
            bufLen = chance.integer({min: 0, max: 200}); //MT CMD Max 256bytes
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
            preBufLen = chance.integer({min: 0, max: 100}) * 2;
            return preBufLen;
        case 'preLenBeaconlist':
            preBufLen = chance.integer({min: 0, max: 10}) * 21;
            return preBufLen;
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

function instWrapper (evtInst) {
    evtInst.getType = function () {
        return mtMetaCmd.getType(this.subSys, this.cmdName);
    };

    evtInst.getCmdBuf = function () {
        var dataBuf = Concentrate(),
            type = this.getType(),
            rspParams,
            self = this;

        if (type === 'SREQ') { // SRSP
            rspParams = this.getRspParams();
        } else { // AREQ
            rspParams = this.getReqParams();
        }

        _.forEach(rspParams, function(paramMeta){
            var paramValue = self[paramMeta.name],
                paramType = paramMeta.type;

            switch (paramType) {
                case 'uint8':
                case 'uint16':
                case 'uint32':
                case 'uint32be':
                    dataBuf = dataBuf[paramType](paramValue);
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
                    dataBuf = dataBuf.buffer(new Buffer(paramValue));
                    break;
                case 'uint8ZdoInd':
                case 'preLenUint8':
                case 'preLenList':
                case 'preLenBeaconlist':
                    dataBuf = dataBuf.uint8(paramValue);
                    break;
                case 'preLenUint16':
                    dataBuf = dataBuf.uint16(paramValue);
                    break;
                case 'longaddr':
                    var msb = _.parseInt(paramValue.slice(2,10), 16),
                        lsb = _.parseInt(paramValue.slice(10), 16);

                    dataBuf = dataBuf.uint32le(lsb).uint32le(msb);
                    break;
                case 'devlistbuffer':
                    dataBuf = dataBuf.buffer(new Buffer(paramValue));
                    break;
                default:
                    throw new Error('Unknown Data Type');
            }
        });

        return dataBuf.result();
    };
    
    return evtInst;
}
