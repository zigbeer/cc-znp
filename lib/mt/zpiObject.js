var zmeta = require('zmeta');

function ZpiObj(subsys, cmd) {
    var subsystem = zmeta.Subsys.get(subsys),
        command,
        meta,
        type;

    this.subsys = undefined;    // string after assigned
    this.cmd = undefined;       // string after assigned
    this.cmdId = undefined;     // number after assigned
    this.type = undefined;      // string after assgined

    if (subsystem) {
        this.subsys = subsystem.key;
        command = zmeta[this.subsys].get(cmd);
    }

    if (command) {
        this.cmd = command.key;
        this.cmdId = command.value;
    }

    meta = zmeta.get(this.subsys, this.cmd);

    if (meta) {
        type = zmeta.CmdType.get(meta.type);
        this.type = type ? type.key : undefined;
    }
}

ZpiObj.prototype.getReqParams = function () {
    return zmeta.getParams(this.subsys, this.cmd).req;
};

ZpiObj.prototype.getRspParams = function () {
    return zmeta.getParams(this.subsys, this.cmd).rsp;
};

ZpiObj.prototype.parse = function (type, bufLen, zBuf, callback) {
    var chunkRules = [],
        rspParams,
        parser;

    if (type === 3 || type === 'SRSP')      // SRSP
        rspParams = this.getRspParams();
    else if (type === 2 || type === 'AREQ') // AREQ
        rspParams = this.getReqParams();

    if (rspParams && rspParams.length) {
        rspParams.forEach(function (arg) {
            var rule = ru[arg.type];
            if (rule) {
                rule = rule(arg.name, bufLen);
                chunkRules.push(rule);
            }
        });
    }

    parser = DChunks().join(chunkRules).compile();

    parser.once('parsed', function (result) {
        parser = null;
        callback(result);
    });

    parser.end(zBuf);
};

ZpiObj.prototype.valueArrayToZpiObj = function (args) {
    var reqParams = this.getReqParams(),
        self = this;

    reqParams.forEach(function (arg, idx) {
        self[arg.name] = args[idx];
    });

    return this;
};

ZpiObj.prototype.valueObjectToZpiObj = function (valObj) {
    var reqParams = this.getReqParams(),
        args = [];

    reqParams.forEach(function (arg, idx) {
        if (!valObj.hasOwnProperty(arg.name))
            throw new Error('The argument object has incorrect properties');

        args.push(valObj[arg.name]);
    });

    return this.valueArrayToZpiObj(args);
};

ZpiObj.prototype.getCmdBuf = function () {
    var reqParams = this.getReqParams(),
        dataBuf = Concentrate(),
        self = this;

    reqParams.forEach(function (arg, idx) {
        var val = self[arg.name],
            type = arg.type;

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
            case 'longaddr':    // string '0x00124b00019c2ee9'
                var msb = _.parseInt(val.slice(2,10), 16),
                    lsb = _.parseInt(val.slice(10), 16);

                dataBuf = dataBuf.uint32le(lsb).uint32le(msb);
                break;
            case 'listbuffer':  // [ 0x0001, 0x0002, 0x0003, ... ]
                var tempBuf = new Buffer(val.length * 2),
                    idxbuf;

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
