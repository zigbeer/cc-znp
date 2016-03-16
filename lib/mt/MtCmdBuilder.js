'use strict';

var _ = require('lodash'),    
    Concentrate = require('concentrate');

var mtMetaCmd = require('./MtMetaCmd');

var mtCmdBuilder = {};

mtCmdBuilder.getCmdInst = function (subsys, cmdName) {
    return ArgObj.factory(subsys, cmdName, arguments);
};

/*************************************************************************************************/
/*** ArgObj Class                                                                              ***/
/*************************************************************************************************/
function ArgObj() {}

ArgObj.factory = function (subsys, cmdName, inArgs) {
    var constrName = subsys + cmdName;

    ArgObj[constrName] = function () {
        this.subSys = subsys;
        this.cmdName = cmdName;
    };

    if (!_.isFunction(ArgObj[constrName].prototype.getType)) {
        ArgObj[constrName].prototype = new ArgObj();
    }

    return new ArgObj[constrName]();
};

ArgObj.prototype.getType = function () {
    return mtMetaCmd.getType(this.subSys, this.cmdName);
};

ArgObj.prototype.getCmdNumber = function () {
    return mtMetaCmd.getCmdNumber(this.subSys, this.cmdName);
};

ArgObj.prototype.getReqParams = function () {
    return mtMetaCmd.getParams(this.subSys, this.cmdName).req;
};

ArgObj.prototype.makeArgObj = function (inArgs) {
    var reqParams = this.getReqParams(),
        self = this;

    _.forEach(reqParams, function (paramMeta, key) {
        self[paramMeta.name] = inArgs[key];
    });

    return this;
};

ArgObj.prototype.transToArgObj = function (valObj) {
    var reqParams = this.getReqParams(),
        inArgs = [];

    _.forEach(reqParams, function (paramMeta) {
        if (!valObj.hasOwnProperty(paramMeta.name)) {
            throw new Error('The argument object has incorrect properties.');
        }
        inArgs.push(valObj[paramMeta.name]);
    });

    return this.makeArgObj(inArgs);
};

ArgObj.prototype.getCmdBuf = function () {
    var reqParams = this.getReqParams(),
        dataBuf = Concentrate(),
        self = this;

    _.forEach(reqParams, function(paramMeta){
        var paramValue = self[paramMeta.name],
            paramType = paramMeta.type;

        switch (paramType) {
            case 'uint8':
            case 'uint16':
            case 'uint32':
                dataBuf = dataBuf[paramType](paramValue);
                break;
            case 'buffer':
            case 'dynbuffer':
                dataBuf = dataBuf.buffer(new Buffer(paramValue));
                break;
            case 'longaddr': //string '0x00124b00019c2ee9'
                var msb = _.parseInt(paramValue.slice(2,10), 16),
                    lsb = _.parseInt(paramValue.slice(10), 16);
                dataBuf = dataBuf.uint32le(lsb).uint32le(msb);
                break;
            case 'listbuffer': //[0x0001,0x0002,0x0003...]
                var tempBuf = new Buffer(paramValue.length * 2),
                    idxbuf;
                for (idxbuf = 0; idxbuf < paramValue.length; idxbuf += 1) {
                    tempBuf.writeUInt16LE(paramValue[idxbuf], idxbuf * 2);
                }
                dataBuf = dataBuf.buffer(tempBuf);
                break;
            default:
                throw new Error('Unknown Data Type');
        }
    });
    return dataBuf.result();
};

module.exports = mtCmdBuilder;
