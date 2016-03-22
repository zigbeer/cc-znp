'use strict'

var _ = require('lodash');

var mtMeta = require('./MtMeta'),
    ZMT = require('../defs/zmtdefs');

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
    20: 'uint8ZdoInd',
    21: 'uint32be',
};

var mtMetaCmd = {};

mtMetaCmd.getMeta = function (subsys, cmdName) {
    var cmd_name = subsys + cmdName;

    if (!this[cmd_name]) {
        this[cmd_name] = mtMeta[subsys][cmdName];
    }

    return this[cmd_name];
};

mtMetaCmd.getType = function (subsys, cmdName) {
    return ZMT.CmdType.get(this.getMeta(subsys, cmdName).type).key;
};

mtMetaCmd.getCmdNumber = function(subsys, cmdName) {
    return this.getMeta(subsys, cmdName).cmdId;
};

mtMetaCmd.getParams = function (subsys, cmdName) {
    var meta = this.getMeta(subsys, cmdName),
        metaParams = {},
        reqParams = [],
        rspParams = [];
    
    _.forEach(meta.params.req, function (reqMeta) {
        var name = Object.keys(reqMeta);

        reqParams.push({name: name[0], type: paramType[reqMeta[name]]});
    });
    metaParams.req = reqParams;

    if (meta.type === 1) { // SREQ
        _.forEach(meta.params.rsp, function (rspMeta) {
            var name = Object.keys(rspMeta);
            
            rspParams.push({name: name[0], type: paramType[rspMeta[name]]});
        });
        metaParams.rsp = rspParams;
    }

    return metaParams;
};

module.exports = mtMetaCmd;
