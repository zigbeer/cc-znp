const expect = require('chai').expect;
const Chance = require('chance');
const chance = new Chance();

const Unpi = require('unpi');
const DChunks = Unpi.DChunks;
const ru = DChunks().Rule();

const zmeta = require('../lib/zmeta');
const ZpiObject = require('../lib/zpiObject');

ru.clause('listbuffer', function(name) {
    this.buffer(name, 2 * 3).tap(function() {
        this.vars[name] = bufToArray(this.vars[name]);
    });
});

ru.clause('dynbuffer', function(name) {
    this.buffer(name, 6);
});

describe('#.frame', function() {
    zmeta.Subsys.enums.forEach(function(subsysObj) {
        const Subsys = subsysObj.key;

        if (Subsys === 'RES0' || Subsys === 'NWK') return;

        zmeta[Subsys].enums.forEach(function(zpiObject) {
            const cmd = zpiObject.key;
            let argObj;
            let reqParams;
            let payload;
            const args = {};

            argObj = new ZpiObject(Subsys, cmd);
            argObj.parser = parser;

            if (argObj.type === 'SREQ') {
                reqParams = zmeta.getReqParams(Subsys, cmd);

                reqParams.forEach(function(arg) {
                    arg.value = randomArgForFrame(arg.type);
                    args[arg.name] = arg.value;
                });

                argObj.args = reqParams;
                payload = argObj.frame();

                argObj.parser(payload, function(err, result) {
                    it(argObj.cmd + ' framer check', function() {
                        expect(result).to.eql(args);
                    });
                });
            }
        });
    });
});

function randomArgForFrame(type) {
    let testBuf;
    let testArr;
    let k;

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
    const chunkRules = [];
    let err;
    let rspParams;
    let parser;

    rspParams = zmeta.getReqParams(this.subsys, this.cmd);

    // [ { name, type }, ... ]
    if (rspParams) {
        rspParams.forEach(function(arg) {
            let rule = ru[arg.type];
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
        if (chunkRules.length === 0) {
            callback(null, {});
            return;
        }

        parser = DChunks().join(chunkRules).compile();

        parser.once('parsed', function(result) {
            parser = null;
            callback(null, result);
        });
    }

    // error occurs, no parser created
    if (!parser) {
        callback(err);
    } else {
        parser.end(zBuf);
    }
}

function bufToArray(buf) {
    const nipArr = [];
    let i;

    for (i = 0; i < buf.length; i += 2) {
        nipArr.push('0x' + buf.readUInt16LE(i).toString(16));
    }

    return nipArr;
}