var MenuLayer = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("res/UI/MenuLayer.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);
    },
    initGUI: function(){
         this["btnDownload"].visible = !gameData.isShowGame();
         this["btnInsertCoin"].visible =  gameData.isShowGame();

        this["btnInsertCoin"].visible = false;

        var rate_count = cc.sys.localStorage.getItem("rate_count");
        if(rate_count != null && rate_count !== "")
        {
            rate_count = parseInt(rate_count);
            this["Button_1"].visible = rate_count !== -1;
        }
    },
    quit: function (btn,type) {
        if(type === ccui.Widget.TOUCH_ENDED)
             this.removeFromParent();
    },
    download: function () {
        tracker.trackPushDownload();
        var my_pkg = fr.platformWrapper.getPackageName();

        if(gameData.isNES())
        {
            if(my_pkg === "nes.emu.zingplay.nes")
            {
                cc.sys.openURL("https://listgame8bit.github.io/nes");
            }
            else if(my_pkg === "nes.snes.gba.n64.funny")
            {
                // cc.sys.openURL("https://listgame8bit.github.io/funny");
            }
            else {
                cc.sys.openURL("https://n64listgame.github.io/nes/");
            }
        }
        else if(gameData.isSNES())
        {
            // cc.sys.openURL("https://n64listgame.github.io/snes/");
        }

    },
    rate: function () {
        tracker.trackRate();

        var url = "market://details?id=@pack".replace("@pack", fr.platformWrapper.getPackageName());
        cc.sys.openURL(url);
    },
    removeADS: function () {
        var parent = this.getParent();
        this.removeFromParent();
        parent.ads();
    },
    insertCoin: function () {
        var parent = this.getParent();
        this.removeFromParent();
        parent.openShop();
    },
});

var StartupMenu = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("res/UI/StartupMenu.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);
    },
    initGUI: function(){
        // this["btnDownload"].visible = !gameData.isShowGame();
        // this["btnInsertCoin"].visible =  gameData.isShowGame();
        //
        // this["btnInsertCoin"].visible = false;
        //
        // var rate_count = cc.sys.localStorage.getItem("rate_count");
        // if(rate_count != null && rate_count !== "")
        // {
        //     rate_count = parseInt(rate_count);
        //     this["Button_1"].visible = rate_count !== -1;
        // }
        this["btnRateForUs"].visible = !tracker.inReview;
    },
    quit: function (btn,type) {
        if(type === ccui.Widget.TOUCH_ENDED)
            this.removeFromParent();
    },
    download: function () {
        tracker.trackPushDownload();
        var my_pkg = fr.platformWrapper.getPackageName();

        if(gameData.isNES())
        {
            if(my_pkg === "nes.emu.zingplay.nes")
            {
                cc.sys.openURL("https://listgame8bit.github.io/nes");
            }
            else if(my_pkg === "nes.snes.gba.n64.funny")
            {
                // cc.sys.openURL("https://listgame8bit.github.io/funny");
            }
            else {
                cc.sys.openURL("https://n64listgame.github.io/nes/");
            }
        }
        else if(gameData.isSNES())
        {
            // cc.sys.openURL("https://n64listgame.github.io/snes/");
        }

    },
    rate: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        var url = "market://details?id=@pack".replace("@pack", fr.platformWrapper.getPackageName());
        cc.sys.openURL(url);
    },
    removeADS: function (btn) {
        tracker.trackingOnGoogleReview(btn.getName());

        var parent = this.getParent();
        this.removeFromParent();
        // parent.ads();
        cc.sys.openURL("https://n64listgame.github.io/ness/");
    },
    insertCoin: function () {
        var parent = this.getParent();
        this.removeFromParent();
        parent.openShop();
    },
});