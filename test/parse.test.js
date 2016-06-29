var expect = require('chai').expect,
    Chance = require('chance'),
    chance = new Chance();

var Unpi = require('unpi'),
    Concentrate = Unpi.Concentrate,
    DChunks = Unpi.DChunks,
    ru = DChunks().Rule();

var zmeta = require('../lib/zmeta'),
    ZpiObject = require('../lib/zpiObject'),
    preBufLen;

ru.clause('dynbuffer', function (name) {
    this.tap(function () {
        this.vars[name] = this.vars.preLenData;
        delete this.vars.preLenData;
    });
});

describe('#.parse', function () {
    zmeta.Subsys.enums.forEach(function (subsysObj) {
        var subsys = subsysObj.key;

        if (subsys === 'RES0' || subsys === 'NWK') return;

        zmeta[subsys].enums.forEach(function (zpiObject) {
            var cmd = zpiObject.key,
                argObj,
                rspParams,
                payload,
                args = {};

            if (subsys === 'SYS' && cmd === 'resetReq') return;  // AREQ from host
            if (subsys === 'DBG' && cmd === 'msg') return;       // AREQ from host

            argObj = new ZpiObject(subsys, cmd);
            argObj.framer = framer;

            if (argObj.type === 'SREQ') {           // SRSP
                rspParams = zmeta.getRspParams(subsys, cmd);
                argObj.type = 'SRSP';
            } else if (argObj.type === 'AREQ') {    // AREQ
                rspParams = zmeta.getReqParams(subsys, cmd);
            }

            rspParams.forEach(function (arg) {
                arg.value = randomArgForParse(arg.type);
                args[arg.name] = arg.value;
            });

            argObj.args = rspParams;
            payload = argObj.framer();

            argObj.parse(argObj.type, payload.length, payload, function (err, result) {
                it(argObj.cmd + ' parser check', function () {
                    expect(result).to.eql(args);
                });
            });
        });
    });
});

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
