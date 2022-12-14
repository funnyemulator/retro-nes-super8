var listROM = null;
var listROM_NES = null;
var listROM_SNES = null;
var listROM_GBA = null;
var listROM_N64 = null;
var currentTab = -1;
var currentTabNES = -1;
var currentTabSNES = -1;
var currentTabGBA = -1;
var currentTabN64 = -1;

var Home = BaseLayer.extend({
    ctor: function () {
        this._super();

        if(gameData.isPortrait())
            this.initWithBinaryFile("res/UI/HomeP.json");
        else
            this.initWithBinaryFile("res/UI/Home.json");
    },
    initGUI: function () {

        this["lbCoin"].visible = false;
        this["iconCoin"].visible = false;
        this["btnCoin"].visible = false;

        if(cc.view.getResolutionPolicy() === cc.ResolutionPolicy.FIXED_WIDTH){
            this["bg"].scale = 0.6 * cc.winSize.height / DESIGN_RESOLUTION_HEIGHT;
        }else
        {
            this["bg"].scale = 0.6 * cc.winSize.width / DESIGN_RESOLUTION_WIDTH;
        }

        if(tracker.inReview)
        {
            this["title"].string = "Games";
        }
        else
        {
            if(gameData.isNES())
                this["title"].string = "NES Games";
            else if(gameData.isSNES())
                this["title"].string = "SNES Games";
            else if(gameData.isGBA())
                this["title"].string = "GBA Games";
            else if(gameData.isN64())
                this["title"].string = "N64 Games";
        }

        this["btnPolicy"].visible = tracker.inReview;
        this["lbPolicy"].visible = tracker.inReview;

        this["lbStatus"].string = "";
        var tableViewSize = this["Content"].getContentSize();
        tableViewSize.height += cc.winSize.height - 640;
        tableViewSize.width = cc.winSize.width;

        // this.infoROM = new InfoROMLayer();
        // this.infoROM.setViewSize(tableViewSize);
        // this.Content.addChild(this.infoROM);
        // this.infoROM.setPositionX(cc.winSize.width);
        // this.infoROM.visible = false;


        if(listROM_NES == null)
        {
            if(tracker.inReview){
                shuffle(dataMgr.datas);
                shuffle(dataMgr.dataSNES);
                shuffle(dataMgr.dataGBA);
            }

            listROM_NES = new ListRomLayer(tableViewSize);listROM_NES.retain();listROM_NES.loadData(dataMgr.datas);
            listROM_SNES = new ListRomSNESLayer(tableViewSize);listROM_SNES.retain();listROM_SNES.loadData(dataMgr.dataSNES);
            listROM_GBA = new ListRomGBALayer(tableViewSize);listROM_GBA.retain();listROM_GBA.loadData(dataMgr.dataGBA);
            listROM_N64 = new ListRomN64Layer(tableViewSize);listROM_N64.retain();listROM_N64.loadData(dataMgr.dataN64);
        }
        else
        {
            listROM_NES.removeFromParent(false);
            listROM_SNES.removeFromParent(false);
            listROM_GBA.removeFromParent(false);
            listROM_N64.removeFromParent(false);
            listROM.removeFromParent(false);
        }

        if(gameData.isNES())
            listROM = listROM_NES;
        else if(gameData.isSNES())
            listROM = listROM_SNES;
        else if(gameData.isGBA())
            listROM = listROM_GBA;
        else if(gameData.isN64())
            listROM = listROM_N64;

        this.listROM = listROM;

    },
    reset: function(direct){
        this.btnList.loadTextures("store/btn_list_noselect.png","store/btn_list_noselect.png","store/btn_list_noselect.png",ccui.Widget.PLIST_TEXTURE);
        this.btnFavorite.loadTextures("store/yeuthich_no_select.png","store/yeuthich_no_select.png","store/yeuthich_no_select.png",ccui.Widget.PLIST_TEXTURE);
        this.btnRecent.loadTextures("store/recent_noselect.png","store/recent_noselect.png","store/recent_noselect.png",ccui.Widget.PLIST_TEXTURE);
        this.btnPurchased.loadTextures("store/mygame_noselect.png","store/mygame_noselect.png","store/mygame_noselect.png",ccui.Widget.PLIST_TEXTURE);
        this.btnAbout.loadTextures("store/about_noselect.png","store/about_noselect.png","store/about_noselect.png",ccui.Widget.PLIST_TEXTURE);

        this.lbList.setTextColor(cc.color.WHITE);
        this.lbFavorite.setTextColor(cc.color.WHITE);
        this.lbRecent.setTextColor(cc.color.WHITE);
        this.lbPurchased.setTextColor(cc.color.WHITE);
        this.lbAbout.setTextColor(cc.color.WHITE);

        this.lbStatus.string = "";
        this.imgAbout.visible = false;
        this["Panel_Multiplayer"].visible = false;

        // this.listROM.loadData([]);

        // if(direct)
        // {
        //     this.listROM.setPosition(cc.p(0, 0));
        //     this.infoROM.setVisible(false);
        //
        // }
        // else
        // {
        //     this.listROM.runAction(cc.sequence(cc.show(), cc.moveTo(.2, cc.p(0, 0))));
        //     this.infoROM.runAction(cc.sequence(cc.moveTo(.2, cc.p(cc.winSize.width, 0)), cc.hide()));
        //
        // }

    },
    checkNew: function() {

        if(currentTabNES > 1 || currentTabSNES > 1 || currentTabGBA > 1 || currentTabN64 > 1)
            this.listGame();

        // if(gameData.isNES())
        // {
        //     if(currentTabNES > 1)
        //         this.listGame();
        // }
        // else if(gameData.isSNES())
        // {
        //     if(currentTabSNES > 1)
        //         this.listGame();
        // }
        //
        // else if(gameData.isGBA())
        // {
        //     if(currentTabGBA > 1)
        //         this.listGame();
        // }
        // else if(gameData.isN64())
        // {
        //     if(currentTabN64 > 1)
        //         this.listGame();
        // }


    },

    onEnterTransitionDidFinish: function(){
        this._super();
        gameData.dispathCoinChange();
        tracker.trackFPS();
    },
    onEnter: function(){
        this._super();
        this.onCoinChange(gameData.userData.coins);


        this.coinChangeListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "coins",
            callback: (event)=>{
                var coins = event._userData.coins;
                this.onCoinChange(coins);
            }
        });
        cc.eventManager.addListener(this.coinChangeListener, this);


        this.permissionListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "permmission",
            callback: this.onRequestPermissionResult.bind(this)
        });

        cc.eventManager.addListener(this.permissionListener, this);

        this.refreshSDListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "refresh_rom",
            callback: this.onRefreshROMinSDCard.bind(this)
        });
        cc.eventManager.addListener(this.refreshSDListener, this);

        this.playGameListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "play_game",
            callback: ()=>{

            }
        });
        cc.eventManager.addListener(this.playGameListener, this);


        this["Content"].addChild(listROM);
        listROM.home = this;
        // listROM.infoROM = this.infoROM;
        listROM.visible = true;
        listROM.setPosition(0,0);
        // this.infoROM.listROM = listROM;
        // this.infoROM.home = this;
        if(currentTab === -1)
            this.listGame();
        else if(currentTab === 1)
            this.listGame(null,null,true);
        else if(currentTab === 3)
            this.favorite(null,null,true);
        else if(currentTab === 5)
            this.recent(null,null,true);
        else if(currentTab === 7)
            this.localrom(null,null,true);
        else if(currentTab === 9)
            this.about(null,null,true);

        if(tracker.isAppSingle())
        {
            this["btnMenu"].visible = true;
            this["btnBack"].visible = false;
        }
        else {
            this["btnMenu"].visible = false;
            this["btnBack"].visible = true;
        }
        this["btnRefresh"].visible = false;

        if(tracker.inReview){
            this.localrom(null,null,true);
        }
    },
    onExit: function(){
        cc.eventManager.removeListener(this.permissionListener);
        cc.eventManager.removeListener(this.refreshSDListener);
        cc.eventManager.removeListener(this.playGameListener);
        cc.eventManager.removeListener(this.coinChangeListener);

        listROM_NES.removeFromParent(false);
        listROM_SNES.removeFromParent(false);
        listROM_GBA.removeFromParent(false);
        listROM_N64.removeFromParent(false);
        listROM.removeFromParent(false);

        this._super();
    },

    back: function(btn){
        tracker.trackingOnGoogleReview(btn.getName());

        if(gameData.isNES())
            currentTabNES = currentTab;
        else if(gameData.isSNES())
            currentTabSNES = currentTab;
        else if(gameData.isGBA())
            currentTabGBA = currentTab;
        else if(gameData.isN64())
            currentTabN64 = currentTab;

        var scene = new cc.Scene();
        var home = new Startup();scene.addChild(home);

        cc.director.runScene(cc.TransitionSlideInL.create(0.2,scene));
    },

    onCoinChange: function(coins)
    {
        this["lbCoin"].string = "x " + StringUtility.standartNumber(coins);
    },

    listGame: function (event,target,direct) {
        if(event)
            tracker.trackingOnGoogleReview(event.getName());

        currentTab = 1;
        this["btnRequestGame"].visible = false;
        this["btnRefresh"].visible = false;
        this["btnReloadROM"].visible = false;


        this.reset(direct);

        this.btnList.loadTextures("store/btn_list_select.png","store/btn_list_select.png","store/btn_list_select.png",ccui.Widget.PLIST_TEXTURE);
        this.lbList.setTextColor(cc.color(41,134,178,255));


        var datas = [];
        if(gameData.emulatorType === EMULATOR_NES)
            datas = dataMgr.promoDatas.concat(dataMgr.datas);
        else if(gameData.emulatorType === EMULATOR_SNES)
        {
            datas = dataMgr.promoDatas.concat(dataMgr.dataSNES);
        }
        else if(gameData.emulatorType === EMULATOR_GBA)
        {
            datas = dataMgr.promoDatas.concat(dataMgr.dataGBA);
        }
        else if(gameData.emulatorType === EMULATOR_N64)
        {
            datas = dataMgr.promoDatas.concat(dataMgr.dataN64);
        }
        if(!direct)
        {
            this.listROM.loadData(datas);
        }

        if(tracker.inReview)
            this.listROM.loadData([]);

        if(datas.length)
            this.lbStatus.string = "";
        else
            this.lbStatus.string = "Please add game from Menu."
    },
    favorite: function (event, target,direct) {
        if(event)
            tracker.trackingOnGoogleReview(event.getName());

        currentTab = 3;
        this["btnRequestGame"].visible = false;
        this["btnRefresh"].visible = false;
        this["btnReloadROM"].visible = false;


        this.reset(direct);

        this.btnFavorite.loadTextures("store/yeuthich_select.png","store/yeuthich_select.png","store/yeuthich_select.png",ccui.Widget.PLIST_TEXTURE);
        this.lbFavorite.setTextColor(cc.color(41,134,178,255));

        var favoriteList = dataMgr.getCurrentFavoriteList();

        if(!direct)
            this.listROM.loadData(favoriteList);

        if(favoriteList.length === 0)
            this["lbStatus"].setString("No game in Favorite list.");

    },
    recent: function (event, target,direct) {
        if(event)
            tracker.trackingOnGoogleReview(event.getName());

        currentTab = 5;
        this["btnRequestGame"].visible = false;
        this["btnRefresh"].visible = false;
        this["btnReloadROM"].visible = false;

        this.reset(direct);
        this.btnRecent.loadTextures("store/recent_select.png","store/recent_select.png","store/recent_select.png",ccui.Widget.PLIST_TEXTURE);
        this.lbRecent.setTextColor(cc.color(41,134,178,255));

        var recentList = [];
        var key = "recents";
        if(gameData.isNES())
        {
            recentList = dataMgr.romRecents;
            key = "recents";
        }
        else if(gameData.isSNES())
        {
            recentList = dataMgr.romRecentsSNES;
            key = "recentsSNES";
        }
        else if(gameData.isGBA())
        {
            recentList = dataMgr.romRecentsGBA;
            key = "recentsGBA";
        }
        else if(gameData.isN64())
        {
            recentList = dataMgr.romRecentsN64;
            key = "recentsN64";
        }

        if(!direct)
            this.listROM.loadData(recentList);

        if(recentList.length == 0)
            this["lbStatus"].setString("No game in Recent list.");
    },
    onRequestPermissionResult: function(event){
        // cc.log("tom " + event._userData);
        if(currentTab === 7)
        {
            if(event._userData["ret"])
            {
                this["btnRefresh"].visible = false;
                this["lbStatus"].string = "Click here to refresh list.";
                this.refreshList();
            }else
            {
                this["btnRefresh"].visible = true;
                this["lbStatus"].setString("Click here to accept Permission to load ROM file in SDCard.");
            }
        }

    },
    onRefreshROMinSDCard: function(event)
    {
        if(currentTab === 7)
        {
            if(gameData.isNES())
            {
                this.listROM.loadData(dataMgr.dataNES_SD);
                if(dataMgr.dataNES_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;
                    this["lbStatus"].string = "No ROM found in SDCard. Click here to refresh list.";
                }
                else
                {
                    this["btnRefresh"].visible = false;
                    this["lbStatus"].string = "";
                }
            }
            else if(gameData.isSNES())
            {
                this.listROM.loadData(dataMgr.dataSNES_SD);
                if(dataMgr.dataSNES_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;

                    this["lbStatus"].string = "No ROM found in SDCard. Click here to refresh list.";
                }
                else
                {
                    this["btnRefresh"].visible = false;
                    this["lbStatus"].string = "";
                }
            }
            else if(gameData.isGBA())
            {
                this.listROM.loadData(dataMgr.dataGBA_SD);
                if(dataMgr.dataGBA_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;
                    this["lbStatus"].string = "No ROM found in SDCard. Click here to refresh list.";
                }
                else
                {
                    this["btnRefresh"].visible = false;
                    this["lbStatus"].string = "";
                }
            }
            else if(gameData.isN64())
            {
                this.listROM.loadData(dataMgr.dataN64_SD);
                if(dataMgr.dataN64_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;
                    this["lbStatus"].string = "No ROM found in SDCard. Click here to refresh list.";
                }
                else
                {
                    this["btnRefresh"].visible = false;
                    this["lbStatus"].string = "";
                }
            }
        }
    },
    localrom: function (event, target,direct) {
        if(event)
            tracker.trackingOnGoogleReview(event.getName());

        currentTab = 7;
        this["btnRequestGame"].visible = false;
        this["btnRefresh"].visible = false;
        this["btnReloadROM"].visible = true;


        this.reset(direct);
        this.btnPurchased.loadTextures("store/mygame_select.png","store/mygame_select.png","store/mygame_select.png",ccui.Widget.PLIST_TEXTURE);
        this.lbPurchased.setTextColor(cc.color(41,134,178));


        if(!fr.platformWrapper.hasPermissionExternalCard())
        {
            this.listROM.loadData([]);
            this["lbStatus"].setString("Click here to accept Permission to load ROM file in SDCard.");
            this["btnRefresh"].visible = true;
            // tracker.requestPermissionExternalCard();
        }
        else
        {
            if(gameData.isNES() && !direct)
            {
                this.listROM.loadData(dataMgr.dataNES_SD);
                if(dataMgr.dataNES_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;
                    this["lbStatus"].string = "No ROM found (make sure the .nes .zip file exist in SD). Click here to refresh list.";
                }
            }
            else if(gameData.isSNES() && !direct)
            {
                this.listROM.loadData(dataMgr.dataSNES_SD);
                if(dataMgr.dataSNES_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;

                    this["lbStatus"].string = "No ROM found (make sure the .smc .sfc .zip file exist in SD). Click here to refresh list.";
                }
            }
            else if(gameData.isGBA() && !direct)
            {
                this.listROM.loadData(dataMgr.dataGBA_SD);
                if(dataMgr.dataGBA_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;
                    this["lbStatus"].string = "No ROM found (make sure the .gba .zip file exist in SD). Click here to refresh list.";
                }
            }else if(gameData.isN64() && !direct)
            {
                this.listROM.loadData(dataMgr.dataN64_SD);
                if(dataMgr.dataN64_SD.length === 0)
                {
                    this["btnRefresh"].visible = true;
                    this["lbStatus"].string = "No ROM found (make sure the .n64 .z64 .zip file exist in SD). Click here to refresh list.";
                }
            }
        }
    },
    about: function (event, target,direct) {
        if(event)
            tracker.trackingOnGoogleReview(event.getName());

        currentTab = 9;
        this["btnRequestGame"].visible = true;
        this["btnRefresh"].visible = false;
        this["btnReloadROM"].visible = false;


        this.reset(direct);
        this.listROM.loadData([]);

        this.btnAbout.loadTextures("store/about_select.png","store/about_select.png","store/about_select.png",ccui.Widget.PLIST_TEXTURE);
        this.lbAbout.setTextColor(cc.color(41,134,178));
        this.imgAbout.visible = true;

    },
    refreshList: function()
    {
        if(!fr.platformWrapper.hasPermissionExternalCard()) {
            fr.platformWrapper.requestPermissionExternalCard();
        }
        else
        {
            this.removeChildByTag(10);
            this.addChild(new FindROMLayer(), 10, 10);
        }
    },
    reloadROM: function(){
        if(!fr.platformWrapper.hasPermissionExternalCard()) {
            fr.platformWrapper.requestPermissionExternalCard();
        }
        else
        {
            this.removeChildByTag(10);
            this.addChild(new FindROMLayer(), 10, 10);
        }
    },
    requestGame: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        if(!tracker.inReview)
            fr.platformWrapper.sendEmail(JSON.stringify({
                "email":   "hoanghdtv154@gmail.com",
                "subject": "NES.emu",
                "body": "Hi FunnyEmulator Developer!",
                "chooserTitle": "NES.emu",
                "isHtmlText": false
            } ));

    },
    menu: function () {
        this.removeChildByTag(10);
        this.addChild(new StartupMenu(),10,10);
    },
    ads: function () {
        this.removeChildByTag(10);
        this.addChild(new RemoveADSLayer(),10,10);

    },
    openShop: function () {
        this.removeChildByTag(10);
        this.addChild(new Shop(),10,10);
    },
    checkOpenRate: function () {
        var rate_count = cc.sys.localStorage.getItem("rate_count");
        if(rate_count == null || rate_count === "")
        {
            cc.sys.localStorage.setItem("rate_count","10");
        }

        {
            rate_count = cc.sys.localStorage.getItem("rate_count");
            rate_count = parseInt(rate_count);
            if(rate_count > 0)
            {
                rate_count--;
                if(rate_count === 0)
                {
                    this.addChild(new RateLayer(),11);
                }
                cc.sys.localStorage.setItem("rate_count",""+rate_count);

            }
        }
    },
    policy: function () {
        cc.sys.openURL("https://classicgame8bits.wordpress.com/emulator-lite2-privacy-policy");

    },
    multiplayer: function () {
        this.reset(true);
        this.listROM.loadData([]);

        currentTab = 9;
        this["btnRequestGame"].visible = false;
        this["btnRefresh"].visible = false;
        this["btnReloadROM"].visible = false;

        this["Panel_Multiplayer"].visible = true;
    }


});

var Toast = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("res/UI/ToastLayer.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);

        this.runAction(cc.sequence(cc.delayTime(5),cc.removeSelf()));
    },
});

var showToast = function (msg) {
    var scene = cc.director.getRunningScene();
    var toast = new Toast();
    toast["message"].string = msg;

    scene.addChild(toast,1000);
}

var RateLayer = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("res/UI/RateLayer.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);

    },
    remindlater: function () {
        this.removeFromParent(true);
        cc.sys.localStorage.setItem("rate_count","10");

    },
    ratenow: function () {
        tracker.trackRate();

        cc.sys.localStorage.setItem("rate_count","-1");
        var url = "market://details?id=@pack".replace("@pack", fr.platformWrapper.getPackageName());
        cc.sys.openURL(url);

        this.removeFromParent(true);


    }
});