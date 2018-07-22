const Enum = require('enum');

const zpiMeta = require('./defs/zpi_meta.json');
let zmtDefs = require('./defs/zmt_defs.json');

const zmeta = {
    CmdType: new Enum(zmtDefs.CmdType),
    Subsys: new Enum(zmtDefs.Subsys),
    ParamType: new Enum(zmtDefs.ParamType),
    SYS: new Enum(zmtDefs.SYS),
    MAC: new Enum(zmtDefs.MAC),
    AF: new Enum(zmtDefs.AF),
    ZDO: new Enum(zmtDefs.ZDO),
    SAPI: new Enum(zmtDefs.SAPI),
    UTIL: new Enum(zmtDefs.UTIL),
    DBG: new Enum(zmtDefs.DBG),
    APP: new Enum(zmtDefs.APP),
    DEBUG: new Enum(zmtDefs.DEBUG),
};

zmtDefs.CmdType = null;
zmtDefs.Subsys = null;
zmtDefs.ParamType = null;
zmtDefs.SYS = null;
zmtDefs.MAC = null;
zmtDefs.AF = null;
zmtDefs.ZDO = null;
zmtDefs.SAPI = null;
zmtDefs.UTIL = null;
zmtDefs.DBG = null;
zmtDefs.APP = null;
zmtDefs.DEBUG = null;
zmtDefs = null;

zmeta.get = function(subsys, cmd) {
    const meta = zpiMeta[subsys];
    return meta ? meta[cmd] : undefined;
    // return: {
    //  type,
    //  cmdId,
    //  params:
    //      {
    //          req: [ { name: type }, ... ],
    //          rsp: [ { name: type }, ... ]
    //      }
    // }
};

zmeta.getType = function(subsys, cmd) {
    let meta = this.get(subsys, cmd);

    if (meta) {
        meta = this.CmdType.get(meta.type);
    }

    // return: "POLL", "SREQ", "AREQ", "SRSP"
    return meta ? meta.key : undefined;
};

zmeta.getParams = function(subsys, cmdName) {
    const meta = zmeta.get(subsys, cmdName);
    return meta ? meta.params : meta;
};

zmeta.getReqParams = function(subsys, cmd) {
    const meta = zmeta.getParams(subsys, cmd);
    // [ { name: type }, .... ]
    const params = meta ? meta.req : meta;

    if (params) {
        return zmeta.cloneParamsWithNewFormat(params);
    }
};


zmeta.getRspParams = function(subsys, cmd) {
    const meta = zmeta.getParams(subsys, cmd);
    // [ { name: type }, .... ]
    const params = meta ? meta.rsp : meta;

    if (params) {
        return zmeta.cloneParamsWithNewFormat(params);
    }
};

zmeta.cloneParamsWithNewFormat = function(params) {
    let output = [];

    params.forEach(function(item, idx) {
        const newItem = {
            name: Object.keys(item)[0],
            type: null,
        };

        // type is a number
        newItem.type = item[newItem.name];
        output.push(newItem);
    });

    output = zmeta._paramTypeToString(output);

    return output;
};

zmeta._paramTypeToString = function(params) {
    params.forEach(function(item, idx) {
        // enum | undefined
        const type = zmeta.ParamType.get(item.type);
        // item.type is a string
        item.type = type ? type.key : item.type;
    });

    return params;
};

module.exports = zmeta;