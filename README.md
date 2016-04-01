cc-znp
========================

**cc-znp** is the interface for a host to communicate with TI **CC**253X **Z**igBee **N**etwork **P**rocessor(ZNP) over a serial port.  

## Table of Contents  

1. [Overview](#Overiew)  
2. [Zigbee Network Processor](#ZNP)  
3. [Installation](#Installation)  
4. [Usage](#Usage)  
5. [APIs](#APIs): init(), close(), and request()  
6. [Events](#Events): 'ready', 'colse', and 'AREQ'  
7. [Contributor](#Contributor)  
8. [Z-Stack MT API Reference Tables](#ApiTables)  

<a name="Overiew"></a>
## 1. Overview  

**cc-znp** allows you to interact with TI's CC253X ZigBee Network Processor(ZNP) on node.js via *TI Z-Stack Monitor and Test(MT) APIs*.  

<a name="ZNP"></a>
## 2. ZigBee Network Processor (ZNP)  

The following diagram shows the scenario when CC253X operates as a ZNP. In this case, the ZigBee stack runs on CC253X, and the application runs on an
external microcontroller or PC.Therefore application can be externally developed on an application processor. The application can communicate with ZNP through TI's Monitor and Test commands upon an UART interface.  

![Network Processor Configuration](https://github.com/jackchased/cc-znp/blob/master/documents/znp.png)

<a name="Installation"></a>
## 3. Installation  

> $ npm install cc-znp --save

<a name="Usage"></a>
## 4. Usage  

To begin with **cc-znp**, you must firstly set up the serial port and call the [init()](#API_init) method:  

``` javascript
var ccznp = require('cc-znp');
var spCfg = {
    path: '/dev/ttyUSB0',
    options: {
        baudrate: 115200,
        flowControl: true,
        rtscts: true        
    }
};

ccznp.on('ready', function () {
    console.log('Initialization completes.');
});

ccznp.init(spCfg, function (err) {
    console.log(err);
});
```

<a name="APIs"></a>
## 5. APIs  

* [init()](#API_init)  
* [close()](#API_close)  
* [request()](#API_request)  

*************************************************
<a name="API_init"></a>
### .init(spCfg, callback)

Create a new serial port on `spCfg.path` and connect to CC253X SoC.  

**Arguments:**  

1. `spCfg` (_Object_): Configuration of the [seiralport](https://www.npmjs.com/package/serialport#to-use) instance. Accepted properties of `spCfg` are listed in the following table.  

    | Property     | Type    | Description                                                                                                             |
    |--------------|---------|-------------------------------------------------------------------------------------------------------------------------|
    | path         | String  | The system path of the serial port to open. e.g., `/dev/ttyUSB0`.                                                       |
    | options      | Object  | Port configuration [options](https://www.npmjs.com/package/serialport#serialport-path-options-openimmediately-callback).|
2. `callback`(_Function_): `function (err) { ... }`  

**Returns:**  
* _none_

**Examples:**  

```js
var ccznp = require('cc-znp');
var spCfg = {
    path: '/dev/ttyUSB0',
    options: {
        baudrate: 115200,
        flowControl: true,
        rtscts: true
    }
};

ccznp.on('ready', function () {
    console.log('Initialization completes.');
});

ccznp.init(spCfg, function (err) {
    console.log(err);
});
```

*************************************************
<a name="API_close"></a>
### .close([callback])

This method will close the opened serial port.  

**Arguments:**  

1. `callback`(_Function_, optional): `function (err) { ... }`  

**Returns:**   
* _none_

**Examples:**  

```js
ccznp.close(function (err) {
    if (err) console.log(err);
});
```

*************************************************
<a name="API_request"></a>
### .request(subsys, cmdId, valObj, callback)

Calls TI Z-Stack Monitor and Test Commands.  

**Arguments:**  

1. `subsys`(_Number_ | _String_): The subsystem. For example, send a command of subsystem 'SYS', you can set `subsys` to `1` or `'SYS'`.  
2. `cmdId`(_Number_ | _String_): The command id which is a number or string according to which subsystem you are using.  
3. `valObj`(_Object_): An argument object along with the specified command.  
4. `callback`(_Function_): `function (err, result) {...}`. Get called when the 'SREQ' message is received.  

**Returns:**  
* _none_

**Examples:**  

```js
// example of calling ping() from the subsystem 'SYS'
ccznp.request('SYS', 'ping', {}, function (err, result) {
    if (err) 
        console.log(err);
    else 
        console.log(result);
});

ccznp.request(1, 1, {}, function (err, result) {
    if (err) 
        console.log(err);
    else 
        console.log(result);
});
```

**Request Shorthands:**  

1. **.sysRequest(cmdId, valObj, callback)**  
2. **.macRequest(cmdId, valObj, callback)**  
3. **.nwkRequest(cmdId, valObj, callback)**  
4. **.afRequest(cmdId, valObj, callback)**  
5. **.zdoRequest(cmdId, valObj, callback)**  
6. **.sapiRequest(cmdId, valObj, callback)**  
7. **.utilRequest(cmdId, valObj, callback)**  
8. **.dbgRequest(cmdId, valObj, callback)**  
9. **.appRequest(cmdId, valObj, callback)**  

**Examples:**  

```js
// example of calling ping() from the subsystem 'SYS'
ccznp.sysRequest('ping', {}, function (err, result) {
    console.log(result);
});
ccznp.sysRequest(1, {}, function (err, result) {
    console.log(result);
});

// example of calling setPanid() from the subsystem 'UTIL'
ccznp.utilRequest('setPanid', {panid: 0xFFFF}, function (err, result) {
    console.log(result);
});
ccznp.utilRequest(2, {panid: 0xFFFF}, function (err, result) {
    console.log(result);
});
```

<a name="Events"></a>
## 6. Events
* [ready](#EVT_ready)  
* [close](#EVT_close)  
* [AREQ](#EVT_AREQ)  

*************************************************
<a name="EVT_ready"></a>
### ccznp.on('ready', function () {...})
The 'ready' event will be fired when the initializing procedure completes.  

**Examples:**  

```js
ccznp.on('ready', function () {
    console.log('Initialization completes.');
});
```

*************************************************
<a name="EVT_close"></a>
### ccznp.on('close', function () {...})
Fired when the serial port is closed.  

**Examples:**  

```js
ccznp.on('close', function () {
    console.log('The serialport is closed.');
});
```

*************************************************
<a name="EVT_AREQ"></a>
### ccznp.on('AREQ', function (data) {...})
When there is an 'AREQ' message coming from ZNP, an 'AREQ' event will be fired along with the data of message information.  

**Examples:**  

```js
ccznp.on('AREQ', function (data) {
    console.log(data);
});
```

<a name="Contributor"></a>
## 7. Contributor

* [Simen Li](https://www.npmjs.com/~simenkid)

<a name="ApiTables"></a>
## 8. Z-Stack MT API Reference Tables  

<a name="SysTable"></a>
### 8.1 ccznp.sysRequest APIs  

* Commands  

    | ZigBee MT APIs              | cc-znp APIs          | Type     | Arguments                                     | Result                                              |
    |-----------------------------|----------------------|----------|-----------------------------------------------|-----------------------------------------------------|
    | SYS_RESET_REQ               | resetReq             | AREQ     | type                                          | _none_                                              |
    | SYS_PING                    | ping                 | SREQ     | _none_                                        | capabilities                                        |
    | SYS_VERSION                 | version              | SREQ     | _none_                                        | transportrev, product, majorrel, minorrel, maintrel |
    | SYS_SET_EXTADDR             | setExtAddr           | SREQ     | extaddress                                    | status                                              |
    | SYS_GET_EXTADDR             | getExtAddr           | SREQ     | _none_                                        | extaddress                                          |
    | SYS_RAM_READ                | ramRead              | SREQ     | address, len                                  | status, len, value                                  |
    | SYS_RAM_WRITE               | ramWrite             | SREQ     | address, len, value                           | status                                              |
    | SYS_OSAL_NV_READ            | osalNvRead           | SREQ     | id, offset                                    | status, len, value                                  |
    | SYS_OSAL_NV_WRITE           | osalNvWrite          | SREQ     | id, offset, len, value                        | status                                              |
    | SYS_OSAL_NV_ITEM_INIT       | osalNvItemInit       | SREQ     | id, len, initlen, initvalue                   | status                                              |
    | SYS_OSAL_NV_DELETE          | osalNvDelete         | SREQ     | id, len                                       | status                                              |
    | SYS_OSAL_NV_LENGTH          | osalNvLength         | SREQ     | id                                            | length                                              |
    | SYS_OSAL_START_TIMER        | osalStartTimer       | SREQ     | id, timeout                                   | status                                              |
    | SYS_OSAL_STOP_TIMER         | osalStopTimer        | SREQ     | id                                            | status                                              |
    | SYS_RANDOM                  | random               | SREQ     | _none_                                        | value                                               |
    | SYS_ADC_READ                | adcRead              | SREQ     | channel, resolution                           | value                                               |
    | SYS_GPIO                    | gpio                 | SREQ     | operation, value                              | value                                               |
    | SYS_STACK_TUNE              | stackTune            | SREQ     | operation, value                              | value                                               |
    | SYS_SET_TIME                | setTime              | SREQ     | utc, hour, minute, second, month, day, year   | status                                              |
    | SYS_GET_TIME                | getTime              | SREQ     | _none_                                        | utc, hour, minute, second, month, day, year         |
    | SYS_SET_TX_POWER            | setTxPower           | SREQ     | level                                         | txpower                                             |
    | SYS_ZDIAGS_INIT_STATS       | zdiagsInitStats      | SREQ     | _none_                                        | status                                              |
    | SYS_ZDIAGS_CLEAR_STATS      | zdiagsClearStats     | SREQ     | clearnv                                       | sysclock                                            |
    | SYS_ZDIAGS_GET_STATS        | zdiagsGetStats       | SREQ     | attributeid                                   | attributevalue                                      |
    | SYS_ZDIAGS_RESTORE_STATS_NV | zdiagsRestoreStatsNv | SREQ     | _none_                                        | status                                              |
    | SYS_ZDIAGS_SAVE_STATS_TO_NV | zdiagsSaveStatsToNv  | SREQ     | _none_                                        | sysclock                                            |
    | SYS_OSAL_NV_READ_EXT        | osalNvReadExt        | SREQ     | id, offset                                    | status, len, value                                  |
    | SYS_OSAL_NV_WRITE_EXT       | osalNvWriteExt       | SREQ     | id, offset, len, value                        | status                                              |
    |                             | jammerParameters     | SREQ     | jmrcntievents, jmrhinoiselvl, jmrdetectperiod | status                                              |
    |                             | snifferParameters    | SREQ     | param                                         | status                                              |

* Callbacks  

    | ZigBee MT APIs         | cc-znp APIs      | Type     | Result                                                     |
    |------------------------|------------------|----------|------------------------------------------------------------|
    | SYS_RESET_IND          | resetInd         |   AREQ   | reason, transportrev, productid, majorrel, minorrel, hwrev |
    | SYS_OSAL_TIMER_EXPIRED | osalTimerExpired |   AREQ   | id                                                         |
    |                        | jammerInd        |   AREQ   | jammerind                                                  |

<a name="MacTable"></a>
### 8.2 ccznp.macRequest APIs  

* Commands  

    | ZigBee MT APIs       | cc-znp APIs     | Type | Arguments                                                                                                                                                                                                                                                                       | Result       |
    |----------------------|-----------------|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
    | MAC_RESET_REQ        | resetReq        | SREQ | setdefault                                                                                                                                                                                                                                                                      | status       |
    | MAC_INIT             | init            | SREQ | _none_                                                                                                                                                                                                                                                                          | status       |
    | MAC_START_REQ        | startReq        | SREQ | starttime, panid, logicalchannel, channelpage, beaconorder, superframeorder, pancoordinator, batterylifeext, coordrealignment, realignkeysource, realignsecuritylevel, realignkeyidmode, realignkeyindex, beaconkeysource, beaconsecuritylevel, beaconkeyidmode, beaconkeyindex | status       |
    | MAC_SYNC_REQ         | syncReq         | SREQ | logicalchannel, channelpage, trackbeacon                                                                                                                                                                                                                                        | status       |
    | MAC_DATA_REQ         | dataReq         | SREQ | destaddressmode, destaddress, destpanid, srcaddressmode, handle, txoption, logicalchannel, power, keysource, securitylevel, keyidmode, keyindex, msdulength, msdu                                                                                                               | status       |
    | MAC_ASSOCIATE_REQ    | associateReq    | SREQ | logicalchannel, channelpage, coordaddressmode, coordaddress, coordpanid, capabilityinformation, keysource, securitylevel, keyidmode, keyindex                                                                                                                                   | status       |
    | MAC_ASSOCIATE_RSP    | associateRsp    | SREQ | extaddr, assocshortaddress, assocstatus                                                                                                                                                                                                                                         | status       |
    | MAC_DISASSOCIATE_REQ | disassociateReq | SREQ | deviceaddressmode, deviceaddress, devicepanid, disassociatereason, txindirect, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                    | status       |
    | MAC_GET_REQ          | getReq          | SREQ | attribute                                                                                                                                                                                                                                                                       | status, data |
    | MAC_SET_REQ          | setReq          | SREQ | attribute, attributevalue                                                                                                                                                                                                                                                       | status       |
    | MAC_SCAN_REQ         | scanReq         | SREQ | scanchannels, scantype, scanduration, channelpage, maxresults, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                                    | status       |
    | MAC_ORPHAN_RSP       | orphanRsp       | SREQ | extaddr, assocshortaddress, associatedmember                                                                                                                                                                                                                                    | status       |
    | MAC_POLL_REQ         | pollReq         | SREQ | coordaddressmode, coordaddress, coordpanid, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                                                       | status       |
    | MAC_PURGE_REQ        | purgeReq        | SREQ | msduhandle                                                                                                                                                                                                                                                                      | status       |
    | MAC_SET_RX_GAIN_REQ  | setRxGainReq    | SREQ | mode                                                                                                                                                                                                                                                                            | status       |
    |                      | securityGetReq  | SREQ | attribute, index1, index2                                                                                                                                                                                                                                                       | status       |
    |                      | securitySetReq  | SREQ | attribute, attributevalue                                                                                                                                                                                                                                                       | status       |

* Callbacks  

    | ZigBee MT APIs        | cc-znp APIs     | Type | Result                                                                                                                                                                                                                                           |
    |-----------------------|-----------------|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | MAC_SYNC_LOSS_IND     | syncLossInd     | AREQ | status, panid, logicalchannel, channelpage, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                        |
    | MAC_ASSOCIATE_IND     | associateInd    | AREQ | deviceextendedaddress, capabilities, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                               |
    | MAC_ASSOCIATE_CNF     | associateCnf    | AREQ | status, deviceshortaddress, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                                        |
    | MAC_BEACON_NOTIFY_IND | beaconNotifyInd | AREQ | bsn, timestamp, coordinatoraddressmode, coordinatorextendedaddress, panid, superframespec, logicalchannel, gtspermit, linkquality, securityfailure, keysource, securitylevel, keyidmode, keyindex, pendingaddrspec, addresslist, sdulength, nsdu |
    | MAC_DATA_CNF          | dataCnf         | AREQ | status, handle, timestamp, timestamp2                                                                                                                                                                                                            |
    | MAC_DATA_IND          | dataInd         | AREQ | srcaddrmode, srcaddr, dstaddrmode, dstaddr, timestamp, timestamp2, srcpanid, dstpanid, linkquality, correlation, rssi, dsn, keysource, securitylevel, keyidmode, keyindex, length, data                                                          |
    | MAC_DISASSOCIATE_IND  | disassociateInd | AREQ | extendedaddress, disassociatereason, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                               |
    | MAC_DISASSOCIATE_CNF  | disassociateCnf | AREQ | status, deviceaddrmode, deviceaddr, devicepanid                                                                                                                                                                                                  |
    | MAC_ORPHAN_IND        | orphanInd       | AREQ | extendedaddr, keysource, securitylevel, keyidmode, keyindex                                                                                                                                                                                      |
    | MAC_POLL_CNF          | pollCnf         | AREQ | status                                                                                                                                                                                                                                           |
    | MAC_SCAN_CNF          | scanCnf         | AREQ | status, ed, scantype, channelpage, unscannedchannellist, resultlistcount, resultlistmaxlength, resultlist                                                                                                                                        |
    | MAC_COMM_STATUS_IND   | commStatusInd   | AREQ | status, srcaddrmode, srcaddr, dstaddrmode, dstaddr, devicepanid, reason, keysource, securitylevel, keyidmode, keyindex                                                                                                                           |
    | MAC_START_CNF         | startCnf        | AREQ | status                                                                                                                                                                                                                                           |
    | MAC_RX_ENABLE_CNF     | rxEnableCnf     | AREQ | status                                                                                                                                                                                                                                           |
    | MAC_PURGE_CNF         | purgeCnf        | AREQ | status, handle                                                                                                                                                                                                                                   |
