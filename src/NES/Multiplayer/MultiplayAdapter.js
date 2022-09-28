


class MultiplayListener {
    onInit(type){}
    onListening(type,name){}
    onDiscoverable(type,discoverable){}
    onConnected(type,device){}
    onMessage(type,data) {}
    onDisconnectd(type,error) {}
    onError(type,error) {}
}

class MultiplayAdapter {

    listeners = [];

    constructor() {
        if(!cc.isNative)
            return;
        cc.MultiplayAdapter.shared().setOnBluetoothEnabledFunc((enabled)=>{
            this.listeners.forEach(lis=>{
                if(lis["onBluetoothEnabled"])
                    lis["onBluetoothEnabled"](enabled);
            });
        });
        cc.MultiplayAdapter.shared().setOnBluetoothServerListening((device)=>{
            this.listeners.forEach(lis=>{
                if(lis["onBluetoothServerListening"])
                    lis["onBluetoothServerListening"](device);
            });
        });
        cc.MultiplayAdapter.shared().setOnBluetoothDiscoverable((discoverable)=>{
            this.listeners.forEach(lis=>{
                if(lis["onBluetoothDiscoverable"])
                    lis["onBluetoothDiscoverable"](discoverable);
            });
        });
        cc.MultiplayAdapter.shared().setOnScanBluetoothDevice((device)=>{
            this.listeners.forEach(lis=>{
                if(lis["onScanBluetoothDevice"])
                    lis["onScanBluetoothDevice"](device);
            });
        });
        cc.MultiplayAdapter.shared().setOnScanBluetoothDevicesFinish(()=>{
            this.listeners.forEach(lis=>{
                if(lis["onScanBluetoothDevicesFinish"])
                    lis["onScanBluetoothDevicesFinish"]();
            });
        });
        cc.MultiplayAdapter.shared().setOnBluetoothConnected((device)=>{
            this.listeners.forEach(lis=>{
                if(lis["onBluetoothConnected"])
                    lis["onBluetoothConnected"](device)
            });
        });
        cc.MultiplayAdapter.shared().setOnBluetoothDisconnect((error)=>{
            this.listeners.forEach(lis=>{
                if(lis["onBluetoothDisconnect"])
                    lis["onBluetoothDisconnect"](error)
            });
        });
        cc.MultiplayAdapter.shared().setOnError((error)=>{
            this.listeners.forEach(lis=>{
                if(lis["onError"])
                    lis["onError"](error)
            });
        });
        cc.MultiplayAdapter.shared().setOnReceivedData((data)=>{
            this.listeners.forEach(lis=>{
                if(lis["onReceivedData"])
                    lis["onReceivedData"](data)
            });
        });
    }

    addListener(lis){
        this.listeners.push(lis);
    }
    removeListener(lis){
        if(this.listeners.indexOf(lis) !== -1)
        {
            this.listeners.splice(this.listeners.indexOf(lis),1);
        }
    }


    startServer(type,port){
        if(type === MULTIPLAY_BLUETOOTH){
            fr.multiplayer.pluginPlatform.callFuncWithParam("startBuletoothServer");

        }
    }

    scanBluetoothDevices(){
        fr.multiplayer.pluginPlatform.callFuncWithParam("startBluetoothClient");

    }

    connect(type,ip,port) {
        fr.multiplayer.pluginPlatform.callFuncWithParam("bluetoothConnect",new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, ip));

    }



    disconnect(){
        fr.multiplayer.pluginPlatform.callFuncWithParam("disconnect");
    }

    sendMessage(data){
        fr.multiplayer.pluginPlatform.callFuncWithParam("sendMessage",new plugin.PluginParam(plugin.PluginParam.ParamType.TypeData, data));
    }


    sendStringMessage(data){
        fr.multiplayer.pluginPlatform.callFuncWithParam("sendStringMessage",new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, data));
    }


    isConnected(){

    }

    enableBluetooth(){
        fr.multiplayer.pluginPlatform.callFuncWithParam("enableBluetooth");
    }

    isBluetoothEnabled() {
        return fr.multiplayer.pluginPlatform.callBoolFuncWithParam("isBluetoothEnabled");
    }

    isBluetoothDiscoverable(){
        return fr.multiplayer.pluginPlatform.callBoolFuncWithParam("isBluetoothDiscoverable");

    }
    getPairedBluetoothDevices() {
        return fr.multiplayer.pluginPlatform.callStringFuncWithParam("getPairedDevices");
    }


}

var multiplayer_ins = null;
MultiplayAdapter.shared = function () {
    if(!multiplayer_ins)
        multiplayer_ins = new MultiplayAdapter();
    return multiplayer_ins;
};
