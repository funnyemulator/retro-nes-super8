
class MultiplayLayer extends DebugNode{
    constructor(){
        super();
        this.initWithBinaryFile("res/UI/MultiplayerLayer.json")
    }

    initGUI() {
        this["listDevices"].addChild(new ccui.Layout());
        if(cc.isNative && cc.sys.isMobile)
        {
            if(MultiplayAdapter.shared().isBluetoothEnabled())
            {
                this["lbStatus"].string = "Bluetooth is enabled, but not connected."
            }
            else
            {
                this["lbStatus"].string = "Bluetooth is not enabled."
            }
        }

        var devicePaireds = MultiplayAdapter.shared().getPairedBluetoothDevices();
        if(devicePaireds !== "")
        {
            devicePaireds = JSON.parse(devicePaireds);
            devicePaireds.forEach((device)=>{
                this["listDevices"].addChild(new BluetoothDeviceDisplayer(device));
            })
        }

    }

    onEnter(){
        super.onEnter();
        this.runAction(this._actionList);
        this._actionList.play("start",false);

        this.permissionListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "permmission",
            callback: ()=>{this.onRequestPermissionResult()}
        });
        cc.eventManager.addListener(this.permissionListener, this);

        MultiplayAdapter.shared().addListener(this);
    }

    onExit() {
        cc.eventManager.removeListener(this.permissionListener);
        MultiplayAdapter.shared().removeListener(this);
        super.onExit();
    }

    quit() {
        this.removeFromParent();
    }

    startBTServer() {
        MultiplayAdapter.shared().disconnect();

        if(!MultiplayAdapter.shared().isBluetoothEnabled())
        {
            MultiplayAdapter.shared().enableBluetooth();

            this.nextFuncEnable = ()=>{
                this["lbStatus"].string = "Bluetooth server is started, waiting for other devices...";
                MultiplayAdapter.shared().startServer(MULTIPLAY_BLUETOOTH);
            }
        }else
            MultiplayAdapter.shared().startServer(MULTIPLAY_BLUETOOTH);
    }

    scanDevices() {
        if(!MultiplayAdapter.shared().isBluetoothEnabled())
        {
            MultiplayAdapter.shared().enableBluetooth();

            this.nextFuncEnable = ()=>{
                this.checkPermissionAndScan();
            }
        }else
            this.checkPermissionAndScan();
    }

    checkPermissionAndScan() {

        this.nextFuncPermission = ()=>{
            this["lbStatus"].string = "Scanning other devices...";
            this.realScanBluetooth();
        };
        if(fr.platformWrapper.checkPermission("android.permission.ACCESS_FINE_LOCATION"))
            this.realScanBluetooth();
        else
        {
            var data = {
                msg: "Allow this permission to find other Bluetooth device",
                title: "Permission",
                btnYes: "Allow",
                btnNo: "Deny",
                permission: "android.permission.ACCESS_FINE_LOCATION"
            };
            fr.platformWrapper.requestPermission(data);
        }
    }

    realScanBluetooth() {
        this["listDevices"].removeAllChildren();
        MultiplayAdapter.shared().scanBluetoothDevices();
    }

    onRequestPermissionResult(ret){
        if(fr.platformWrapper.checkPermission("android.permission.ACCESS_FINE_LOCATION"))
            if(this.nextFuncPermission)
                this.nextFuncPermission();
            else {
                this["lbStatus"].string = "Permission canceled."
            }
    }


    // delegate
    onBluetoothEnabled(enabled){
        cc.log("bluetooth " + enabled);
        // this["lbStatus"].string = "bluetooth " + enabled;
        if(enabled){
            this.nextFuncEnable && this.nextFuncEnable();
        } else {
            this["lbStatus"].string = "Bluetooth is disabled.";
        }
    }
    onBluetoothServerListening(device){
        cc.log("server start " + device);
        this["lbStatus"].string = "Bluetooth server is started, waiting for other devices...";

    }

    realScanBluetooth() {
        this["listDevices"].removeAllChildren();

        var devicePaireds = MultiplayAdapter.shared().getPairedBluetoothDevices();
        if(devicePaireds !== "")
        {
            devicePaireds = JSON.parse(devicePaireds);
            devicePaireds.forEach((device)=>{
                this["listDevices"].addChild(new BluetoothDeviceDisplayer(device));
            })
        }

        MultiplayAdapter.shared().scanBluetoothDevices();
    }

    onBluetoothConnected(device) {
        this["lbStatus"].string = "Connected with device :" + device;
    }

    onReceivedData(data){
        cc.log("received : " + data);
        if(data instanceof ArrayBuffer)
        {
            cc.log("tom");
            var view = new Uint8Array(data);
            cc.log(JSON.stringify(view));
            this["lbStatus"].string = JSON.stringify(view);

        }
    }

    btDiscoverable(){

    }
}


class BluetoothDeviceDisplayer extends ccui.Layout {
    constructor(device){
        super();
        var splits = device.split(";");
        this.deviceName = splits[0];
        this.deviceAddr = splits[1];

        this.initWithBinaryFile("res/UI/DeviceBluetoothLayer.json");
        this.setContentSize(cc.size(722,50));
    }
    initWithBinaryFile(json){

        var start = new Date().getTime();
        this._layoutPath = json;
        var jsonLayout = ccs.load(json);

        this._actionList = jsonLayout.action;
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.winSize);
        // this._layout.setAnchorPoint(cc.p(0.5,0.5));
        // this._layout.setPosition(DESIGN_RESOLUTION_WIDTH/2,DESIGN_RESOLUTION_HEIGHT/2);
        ccui.helper.doLayout(this._layout);

        this.addChild(this._layout);

        this.syncWidgets(this._layout);

        var end = new Date().getTime();

        this.initGUI();
        var end2 = new Date().getTime();
    }

    initGUI(){
        this["lbName"].string = this.deviceName + " (" + this.deviceAddr + ")";
    }

    connect(){
        MultiplayAdapter.shared().connect(MULTIPLAY_BLUETOOTH,this.deviceAddr);
    }

    syncWidgets (root)
    {
        var thiz = this;
        var childs = root.getChildren();
        childs.forEach(child=>{
            if(child )
            {
                if(child.getName() !== "")
                    thiz[child.getName()] = child;
                if(typeof (child.callBackList) !== "undefined")
                {
                    child.callBackList.forEach(cb=>{

                        child[cb] = thiz[cb]?thiz[cb].bind(thiz):undefined;
                    })
                }

                thiz.syncWidgets(child);
            }
        });
    }
}