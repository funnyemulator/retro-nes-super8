

var Startup = BaseLayer.extend({
    ctor: function () {
        this._super();

        if (gameData.isPortrait())
            this.initWithBinaryFile("res/UI/StartupScene.json");
        else
            this.initWithBinaryFile("res/UI/StartupScene.json");
        // this.runAction(this._actionList);
        // this._actionList.play("ads", true);
    },
    initGUI: function () {

        this["lbCoin"].visible = false;
        this["iconCoin"].visible = false;
        this["btnCoin"].visible = false;

        this.lbV.setString("v" +fr.platformWrapper.getAppVersion()+ "." + fr.platformWrapper.getVersionCode() + "."+fr.platformWrapper.getJSVersion());
        this["btnPolicy"].visible = tracker.inReview;
        this["lbPolicy"].visible = tracker.inReview;

        if(cc.view.getResolutionPolicy() === cc.ResolutionPolicy.FIXED_WIDTH){
            this["bg"].scale = 0.6 * cc.winSize.height / DESIGN_RESOLUTION_HEIGHT;
        }else
        {
            this["bg"].scale = 0.6 * cc.winSize.width / DESIGN_RESOLUTION_WIDTH;
        }
    },
    onEnter: function(){
        this._super();

        this.coinChangeListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "coins",
            callback: (event)=>{
                var coins = event._userData.coins;
                this.onCoinChange(coins);
            }
        });
        cc.eventManager.addListener(this.coinChangeListener, this);
        this.onCoinChange(gameData.userData.coins);

    },
    onEnterTransitionDidFinish: function(){
        this._super();
        gameData.dispathCoinChange();
    },
    onExit: function(){
        this._super();
        cc.eventManager.removeListener(this.coinChangeListener);
    },
    onCoinChange: function(coins)
    {
        this["lbCoin"].string = "x " + StringUtility.standartNumber(coins);
    },
    nes: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        if(cc.sys.isNative)
        {
            // change current emu
            cc.EmuEngine.shared().setCurrent(EMULATOR_NES);
        }
        var scene = new cc.Scene();
        var home = new Home();
        home.checkNew();
        scene.addChild(home);
        cc.director.runScene(cc.TransitionSlideInR.create(0.25,scene));

    },
    snes: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        if(cc.sys.isNative)
        {
            // change current emu
            cc.EmuEngine.shared().setCurrent(EMULATOR_SNES);
        }
        var scene = new cc.Scene();
        var home = new Home();scene.addChild(home);home.checkNew();

        cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
    }
    ,
    gba: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        if(cc.sys.isNative)
        {
            // change current emu
            cc.EmuEngine.shared().setCurrent(EMULATOR_GBA);
        }
        var scene = new cc.Scene();
        var home = new Home();scene.addChild(home);home.checkNew();

        cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
    },
    n64: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        if(cc.sys.isNative)
        {
            // change current emu
            cc.EmuEngine.shared().setCurrent(EMULATOR_N64);
        }
        gameData.emulatorType = EMULATOR_N64;

        var scene = new cc.Scene();
        var home = new Home();scene.addChild(home);home.checkNew();

        cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
    },
    menu: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        this.removeChildByTag(10);
        this.addChild(new StartupMenu(),10,10);
    },
    removeADS: function (btn) {
        if(btn)
            tracker.trackingOnGoogleReview(btn.getName());

    },
    policy: function () {
        cc.sys.openURL("https://classicgame8bits.wordpress.com/emulator-lite2-privacy-policy");
    },
    openShop: function () {
        this.removeChildByTag(10);
        this.addChild(new Shop(),10,10);
    },
});