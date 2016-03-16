'use strict';

var mtMeta = {
    SYS: {
        resetReq: {
            type: 2,
            cmdId: 0x00,
            params: {
                req: [{type: 0}]
            }
        },
        ping: {
            type: 1,
            cmdId: 0x01,
            params: {
                req: [],
                rsp: [{capabilities: 1}]
            }
        },
        version: {
            type: 1,
            cmdId: 0x02,
            params: {
                req: [],
                rsp: [{transportrev: 0},
                      {product: 0},
                      {majorrel: 0},
                      {minorrel: 0},
                      {maintrel: 0}]
            }
        },
        setExtAddr: {
            type: 1,
            cmdId: 0x03,
            params: {
                req: [{extaddress: 3}],
                rsp: [{status: 0}]
            }
        },
        getExtAddr: {
            type: 1,
            cmdId: 0x04,
            params: {
                req: [],
                rsp: [{extaddress: 3}]
            }
        },
        ramRead: {
            type: 1,
            cmdId: 0x05,
            params: {
                req: [{address: 1},
                      {len: 0}],
                rsp: [{status: 0},
                      {len: 7},
                      {value: 11}]
            }
        },
        ramWrite: {
            type: 1,
            cmdId: 0x06,
            params: {
                req: [{address: 1},
                      {len: 0},
                      {value: 11}],
                rsp: [{status: 0}]
            }
        },
        osalNvItemInit: {
            type: 1,
            cmdId: 0x07,
            params: {
                req: [{id: 1},
                      {len: 1},
                      {initlen: 0},
                      {initvalue: 11}],
                rsp: [{status: 0}]
            }
        },
        osalNvRead: {
            type: 1,
            cmdId: 0x08,
            params: {
                req: [{id: 1},
                      {offset: 0}],
                rsp: [{status: 0},
                      {len: 7},
                      {value: 11}]
            }
        },
        osalNvWrite: {
            type: 1,
            cmdId: 0x09,
            params: {
                req: [{id: 1},
                      {offset: 0},
                      {len: 0},
                      {value: 11}],
                rsp: [{status: 0}]
            }
        },
        osalStartTimer: {
            type: 1,
            cmdId: 0x0A,
            params: {
                req: [{id: 0},
                      {timeout: 1}],
                rsp: [{status: 0}]
            }
        },
        osalStopTimer: {
            type: 1,
            cmdId: 0x0B,
            params: {
                req: [{id: 0}],
                rsp: [{status: 0}]
            }
        },
        random: {
            type: 1,
            cmdId: 0x0C,
            params: {
                req: [],
                rsp: [{value: 1}]
            }
        },
        adcRead: {
            type: 1,
            cmdId: 0x0D,
            params: {
                req: [{channel: 0},
                      {resolution: 0}],
                rsp: [{value: 1}]
            }
        },
        gpio: {
            type: 1,
            cmdId: 0x0E,
            params: {
                req: [{operation: 0},
                      {value: 0}],
                rsp: [{value: 1}]
            }
        },
        stackTune: {
            type: 1,
            cmdId: 0x0F,
            params: {
                req: [{operation: 0},
                      {value: 0}],
                rsp: [{value: 0}]
            }
        },
        setTime: {
            type: 1,
            cmdId: 0x10,
            params: {
                req: [{utc: 2},
                      {hour: 0},
                      {minute: 0},
                      {second: 0},
                      {month: 0},
                      {day: 0},
                      {year: 1}],
                rsp: [{status: 0}]
            }
        },
        getTime: {
            type: 1,
            cmdId: 0x11,
            params: {
                req: [],
                rsp: [{utc: 2},
                      {hour: 0},
                      {minute: 0},
                      {second: 0},
                      {month: 0},
                      {day: 0},
                      {year: 1}]
            }
        },
        osalNvDelete: {
            type: 1,
            cmdId: 0x12,
            params: {
                req: [{id: 1},
                      {len: 1}],
                rsp: [{status: 0}]
            }
        },
        osalNvLength: {
            type: 1,
            cmdId: 0x13,
            params: {
                req: [{id: 1}],
                rsp: [{length: 1}]
            }
        },
        setTxPower: {
            type: 1,
            cmdId: 0x14,
            params: {
                req: [{level: 0}],
                rsp: [{txpower: 0}]
            }
        },
        jammerParameters: {
            type: 1,
            cmdId: 0x15,
            params: {
                req: [{jmrcntievents: 1},
                      {jmrhinoiselvl: 0},
                      {jmrdetectperiod: 2}],
                rsp: [{status: 0}]
            }
        },
        snifferParameters: {
            type: 1,
            cmdId: 0x16,
            params: {
                req: [{param: 0}],
                rsp: [{status: 0}]
            }
        },
        zdiagsInitStats: {
            type: 1,
            cmdId: 0x17,
            params: {
                req: [],
                rsp: [{status: 0}]
            }
        },
        zdiagsClearStats: {
            type: 1,
            cmdId: 0x18,
            params: {
                req: [{clearnv: 0}],
                rsp: [{sysclock: 2}]
            }
        },
        zdiagsGetStats: {
            type: 1,
            cmdId: 0x19,
            params: {
                req: [{attributeid: 1}],
                rsp: [{attributevalue: 2}]
            }
        },
        zdiagsRestoreStatsNv: {
            type: 1,
            cmdId: 0x1A,
            params: {
                req: [],
                rsp: [{status: 0}]
            }
        },
        zdiagsSaveStatsToNv: {
            type: 1,
            cmdId: 0x1B,
            params: {
                req: [],
                rsp: [{sysclock: 2}]
            }
        },
        osalNvReadExt: {
            type: 1,
            cmdId: 0x1C,
            params: {
                req: [{id: 1},
                      {offset: 1}],
                rsp: [{status: 0},
                      {len: 7},
                      {value: 11}]
            }
        },
        osalNvWriteExt: {
            type: 1,
            cmdId: 0x1D,
            params: {
                req: [{id: 1},
                      {offset: 1},
                      {len: 1},
                      {value: 11}],
                rsp: [{status: 0}]
            }
        },
        resetInd: {
            type: 2,
            cmdId: 0x80,
            params: {
                req: [{reason: 0},
                      {transportrev: 0},
                      {productid: 0},
                      {majorrel: 0},
                      {minorrel: 0},
                      {hwrev: 0}]
            }
        },
        osalTimerExpired: {
            type: 2,
            cmdId: 0x81,
            params: {
                req: [{id: 0}]
            }
        },
        jammerInd: {
            type: 2,
            cmdId: 0x82,
            params: {
                req: [{jammerind: 0}]
            }
        }
    },

    MAC: {
        resetReq: {
            type: 1,
            cmdId: 0x01,
            params: {
                req: [{setdefault: 0}],
                rsp: [{status: 0}]
            }
        },
        init: {
            type: 1,
            cmdId: 0x02,
            params: {
                req: [],
                rsp: [{status: 0}]
            }
        },
        startReq: {
            type: 1,
            cmdId: 0x03,
            params: {
                req: [{starttime: 2},
                      {panid: 1},
                      {logicalchannel: 0},
                      {channelpage: 0},
                      {beaconorder: 0},
                      {superframeorder: 0},
                      {pancoordinator: 0},
                      {batterylifeext: 0},
                      {coordrealignment: 0},
                      {realignkeysource: 13},
                      {realignsecuritylevel: 0},
                      {realignkeyidmode: 0},
                      {realignkeyindex: 0},
                      {beaconkeysource: 13},
                      {beaconsecuritylevel: 0},
                      {beaconkeyidmode: 0},
                      {beaconkeyindex: 0}],
                rsp: [{status: 0}]
            }
        },
        syncReq: {
            type: 1,
            cmdId: 0x04,
            params: {
                req: [{logicalchannel: 0},
                      {channelpage: 0},
                      {trackbeacon: 0}],
                rsp: [{status: 0}]
            }
        },
        dataReq: {
            type: 1,
            cmdId: 0x05,
            params: {
                req: [{destaddressmode: 0},
                      {destaddress: 3},
                      {destpanid: 1},
                      {srcaddressmode: 0},
                      {handle: 0},
                      {txoption: 0},
                      {logicalchannel: 0},
                      {power: 0},
                      {keysource: 13},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0},
                      {msdulength: 0},
                      {msdu: 11}],
                rsp: [{status: 0}]
            }
        },
        associateReq: {
            type: 1,
            cmdId: 0x06,
            params: {
                req: [{logicalchannel: 0},
                      {channelpage: 0},
                      {coordaddressmode: 0},
                      {coordaddress: 3},
                      {coordpanid: 1},
                      {capabilityinformation: 0},
                      {keysource: 13},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}],
                rsp: [{status: 0}]
            }
        },
        disassociateReq: {
            type: 1,
            cmdId: 0x07,
            params: {
                req: [{deviceaddressmode: 0},
                      {deviceaddress: 3},
                      {devicepanid: 1},
                      {disassociatereason: 0},
                      {txindirect: 0},
                      {keysource: 13},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}],
                rsp: [{status: 0}]
            }
        },
        getReq: {
            type: 1,
            cmdId: 0x08,
            params: {
                req: [{attribute: 0}],
                rsp: [{status: 0},
                      {data: 15}]
            }
        },
        setReq: {
            type: 1,
            cmdId: 0x09,
            params: {
                req: [{attribute: 0},
                      {attributevalue: 13}],
                rsp: [{status: 0}]
            }
        },
        scanReq: {
            type: 1,
            cmdId: 0x0C,
            params: {
                req: [{scanchannels: 2},
                      {scantype: 0},
                      {scanduration: 0},
                      {channelpage: 0},
                      {maxresults: 0},
                      {keysource: 13},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}],
                rsp: [{status: 0}]
            }
        },
        pollReq: {
            type: 1,
            cmdId: 0x0D,
            params: {
                req: [{coordaddressmode: 0},
                      {coordaddress: 3},
                      {coordpanid: 1},
                      {keysource: 13},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}],
                rsp: [{status: 0}]
            }
        },
        purgeReq: {
            type: 1,
            cmdId: 0x0E,
            params: {
                req: [{msduhandle: 0}],
                rsp: [{status: 0}]
            }
        },
        setRxGainReq: {
            type: 1,
            cmdId: 0x0F,
            params: {
                req: [{mode: 0}],
                rsp: [{status: 0}]
            }
        },
        securityGetReq: {
            type: 1,
            cmdId: 0x30,
            params: {
                req: [{attribute: 0},
                      {index1: 0},
                      {index2: 0}],
                rsp: [{status: 0}]
            }
        },
        securitySetReq: {
            type: 1,
            cmdId: 0x31,
            params: {
                req: [{attribute: 0},
                      {attributevalue: 13}],
                rsp: [{status: 0}]
            }
        },
        associateRsp: {
            type: 1,
            cmdId: 0x50,
            params: {
                req: [{extaddr: 3},
                      {assocshortaddress: 1},
                      {assocstatus: 0}],
                rsp: [{status: 0}]
            }
        },
        orphanRsp: {
            type: 1,
            cmdId: 0x51,
            params: {
                req: [{extaddr: 3},
                      {assocshortaddress: 1},
                      {associatedmember: 0}],
                rsp: [{status: 0}]
            }
        },
        syncLossInd: {
            type: 2,
            cmdId: 0x80,
            params: {
                req: [{status: 0},
                      {panid: 1},
                      {logicalchannel: 0},
                      {channelpage: 0},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}]
            }
        },
        associateInd: {
            type: 2,
            cmdId: 0x81,
            params: {
                req: [{deviceextendedaddress: 3},
                      {capabilities: 0},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}]
            }
        },
        associateCnf: {
            type: 2,
            cmdId: 0x82,
            params: {
                req: [{status: 0},
                      {deviceshortaddress: 1},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}]
            }
        },
        beaconNotifyInd: {
            type: 2,
            cmdId: 0x83,
            params: {
                req: [{bsn: 0},
                      {timestamp: 2},
                      {coordinatoraddressmode: 0},
                      {coordinatorextendedaddress: 3},
                      {panid: 1},
                      {superframespec: 1},
                      {logicalchannel: 0},
                      {gtspermit: 0},
                      {linkquality: 0},
                      {securityfailure: 0},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0},
                      {pendingaddrspec: 0},
                      {addresslist: 17},
                      {sdulength: 7},
                      {nsdu: 11}]
            }
        },
        dataCnf: {
            type: 2,
            cmdId: 0x84,
            params: {
                req: [{status: 0},
                      {handle: 0},
                      {timestamp: 2},
                      {timestamp2: 1}]
            }
        },
        dataInd: {
            type: 2,
            cmdId: 0x85,
            params: {
                req: [{srcaddrmode: 0},
                      {srcaddr: 3},
                      {dstaddrmode: 0},
                      {dstaddr: 3},
                      {timestamp: 2},
                      {timestamp2: 1},
                      {srcpanid: 1},
                      {dstpanid: 1},
                      {linkquality: 0},
                      {correlation: 0},
                      {rssi: 0},
                      {dsn: 0},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0},
                      {length: 7},
                      {data: 11}]
            }
        },
        disassociateInd: {
            type: 2,
            cmdId: 0x86,
            params: {
                req: [{extendedaddress: 3},
                      {disassociatereason: 0},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}]
            }
        },
        disassociateCnf: {
            type: 2,
            cmdId: 0x87,
            params: {
                req: [{status: 0},
                      {deviceaddrmode: 0},
                      {deviceaddr: 3},
                      {devicepanid: 1}]
            }
        },
        orphanInd: {
            type: 2,
            cmdId: 0x8A,
            params: {
                req: [{extendedaddr: 3},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}]
            }
        },
        pollCnf: {
            type: 2,
            cmdId: 0x8B,
            params: {
                req: [{status: 0}]
            }
        },
        scanCnf: {
            type: 2,
            cmdId: 0x8C,
            params: {
                req: [{status: 0},
                      {ed: 0},
                      {scantype: 0},
                      {channelpage: 0},
                      {unscannedchannellist: 2},
                      {resultlistcount: 0},
                      {resultlistmaxlength: 7},
                      {resultlist: 11}]
            }
        },
        commStatusInd: {
            type: 2,
            cmdId: 0x8D,
            params: {
                req: [{status: 0},
                      {srcaddrmode: 0},
                      {srcaddr: 3},
                      {dstaddrmode: 0},
                      {dstaddr: 3},
                      {devicepanid: 1},
                      {reason: 0},
                      {keysource: 14},
                      {securitylevel: 0},
                      {keyidmode: 0},
                      {keyindex: 0}]
            }
        },
        startCnf: {
            type: 2,
            cmdId: 0x8E,
            params: {
                req: [{status: 0}]
            }
        },
        rxEnableCnf: {
            type: 2,
            cmdId: 0x8F,
            params: {
                req: [{status: 0}]
            }
        },
        purgeCnf: {
            type: 2,
            cmdId: 0x90,
            params: {
                req: [{status: 0},
                      {handle: 0}]
            }
        }
    },

    AF: {
        register: {
            type: 1,
            cmdId: 0x00,
            params: {
                req: [{endpoint: 0},
                      {appprofid: 1},
                      {appdeviceid: 1},
                      {appdevver: 0},
                      {latencyreq: 0},
                      {appnuminclusters: 0},
                      {appinclusterlist: 12},
                      {appnumoutclusters: 0},
                      {appoutclusterlist: 12}],
                rsp: [{status: 0}]
            }
        },
        dataRequest: {
            type: 1,
            cmdId: 0x01,
            params: {
                req: [{dstaddr: 1},
                      {destendpoint: 0},
                      {srcendpoint: 0},
                      {clusterid: 1},
                      {transid: 0},
                      {options: 0},
                      {radius: 0},
                      {len: 0},
                      {data: 11}],
                rsp: [{status: 0}]
            }
        },
        dataRequestExt: {
            type: 1,
            cmdId: 0x02,
            params: {
                req: [{dstaddrmode: 0},
                      {dstaddr: 3},
                      {destendpoint: 0},
                      {dstpanid: 1},
                      {srcendpoint: 0},
                      {clusterid: 1},
                      {transid: 0},
                      {options: 0},
                      {radius: 0},
                      {len: 1},
                      {data: 11}],
                rsp: [{status: 0}]
            }
        },
        dataRequestSrcRtg: {
            type: 1,
            cmdId: 0x03,
            params: {
                req: [{dstaddr: 1},
                      {destendpoint: 0},
                      {srcendpoint: 0},
                      {clusterid: 1},
                      {transid: 0},
                      {options: 0},
                      {radius: 0},
                      {relaycount: 0},
                      {relaylist: 12},
                      {len: 0},
                      {data: 11}],
                rsp: [{status: 0}]
            }
        },
        delete: {
            type: 1,
            cmdId: 0x04,
            params: {
                req: [{endpoint: 0}],
                rsp: [{status: 0}]
            }
        },
        interPanCtl: {
            type: 1,
            cmdId: 0x10,
            params: {
                req: [{cmd: 0},
                      {data: 13}],
                rsp: [{status: 0}]
            }
        },
        dataStore: {
            type: 1,
            cmdId: 0x11,
            params: {
                req: [{index: 1},
                      {length: 0},
                      {data: 11}],
                rsp: [{status: 0}]
            }
        },
        dataRetrieve: {
            type: 1,
            cmdId: 0x12,
            params: {
                req: [{timestamp: 2},
                      {index: 1},
                      {length: 0}],
                rsp: [{status: 0},
                      {length: 7},
                      {data: 11}]
            }
        },
        apsfConfigSet: {
            type: 1,
            cmdId: 0x13,
            params: {
                req: [{endpoint: 0},
                      {framedelay: 0},
                      {windowsize: 0}],
                rsp: [{status: 0}]
            }
        },
        apsfConfigGet: {
            type: 1,
            cmdId: 0x14,
            params: {
                req: [{endpoint: 0}],
                rsp: [{framedelay: 0},
                      {windowsize: 0},
                      {nomean: 0}]
            }
        },
        dataConfirm: {
            type: 2,
            cmdId: 0x80,
            params: {
                req: [{status: 0},
                      {endpoint: 0},
                      {transid: 0}]
            }
        },
        incomingMsg: {
            type: 2,
            cmdId: 0x81,
            params: {
                req: [{groupid: 1},
                      {clusterid: 1},
                      {srcaddr: 1},
                      {srcendpoint: 0},
                      {dstendpoint: 0},
                      {wasbroadcast: 0},
                      {linkquality: 0},
                      {securityuse: 0},
                      {timestamp: 2},
                      {transseqnumber: 0},
                      {len: 7},
                      {data: 11}]
            }
        },
        incomingMsgExt: {
            type: 2,
            cmdId: 0x82,
            params: {
                req: [{groupid: 1},
                      {clusterid: 1},
                      {srcaddrmode: 0},
                      {srcaddr: 3},
                      {srcendpoint: 0},
                      {srcpanid: 1},
                      {dstendpoint: 0},
                      {wasbroadcast: 0},
                      {linkquality: 0},
                      {securityuse: 0},
                      {timestamp: 2},
                      {transseqnumber: 0},
                      {len: 7},
                      {data: 11}]
            }
        },
        reflectError: {
            type: 2,
            cmdId: 0x83,
            params: {
                req: [{status: 0},
                      {endpoint: 0},
                      {transid: 0},
                      {dstaddrmode: 0},
                      {dstaddr: 1}]
            }
        }
    },

    ZDO: {
        nwkAddrReq: {
            type: 1,
            cmdId: 0x00,
            params: {
                req: [{ieeeaddr: 3},
                      {reqtype: 0},
                      {startindex: 0}],
                rsp: [{status: 0}]
            }
        },
        ieeeAddrReq: {
            type: 1,
            cmdId: 0x01,
            params: {
                req: [{shortaddr: 1},
                      {reqtype: 0},
                      {startindex: 0}],
                rsp: [{status: 0}]
            }
        },
        nodeDescReq: {
            type: 1,
            cmdId: 0x02,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1}],
                rsp: [{status: 0}]
            }
        },
        powerDescReq: {
            type: 1,
            cmdId: 0x03,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1}],
                rsp: [{status: 0}]
            }
        },
        simpleDescReq: {
            type: 1,
            cmdId: 0x04,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1},
                      {endpoint: 0}],
                rsp: [{status: 0}]
            }
        },
        activeEpReq: {
            type: 1,
            cmdId: 0x05,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1}],
                rsp: [{status: 0}]
            }
        },
        matchDescReq: {
            type: 1,
            cmdId: 0x06,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1},
                      {profileid: 1},
                      {numinclusters: 0},
                      {inclusterlist: 12},
                      {numoutclusters: 0},
                      {outclusterlist: 12}],
                rsp: [{status: 0}]
            }
        },
        complexDescReq: {
            type: 1,
            cmdId: 0x07,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1}],
                rsp: [{status: 0}]
            }
        },
        userDescReq: {
            type: 1,
            cmdId: 0x08,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1}],
                rsp: [{status: 0}]
            }
        },
        endDeviceAnnce: {
            type: 1,
            cmdId: 0x0A,
            params: {
                req: [{nwkaddr: 1},
                      {ieeeaddr: 3},
                      {capability: 0}],
                rsp: [{status: 0}]
            }
        },
        userDescSet: {
            type: 1,
            cmdId: 0x0B,
            params: {
                req: [{dstaddr: 1},
                      {nwkaddrofinterest: 1},
                      {descriptor_len: 0},
                      {userdescriptor: 11}],
                rsp: [{status: 0}]
            }
        },
        serverDiscReq: {
            type: 1,
            cmdId: 0x0C,
            params: {
                req: [{servermask: 1}],
                rsp: [{status: 0}]
            }
        },
        endDeviceBindReq: {
            type: 1,
            cmdId: 0x20,
            params: {
                req: [{dstaddr: 1},
                      {localcoord: 1},
                      {localieee: 3},
                      {endpoint: 0},
                      {profileid: 1},
                      {numinclusters: 0},
                      {inclusterlist: 12},
                      {numoutclusters: 0},
                      {outclusterlist: 12}],
                rsp: [{status: 0}]
            }
        },
        bindReq: {
            type: 1,
            cmdId: 0x21,
            params: {
                req: [{dstaddr: 1},
                      {srcaddr: 3},
                      {srcendpoint: 0},
                      {clusterid: 1},
                      {dstaddrmode: 0},
                      {addr_short_long: 3},
                      {dstendpoint: 0}],
                rsp: [{status: 0}]
            }
        },
        unbindReq: {
            type: 1,
            cmdId: 0x22,
            params: {
                req: [{dstaddr: 1},
                      {srcaddr: 3},
                      {srcendpoint: 0},
                      {clusterid: 1},
                      {dstaddrmode: 0},
                      {addr_short_long: 3},
                      {dstendpoint: 0}],
                rsp: [{status: 0}]
            }
        },
        setLinkKey: {
            type: 1,
            cmdId: 0x23,
            params: {
                req: [{shortaddr: 1},
                      {ieeeaddr: 3},
                      {linkkey: 13}],
                rsp: [{status: 0}]
            }
        },
        removeLinkKey: {
            type: 1,
            cmdId: 0x24,
            params: {
                req: [{ieeeaddr: 3}],
                rsp: [{status: 0}]
            }
        },
        getLinkKey: {
            type: 1,
            cmdId: 0x25,
            params: {
                req: [{ieeeaddr: 3}],
                rsp: [{status: 0},
                      {ieeeaddr: 3},
                      {linkkeydata: 15}]
            }
        },
        nwkDiscoveryReq: {
            type: 1,
            cmdId: 0x26,
            params: {
                req: [{scanchannels: 2},
                      {scanduration: 0}],
                rsp: [{status: 0}]
            }
        },
        joinReq: {
            type: 1,
            cmdId: 0x27,
            params: {
                req: [{logicalchannel: 0},
                      {panid: 1},
                      {extendedpanid: 3},
                      {chosenparent: 1},
                      {parentdepth: 0},
                      {stackprofile: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtNwkDiscReq: {
            type: 1,
            cmdId: 0x30,
            params: {
                req: [{dstaddr: 1},
                      {scanchannels: 2},
                      {scanduration: 0},
                      {startindex: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtLqiReq: {
            type: 1,
            cmdId: 0x31,
            params: {
                req: [{dstaddr: 1},
                      {startindex: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtRtgReq: {
            type: 1,
            cmdId: 0x32,
            params: {
                req: [{dstaddr: 1},
                      {startindex: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtBindReq: {
            type: 1,
            cmdId: 0x33,
            params: {
                req: [{dstaddr: 1},
                      {startindex: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtLeaveReq: {
            type: 1,
            cmdId: 0x34,
            params: {
                req: [{dstaddr: 1},
                      {deviceaddress: 3},
                      {removechildren_rejoin: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtDirectJoinReq: {
            type: 1,
            cmdId: 0x35,
            params: {
                req: [{dstaddr: 1},
                      {deviceaddr: 3},
                      {capinfo: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtPermitJoinRequest: {
            type: 1,
            cmdId: 0x36,
            params: {
                req: [{dstaddr: 1},
                      {duration: 0},
                      {tcsignificance: 0}],
                rsp: [{status: 0}]
            }
        },
        mgmtNwkUpdateRequest: {
            type: 1,
            cmdId: 0x37,
            params: {
                req: [{dstaddr: 1},
                      {dstaddrmode: 0},
                      {channelmask: 2},
                      {scanduration: 0},
                      {scancount: 0},
                      {nwkmanageraddr: 1}],
                rsp: [{status: 0}]
            }
        },
        msgCbRegister: {
            type: 1,
            cmdId: 0x3E,
            params: {
                req: [{clusterid: 1}],
                rsp: [{status: 0}]
            }
        },
        msgCbRemove: {
            type: 1,
            cmdId: 0x3F,
            params: {
                req: [{clusterid: 1}],
                rsp: [{status: 0}]
            }
        },
        startupFromApp: {
            type: 1,
            cmdId: 0x40,
            params: {
                req: [{startdelay: 1}],
                rsp: [{status: 0}]
            }
        },
        autoFindDestination: {
            type: 2,
            cmdId: 0x41,
            params: {
                req: [{endpoint: 0}]
            }
        },
        nwkAddrRsp: {
            type: 2,
            cmdId: 0x80,
            params: {
                req: [{status: 0},
                      {ieeeaddr: 3},
                      {nwkaddr: 1},
                      {startindex: 0},
                      {numassocdev: 0},
                      {assocdevlist: 5}]
            }
        },
        ieeeAddrRsp: {
            type: 2,
            cmdId: 0x81,
            params: {
                req: [{status: 0},
                      {ieeeaddr: 3},
                      {nwkaddr: 1},
                      {startindex: 0},
                      {numassocdev: 0},
                      {assocdevlist: 5}]
            }
        },
        nodeDescRsp: {
            type: 2,
            cmdId: 0x82,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1},
                      {logicaltype_cmplxdescavai_userdescavai: 0},
                      {apsflags_freqband: 0},
                      {maccapflags: 0},
                      {manufacturercode: 1},
                      {maxbuffersize: 0},
                      {maxintransfersize: 1},
                      {servermask: 1},
                      {maxouttransfersize: 1},
                      {descriptorcap: 0}]
            }
        },
        powerDescRsp: {
            type: 2,
            cmdId: 0x83,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1},
                      {currentpowermode_avaipowersrc: 0},
                      {currentpowersrc_currentpowersrclevel: 0}]
            }
        },
        simpleDescRsp: {
            type: 2,
            cmdId: 0x84,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1},
                      {len: 0},
                      {endpoint: 0},
                      {profileid: 1},
                      {deviceid: 1},
                      {deviceversion: 0},
                      {numinclusters: 9},
                      {inclusterlist: 11},
                      {numoutclusters: 9},
                      {outclusterlist: 11}]
            }
        },
        activeEpRsp: {
            type: 2,
            cmdId: 0x85,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1},
                      {activeepcount: 7},
                      {activeeplist: 11}]
            }
        },
        matchDescRsp: {
            type: 2,
            cmdId: 0x86,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1},
                      {matchlength: 7},
                      {matchlist: 11}]
            }
        },
        complexDescRsp: {
            type: 2,
            cmdId: 0x87,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1},
                      {complexlength: 7},
                      {complexdesclist: 11}]
            }
        },
        userDescRsp: {
            type: 2,
            cmdId: 0x88,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1},
                      {userlength: 7},
                      {userdescriptor: 11}]
            }
        },
        userDescConf: {
            type: 2,
            cmdId: 0x89,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {nwkaddr: 1}]
            }
        },
        serverDiscRsp: {
            type: 2,
            cmdId: 0x8A,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {servermask: 1}]
            }
        },
        endDeviceBindRsp: {
            type: 2,
            cmdId: 0xA0,
            params: {
                req: [{srcaddr: 1},
                      {status: 0}]
            }
        },
        bindRsp: {
            type: 2,
            cmdId: 0xA1,
            params: {
                req: [{srcaddr: 1},
                      {status: 0}]
            }
        },
        unbindRsp: {
            type: 2,
            cmdId: 0xA2,
            params: {
                req: [{srcaddr: 1},
                      {status: 0}]
            }
        },
        mgmtNwkDiscRsp: {
            type: 2,
            cmdId: 0xB0,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {networkcount: 0},
                      {startindex: 0},
                      {networklistcount: 0},
                      {networklist: 6}]
            }
        },
        mgmtLqiRsp: {
            type: 2,
            cmdId: 0xB1,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {neighbortableentries: 0},
                      {startindex: 0},
                      {neighborlqilistcount: 0},
                      {neighborlqilist: 6}]
            }
        },
        mgmtRtgRsp: {
            type: 2,
            cmdId: 0xB2,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {routingtableentries: 0},
                      {startindex: 0},
                      {routingtablelistcount: 0},
                      {routingtablelist: 6}]
            }
        },
        mgmtBindRsp: {
            type: 2,
            cmdId: 0xB3,
            params: {
                req: [{srcaddr: 1},
                      {status: 0},
                      {bindingtableentries: 0},
                      {startindex: 0},
                      {bindingtablelistcount: 0},
                      {bindingtablelist: 6}]
            }
        },
        mgmtLeaveRsp: {
            type: 2,
            cmdId: 0xB4,
            params: {
                req: [{srcaddr: 1},
                      {status: 0}]
            }
        },
        mgmtDirectJoinRsp: {
            type: 2,
            cmdId: 0xB5,
            params: {
                req: [{srcaddr: 1},
                      {status: 0}]
            }
        },
        mgmtPermitJoinRsp: {
            type: 2,
            cmdId: 0xB6,
            params: {
                req: [{srcaddr: 1},
                      {status: 0}]
            }
        },
        stateChangeInd: {
            type: 2,
            cmdId: 0xC0,
            params: {
                req: [{state: 20}]
            }
        },
        endDeviceAnnceInd: {
            type: 2,
            cmdId: 0xC1,
            params: {
                req: [{srcaddr: 1},
                      {nwkaddr: 1},
                      {ieeeaddr: 3},
                      {capabilities: 0}]
            }
        },
        matchDescRspSent: {
            type: 2,
            cmdId: 0xC2,
            params: {
                req: [{nwkaddr: 1},
                      {numinclusters: 9},
                      {inclusterlist: 11},
                      {numoutclusters: 9},
                      {outclusterlist: 11}]
            }
        },
        statusErrorRsp: {
            type: 2,
            cmdId: 0xC3,
            params: {
                req: [{srcaddr: 1},
                      {status: 0}]
            }
        },
        srcRtgInd: {
            type: 2,
            cmdId: 0xC4,
            params: {
                req: [{dstaddr: 1},
                      {relaycount: 9},
                      {relaylist: 11}]
            }
        },
        beacon_notify_ind: {
            type: 2,
            cmdId: 0xC5,
            params: {
                req: [{beaconcount: 10},
                      {beaconlist: 11}]
            }
        },
        joinCnf: {
            type: 2,
            cmdId: 0xC6,
            params: {
                req: [{status: 0},
                      {deviceaddress: 1},
                      {parentaddress: 1}]
            }
        },
        nwkDiscoveryCnf: {
            type: 2,
            cmdId: 0xC7,
            params: {
                req: [{status: 0}]
            }
        },
        leaveInd: {
            type: 2,
            cmdId: 0xC9,
            params: {
                req: [{srcaddr: 1},
                      {extaddr: 3},
                      {request: 0},
                      {removechildren: 0},
                      {rejoin: 0}]
            }
        },
        msgCbIncoming: {
            type: 2,
            cmdId: 0xFF,
            params: {
                req: [{srcaddr: 1},
                      {wasbroadcast: 0},
                      {clusterid: 1},
                      {securityuse: 0},
                      {seqnum: 0},
                      {macdstaddr: 1},
                      {msgdata: 4}]
            }
        },
        endDeviceTimeoutReq: {
            type: 1,
            cmdId: 0x0D,
            params: {
                req: [{parentaddr: 1},
                      {reqrimeout: 1}],
                rsp: [{status: 0}]
            }
        },
        sendData: {
            type: 1,
            cmdId: 0x28,
            params: {
                req: [{shortaddr: 1},
                      {transseq: 0},
                      {cmd: 1},
                      {len: 0},
                      {buf: 11}],
                rsp: [{status: 0}]
            }
        },
        nwkAddrOfInterestReq: {
            type: 1,
            cmdId: 0x29,
            params: {
                req: [{shortaddr: 1},
                      {nwkaddr: 1},
                      {cmd: 0}],
                rsp: [{status: 0}]
            }
        },
        secAddLinkKey: {
            type: 1,
            cmdId: 0x42,
            params: {
                req: [{shortaddr: 1},
                      {extaddr: 3},
                      {linkkey: 13}],
                rsp: [{status: 0}]
            }
        },
        secEntryLookupExt: {
            type: 1,
            cmdId: 0x43,
            params: {
                req: [{extaddr: 3}],
                rsp: [{status: 0},
                      {ami: 1},
                      {keynvid: 1},
                      {authenticateoption: 0}]
            }
        },
        extRouteDisc: {
            type: 1,
            cmdId: 0x45,
            params: {
                req: [{dstAddr: 1},
                      {options: 0},
                      {radius: 0}],
                rsp: [{status: 0}]
            }
        },
        extRouteCheck: {
            type: 1,
            cmdId: 0x46,
            params: {
                req: [{dstaddr: 1},
                      {rtstatus: 0},
                      {options: 0}],
                rsp: [{status: 0}]
            }
        },
        extRemoveGroup: {
            type: 1,
            cmdId: 0x47,
            params: {
                req: [{endpoint: 0},
                      {groupid: 1}],
                rsp: [{status: 0}]
            }
        },
        extRemoveAllGroup: {
            type: 1,
            cmdId: 0x48,
            params: {
                req: [{endpoint: 0}],
                rsp: [{status: 0}]
            }
        },
        extFindAllGroupsEndpoint: {
            type: 1,
            cmdId: 0x49,
            params: {
                req: [{endpoint: 0}],
                rsp: [{groups: 9},
                      {grouplist: 11}]
            }
        },
        extFindGroup: {
            type: 1,
            cmdId: 0x4A,
            params: {
                req: [{endpoint: 0},
                      {groupid: 1}],
                rsp: [{status: 0},
                      {groupid: 1},
                      {namelen: 7},
                      {groupname: 11}]
            }
        },
        extAddGroup: {
            type: 1,
            cmdId: 0x4B,
            params: {
                req: [{endpoint: 0},
                      {groupid: 1},
                      {namelen: 0},
                      {groupname: 11}],
                rsp: [{status: 0}]
            }
        },
        extCountAllGroups: {
            type: 1,
            cmdId: 0x4C,
            params: {
                req: [],
                rsp: [{status: 0}]
            }
        },
        extRxIdle: {
            type: 1,
            cmdId: 0x4D,
            params: {
                req: [{setflag: 0},
                      {setvalue: 0}],
                rsp: [{status: 0}]
            }
        },
        extUpdateNwkKey: {
            type: 1,
            cmdId: 0x4E,
            params: {
                req: [{dstaddr: 1},
                      {keyseqnum: 0}],
                rsp: [{status: 0}]
            }
        },
        extSwitchNwkKey: {
            type: 1,
            cmdId: 0x4F,
            params: {
                req: [{dstaddr: 1},
                      {keyseqnum: 0}],
                rsp: [{status: 0}]
            }
        },
        extNwkInfo: {
            type: 1,
            cmdId: 0x50,
            params: {
                req: [],
                rsp: [{nwkdevaddress: 1},
                      {devstate: 0},
                      {nwkpanid: 1},
                      {nwkcoordaddress: 1},
                      {extendedpanid: 3},
                      {nwkcoordextaddress: 3},
                      {nwklogicalchannel: 0}]
            }
        },
        extSecApsRemoveReq: {
            type: 1,
            cmdId: 0x51,
            params: {
                req: [{parentaddr: 1},
                      {nwkaddr: 1},
                      {extaddr: 3}],
                rsp: [{status: 0}]
            }
        },
        forceConcentratorChange: {
            type: 1,
            cmdId: 0x52,
            params: {
                req: [],
                rsp: []
            }
        },
        extSetParams: {
            type: 1,
            cmdId: 0x53,
            params: {
                req: [{usemulticast: 0}],
                rsp: []
            }
        },
        tcDeviceInd: {
            type: 2,
            cmdId: 0xCA,
            params: {
                req: [{nwkaddr: 1},
                      {extaddr: 3},
                      {parentaddr: 1}]
            }
        },
        permitJoinInd: {
            type: 2,
            cmdId: 0xCB,
            params: {
                req: [{duration: 0}]
            }
        }
    },

    SAPI: {
        systemReset: {
            type: 2,
            cmdId: 0x09,
            params: {
                req: []
            }
        },
        startRequest: {
            type: 1,
            cmdId: 0x00,
            params: {
                req: [],
                rsp: []
            }
        },
        bindDevice: {
            type: 1,
            cmdId: 0x01,
            params: {
                req: [{action: 0},
                      {commandid: 1},
                      {destination: 3}],
                rsp: []
            }
        },
        allowBind: {
            type: 1,
            cmdId: 0x02,
            params: {
                req: [{timeout: 0}],
                rsp: []
            }
        },
        sendDataRequest: {
            type: 1,
            cmdId: 0x03,
            params: {
                req: [{destination: 1},
                      {commandid: 1},
                      {handle: 0},
                      {txoptions: 0},
                      {radius: 0},
                      {payloadlen: 0},
                      {payloadvalue: 11}],
                rsp: []
            }
        },
        readConfiguration: {
            type: 1,
            cmdId: 0x04,
            params: {
                req: [{configid: 0}],
                rsp: [{status: 0},
                      {configid: 0},
                      {len: 7},
                      {value: 11}]
            }
        },
        writeConfiguration: {
            type: 1,
            cmdId: 0x05,
            params: {
                req: [{configid: 0},
                      {len: 0},
                      {value: 11}],
                rsp: [{status: 0}]
            }
        },
        getDeviceInfo: {
            type: 1,
            cmdId: 0x06,
            params: {
                req: [{param: 0}],
                rsp: [{param: 0},
                      {value: 14}]
            }
        },
        findDeviceRequest: {
            type: 1,
            cmdId: 0x07,
            params: {
                req: [{searchKey: 3}],
                rsp: []
            }
        },
        permitJoiningRequest: {
            type: 1,
            cmdId: 0x08,
            params: {
                req: [{destination: 1},
                      {timeout: 0}],
                rsp: [{status: 0}]
            }
        },
        startConfirm: {
            type: 2,
            cmdId: 0x80,
            params: {
                req: [{status: 0}]
            }
        },
        bindConfirm: {
            type: 2,
            cmdId: 0x81,
            params: {
                req: [{commandid: 1},
                      {status: 0}]
            }
        },
        allowBindConfirm: {
            type: 2,
            cmdId: 0x82,
            params: {
                req: [{source: 1}]
            }
        },
        sendDataConfirm: {
            type: 2,
            cmdId: 0x83,
            params: {
                req: [{handle: 0},
                      {status: 0}]
            }
        },
        findDeviceConfirm: {
            type: 2,
            cmdId: 0x85,
            params: {
                req: [{searchtype: 0},
                      {searchkey: 1},
                      {result: 3}]
            }
        },
        receiveDataIndication: {
            type: 2,
            cmdId: 0x87,
            params: {
                req: [{source: 1},
                      {command: 1},
                      {len: 8},
                      {data: 11}]
            }
        }
    },

    UTIL: {
        getDeviceInfo: {
            type: 1,
            cmdId: 0x00,
            params: {
                req: [],
                rsp: [{status: 0},
                      {ieeeaddr: 3},
                      {shortaddr: 1},
                      {devicetype: 0},
                      {devicestate: 0},
                      {numassocdevices: 9},
                      {assocdeviceslist: 11}]
            }
        },
        getNvInfo: {
            type: 1,
            cmdId: 0x01,
            params: {
                req: [],
                rsp: [{status: 0},
                      {ieeeaddr: 3},
                      {scanchannels: 2},
                      {panid: 1},
                      {securitylevel: 0},
                      {preconfigkey: 15}]
            }
        },
        setPanid: {
            type: 1,
            cmdId: 0x02,
            params: {
                req: [{panid: 1}],
                rsp: [{status: 0}]
            }
        },
        setChannels: {
            type: 1,
            cmdId: 0x03,
            params: {
                req: [{channels: 2}],
                rsp: [{status: 0}]
            }
        },
        setSeclevel: {
            type: 1,
            cmdId: 0x04,
            params: {
                req: [{securitylevel: 0}],
                rsp: [{status: 0}]
            }
        },
        setPrecfgkey: {
            type: 1,
            cmdId: 0x05,
            params: {
                req: [{preconfigkey: 13}],
                rsp: [{status: 0}]
            }
        },
        callbackSubCmd: {
            type: 1,
            cmdId: 0x06,
            params: {
                req: [{subsystemid: 1},
                      {action: 0}],
                rsp: [{status: 0}]
            }
        },
        keyEvent: {
            type: 1,
            cmdId: 0x07,
            params: {
                req: [{shift: 0},
                      {key: 0}],
                rsp: [{status: 0}]
            }
        },
        timeAlive: {
            type: 1,
            cmdId: 0x09,
            params: {
                req: [],
                rsp: [{seconds: 2}]
            }
        },
        ledControl: {
            type: 1,
            cmdId: 0x0A,
            params: {
                req: [{ledid: 0},
                      {mode: 0}],
                rsp: [{status: 0}]
            }
        },
        testLoopback: {
            type: 1,
            cmdId: 0x10,
            params: {
                req: [{data: 13}],
                rsp: [{data: 13}]
            }
        },
        dataReq: {
            type: 1,
            cmdId: 0x11,
            params: {
                req: [{securityuse: 0}],
                rsp: [{status: 0}]
            }
        },
        srcMatchEnable: {
            type: 1,
            cmdId: 0x20,
            params: {
                req: [{addrtype: 0},
                      {numentries: 0}],
                rsp: [{status: 0}]
            }
        },
        srcMatchAddEntry: {
            type: 1,
            cmdId: 0x21,
            params: {
                req: [{addressmode: 0},
                      {address: 3},
                      {panid: 1}],
                rsp: [{status: 0}]
            }
        },
        srcMatchDelEntry: {
            type: 1,
            cmdId: 0x22,
            params: {
                req: [{addressmode: 0},
                      {address: 3},
                      {panid: 1}],
                rsp: [{status: 0}]
            }
        },
        srcMatchCheckSrcAddr: {
            type: 1,
            cmdId: 0x23,
            params: {
                req: [{addressmode: 0},
                      {address: 3},
                      {panid: 1}],
                rsp: [{status: 0}]
            }
        },
        srcMatchAckAllPending: {
            type: 1,
            cmdId: 0x24,
            params: {
                req: [{option: 0}],
                rsp: [{status: 0}]
            }
        },
        srcMatchCheckAllPending: {
            type: 1,
            cmdId: 0x25,
            params: {
                req: [],
                rsp: [{status: 0},
                      {value: 0}]
            }
        },
        addrmgrExtAddrLookup: {
            type: 1,
            cmdId: 0x40,
            params: {
                req: [{extaddr: 3}],
                rsp: [{nwkaddr: 1}]
            }
        },
        addrmgrNwkAddrLookup: {
            type: 1,
            cmdId: 0x41,
            params: {
                req: [{nwkaddr: 1}],
                rsp: [{extaddr: 3}]
            }
        },
        apsmeLinkKeyDataGet: {
            type: 1,
            cmdId: 0x44,
            params: {
                req: [{extaddr: 3}],
                rsp: [{status: 0},
                      {seckey: 15},
                      {txfrmcntr: 2},
                      {rxfrmcntr: 2}]
            }
        },
        apsmeLinkKeyNvIdGet: {
            type: 1,
            cmdId: 0x45,
            params: {
                req: [{extaddr: 3}],
                rsp: [{status: 0},
                      {linkkeynvid: 1}]
            }
        },
        assocCount: {
            type: 1,
            cmdId: 0x48,
            params: {
                req: [{startrelation: 0},
                      {endrelation: 0}],
                rsp: [{count: 1}]
            }
        },
        assocFindDevice: {
            type: 1,
            cmdId: 0x49,
            params: {
                req: [{number: 0}],
                rsp: [{device: 16}]
            }
        },
        assocGetWithAddress: {
            type: 1,
            cmdId: 0x4A,
            params: {
                req: [{extaddr: 3},
                      {nwkaddr: 1}],
                rsp: [{device: 16}]
            }
        },
        apsmeRequestKeyCmd: {
            type: 1,
            cmdId: 0x4B,
            params: {
                req: [{partneraddr: 3}],
                rsp: [{status: 0}]
            }
        },
        zclKeyEstInitEst: {
            type: 1,
            cmdId: 0x80,
            params: {
                req: [{taskid: 0},
                      {seqnum: 0},
                      {endpoint: 0},
                      {addrmode: 0},
                      {extaddr: 3}],
                rsp: [{status: 0}]
            }
        },
        zclKeyEstSign: {
            type: 1,
            cmdId: 0x81,
            params: {
                req: [{inputlen: 0},
                      {input: 11}],
                rsp: [{status: 0},
                      {key: 18}]
            }
        },
        syncReq: {
            type: 2,
            cmdId: 0xE0,
            params: {
                req: []
            }
        },
        zclKeyEstablishInd: {
            type: 2,
            cmdId: 0xE1,
            params: {
                req: [{taskid: 0},
                      {event: 0},
                      {status: 0},
                      {waittime: 0},
                      {suite: 1}]
            }
        },
        gpioSetDirection: {
            type: 1,
            cmdId: 0x14,
            params: {
                req: [{port: 0},
                      {bit: 0},
                      {direction: 0}],
                rsp: [{oldp0dir: 0},
                      {oldp1dir: 0},
                      {oldp2dir: 0},
                      {p0dir: 0},
                      {p1dir: 0},
                      {p2dir: 0}]
            }
        },
        gpioRead: {
            type: 1,
            cmdId: 0x15,
            params: {
                req: [],
                rsp: [{p0: 0},
                      {p1: 0},
                      {p2: 0},
                      {p0dir: 0},
                      {p1dir: 0},
                      {p2dir: 0}]
            }
        },
        gpioWrite: {
            type: 1,
            cmdId: 0x16,
            params: {
                req: [{port: 0},
                      {bit: 0},
                      {value: 0}],
                rsp: [{oldp0: 0},
                      {oldp1: 0},
                      {oldp2: 0},
                      {p0: 0},
                      {p1: 0},
                      {p2: 0},
                      {p0dir: 0},
                      {p1dir: 0},
                      {p2dir: 0}]
            }
        },
        srngGenerate: {
            type: 1,
            cmdId: 0x4C,
            params: {
                req: [],
                rsp: [{outrng: 19}]
            }
        },
        bindAddEntry: {
            type: 1,
            cmdId: 0x4D,
            params: {
                req: [{addrmode: 0},
                      {dstaddr: 3},
                      {dstendpoint: 0},
                      {numclusterids: 0},
                      {clusterids: 12}],
                rsp: [{srcep: 0},
                      {dstgroupmode: 0},
                      {dstidx: 1},
                      {dstep: 0},
                      {numclusterids: 0},
                      {clusterids: 14}]
            }
        }
    },

    DBG: {
        setDebugThreshold: {
            type: 1,
            cmdId: 0x00,
            params: {
                req: [{componentid: 0},
                      {threshold: 0}],
                rsp: [{status: 0}]
            }
        },
        msg: {
            type: 2,
            cmdId: 0x80,
            params: {
                req: [{length: 0},
                      {string: 11}]
            }
        }
    },

    APP: {
        msg: {
            type: 1,
            cmdId: 0x00,
            params: {
                req: [{appendpoint: 0},
                      {destaddress: 1},
                      {destendpoint: 0},
                      {clusterid: 1},
                      {msglen: 0},
                      {message: 11}],
                rsp: [{status: 0}]
            }
        },
        userTest: {
            type: 1,
            cmdId: 0x01,
            params: {
                req: [{srcep: 0},
                      {commandid: 1},
                      {param1: 1},
                      {param2: 1}],
                rsp: [{status: 0}]
            }
        },
        zllTlInd: {
            type: 2,
            cmdId: 0x81,
            params: {
                req: [{nwkaddr: 1},
                      {endpoint: 0},
                      {profileid: 1},
                      {deviceid: 1},
                      {version: 0}]
            }
        }
    }
};

module.exports = mtMeta;
