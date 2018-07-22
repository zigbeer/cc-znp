const expect = require('chai').expect;

const ccznp = require('../');

describe('Signature Check', () => {
    it('ccznp.init(spCfg[, callback])', () => {
        expect(() => ccznp.init({
            path: 'xxx',
        })).to.not.throw();

        ccznp._sp = null;
        expect(() => ccznp.init({})).to.throw();
        ccznp._sp = null;
        expect(() => ccznp.init([])).to.throw();
        ccznp._sp = null;
        expect(() => ccznp.init('xxx')).to.throw();
        ccznp._sp = null;
        expect(() => ccznp.init(123)).to.throw();
        ccznp._sp = null;
        expect(() => ccznp.init(false)).to.throw();
        ccznp._sp = null;
        expect(() => ccznp.init(undefined)).to.throw();
        ccznp._sp = null;
        expect(() => ccznp.init(null)).to.throw();
    });

    it('ccznp.request(subsys, cmdId, valObj, callback)', () => {
        ccznp._init = true;

        ccznp._spinLock = false;
        expect(() => ccznp.request({}, 'ping', [], () => {})).to.throw('Unrecognized subsystem');
        ccznp._spinLock = false;
        expect(() => ccznp.request([], 'ping', [], () => {})).to.throw('Unrecognized subsystem');
        ccznp._spinLock = false;
        expect(() => ccznp.request('xxx', 'ping', [], () => {})).to.throw('Unrecognized subsystem');
        ccznp._spinLock = false;
        expect(() => ccznp.request(123, 'ping', [], () => {})).to.throw('Unrecognized subsystem');
        ccznp._spinLock = false;
        expect(() => ccznp.request(false, 'ping', [], () => {})).to.throw('Unrecognized subsystem');
        ccznp._spinLock = false;
        expect(() => ccznp.request(undefined, 'ping', [], () => {})).to.throw('Unrecognized subsystem');
        ccznp._spinLock = false;
        expect(() => ccznp.request(null, 'ping', [], () => {})).to.throw('Unrecognized subsystem');

        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', {}, [], () => {})).to.throw('Unrecognized command');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', [], [], () => {})).to.throw('Unrecognized command');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'xxx', [], () => {})).to.throw('Unrecognized command');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 123, [], () => {})).to.throw('Unrecognized command');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', false, [], () => {})).to.throw('Unrecognized command');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', undefined, [], () => {})).to.throw('Unrecognized command');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', null, [], () => {})).to.throw('Unrecognized command');

        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', 'xxx', () => {})).to.throw('valObj should be an object');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', 123, () => {})).to.throw('valObj should be an object');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', false, () => {})).to.throw('valObj should be an object');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', undefined, () => {})).to.throw('valObj should be an object');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', null, () => {})).to.throw('valObj should be an object');

        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', [], {})).to.throw('callback should be a function');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', [], [])).to.throw('callback should be a function');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', [], 'xxx')).to.throw('callback should be a function');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', [], 123)).to.throw('callback should be a function');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', [], false)).to.throw('callback should be a function');
        ccznp._spinLock = false;
        expect(() => ccznp.request('SYS', 'ping', [], null)).to.throw('callback should be a function');
        ccznp._spinLock = false;
    });
});

describe('Functional Check', function() {
    it('ccznp.init()', (done) => {
        ccznp.on('ready', () => {
            if (ccznp._init === true) {
                done();
            }
        });
        ccznp.init({
            path: 'xxx',
        }, (err) => {
            ccznp._sp.open = (callback) => {
                callback(null);
            };
            ccznp.init({
                path: 'xxx',
            }, (err) => {
                if (!err) {
                    ccznp.emit('_ready');
                }
            });
        });
    });

    this.timeout(5000);
    it('ccznp.request() - timeout', (done) => {
        ccznp._unpi.send = () => {};
        ccznp.request('SYS', 'ping', {}, (err, result) => {
            if (err.message === 'request timeout') {
                done();
            }
        });
    });

    it('ccznp.request()', (done) => {
        const rsp = {
            status: 0,
        };

        ccznp._unpi.send = () => {};
        ccznp.request('SYS', 'ping', {}, function(err, result) {
            if (err) {
                console.log(err);
            } else if (result === rsp && ccznp._spinLock === false) {
                done();
            }
        });
        ccznp.emit('SRSP:SYS:ping', rsp);
    });

    it('event: data', (done) => {
        const data = {
            sof: 254,
            len: 5,
            type: 3,
            subsys: 1,
            cmd: 2,
            payload: new Buffer([0, 1, 2, 3, 4]),
            fcs: 100,
            csum: 100,
        };
        let dataEvtFlag = false;

        ccznp.on('data', function(msg) {
            if (msg === data) {
                dataEvtFlag = true;
            }
        });
        ccznp.on('SRSP:SYS:version', function(result) {
            let flag = true;
            const parsedResult = {
                transportrev: 0,
                product: 1,
                majorrel: 2,
                minorrel: 3,
                maintrel: 4,
            };

            for (let key in result) {
                if (parsedResult[key] !== result[key]) {
                    flag = false;
                }
            }

            if (dataEvtFlag && flag) {
                done();
            }
        });

        ccznp._unpi.emit('data', data);
    });

    it('event: AREQ', (done) => {
        const data = {
            sof: 254,
            len: 3,
            type: 2,
            subsys: 4,
            cmd: 128,
            payload: new Buffer([0, 8, 30]),
            fcs: 100,
            csum: 100,
        };

        let dataEvtFlag = false;

        ccznp.on('data', function(msg) {
            if (msg === data) {
                dataEvtFlag = true;
            }
        });

        ccznp.on('AREQ', function(result) {
            let flag = true;
            const parsedResult = {
                subsys: 'AF',
                ind: 'dataConfirm',
                data: {
                    status: 0,
                    endpoint: 8,
                    transid: 30,
                },
            };

            for (let key in result) {
                if (key !== 'data' && parsedResult[key] !== result[key]) {
                    flag = false;
                }
            }

            for (let field in result[data]) {
                if (parsedResult.data[field] !== result.data[field]) {
                    flag = false;
                }
            }

            if (dataEvtFlag && flag) {
                done();
            }
        });

        ccznp._unpi.emit('data', data);
    });
});