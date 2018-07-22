const zmeta = require('./zmeta');
const Unpi = require('unpi');
const Concentrate = Unpi.Concentrate;
const DChunks = Unpi.DChunks;
const ru = DChunks().Rule();

/*
    ZpiObject Class
        1. Provides command framer (SREQ)
        2. Provides parser (SRSP, AREQ)
*/
// args is optional, and can be an array or a value-object if given
function ZpiObject(subsys, cmd, args) {
    const subsystem = zmeta.Subsys.get(subsys);
    let command;
    let reqParams;

    // string after assgined
    this.type = undefined;
    // string after assigned
    this.subsys = undefined;
    // string after assigned
    this.cmd = undefined;
    // number after assigned
    this.cmdId = undefined;
    // array after assigned: [ { name, type, value }, ... ]
    this.args = undefined;

    if (!subsystem) {
        throw new Error('Unrecognized subsystem');
    }

    this.subsys = subsystem.key;
    command = zmeta[this.subsys].get(cmd);

    if (!command) {
        throw new Error('Unrecognized command');
    }

    this.cmd = command.key;
    this.cmdId = command.value;

    this.type = zmeta.getType(this.subsys, this.cmd);

    if (!this.type) {
        throw new Error('Unrecognized type');
    }

    // if args is given, this is for REQ transmission
    // otherwise, maybe just for parsing RSP packet
    if (args) {
        // [ { name, type }, ... ]
        reqParams = zmeta.getReqParams(this.subsys, this.cmd);
    }

    if (reqParams) {
        if (Array.isArray(args)) {
            // arg: { name, type } -> { name, type, value }
            reqParams.forEach(function(arg, idx) {
                arg.value = args[idx];
            });
        } else if (typeof args === 'object') {
            reqParams.forEach(function(arg, idx) {
                if (!args.hasOwnProperty(arg.name)) {
                    throw new Error('The argument object has incorrect properties');
                } else {
                    arg.value = args[arg.name];
                }
            });
        }

        // [ { name, type, value }, ... ]
        this.args = reqParams;
    }
}

ZpiObject.prototype.parse = function(type, bufLen, zBuf, callback) {
    const chunkRules = [];
    let err;
    let rspParams;
    let parser;
    let parseTimeout;

    // SRSP
    if (type === 'SRSP' || type === 3) {
        rspParams = zmeta.getRspParams(this.subsys, this.cmd);

    // AREQ
    } else if (type === 'AREQ' || type === 2) {
        rspParams = zmeta.getReqParams(this.subsys, this.cmd);
    }

    // [ { name, type }, ... ]
    if (rspParams) {
        rspParams.forEach(function(arg) {
            let rule = ru[arg.type];
            if (rule) {
                rule = rule(arg.name, bufLen);
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

        parseTimeout = setTimeout(function() {
            if (parser.listenerCount('parsed')) {
                parser.emit('parsed', '__timeout__');
            }

            parseTimeout = null;
        }, 3000);

        parser.once('parsed', function(result) {
            if (parseTimeout) {
                clearTimeout(parseTimeout);
                parseTimeout = null;
            }

            parser = null;

            if (result === '__timeout__') {
                callback(new Error('parse timeout'));
            } else {
                callback(null, result);
            }
        });
    }

    // error occurs, no parser created
    if (!parser) {
        callback(err);
    } else {
        parser.end(zBuf);
    }
};

ZpiObject.prototype.frame = function() {
    // no args, cannot build frame
    if (!Array.isArray(this.args)) {
        return null;
    }

    let dataBuf = Concentrate();

    // arg: { name, type, value }
    this.args.forEach(function(arg, idx) {
        const type = arg.type;
        const val = arg.value;

        switch (type) {
            case 'uint8':
            case 'uint16':
            case 'uint32':
                dataBuf = dataBuf[type](val);
                break;
            case 'buffer':
            case 'dynbuffer':
                dataBuf = dataBuf.buffer(new Buffer(val));
                break;
            case 'longaddr':
                // string '0x00124b00019c2ee9'
                const msb = parseInt(val.slice(2, 10), 16);
                const lsb = parseInt(val.slice(10), 16);

                dataBuf = dataBuf.uint32le(lsb).uint32le(msb);
                break;
            case 'listbuffer':
                // [ 0x0001, 0x0002, 0x0003, ... ]
                const tempBuf = new Buffer(val.length * 2);
                let idxbuf;

                for (idxbuf = 0; idxbuf < val.length; idxbuf += 1) {
                    tempBuf.writeUInt16LE(val[idxbuf], idxbuf * 2);
                }
                dataBuf = dataBuf.buffer(tempBuf);
                break;
            default:
                throw new Error('Unknown Data Type');
        }
    });

    return dataBuf.result();
};

/*
    Add Parsing Rules to DChunks
*/
const rules = [
    'buffer8',
    'buffer16',
    'buffer18',
    'buffer32',
    'buffer42',
    'buffer100',
    '_preLenUint8',
    '_preLenUint16',
];

rules.forEach(function(ruName) {
    ru.clause(ruName, function(name) {
        let needTap = true;
        let bufLen;

        if (ruName === '_preLenUint8') {
            this.uint8(name);
        } else if (ruName === '_preLenUint16') {
            this.uint16(name);
        } else {
            needTap = false;
            bufLen = parseInt(ruName.slice(6));
            this.buffer(name, bufLen);
        }

        if (needTap) {
            this.tap(function() {
                this.buffer('preLenData', this.vars[name]);
            });
        }
    });
});

ru.clause('longaddr', function(name) {
    this.buffer(name, 8).tap(function() {
        const addrBuf = this.vars[name];
        this.vars[name] = addrBuf2Str(addrBuf);
    });
});

ru.clause('uint8ZdoInd', function(name, bufLen) {
    if (bufLen === 3) {
        this.uint16('nwkaddr').uint8(name);
    } else if (bufLen === 1) {
        this.uint8(name);
    }
});

ru.clause('devlistbuffer', function(name, bufLen) {
    this.buffer(name, bufLen - 13).tap(function() {
        this.vars[name] = bufToArray(this.vars[name], 'uint16');
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
            listcount = this.vars.networklistcount;
            end = len = 12;
            getList = networkList;
        } else if (name === 'neighborlqilist') {
            listcount = this.vars.neighborlqilistcount;
            end = len = 22;
            getList = neighborLqiList;
        } else if (name === 'routingtablelist') {
            listcount = this.vars.routingtablelistcount;
            end = len = 5;
            getList = routingTableList;
        } else {
            listcount = this.vars.bindingtablelistcount;
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

ru.clause('zdomsgcb', function(name, bufLen) {
    this.buffer(name, bufLen - 9);
});

ru.clause('preLenList', function(name) {
    this.uint8(name).tap(function() {
        this.buffer('preLenData', 2 * (this.vars[name]));
    });
});

ru.clause('preLenBeaconlist', function(name) {
    this.uint8(name).tap(function() {
        this.buffer('preLenData', 21 * (this.vars[name])).tap(function() {
            const buf = this.vars.preLenData;
            const list = [];
            let len = 21;
            let start = 0;
            let end = 21;
            let i;

            for (i = 0; i < this.vars[name]; i += 1) {
                list.push(beaconList(buf.slice(start, end)));
                start = start + len;
                end = end + len;
            }

            this.vars.preLenData = list;
        });
    });
});

ru.clause('dynbuffer', function(name) {
    this.tap(function() {
        this.vars[name] = this.vars.preLenData;
        delete this.vars.preLenData;
    });
});

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
    const len = 21;
    let start = 0;
    let end = len;
    let i;

    function getList(buf) {
        const itemObj = {
            item: {},
            thisItemLen: 0,
        };
        const itemLen = 21;
        const item = {};
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
    const item = {};
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

module.exports = ZpiObject;