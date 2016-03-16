'use strict'

var _ = require('lodash'),
    mtMeta = require('./MtMeta');

var cmdType = {
    0: 'POLL',
    1: 'SREQ',
    2: 'AREQ',
    3: 'SRSP'
};

var subSysType = {
    0: 'RES0',
    1: 'SYS',
    2: 'MAC',
    3: 'NWK',
    4: 'AF',
    5: 'ZDO',
    6: 'SAPI',
    7: 'UTIL',
    8: 'DBG',
    9: 'APP'
};

var paramType = {
    0: 'uint8',
    1: 'uint16',
    2: 'uint32',
    3: 'longaddr',
    4: 'zdomsgcb',
    5: 'devlistbuffer',
    6: 'nwklistbuffer',
    7: 'preLenUint8',
    8: 'preLenUint16',
    9: 'preLenList',
    10: 'preLenBeaconlist',
    11: 'dynbuffer',
    12: 'listbuffer',
    13: 'buffer',
    14: 'buffer8',
    15: 'buffer16',
    16: 'buffer18',
    17: 'buffer32',
    18: 'buffer42',
    19: 'buffer100',
    20: 'uint8ZdoInd'
};

var mtMetaCmd = {};

mtMetaCmd.getMeta = function (subsysNumber, cmdName) {
    var cmd_name = subsysNumber + cmdName;

    if (!this[cmd_name]) {
        this[cmd_name] = mtMeta[subSysType[subsysNumber]][cmdName];
    }

    return this[cmd_name];
};

mtMetaCmd.getType = function (subsysNumber, cmdName) {
    return cmdType[this.getMeta(subsysNumber, cmdName).type];
};

mtMetaCmd.getCmdNumber = function(subsysNumber, cmdName) {
    return this.getMeta(subsysNumber, cmdName).cmdId;
};

mtMetaCmd.getParams = function (subsysNumber, cmdName) {
    var meta = this.getMeta(subsysNumber, cmdName),
        metaParams = {},
        reqParams = [],
        rspParams = [];
    
    _.forEach(meta.params.req, function (reqMeta) {
        var name = Object.keys(reqMeta);

        reqParams.push({name: name[0], type: paramType[reqMeta[name]]});
    });
    metaParams.req = reqParams;

    if (meta.type === 1) { 
        _.forEach(meta.params.rsp, function (rspMeta) {
            var name = Object.keys(rspMeta);
            
            rspParams.push({name: name[0], type: paramType[rspMeta[name]]});
        });
        metaParams.rsp = rspParams;
    }

    return metaParams;
};

module.exports = mtMetaCmd;
