var expect = require('chai').expect,
    Chance = require('chance'),
    chance = new Chance();

var zmeta = require('../lib/zmeta'),
    ZpiObject = require('../lib/zpiObject');

describe('ZpiObject Class Testing', function () {
    it('zpiInstance check', function () {
        zmeta.Subsys.enums.forEach(function (subsysObj) {
            var Subsys = subsysObj.key;

            if (Subsys === 'RES0' || Subsys === 'NWK') return;

            zmeta[Subsys].enums.forEach(function (zpiObject) {
                var cmd = zpiObject.key,
                    argObj;

                argObj = new ZpiObject(Subsys, cmd);
                expect(argObj.cmd).to.be.eql(cmd);
            });
        });
    });
});
