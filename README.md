cc-znp
========================

**cc-znp** is the interface for a host to communicate with TI **CC**253X **Z**igBee **N**etwork **P**rocessor(ZNP) over a serial port.  

[![NPM](https://nodei.co/npm/cc-znp.png?downloads=true)](https://nodei.co/npm/cc-znp/)  

[![Travis branch](https://img.shields.io/travis/zigbeer/cc-znp/master.svg?maxAge=2592000)](https://travis-ci.org/zigbeer/cc-znp)
[![npm](https://img.shields.io/npm/v/cc-znp.svg?maxAge=2592000)](https://www.npmjs.com/package/cc-znp)
[![npm](https://img.shields.io/npm/l/cc-znp.svg?maxAge=2592000)](https://www.npmjs.com/package/cc-znp)

<br />

## Table of Contents  

1. [Overview](#Overview)  
2. [ZigBee Network Processor](#ZNP)  
3. [Installation](#Installation)  
4. [Usage](#Usage)  
5. [APIs](#APIs): init(), close(), request(), and sendCmd()  
6. [Events](#Events): 'ready', 'colse', 'data', and 'AREQ'  
7. [Z-Stack MT API Reference Tables](#ApiTables)  
8. [Contributors](#Contributors)  
9. [License](#License)  

<a name="Overview"></a>
## 1. Overview  

**cc-znp** allows you to interact with TI's CC253X ZigBee Network Processor(ZNP) on node.js via *TI Z-Stack Monitor and Test(MT) APIs* upon an UART interface.  

This project aims to provide an opportunity for those who like to build IoT applications with zigbee on node.js. With node.js, back-end developers can have RESTful APIs to bring zigbee machines to web world easily, and can push machines to the cloud as well. For front-end developers, they can do more creative things with Javascript, and can build any fascinating GUI they want with many cool UI frameworks.  

<a name="ZNP"></a>
## 2. ZigBee Network Processor  

The following diagram shows the scenario when CC253X operates as a ZNP. In this case, the ZigBee stack is running on CC253X, and the application (app) is running on an external host, i.e. a microcontroller or an application processor. The app can do its job in a resourceful environment and work with ZNP for network transportation.  

![Network Processor Configuration](https://github.com/zigbeer/documents/blob/master/cc-znp/znp.png)

<a name="Installation"></a>
## 3. Installation  

> $ npm install cc-znp --save

<a name="Usage"></a>
## 4. Usage  

To begin with **cc-znp**, firstly set up the serial port and call [init() API](#API_init) to enable the interface:  

```js
var znp = require('cc-znp');
var spCfg = {
    path: '/dev/ttyUSB0',
    options: {
        baudrate: 115200,
        flowControl: true,
        rtscts: true
    }
};

znp.on('ready', function () {
    console.log('Initialization completes.');

    // start to run your application

});

znp.init(spCfg, function (err) {
    console.log(err);
});
```

<a name="APIs"></a>
## 5. APIs  

* [init()](#API_init)  
* [close()](#API_close)  
* [request()](#API_request)  
* [sendCmd()](#API_sendCmd)  

*************************************************
<a name="API_init"></a>
### .init(spCfg, callback)

Enable a serial port connecting to CC253X SoC with given `spCfg.path`.  

**Arguments:**  

1. `spCfg` (_Object_): Configuration of the [seiralport](https://www.npmjs.com/package/serialport#to-use) instance. Accepted properties of `spCfg` are listed in the following table.  

    | Property     | Type    | Description                                                                                                             |
    |--------------|---------|-------------------------------------------------------------------------------------------------------------------------|
    | path         | String  | System path of the serial port to open. e.g., `/dev/ttyUSB0`.                                                           |
    | options      | Object  | Port configuration [options](https://www.npmjs.com/package/serialport#serialport-path-options-openimmediately-callback).|

2. `callback` (_Function_): `function (err) { ... }`  

**Returns:**  

* _none_

**Examples:**  

```js
var znp = require('cc-znp');
var spCfg = {
    path: '/dev/ttyUSB0',
    options: {
        baudrate: 115200,
        flowControl: true,
        rtscts: true
    }
};

znp.init(spCfg, function (err) {
    console.log(err);
});
```

*************************************************
<a name="API_close"></a>
### .close([callback])

This method will close the opened serial port.  

**Arguments:**  

1. `callback` (_Function_, optional): `function (err) { ... }`  

**Returns:**   

* _none_

**Examples:**  

```js
znp.close(function (err) {
    if (err)
        console.log(err);
});
```

*************************************************
<a name="API_request"></a>
### .request(subsys, cmdId, valObj, callback)

Invoke TI Z-Stack Monitor and Test Commands.  

**Arguments:**  

1. `subsys` (_Number_ | _String_): Subsystem, i.e., set it to `1` or `'SYS'` to invoke a SYS command.  

2. `cmdId` (_Number_ | _String_): Command id of which subsys command you like to invoke. See [Z-Stack MT API Reference Tables](#ApiTables) Section.  

3. `valObj` (_Object_): An argument object of the command.  

4. `callback` (_Function_): `function (err, result) { ... }`. Get called when the 'SRSP' is received.  

* Subsystem  

    ```js
    {
        "SYS": 1,
        "MAC": 2,
        "NWK": 3,
        "AF": 4,
        "ZDO": 5,
        "SAPI": 6,
        "UTIL": 7,
        "DBG": 8,
        "APP": 9
    }
    ```

**Returns:**  

* _none_

**Examples:**  

```js
// example of calling ping() from the subsystem 'SYS'
znp.request('SYS', 'ping', {}, function (err, result) {
    if (err) 
        console.log(err);
    else 
        console.log(result);    // { capabilities: 121 }
});

// use numbered ids. The first 1 is subsystem 'SYS', and the second 1 is command 'ping'
znp.request(1, 1, {}, function (err, result) {
    if (err) 
        console.log(err);
    else 
        console.log(result);    // { capabilities: 121 }
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
// examples with shorthands

znp.sysRequest('ping', {}, function (err, result) {
    console.log(result);    // { capabilities: 121 }
});

znp.utilRequest('setPanid', { panid: 0xFFFF }, function (err, result) {
    console.log(result);    // { status: 0 }
});
```

*************************************************
<a name="API_sendCmd"></a>
### .sendCmd(type, subsys, cmdId, payload)

Exports the dependencies [Unpi](https://www.npmjs.com/package/unpi) [send() API](https://www.npmjs.com/package/unpi#API_send), you can take it to send some binary data.  

**Arguments:**  

1. `type` (_Number_ | _String_): The [command type](https://www.npmjs.com/package/unpi#Appendix). For exmaple, set `type` to `1` or `'SREQ'` to send a synchronous command.  

2. `subsys` (_Number_ | _String_): The [subsystem](https://www.npmjs.com/package/unpi#Appendix). For example, send a command of subsystem 'RPC_SYS_UTIL', you can set `subsys` to `7`, `'RPC_SYS_UTIL'`, or simply `'UTIL'` (the prefix `'RPC_SYS_'` can be ignored).  

3. `cmdId` (_Number_): The command id which is a number according to which subsystem you are using.  

4. `payload` (_Buffer_): The data payload.  

**Returns:**  

* (_Buffer_): Buffer of the built command packet.  

**Examples:**  

```js
// The following calls do the same thing
znp.send('AREQ', 'SYS', 0, new Buffer([ 0 ]));
znp.send('AREQ', 1, 0, new Buffer([ 0 ]));
znp.send(2, 'SYS', 0, new Buffer([ 0 ]));
znp.send(2, 1, 0, new Buffer([ 0 ]));
```

<a name="Events"></a>
## 6. Events  
* [ready](#EVT_ready)  
* [close](#EVT_close)  
* [data](#EVT_data)  
* [AREQ](#EVT_AREQ)  

*************************************************
<a name="EVT_ready"></a>
### .on('ready', function () { ... })

'ready' event will be fired when the initializing procedure accomplishes.  

**Examples:**  

```js
znp.on('ready', function () {
    console.log('Initialization completes.');
});
```

*************************************************
<a name="EVT_close"></a>
### .on('close', function () { ... })

Fired when the serial port is closed.  

**Examples:**  

```js
znp.on('close', function () {
    console.log('The serialport is closed.');
});
```

*************************************************
<a name="EVT_data"></a>
### .on('data', function (data) { ... })

The 'data' event will be fired along with the parsed result. Here is an example of the parsed data to show you the format. The `csum` is the checksum calculated from the received binaries. You can use it to check that if the received packet is corrupted.  

```js
{ 
    sof: 254,
    len: 6,
    type: 2,
    subsys: 1,
    cmd: 128,
    payload: <Buffer 02 02 00 02 06 02>,
    fcs: 193,  // this is the checksum originated from the sender
    csum: 193  // this is the checksum calculated from the received binaries
}
```

**Examples:**  
    
```js
znp.on('data', function (data) {
    console.log(data);  // The parsed data
});
```

*************************************************
<a name="EVT_AREQ"></a>
### .on('AREQ', function (msg) { ... })

When there is an 'AREQ' message coming from ZNP, an 'AREQ' event will be fired along with the message content. Here is an example of the msg format.  

```js
{
    subsys: 'ZDO',
    ind: 'endDeviceAnnceInd',
    data: { srcaddr: 63536, nwkaddr: 63536, ieeeaddr: '0x00124b0001ce3631', capabilities: 142 }
}
```

**Examples:**  

```js
znp.on('AREQ', function (msg) {
    console.log(msg);
});
```

<a name="ApiTables"></a>
## 7. Z-Stack MT API Reference Tables  

These tables are cross-references between the **Z-Stack Monitor and Test API** and **cc-znp API**. Here is the description of each column in the table:  

**Commands Table:**  
* ZigBee MT Cmd:  
    * The command name documented in [Z-Stack Monitor and Test API.pdf](https://github.com/zigbeer/documents/blob/master/cc-znp/Z-Stack%20Monitor%20and%20Test%20API.pdf).  
* cc-znp CmdId:  
    * The cmdId name, in cc-znp, according to a Z-Stack MT API.  
* Type:  
    * Synchronous or Asynchronous request.  
* Arguments:  
    * Required parameters of a cc-znp CmdId.  
* Result:  
    * Resulted data object passing to the [request() API](#API_request) callback.  

**Indication Table:**  
* msg.ind:  
    * Denotes the indication command.  
* msg.data:  
    * An AREQ message content.  

**The cc-znp commands:**  
* [SYS Table](#SysTable)  
* [MAC Table](#MacTable)  
* [AF Table](#AfTable)  
* [ZDO Tables](#ZdoTable)  
* [SAPI Table](#SapiTable)  
* [UTIL Table](#UtilTable)  
* [DBG Table](#DbgTable)  
* [APP Table](#AppTable)  

*************************************************
<a name="SysTable"></a>
### 7.1 SYS Table  

* Commands  

    | ZigBee MT Cmd               | cc-znp CmdId         | Type     | Arguments                                           | Result                                                    |
    |-----------------------------|----------------------|----------|-----------------------------------------------------|-----------------------------------------------------------|
    | SYS_RESET_REQ               | resetReq             | AREQ     | `{ type }`                                          | _none_                                                    |
    | SYS_PING                    | ping                 | SREQ     | `{ }`                                               | `{ capabilities }`                                        |
    | SYS_VERSION                 | version              | SREQ     | `{ }`                                               | `{ transportrev, product, majorrel, minorrel, maintrel }` |
    | SYS_SET_EXTADDR             | setExtAddr           | SREQ     | `{ extaddress }`                                    | `{ status }`                                              |
    | SYS_GET_EXTADDR             | getExtAddr           | SREQ     | `{ }`                                               | `{ extaddress }`                                          |
    | SYS_RAM_READ                | ramRead              | SREQ     | `{ address, len }`                                  | `{ status, len, value }`                                  |
    | SYS_RAM_WRITE               | ramWrite             | SREQ     | `{ address, len, value }`                           | `{ status }`                                              |
    | SYS_OSAL_NV_READ            | osalNvRead           | SREQ     | `{ id, offset }`                                    | `{ status, len, value }`                                  |
    | SYS_OSAL_NV_WRITE           | osalNvWrite          | SREQ     | `{ id, offset, len, value }`                        | `{ status }`                                              |
    | SYS_OSAL_NV_ITEM_INIT       | osalNvItemInit       | SREQ     | `{ id, len, initlen, initvalue }`                   | `{ status }`                                              |
    | SYS_OSAL_NV_DELETE          | osalNvDelete         | SREQ     | `{ id, len }`                                       | `{ status }`                                              |
    | SYS_OSAL_NV_LENGTH          | osalNvLength         | SREQ     | `{ id }`                                            | `{ length }`                                              |
    | SYS_OSAL_START_TIMER        | osalStartTimer       | SREQ     | `{ id, timeout }`                                   | `{ status }`                                              |
    | SYS_OSAL_STOP_TIMER         | osalStopTimer        | SREQ     | `{ id }`                                            | `{ status }`                                              |
    | SYS_RANDOM                  | random               | SREQ     | `{ }`                                               | `{ value }`                                               |
    | SYS_ADC_READ                | adcRead              | SREQ     | `{ channel, resolution }`                           | `{ value }`                                               |
    | SYS_GPIO                    | gpio                 | SREQ     | `{ operation, value }`                              | `{ value }`                                               |
    | SYS_STACK_TUNE              | stackTune            | SREQ     | `{ operation, value }`                              | `{ value }`                                               |
    | SYS_SET_TIME                | setTime              | SREQ     | `{ utc, hour, minute, second, month, day, year }`   | `{ status }`                                              |
    | SYS_GET_TIME                | getTime              | SREQ     | `{ }`                                               | `{ utc, hour, minute, second, month, day, year }`         |
    | SYS_SET_TX_POWER            | setTxPower           | SREQ     | `{ level }`                                         | `{ txpower }`                                             |
    | SYS_ZDIAGS_INIT_STATS       | zdiagsInitStats      | SREQ     | `{ }`                                               | `{ status }`                                              |
    | SYS_ZDIAGS_CLEAR_STATS      | zdiagsClearStats     | SREQ     | `{ clearnv }`                                       | `{ sysclock }`                                            |
    | SYS_ZDIAGS_GET_STATS        | zdiagsGetStats       | SREQ     | `{ attributeid }`                                   | `{ attributevalue }`                                      |
    | SYS_ZDIAGS_RESTORE_STATS_NV | zdiagsRestoreStatsNv | SREQ     | `{ }`                                               | `{ status }`                                              |
    | SYS_ZDIAGS_SAVE_STATS_TO_NV | zdiagsSaveStatsToNv  | SREQ     | `{ }`                                               | `{ sysclock }`                                            |
    | SYS_NV_CREATE               | nvCreate             | SREQ     | `{ sysid, itemid, subid, len }`                     | `{ status }`                                              |
    | SYS_NV_DELETE               | nvDelete             | SREQ     | `{ sysid, itemid, subid }`                          | `{ status }`                                              |
    | SYS_NV_LENGTH               | nvLength             | SREQ     | `{ sysid, itemid, subid }`                          | `{ len }`                                                 |
    | SYS_NV_READ                 | nvRead               | SREQ     | `{ sysid, itemid, subid, offset, len }`             | `{ status, len, value }`                                  |
    | SYS_NV_WRITE                | nvWrite              | SREQ     | `{ sysid, itemid, subid, offset, len, value }`      | `{ status }`                                              |
    | SYS_NV_UPDATE               | nvUpdate             | SREQ     | `{ sysid, itemid, subid, len, value }`              | `{ status }`                                              |
    | SYS_NV_COMPACT              | nvCompact            | SREQ     | `{ threshold }`                                     | `{ status }`                                              |
    | SYS_OSAL_NV_READ_EXT        | osalNvReadExt        | SREQ     | `{ id, offset }`                                    | `{ status, len, value }`                                  |
    | SYS_OSAL_NV_WRITE_EXT       | osalNvWriteExt       | SREQ     | `{ id, offset, len, value }`                        | `{ status }`                                              |
    |                             | jammerParameters     | SREQ     | `{ jmrcntievents, jmrhinoiselvl, jmrdetectperiod }` | `{ status }`                                              |
    |                             | snifferParameters    | SREQ     | `{ param }`                                         | `{ status }`                                              |

* Indication  

    | ZigBee MT Cmd          | cc-znp Event | msg.ind          | msg.data                                                         |
    |------------------------|--------------|------------------|------------------------------------------------------------------|
    | SYS_RESET_IND          |     AREQ     | resetInd         | `{ reason, transportrev, productid, majorrel, minorrel, hwrev }` |
    | SYS_OSAL_TIMER_EXPIRED |     AREQ     | osalTimerExpired | `{ id }`                                                         |
    |                        |     AREQ     | jammerInd        | `{ jammerind }`                                                  |

*************************************************
<a name="MacTable"></a>
### 7.2 MAC Table  

* Commands  

    | ZigBee MT Cmd        | cc-znp CmdId    | Type | Arguments                                                                                                                                                                                                                                                                             | Result             |
    |----------------------|-----------------|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
    | MAC_RESET_REQ        | resetReq        | SREQ | `{ setdefault }`                                                                                                                                                                                                                                                                      | `{ status }`       |
    | MAC_INIT             | init            | SREQ | `{ }`                                                                                                                                                                                                                                                                          | `{ status }`       |
    | MAC_START_REQ        | startReq        | SREQ | `{ starttime, panid, logicalchannel, channelpage, beaconorder, superframeorder, pancoordinator, batterylifeext, coordrealignment, realignkeysource, realignsecuritylevel, realignkeyidmode, realignkeyindex, beaconkeysource, beaconsecuritylevel, beaconkeyidmode, beaconkeyindex }` | `{ status }`       |
    | MAC_SYNC_REQ         | syncReq         | SREQ | `{ logicalchannel, channelpage, trackbeacon }`                                                                                                                                                                                                                                        | `{ status }`       |
    | MAC_DATA_REQ         | dataReq         | SREQ | `{ destaddressmode, destaddress, destpanid, srcaddressmode, handle, txoption, logicalchannel, power, keysource, securitylevel, keyidmode, keyindex, msdulength, msdu }`                                                                                                               | `{ status }`       |
    | MAC_ASSOCIATE_REQ    | associateReq    | SREQ | `{ logicalchannel, channelpage, coordaddressmode, coordaddress, coordpanid, capabilityinformation, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                   | `{ status }`       |
    | MAC_ASSOCIATE_RSP    | associateRsp    | SREQ | `{ extaddr, assocshortaddress, assocstatus }`                                                                                                                                                                                                                                         | `{ status }`       |
    | MAC_DISASSOCIATE_REQ | disassociateReq | SREQ | `{ deviceaddressmode, deviceaddress, devicepanid, disassociatereason, txindirect, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                    | `{ status }`       |
    | MAC_GET_REQ          | getReq          | SREQ | `{ attribute }`                                                                                                                                                                                                                                                                       | `{ status, data }` |
    | MAC_SET_REQ          | setReq          | SREQ | `{ attribute, attributevalue }`                                                                                                                                                                                                                                                       | `{ status }`       |
    | MAC_SCAN_REQ         | scanReq         | SREQ | `{ scanchannels, scantype, scanduration, channelpage, maxresults, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                                    | `{ status }`       |
    | MAC_ORPHAN_RSP       | orphanRsp       | SREQ | `{ extaddr, assocshortaddress, associatedmember }`                                                                                                                                                                                                                                    | `{ status }`       |
    | MAC_POLL_REQ         | pollReq         | SREQ | `{ coordaddressmode, coordaddress, coordpanid, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                                                       | `{ status }`       |
    | MAC_PURGE_REQ        | purgeReq        | SREQ | `{ msduhandle }`                                                                                                                                                                                                                                                                      | `{ status }`       |
    | MAC_SET_RX_GAIN_REQ  | setRxGainReq    | SREQ | `{ mode }`                                                                                                                                                                                                                                                                            | `{ status }`       |
    |                      | securityGetReq  | SREQ | `{ attribute, index1, index2 }`                                                                                                                                                                                                                                                       | `{ status }`       |
    |                      | securitySetReq  | SREQ | `{ attribute, attributevalue }`                                                                                                                                                                                                                                                       | `{ status }`       |

* Indication  

    | ZigBee MT Cmd         | cc-znp Event | msg.ind         | msg.data                                                                                                                                                                                                                                               |
    |-----------------------|--------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | MAC_SYNC_LOSS_IND     | AREQ         | syncLossInd     | `{ status, panid, logicalchannel, channelpage, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                        |
    | MAC_ASSOCIATE_IND     | AREQ         | associateInd    | `{ deviceextendedaddress, capabilities, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                               |
    | MAC_ASSOCIATE_CNF     | AREQ         | associateCnf    | `{ status, deviceshortaddress, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                                        |
    | MAC_BEACON_NOTIFY_IND | AREQ         | beaconNotifyInd | `{ bsn, timestamp, coordinatoraddressmode, coordinatorextendedaddress, panid, superframespec, logicalchannel, gtspermit, linkquality, securityfailure, keysource, securitylevel, keyidmode, keyindex, pendingaddrspec, addresslist, sdulength, nsdu }` |
    | MAC_DATA_CNF          | AREQ         | dataCnf         | `{ status, handle, timestamp, timestamp2 }`                                                                                                                                                                                                            |
    | MAC_DATA_IND          | AREQ         | dataInd         | `{ srcaddrmode, srcaddr, dstaddrmode, dstaddr, timestamp, timestamp2, srcpanid, dstpanid, linkquality, correlation, rssi, dsn, keysource, securitylevel, keyidmode, keyindex, length, data }`                                                          |
    | MAC_DISASSOCIATE_IND  | AREQ         | disassociateInd | `{ extendedaddress, disassociatereason, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                               |
    | MAC_DISASSOCIATE_CNF  | AREQ         | disassociateCnf | `{ status, deviceaddrmode, deviceaddr, devicepanid }`                                                                                                                                                                                                  |
    | MAC_ORPHAN_IND        | AREQ         | orphanInd       | `{ extendedaddr, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                                                                                      |
    | MAC_POLL_CNF          | AREQ         | pollCnf         | `{ status }`                                                                                                                                                                                                                                           |
    | MAC_SCAN_CNF          | AREQ         | scanCnf         | `{ status, ed, scantype, channelpage, unscannedchannellist, resultlistcount, resultlistmaxlength, resultlist }`                                                                                                                                        |
    | MAC_COMM_STATUS_IND   | AREQ         | commStatusInd   | `{ status, srcaddrmode, srcaddr, dstaddrmode, dstaddr, devicepanid, reason, keysource, securitylevel, keyidmode, keyindex }`                                                                                                                           |
    | MAC_START_CNF         | AREQ         | startCnf        | `{ status }`                                                                                                                                                                                                                                           |
    | MAC_RX_ENABLE_CNF     | AREQ         | rxEnableCnf     | `{ status }`                                                                                                                                                                                                                                           |
    | MAC_PURGE_CNF         | AREQ         | purgeCnf        | `{ status, handle }`                                                                                                                                                                                                                                   |

*************************************************
<a name="AfTable"></a>
### 7.3 AF Table  

* Commands  

    | ZigBee MT Cmd           | cc-znp CmdId      | Type | Arguments                                                                                                                               | Result                               |
    |-------------------------|-------------------|------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
    | AF_REGISTER             | register          | SREQ | `{ endpoint, appprofid, appdeviceid, appdevver, latencyreq, appnuminclusters, appinclusterlist, appnumoutclusters, appoutclusterlist }` | `{ status }`                         |
    | AF_DATA_REQUEST         | dataRequest       | SREQ | `{ dstaddr, destendpoint, srcendpoint, clusterid, transid, options, radius, len, data }`                                                | `{ status }`                         |
    | AF_DATA_REQUEST_EXT     | dataRequestExt    | SREQ | `{ dstaddrmode, dstaddr, destendpoint, dstpanid, srcendpoint, clusterid, transid, options, radius, len, data }`                         | `{ status }`                         |
    | AF_DATA_REQUEST_SRC_RTG | dataRequestSrcRtg | SREQ | `{ dstaddr, destendpoint, srcendpoint, clusterid, transid, options, radius, relaycount, relaylist, len, data }`                         | `{ status }`                         |
    | AF_INTER_PAN_CTL        | interPanCtl       | SREQ | `{ cmd, data }`                                                                                                                         | `{ status }`                         |
    | AF_DATA_STORE           | dataStore         | SREQ | `{ index, length, data }`                                                                                                               | `{ status }`                         |
    | AF_DATA_RETRIEVE        | dataRetrieve      | SREQ | `{ timestamp, index, length }`                                                                                                          | `{ status, length, data }`           |
    | AF_APSF_CONFIG_SET      | apsfConfigSet     | SREQ | `{ endpoint, framedelay, windowsize }`                                                                                                  | `{ status }`                         |
    |                         | apsfConfigGet     | SREQ | `{ endpoint }`                                                                                                                          | `{ framedelay, windowsize, nomean }` |
    |                         | delete            | SREQ | `{ endpoint }`                                                                                                                          | `{ status }`                         |

* Indication  

    | ZigBee MT Cmd       | cc-znp Event | msg.ind        | msg.data                                                                                                                                                         |
    |---------------------|--------------|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | AF_DATA_CONFIRM     | AREQ         | dataConfirm    | `{ status, endpoint, transid }`                                                                                                                                  |
    | AF_REFLECT_ERROR    | AREQ         | reflectError   | `{ status, endpoint, transid, dstaddrmode, dstaddr }`                                                                                                            |
    | AF_INCOMING_MSG     | AREQ         | incomingMsg    | `{ groupid, clusterid, srcaddr, srcendpoint, dstendpoint, wasbroadcast, linkquality, securityuse, timestamp, transseqnumber, len, data }`                        |
    | AF_INCOMING_MSG_EXT | AREQ         | incomingMsgExt | `{ groupid, clusterid, srcaddrmode, srcaddr, srcendpoint, srcpanid, dstendpoint, wasbroadcast, linkquality, securityuse, timestamp, transseqnumber, len, data }` |

*************************************************
<a name="ZdoTable"></a>
### 7.4 ZDO Table  

* Commands  

    | ZigBee MT Cmd                    | cc-znp CmdId             | Type | Arguments                                                                                                               | Result                                                                                                         |
    |----------------------------------|--------------------------|------|-------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
    | ZDO_NWK_ADDR_REQ                 | nwkAddrReq               | SREQ | `{ ieeeaddr, reqtype, startindex }`                                                                                     | `{ status }`                                                                                                   |
    | ZDO_IEEE_ADDR_REQ                | ieeeAddrReq              | SREQ | `{ shortaddr, reqtype, startindex }`                                                                                    | `{ status }`                                                                                                   |
    | ZDO_NODE_DESC_REQ                | nodeDescReq              | SREQ | `{ dstaddr, nwkaddrofinterest }`                                                                                        | `{ status }`                                                                                                   |
    | ZDO_POWER_DESC_REQ               | powerDescReq             | SREQ | `{ dstaddr, nwkaddrofinterest }`                                                                                        | `{ status }`                                                                                                   |
    | ZDO_SIMPLE_DESC_REQ              | simpleDescReq            | SREQ | `{ dstaddr, nwkaddrofinterest, endpoint }`                                                                              | `{ status }`                                                                                                   |
    | ZDO_ACTIVE_EP_REQ                | activeEpReq              | SREQ | `{ dstaddr, nwkaddrofinterest }`                                                                                        | `{ status }`                                                                                                   |
    | ZDO_MATCH_DESC_REQ               | matchDescReq             | SREQ | `{ dstaddr, nwkaddrofinterest, profileid, numinclusters, inclusterlist, numoutclusters, outclusterlist }`               | `{ status }`                                                                                                   |
    | ZDO_COMPLEX_DESC_REQ             | complexDescReq           | SREQ | `{ dstaddr, nwkaddrofinterest }`                                                                                        | `{ status }`                                                                                                   |
    | ZDO_USER_DESC_REQ                | userDescReq              | SREQ | `{ dstaddr, nwkaddrofinterest }`                                                                                        | `{ status }`                                                                                                   |
    | ZDO_END_DEVICE_ANNCE             | endDeviceAnnce           | SREQ | `{ nwkaddr, ieeeaddr, capability }`                                                                                     | `{ status }`                                                                                                   |
    | ZDO_USER_DESC_SET                | userDescSet              | SREQ | `{ dstaddr, nwkaddrofinterest, descriptor_len, userdescriptor }`                                                        | `{ status }`                                                                                                   |
    | ZDO_SERVER_DISC_REQ              | serverDiscReq            | SREQ | `{ servermask }`                                                                                                        | `{ status }`                                                                                                   |
    | ZDO_END_DEVICE_BIND_REQ          | endDeviceBindReq         | SREQ | `{ dstaddr, localcoord, localieee, endpoint, profileid, numinclusters, inclusterlist, numoutclusters, outclusterlist }` | `{ status }`                                                                                                   |
    | ZDO_BIND_REQ                     | bindReq                  | SREQ | `{ dstaddr, srcaddr, srcendpoint, clusterid, dstaddrmode, addr_short_long, dstendpoint }`                               | `{ status }`                                                                                                   |
    | ZDO_UNBIND_REQ                   | unbindReq                | SREQ | `{ dstaddr, srcaddr, srcendpoint, clusterid, dstaddrmode, addr_short_long, dstendpoint }`                               | `{ status }`                                                                                                   |
    | ZDO_MGMT_NWK_DISC_REQ            | mgmtNwkDiscReq           | SREQ | `{ dstaddr, scanchannels, scanduration, startindex }`                                                                   | `{ status }`                                                                                                   |
    | ZDO_MGMT_LQI_REQ                 | mgmtLqiReq               | SREQ | `{ dstaddr, startindex }`                                                                                               | `{ status }`                                                                                                   |
    | ZDO_MGMT_RTG_REQ                 | mgmtRtgReq               | SREQ | `{ dstaddr, startindex }`                                                                                               | `{ status }`                                                                                                   |
    | ZDO_MGMT_BIND_REQ                | mgmtBindReq              | SREQ | `{ dstaddr, startindex }`                                                                                               | `{ status }`                                                                                                   |
    | ZDO_MGMT_LEAVE_REQ               | mgmtLeaveReq             | SREQ | `{ dstaddr, deviceaddress, removechildren_rejoin }`                                                                     | `{ status }`                                                                                                   |
    | ZDO_MGMT_DIRECT_JOIN_REQ         | mgmtDirectJoinReq        | SREQ | `{ dstaddr, deviceaddr, capinfo }`                                                                                      | `{ status }`                                                                                                   |
    | ZDO_MGMT_PERMIT_JOIN_REQ         | mgmtPermitJoinReq        | SREQ | `{ addrmode, dstaddr, duration, tcsignificance }`                                                                       | `{ status }`                                                                                                   |
    | ZDO_MGMT_NWK_UPDATE_REQ          | mgmtNwkUpdateReq         | SREQ | `{ dstaddr, dstaddrmode, channelmask, scanduration, scancount, nwkmanageraddr }`                                        | `{ status }`                                                                                                   |
    | ZDO_MSG_CB_REGISTER              | msgCbRegister            | SREQ | `{ clusterid }`                                                                                                         | `{ status }`                                                                                                   |
    | ZDO_MSG_CB_REMOVE                | msgCbRemove              | SREQ | `{ clusterid }`                                                                                                         | `{ status }`                                                                                                   |
    | ZDO_STARTUP_FROM_APP             | startupFromApp           | SREQ | `{ startdelay }`                                                                                                        | `{ status }`                                                                                                   |
    | ZDO_SET_LINK_KEY                 | setLinkKey               | SREQ | `{ shortaddr, ieeeaddr, linkkey }`                                                                                      | `{ status }`                                                                                                   |
    | ZDO_REMOVE_LINK_KEY              | removeLinkKey            | SREQ | `{ ieeeaddr }`                                                                                                          | `{ status }`                                                                                                   |
    | ZDO_GET_LINK_KEY                 | getLinkKey               | SREQ | `{ ieeeaddr }`                                                                                                          | `{ status, ieeeaddr, linkkeydata }`                                                                            |
    | ZDO_NWK_DISCOVERY_REQ            | nwkDiscoveryReq          | SREQ | `{ scanchannels, scanduration }`                                                                                        | `{ status }`                                                                                                   |
    | ZDO_JOIN_REQ                     | joinReq                  | SREQ | `{ logicalchannel, panid, extendedpanid, chosenparent, parentdepth, stackprofile }`                                     | `{ status }`                                                                                                   |
    | ZDO_SET_REJOIN_PARAMETERS_REQ    | setRejoinParametersReq   | SREQ | `{ backoffduration, scanduration }`                                                                                     | `{ status }`                                                                                                   |
    | ZDO_SEC_ADD_LINK_KEY             | secAddLinkKey            | SREQ | `{ shortaddr, extaddr, linkkey }`                                                                                       | `{ status }`                                                                                                   |
    | ZDO_SEC_ENTRY_LOOKUP_EXT         | secEntryLookupExt        | SREQ | `{ extaddr }`                                                                                                           | `{ status, ami, keynvid, authenticateoption }`                                                                 |
    | ZDO_SEC_DEVICE_REMOVE            | secDeviceRemove          | SREQ | `{ extaddr }`                                                                                                           | `{ status }`                                                                                                   |
    | ZDO_EXT_ROUTE_DISC               | extRouteDisc             | SREQ | `{ dstAddr, options, radius }`                                                                                          | `{ status }`                                                                                                   |
    | ZDO_EXT_ROUTE_CHECK              | extRouteCheck            | SREQ | `{ dstaddr, rtstatus, options }`                                                                                        | `{ status }`                                                                                                   |
    | ZDO_EXT_REMOVE_GROUP             | extRemoveGroup           | SREQ | `{ endpoint, groupid }`                                                                                                 | `{ status }`                                                                                                   |
    | ZDO_EXT_REMOVE_ALL_GROUP         | extRemoveAllGroup        | SREQ | `{ endpoint }`                                                                                                          | `{ status }`                                                                                                   |
    | ZDO_EXT_FIND_ALL_GROUPS_ENDPOINT | extFindAllGroupsEndpoint | SREQ | `{ endpoint }`                                                                                                          | `{ groups, grouplist }`                                                                                        |
    | ZDO_EXT_FIND_GROUP               | extFindGroup             | SREQ | `{ endpoint, groupid }`                                                                                                 | `{ status, groupid, namelen, groupname }`                                                                      |
    | ZDO_EXT_ADD_GROUP                | extAddGroup              | SREQ | `{ endpoint, groupid, namelen, groupname }`                                                                             | `{ status }`                                                                                                   |
    | ZDO_EXT_COUNT_ALL_GROUPS         | extCountAllGroups        | SREQ | `{ }`                                                                                                                   | `{ status }`                                                                                                   |
    | ZDO_EXT_RX_IDLE                  | extRxIdle                | SREQ | `{ setflag, setvalue }`                                                                                                 | `{ status }`                                                                                                   |
    | ZDO_EXT_UPDATE_NWK_KEY           | extUpdateNwkKey          | SREQ | `{ dstaddr, keyseqnum, key }`                                                                                           | `{ status }`                                                                                                   |
    | ZDO_EXT_SWITCH_NWK_KEY           | extSwitchNwkKey          | SREQ | `{ dstaddr, keyseqnum }`                                                                                                | `{ status }`                                                                                                   |
    | ZDO_EXT_NWK_INFO                 | extNwkInfo               | SREQ | `{ }`                                                                                                                   | `{ shortaddr, devstate, panid, parentaddr, extendedpanid, parentextaddr, channel }`                            |
    | ZDO_EXT_SEC_APS_REMOVE_REQ       | extSecApsRemoveReq       | SREQ | `{ parentaddr, nwkaddr, extaddr }`                                                                                      | `{ status }`                                                                                                   |
    | ZDO_FORCE_CONCENTRATOR_CHANGE    | forceConcentratorChange  | SREQ | `{ }`                                                                                                                   | `{ }`                                                                                                          |
    | ZDO_EXT_SET_PARAMS               | extSetParams             | SREQ | `{ usemulticast }`                                                                                                      | `{ status }`                                                                                                   |
    |                                  | endDeviceTimeoutReq      | SREQ | `{ parentaddr, reqrimeout }`                                                                                            | `{ status }`                                                                                                   |
    |                                  | sendData                 | SREQ | `{ shortaddr, transseq, cmd, len, buf }`                                                                                | `{ status }`                                                                                                   |
    |                                  | nwkAddrOfInterestReq     | SREQ | `{ shortaddr, nwkaddr, cmd }`                                                                                           | `{ status }`                                                                                                   |

* Indication  

    | ZigBee MT Cmd            | cc-znp Event | msg.ind           | msg.data                                                                                                                                                                                                  |
    |--------------------------|--------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | ZDO_NWK_ADDR_RSP         | AREQ         | nwkAddrRsp        | `{ status, ieeeaddr, nwkaddr, startindex, numassocdev, assocdevlist }`                                                                                                                                    |
    | ZDO_IEEE_ADDR_RSP        | AREQ         | ieeeAddrRsp       | `{ status, ieeeaddr, nwkaddr, startindex, numassocdev, assocdevlist }`                                                                                                                                    |
    | ZDO_NODE_DESC_RSP        | AREQ         | nodeDescRsp       | `{ srcaddr, status, nwkaddr, logicaltype_cmplxdescavai_userdescavai, apsflags_freqband, maccapflags, manufacturercode, maxbuffersize, maxintransfersize, servermask, maxouttransfersize, descriptorcap }` |
    | ZDO_POWER_DESC_RSP       | AREQ         | powerDescRsp      | `{ srcaddr, status, nwkaddr, currentpowermode_avaipowersrc, currentpowersrc_currentpowersrclevel }`                                                                                                       |
    | ZDO_SIMPLE_DESC_RSP      | AREQ         | simpleDescRsp     | `{ srcaddr, status, nwkaddr, len, endpoint, profileid, deviceid, deviceversion, numinclusters, inclusterlist, numoutclusters, outclusterlist }`                                                           |
    | ZDO_ACTIVE_EP_RSP        | AREQ         | activeEpRsp       | `{ srcaddr, status, nwkaddr, activeepcount, activeeplist }`                                                                                                                                               |
    | ZDO_MATCH_DESC_RSP       | AREQ         | matchDescRsp      | `{ srcaddr, status, nwkaddr, matchlength, matchlist }`                                                                                                                                                    |
    | ZDO_COMPLEX_DESC_RSP     | AREQ         | complexDescRsp    | `{ srcaddr, status, nwkaddr, complexlength, complexdesclist }`                                                                                                                                            |
    | ZDO_USER_DESC_RSP        | AREQ         | userDescRsp       | `{ srcaddr, status, nwkaddr, userlength, userdescriptor }`                                                                                                                                                |
    | ZDO_USER_DESC_CONF       | AREQ         | userDescConf      | `{ srcaddr, status, nwkaddr }`                                                                                                                                                                            |
    | ZDO_SERVER_DISC_RSP      | AREQ         | serverDiscRsp     | `{ srcaddr, status, servermask }`                                                                                                                                                                         |
    | ZDO_END_DEVICE_BIND_RSP  | AREQ         | endDeviceBindRsp  | `{ srcaddr, status }`                                                                                                                                                                                     |
    | ZDO_BIND_RSP             | AREQ         | bindRsp           | `{ srcaddr, status }`                                                                                                                                                                                     |
    | ZDO_UNBIND_RSP           | AREQ         | unbindRsp         | `{ srcaddr, status }`                                                                                                                                                                                     |
    | ZDO_MGMT_NWK_DISC_RSP    | AREQ         | mgmtNwkDiscRsp    | `{ srcaddr, status, networkcount, startindex, networklistcount, networklist }`                                                                                                                            |
    | ZDO_MGMT_LQI_RSP         | AREQ         | mgmtLqiRsp        | `{ srcaddr, status, neighbortableentries, startindex, neighborlqilistcount, neighborlqilist }`                                                                                                            |
    | ZDO_MGMT_RTG_RSP         | AREQ         | mgmtRtgRsp        | `{ srcaddr, status, routingtableentries, startindex, routingtablelistcount, routingtablelist }`                                                                                                           |
    | ZDO_MGMT_BIND_RSP        | AREQ         | mgmtBindRsp       | `{ srcaddr, status, bindingtableentries, startindex, bindingtablelistcount, bindingtablelist }`                                                                                                           |
    | ZDO_MGMT_LEAVE_RSP       | AREQ         | mgmtLeaveRsp      | `{ srcaddr, status }`                                                                                                                                                                                     |
    | ZDO_MGMT_DIRECT_JOIN_RSP | AREQ         | mgmtDirectJoinRsp | `{ srcaddr, status }`                                                                                                                                                                                     |
    | ZDO_MGMT_PERMIT_JOIN_RSP | AREQ         | mgmtPermitJoinRsp | `{ srcaddr, status }`                                                                                                                                                                                     |
    | ZDO_STATE_CHANGE_IND     | AREQ         | stateChangeInd    | `{ state[, nwkaddr] }`                                                                                                                                                                                    |
    | ZDO_END_DEVICE_ANNCE_IND | AREQ         | endDeviceAnnceInd | `{ srcaddr, nwkaddr, ieeeaddr, capabilities }`                                                                                                                                                            |
    | ZDO_MATCH_DESC_RSP_SENT  | AREQ         | matchDescRspSent  | `{ nwkaddr, numinclusters, inclusterlist, numoutclusters, outclusterlist }`                                                                                                                               |
    | ZDO_STATUS_ERROR_RSP     | AREQ         | statusErrorRsp    | `{ srcaddr, status }`                                                                                                                                                                                     |
    | ZDO_SRC_RTG_IND          | AREQ         | srcRtgInd         | `{ dstaddr, relaycount, relaylist }`                                                                                                                                                                      |
    | ZDO_BEACON_NOTIFY_IND    | AREQ         | beacon_notify_ind | `{ beaconcount, beaconlist }`                                                                                                                                                                             |
    | ZDO_JOIN_CNF             | AREQ         | joinCnf           | `{ status, deviceaddress, parentaddress }`                                                                                                                                                                |
    | ZDO_NWK_DISCOVERY_CNF    | AREQ         | nwkDiscoveryCnf   | `{ status }`                                                                                                                                                                                              |
    | ZDO_LEAVE_IND            | AREQ         | leaveInd          | `{ srcaddr, extaddr, request, removechildren, rejoin }`                                                                                                                                                   |
    | ZDO_MSG_CB_INCOMING      | AREQ         | msgCbIncoming     | `{ srcaddr, wasbroadcast, clusterid, securityuse, seqnum, macdstaddr, msgdata }`                                                                                                                          |
    |                          | AREQ         | tcDeviceInd       | `{ nwkaddr, extaddr, parentaddr }`                                                                                                                                                                        |
    |                          | AREQ         | permitJoinInd     | `{ duration }`                                                                                                                                                                                            |

*************************************************
<a name="SapiTable"></a>
### 7.5 SAPI Table  

* Commands  

    | ZigBee MT Cmd             | cc-znp CmdId         | Type | Arguments                                                                         | Result                             |
    |---------------------------|----------------------|------|-----------------------------------------------------------------------------------|------------------------------------|
    | ZB_SYSTEM_RESET           | systemReset          | AREQ | `{ }`                                                                             | _none_                             |
    | ZB_START_REQUEST          | startRequest         | SREQ | `{ }`                                                                             | `{ }`                              |
    | ZB_PERMIT_JOINING_REQUEST | permitJoiningRequest | SREQ | `{ destination, timeout }`                                                        | `{ status }`                       |
    | ZB_BIND_DEVICE            | bindDevice           | SREQ | `{ action, commandid, destination }`                                              | `{ }`                              |
    | ZB_ALLOW_BIND             | allowBind            | SREQ | `{ timeout }`                                                                     | `{ }`                              |
    | ZB_SEND_DATA_REQUEST      | sendDataRequest      | SREQ | `{ destination, commandid, handle, txoptions, radius, payloadlen, payloadvalue }` | `{ }`                              |
    | ZB_READ_CONFIGURATION     | readConfiguration    | SREQ | `{ configid }`                                                                    | `{ status, configid, len, value }` |
    | ZB_WRITE_CONFIGURATION    | writeConfiguration   | SREQ | `{ configid, len, value }`                                                        | `{ status }`                       |
    | ZB_GET_DEVICE_INFO        | getDeviceInfo        | SREQ | `{ param }`                                                                       | `{ param, value }`                 |
    | ZB_FIND_DEVICE_REQUEST    | findDeviceRequest    | SREQ | `{ searchKey }`                                                                   | `{ }`                              |

* Indication  

    | ZigBee MT Cmd              | cc-znp Event | msg.ind               | msg.data                            |
    |----------------------------|--------------|-----------------------|-------------------------------------|
    | ZB_START_CONFIRM           | AREQ         | startConfirm          | `{ status }`                        |
    | ZB_BIND_CONFIRM            | AREQ         | bindConfirm           | `{ commandid, status }`             |
    | ZB_ALLOW_BIND_CONFIRM      | AREQ         | allowBindConfirm      | `{ source }`                        |
    | ZB_SEND_DATA_CONFIRM       | AREQ         | sendDataConfirm       | `{ handle, status }`                |
    | ZB_RECEIVE_DATA_INDICATION | AREQ         | receiveDataIndication | `{ source, command, len, data }`    |
    | ZB_FIND_DEVICE_CONFIRM     | AREQ         | findDeviceConfirm     | `{ searchtype, searchkey, result }` |

*************************************************
<a name="UtilTable"></a>
### 7.6 UTIL Table  

* Commands  

    | ZigBee MT Cmd                    | cc-znp CmdId            | Type | Arguments                                                       | Result                                                                                        |
    |----------------------------------|-------------------------|------|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
    | UTIL_GET_DEVICE_INFO             | getDeviceInfo           | SREQ | `{ }`                                                           | `{ status, ieeeaddr, shortaddr, devicetype, devicestate, numassocdevices, assocdeviceslist }` |
    | UTIL_GET_NV_INFO                 | getNvInfo               | SREQ | `{ }`                                                           | `{ status, ieeeaddr, scanchannels, panid, securitylevel, preconfigkey }`                      |
    | UTIL_SET_PANID                   | setPanid                | SREQ | `{ panid }`                                                     | `{ status }`                                                                                  |
    | UTIL_SET_CHANNELS                | setChannels             | SREQ | `{ channels }`                                                  | `{ status }`                                                                                  |
    | UTIL_SET_SECLEVEL                | setSeclevel             | SREQ | `{ securitylevel }`                                             | `{ status }`                                                                                  |
    | UTIL_SET_PRECFGKEY               | setPrecfgkey            | SREQ | `{ preconfigkey }`                                              | `{ status }`                                                                                  |
    | UTIL_CALLBACK_SUB_CMD            | callbackSubCmd          | SREQ | `{ subsystemid, action }`                                       | `{ status }`                                                                                  |
    | UTIL_KEY_EVENT                   | keyEvent                | SREQ | `{ keys, shift }`                                               | `{ status }`                                                                                  |
    | UTIL_TIME_ALIVE                  | timeAlive               | SREQ | `{ }`                                                           | `{ seconds }`                                                                                 |
    | UTIL_LED_CONTROL                 | ledControl              | SREQ | `{ ledid, mode }`                                               | `{ status }`                                                                                  |
    | UTIL_LOOPBACK                    | testLoopback            | SREQ | `{ data }`                                                      | `{ data }`                                                                                    |
    | UTIL_DATA_REQ                    | dataReq                 | SREQ | `{ securityuse }`                                               | `{ status }`                                                                                  |
    | UTIL_SRC_MATCH_ENABLE            | srcMatchEnable          | SREQ | `{ }`                                                           | `{ status }`                                                                                  |
    | UTIL_SRC_MATCH_ADD_ENTRY         | srcMatchAddEntry        | SREQ | `{ addressmode, address, panid }`                               | `{ status }`                                                                                  |
    | UTIL_SRC_MATCH_DEL_ENTRY         | srcMatchDelEntry        | SREQ | `{ addressmode, address, panid }`                               | `{ status }`                                                                                  |
    | UTIL_SRC_MATCH_CHECK_SRC_ADDR    | srcMatchCheckSrcAddr    | SREQ | `{ addressmode, address, panid }`                               | `{ status }`                                                                                  |
    | UTIL_SRC_MATCH_ACK_ALL_PENDING   | srcMatchAckAllPending   | SREQ | `{ option }`                                                    | `{ status }`                                                                                  |
    | UTIL_SRC_MATCH_CHECK_ALL_PENDING | srcMatchCheckAllPending | SREQ | `{ }`                                                           | `{ status, value }`                                                                           |
    | UTIL_ADDRMGR_EXT_ADDR_LOOKUP     | addrmgrExtAddrLookup    | SREQ | `{ extaddr }`                                                   | `{ nwkaddr }`                                                                                 |
    | UTIL_ADDRMGR_NWK_ADDR_LOOKUP     | addrmgrNwkAddrLookup    | SREQ | `{ nwkaddr }`                                                   | `{ extaddr }`                                                                                 |
    | UTIL_APSME_LINK_KEY_DATA_GET     | apsmeLinkKeyDataGet     | SREQ | `{ extaddr }`                                                   | `{ status, seckey, txfrmcntr, rxfrmcntr }`                                                    |
    | UTIL_APSME_LINK_KEY_NV_ID_GET    | apsmeLinkKeyNvIdGet     | SREQ | `{ extaddr }`                                                   | `{ status, linkkeynvid }`                                                                     |
    | UTIL_APSME_REQUEST_KEY_CMD       | apsmeRequestKeyCmd      | SREQ | `{ partneraddr }`                                               | `{ status }`                                                                                  |
    | UTIL_ASSOC_COUNT                 | assocCount              | SREQ | `{ startrelation, endrelation }`                                | `{ count }`                                                                                   |
    | UTIL_ASSOC_FIND_DEVICE           | assocFindDevice         | SREQ | `{ number }`                                                    | `{ device }`                                                                                  |
    | UTIL_ASSOC_GET_WITH_ADDRESS      | assocGetWithAddress     | SREQ | `{ extaddr, nwkaddr }`                                          | `{ device }`                                                                                  |
    | UTIL_BIND_ADD_ENTRY              | bindAddEntry            | SREQ | `{ addrmode, dstaddr, dstendpoint, numclusterids, clusterids }` | `{ srcep, dstgroupmode, dstidx, dstep, numclusterids, clusterids }`                           |
    | UTIL_ZCL_KEY_EST_INIT_EST        | zclKeyEstInitEst        | SREQ | `{ taskid, seqnum, endpoint, addrmode, extaddr }`               | `{ status }`                                                                                  |
    | UTIL_ZCL_KEY_EST_SIGN            | zclKeyEstSign           | SREQ | `{ inputlen, input }`                                           | `{ status, key }`                                                                             |
    | UTIL_SRNG_GEN                    | srngGen                 | SREQ | `{ }`                                                           | `{ outrng }`                                                                                  |
    |                                  | gpioSetDirection        | SREQ | `{ port, bit, direction }`                                      | `{ oldp0dir, oldp1dir, oldp2dir, p0dir, p1dir, p2dir }`                                       |
    |                                  | gpioRead                | SREQ | `{ }`                                                           | `{ p0, p1, p2, p0dir, p1dir, p2dir }`                                                         |
    |                                  | gpioWrite               | SREQ | `{ port, bit, value }`                                          | `{ oldp0, oldp1, oldp2, p0, p1, p2, p0dir, p1dir, p2dir }`                                    |

* Indication  

    | ZigBee MT Cmd              | cc-znp Event | msg.ind            | msg.data                                     |
    |----------------------------|--------------|--------------------|----------------------------------------------|
    | UTIL_SYNC_REQ              | AREQ         | syncReq            | `{ }`                                        |
    | UTIL_ZCL_KEY_ESTABLISH_IND | AREQ         | zclKeyEstablishInd | `{ taskid, event, status, waittime, suite }` |

*************************************************
<a name="DbgTable"></a>
### 7.7 DBG Table  

* Commands  

    | ZigBee MT Cmd       | cc-znp CmdId | Type | Arguments                    | Result       |
    |---------------------|--------------|------|------------------------------|--------------|
    | DEBUG_SET_THRESHOLD | setThreshold | SREQ | `{ componentid, threshold }` | `{ status }` |
    | DEBUG_MSG           | msg          | AREQ | `{ length, string }`         | _none_       |

* Indication  

    _none_

*************************************************
<a name="AppTable"></a>
### 7.8 APP Table  

* Commands  

    | ZigBee MT Cmd  | cc-znp CmdId| Type | Arguments                                                                | Result       |
    |----------------|-------------|------|--------------------------------------------------------------------------|--------------|
    | APP_MSG        | msg         | SREQ | `{ appendpoint, destaddress, destendpoint, clusterid, msglen, message }` | `{ status }` |
    | APP_USER_TEST  | userTest    | SREQ | `{ srcep, commandid, param1, param2 }`                                   | `{ status }` |

* Indication  

    | ZigBee MT Cmd  | cc-znp Event | msg.ind  | msg.data                                              |
    |----------------|--------------|----------|-------------------------------------------------------|
    |                | AREQ         | zllTlInd | `{ nwkaddr, endpoint, profileid, deviceid, version }` |

<a name="Contributors"></a>
## 8. Contributors  

* [Jack Wu](https://www.npmjs.com/~jackchased)  
* [Simen Li](https://www.npmjs.com/~simenkid)  

<a name="License"></a>
## 9. License  

The MIT License (MIT)

Copyright (c) 2016 Jack Wu <jackchased@gmail.com> and Simen Li <simenkid@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
