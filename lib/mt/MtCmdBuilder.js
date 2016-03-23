/* jshint node: true */
'use strict';

var _ = require('lodash'),
    Concentrate = require('concentrate');

var ZpiObj = require('zpiObject'),
    mtMetaCmd = require('./MtMetaCmd'),
    ZMT = require('../defs/zmtdefs');

// var mtCmdBuilder = {};

// mtCmdBuilder.getCmdInst = function (subsys, cmdName) {
//     return ArgObj.factory(subsys, cmdName);
// };

module.exports = function (subsys, cmdName) {
    if (_.isNumber(subsys))
        subsys = ZMT.SubSys.get(subsys);

    if (_.isNumber(cmdName))
        cmdName = ZMT[subsys].get(cmdName);


    return ArgObj.factory(subsys, cmdName);
};

// module.exports = mtCmdBuilder;
