const expect = require('chai').expect;
const Chance = require('chance');
const chance = new Chance();

const Unpi = require('unpi');
const Concentrate = Unpi.Concentrate;
const DChunks = Unpi.DChunks;
const ru = DChunks().Rule();

const zmeta = require('../lib/zmeta');
const ZpiObject = require('../lib/zpiObject');
let preBufLen;

ru.clause('dynbuffer', function(name) {
    this.tap(function() {
        this.vars[name] = this.vars.preLenData;
        delete this.vars.preLenData;
    });
});

ru.clause('nwklistbuffer', function(name, bufLen) {
    this.buffer(name, bufLen - 6).tap(function() {
        const buf = this.vars[name];
        const list = [];
        let listcount;
        let getList;
        let start = 0;
        let end;
        let len;
        let i;

        if (name === 'networklist') {
            listcount = buf.length / 12;
            end = len =12;
            getList = networkList;
        } else if (name === 'neighborlqilist') {
            listcount = buf.length / 22;
            end = len =22;
            getList = neighborLqiList;
        } else if (name === 'routingtablelist') {
            listcount = buf.length / 5;
            end = len =5;
            getList = routingTableList;
        } else {
            listcount = buf.length / 21;
            this.vars[name] = bindTableList(buf, listcount);
            return;
        }

        for (i = 0; i < listcount; i += 1) {
            list.push(getList(buf.slice(start, end)));
            start = start + len;
            end = end + len;
        }

        this.vars[name] = list;
    });
});

describe('#.parse', function() {
    zmeta.Subsys.enums.forEach(function(subsysObj) {
        const subsys = subsysObj.key;

        if (subsys === 'RES0' || subsys === 'NWK') return;

        zmeta[subsys].enums.forEach(function(zpiObject) {
            const cmd = zpiObject.key;
            let argObj;
            let rspParams;
            let payload;
            let args = {};

            // AREQ from host
            if (subsys === 'SYS' && cmd === 'resetReq') return;
            // AREQ from host
            if (subsys === 'DBG' && cmd === 'msg') return;

            argObj = new ZpiObject(subsys, cmd);
            argObj.framer = framer;

            // SRSP
            if (argObj.type === 'SREQ') {
                rspParams = zmeta.getRspParams(subsys, cmd);
                argObj.type = 'SRSP';

            // AREQ
            } else if (argObj.type === 'AREQ') {
                rspParams = zmeta.getReqParams(subsys, cmd);
            }

            rspParams.forEach(function(arg) {
                arg.value = randomArgForParse(arg.type, arg.name);

                if (arg.type === 'devlistbuffer') {
                    args[arg.name] = bufToArray(arg.value, 'uint16');
                } else if (arg.type === 'nwklistbuffer') {
                    args[arg.name] = bufToList(arg.value, arg.name);
                } else if (arg.name === 'beaconlist') {
                    args[arg.name] = bufToList(arg.value, arg.name);
                } else {
                    args[arg.name] = arg.value;
                }
            });

            argObj.args = rspParams;
            payload = argObj.framer();

            argObj.parse(argObj.type, payload.length, payload, function(err, result) {
                it(argObj.cmd + ' parser check', function() {
                    expect(result).to.eql(args);
                });
            });
        });
    });
});

function randomArgForParse(type, name) {
    let bufLen;
    let testBuf;
    let k;

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
            // MT CMD Max 256bytes
            bufLen = chance.integer({min: 0, max: 128}) * 2;
            testBuf = new Buffer(bufLen);
            for (k = 0; k < bufLen; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            return testBuf;
        case 'nwklistbuffer':
            if (name === 'networklist') {
                bufLen = chance.integer({min: 0, max: 20}) * 12;
            } else if (name === 'neighborlqilist') {
                bufLen = chance.integer({min: 0, max: 10}) * 22;
            } else if (name === 'routingtablelist') {
                bufLen = chance.integer({min: 0, max: 20}) * 5;
            } else if (name === 'bindingtablelist') {
                bufLen = chance.integer({min: 0, max: 10}) * 21;
            }
            testBuf = new Buffer(bufLen);
            for (k = 0; k < bufLen; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            return testBuf;
        case 'zdomsgcb':
            // MT CMD Max 256bytes
            bufLen = chance.integer({min: 0, max: 200});
            testBuf = new Buffer(bufLen);
            for (k = 0; k < bufLen; k += 1) {
                testBuf[k] = chance.integer({min: 0, max: 255});
            }
            return testBuf;
        case 'longaddr':
            return '0x00124b00019c2ee9';
        case '_preLenUint8':
        case '_preLenUint16':
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
    // no args, cannot build frame
    if (!Array.isArray(this.args)) return null;

    let dataBuf = Concentrate();

    // arg: { name, type, value }
    this.args.forEach(function(arg, idx) {
        const type = arg.type;
        const val = arg.value;

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
            case '_preLenUint8':
            case 'preLenList':
            case 'preLenBeaconlist':
                dataBuf = dataBuf.uint8(val);
                break;
            case '_preLenUint16':
                dataBuf = dataBuf.uint16(val);
                break;
            case 'longaddr':
                const msb = parseInt(val.slice(2, 10), 16);
                const lsb = parseInt(val.slice(10), 16);

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

function bufToList(buf, listType) {
    let list = [];
    let listcount;
    let getList;
    let start = 0;
    let end;
    let len;
    let i;

    if (listType === 'networklist') {
        listcount = buf.length / 12;
        end = len = 12;
        getList = networkList;
    } else if (listType === 'neighborlqilist') {
        listcount = buf.length / 22;
        end = len = 22;
        getList = neighborLqiList;
    } else if (listType === 'routingtablelist') {
        listcount = buf.length / 5;
        end = len = 5;
        getList = routingTableList;
    } else if (listType === 'bindingtablelist') {
        listcount = buf.length / 21;
        list = bindTableList(buf, listcount);
        return list;
    } else if (listType === 'beaconlist') {
        listcount = buf.length / 21;
        end = len = 21;
        getList = beaconList;
    }

    for (i = 0; i < listcount; i += 1) {
        list.push(getList(buf.slice(start, end)));
        start = start + len;
        end = end + len;
    }

    return list;
}

function networkList(buf) {
    const item = {};
    let i = 0;

    item.neightborPanId = buf.readUInt16LE(i);
    i += (2+6);
    item.logicalChannel = buf.readUInt8(i);
    i += 1;
    item.stackProfile = buf.readUInt8(i) & 0x0F;
    item.zigbeeVersion = (buf.readUInt8(i) & 0xF0) >> 4;
    i += 1;
    item.beaconOrder = buf.readUInt8(i) & 0x0F;
    item.superFrameOrder = (buf.readUInt8(i) & 0xF0) >> 4;
    i += 1;
    item.permitJoin = buf.readUInt8(i);
    i += 1;

    return item;
}

function neighborLqiList(buf) {
    const item = {};
    let i = 0;

    item.extPandId = addrBuf2Str(buf.slice(0, 8));
    i += 8;
    item.extAddr = addrBuf2Str(buf.slice(8, 16));
    i += 8;
    item.nwkAddr = buf.readUInt16LE(i);
    i += 2;
    item.deviceType = buf.readUInt8(i) & 0x03;
    item.rxOnWhenIdle = (buf.readUInt8(i) & 0x0C) >> 2;
    item.relationship = (buf.readUInt8(i) & 0x70) >> 4;
    i += 1;
    item.permitJoin = buf.readUInt8(i) & 0x03;
    i += 1;
    item.depth = buf.readUInt8(i);
    i += 1;
    item.lqi = buf.readUInt8(i);
    i += 1;

    return item;
}

function routingTableList(buf) {
    const item = {};
    let i = 0;

    item.destNwkAddr = buf.readUInt16LE(i);
    i += 2;
    item.routeStatus = buf.readUInt8(i) & 0x07;
    i += 1;
    item.nextHopNwkAddr = buf.readUInt16LE(i);
    i += 2;

    return item;
}

function bindTableList(buf, listcount) {
    let itemObj;
    const list = [];
    let len = 21;
    let start = 0;
    let end = len;
    let i;

    function getList(buf) {
        const itemObj = {
            item: {},
            thisItemLen: 0,
        };
        let itemLen = 21;
        let item = {};
        let i = 0;

        item.srcAddr = addrBuf2Str(buf.slice(0, 8));
        i += 8;
        item.srcEp = buf.readUInt8(i);
        i += 1;
        item.clusterId = buf.readUInt16LE(i);
        i += 2;
        item.dstAddrMode = buf.readUInt8(i);
        i += 1;
        item.dstAddr = addrBuf2Str(buf.slice(12, 20));
        i += 8;

        // 'Addr64Bit'
        if (item.dstAddrMode === 3) {
            item.dstEp = buf.readUInt8(i);
            i += 1;
        } else {
            itemLen = itemLen - 1;
        }

        itemObj.thisItemLen = itemLen;
        itemObj.item = item;
        return itemObj;
    }

    for (i = 0; i < listcount; i += 1) {
        itemObj = getList(buf.slice(start, end));
        list.push(itemObj.item);

        start = start + itemObj.thisItemLen;

        // for the last item, we don't know the length of bytes
        // so, assign 'end' by the buf length to avoid memory leak.
        // for each item, take 21 bytes from buf to parse
        if (i === listcount - 2) {
            end = buf.length;
        } else {
            end = start + len;
        }
    }

    return list;
}

function beaconList(buf) {
    let item = {};
    let i = 0;

    item.srcAddr = buf.readUInt16LE(i);
    i += 2;
    item.padId = buf.readUInt16LE(i);
    i += 2;
    item.logicalChannel = buf.readUInt8(i);
    i += 1;
    item.permitJoin = buf.readUInt8(i);
    i += 1;
    item.routerCapacity = buf.readUInt8(i);
    i += 1;
    item.deviceCapacity = buf.readUInt8(i);
    i += 1;
    item.protocolVersion = buf.readUInt8(i);
    i += 1;
    item.stackProfile = buf.readUInt8(i);
    i += 1;
    item.lqi = buf.readUInt8(i);
    i += 1;
    item.depth = buf.readUInt8(i);
    i += 1;
    item.updateId = buf.readUInt8(i);
    i += 1;
    item.extPandId = addrBuf2Str(buf.slice(13));
    i += 8;

    return item;
}

function addrBuf2Str(buf) {
    const bufLen = buf.length;
    let val;
    let strChunk = '0x';

    for (let i = 0; i < bufLen; i += 1) {
        val = buf.readUInt8(bufLen - i - 1);
        if (val <= 15) {
            strChunk += '0' + val.toString(16);
        } else {
            strChunk += val.toString(16);
        }
    }

    return strChunk;
}

function bufToArray(buf, nip) {
    let i;
    const nipArr = [];

    if (nip === 'uint8') {
        for (i = 0; i < buf.length; i += 1) {
            nipArr.push(buf.readUInt8(i));
        }
    } else if (nip === 'uint16') {
        for (i = 0; i < buf.length; i += 2) {
            nipArr.push(buf.readUInt16LE(i));
        }
    }
    return nipArr;
}