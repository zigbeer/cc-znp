var fs = require('fs'),
    Enum = require('enum');

var zpiMeta = JSON.parse(fs.readFileSync('zpi_meta.json')),
    zmtDefs = JSON.parse(fs.readFileSync('zmt_defs.json'));

var zmeta = {
    CmdType: new Enum(zmtDefs.CmdType),
    Subsys: new Enum(zmtDefs.Subsys),
    ParamType: new Enum(zmtDefs.ParamType),
    SYS: new Enum(zmtDefs.SYS),
    MAC: new Enum(zmtDefs.MAC),
    AF: new Enum(zmtDefs.AF),
    ZDO: new Enum(zmtDefs.ZDO),
    SAPI: new Enum(zmtDefs.SAPI),
    UTIL: new Enum(zmtDefs.UTIL),
    DEBUG: new Enum(zmtDefs.DEBUG),
    APP: new Enum(zmtDefs.APP),
};

// [TODO] should data remain there?
zmtDefs.CmdType = null;
zmtDefs.Subsys = null;
zmtDefs.ParamType = null;
zmtDefs.SYS = null;
zmtDefs.MAC = null;
zmtDefs.AF = null;
zmtDefs.ZDO = null;
zmtDefs.SAPI = null;
zmtDefs.UTIL = null;
zmtDefs.DEBUG = null;
zmtDefs.APP = null;
zmtDefs = null;

zmeta.get = function (subsys, cmd) {
    var meta = zpiMeta[subsys];
    return meta ? meta[cmd] : undefined;
};

zmeta.getType = function (subsys, cmd) {
    var meta = this.get(subsys, cmd);

    if (meta)
        meta = this.CmdType.get(meta.type);

    return meta ? meta.key : undefined;
};

zmeta.getCmdNumber = function(subsys, cmd) {
    var meta = this.get(subsys, cmd);
    return meta ? meta.cmdId : undefined;
};

zmeta.getParams = function (subsys, cmdName) {
    var self = this,
        meta = this.get(subsys, cmdName),
        params = {
            req: null,
            rsp: null
        },
        reqParams = [],
        rspParams = [];

        // metaParams = {},
        // reqParams = [],
        // rspParams = [];

    if (!meta)
        return;

    var req = meta.params.req,
        rsp = meta.params.rsp;

    if (req.length) {
        req.forEach(function (arg) {
            var argName = Object.keys(arg);
            argName = argName[0];
            reqParams.push({
                name: argName,
                type: self.ParamType.get()
            });
            // reqParams.push({name: name[0], type: paramType[reqMeta[name]]});
        });
    }


    params.req = reqParams;

    if (meta.type === 1 || meta.type === 'SREQ') { // SREQ

        rsp.forEach(function (arg) {
            var argName = Object.keys(arg);
            argName = argName[0];

            rspParams.push({
                name: argName,
                type: paramType[meta[name]]
            });
        });

        metaParams.rsp = rspParams;
    }

    return metaParams;
};