var ccznp = require('../index.js');

var spCfg = {
    path: "/dev/ttyUSB0",
    options: {
        baudrate: 115200,
        rtscts: true
    }
};

ccznp.on('ready', function () {
    ccznp.sysRequest('ping', {}, function (err, result) {
        if (err)
            console.log(err);
        else
            console.log(result);
    });

    ccznp.sysRequest('version', {}, function (err, result) {
        if (err)
            console.log(err);
        else
            console.log(result);
    });
});

ccznp.on('AREQ', function(result) {
    console.log(result);
});

ccznp.init(spCfg, function (err) {
    if (err)
        console.log(err);
});
