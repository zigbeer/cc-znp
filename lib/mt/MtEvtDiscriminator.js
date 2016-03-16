'use strict';

var _ = require('lodash'),
    DChunks = require('dissolve-chunks'),
    ru = DChunks().Rule();

var mtMetaCmd = require('./MtMetaCmd');

var mtEvtDiscriminator = {};

mtEvtDiscriminator.getEvtInst = function (subsys, cmdName) {
    return ArgObj.factory(subsys, cmdName, arguments);
};

/*************************************************************************************************/
/*** ArgObj Class                                                                              ***/
/*************************************************************************************************/
function ArgObj() {}

ArgObj.factory = function (subsys, cmdName) {
    var constrName = subsys + cmdName;
    
    ArgObj[constrName] = function () {
        this.subSys = subsys;
        this.cmdName = cmdName;
    };

    if (!_.isFunction(ArgObj[constrName].prototype.getReqParams)) {
        ArgObj[constrName].prototype = new ArgObj();
    }

    return new ArgObj[constrName]();
};

ArgObj.prototype.getReqParams = function () {
    return mtMetaCmd.getParams(this.subSys, this.cmdName).req;
};

ArgObj.prototype.getRspParams = function () {
    return mtMetaCmd.getParams(this.subSys, this.cmdName).rsp;
};

ArgObj.prototype.getMtEvtPacket = function (type, bufLen, zBuf, callback) {
    var chunkRules = [],
        rspParams,
        parser;

    if (type === 3) {    //SRSP
        rspParams = this.getRspParams();
    } else {             //AREQ
        rspParams = this.getReqParams();
    }

    _.forEach(rspParams, function (paramMeta) {
        chunkRules.push(ru[paramMeta.type](paramMeta.name, bufLen));
    });

    parser = DChunks().join(chunkRules).compile();

    parser.once('parsed', function (result) {
        parser = undefined;
        callback(result);
    });

    parser.write(zBuf);
};

/*************************************************************************************************/
/*** Specific Chunk Rules                                                                      ***/
/*************************************************************************************************/
var rules = ['buffer8', 'buffer16', 'buffer18', 'buffer32', 'buffer42', 
             'buffer100', 'preLenUint8', 'preLenUint16'];

(function () {
    _.forEach(rules, function (rule) {
        ru.clause(rule, function(name) {
            if (_.startsWith(rule, 'buffer')) {
                this.buffer(name, _.parseInt(rule.slice(6)));
            } else {
                this[rule.slice(6).toLowerCase()](name).tap(function () {
                    this.buffer('preLenData', this.vars[name]);
                }); 
            }
        });
    });
}());

ru.clause('longaddr', function (name) {
    this.buffer(name, 8).tap(function () {
        var origBuf = this.vars[name],
            longaddr;

        longaddr = buf2Str(origBuf);
        this.vars[name] = longaddr;
    });
});

ru.clause('uint8ZdoInd', function (name, bufLen) {
    if (bufLen === 3) {
        this.uint16('nwkaddr').uint8(name);
    } else if (bufLen === 1) {
        this.uint8(name);
    }
});

ru.clause('devlistbuffer', function (name, bufLen) {
    this.buffer(name, bufLen - 13);
});

ru.clause('nwklistbuffer', function (name, bufLen) {
    this.buffer(name, bufLen - 6);
});

ru.clause('zdomsgcb', function (name, bufLen) {
    this.buffer(name, bufLen - 9);
});

ru.clause('preLenList', function (name) {
    this.uint8(name).tap(function () {
        this.buffer('preLenData', 2 * (this.vars[name]));
    });
});

ru.clause('preLenBeaconlist', function (name) {
    this.uint8(name).tap(function () {
        this.buffer('preLenData', 21 * (this.vars[name]));
    });    
});

ru.clause('dynbuffer', function (name) {
    this.tap(function () {
        this.vars[name] = this.vars.preLenData;
        delete this.vars.preLenData;
    });
});

function buf2Str(buf) {
    var bufLen = buf.length,
        val,
        strChunk = '0x';

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

module.exports = mtEvtDiscriminator;
