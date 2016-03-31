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
