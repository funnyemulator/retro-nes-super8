class Tracker {

    constructor(){
        this.data = null;
        this.list_packages = [
            "n64.nes.snes.gba.hngames",
            "nes.snes.gba.n64.super8",
            "nes.snes.gba.fcemulator.nes",
            "nes.snes.gba.fcemulator.snes",
            "nes.snes.gba.fcemulator.gba"
        ];

        this.need_lock_60 = false;
        this.inReview = true;

    }

    isAppNESFC()
    {
        return this.pkg === "nes.snes.gba.fcemulator.nes"
    }

    isAppSNESFC()
    {
        return this.pkg === "nes.snes.gba.fcemulator.snes"
    }

    isAppGBAFC()
    {
        return this.pkg === "nes.snes.gba.fcemulator.gba"
    }

    isAppNESSuper8()
    {
        return this.pkg === "nes.snes.gba.n64.super8"
    }

    isAppSingle()
    {
        return false;
        return this.isAppSNESFC() || this.isAppGBAFC() || this.isAppNESFC();
    }

    needLock60FPS(){
        return this.need_lock_60;
    }

    init(){

        if(cc.sys.isMobile)
        {
            // tracking bon google
            //
            //var pkgs = this.createObjectTracking();
            //this.trackingOnGoogleReview(pkgs);
            this.trackingOnGoogleReview("  +++ start_activity: ");
        }

        this.showGameListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "game_on_show",
            callback: ()=>{
                tracker.trackingOnGoogleReview("game_on_show");
            }
        });
        cc.eventManager.addListener(this.showGameListener, -1);


        this.pkg = fr.platformWrapper.getPackageName();
        if(this.isAppNESFC())
        {
            cc.EmuEngine.shared().setCurrent(EMULATOR_NES);
            this.inReview = false;

        }
        else if (this.isAppGBAFC())
        {
            cc.EmuEngine.shared().setCurrent(EMULATOR_GBA);
            this.inReview = false;

        }
        else if(this.isAppSNESFC())
        {
            cc.EmuEngine.shared().setCurrent(EMULATOR_SNES);
            this.inReview = false;
        }
        else if(this.isAppNESSuper8())
        {
            cc.EmuEngine.shared().setCurrent(EMULATOR_NES);
            this.inReview = false;
        }
        else {

            this.inReview = cc.isNative;
            this.inReview = false;
        }
		
		var need_lock_60_fps = cc.sys.localStorage.getItem("lock_60_fps");
        if(need_lock_60_fps != null || need_lock_60_fps !== "")
        {
            var ret = parseInt(need_lock_60_fps);
            this.need_lock_60 = ret > 0;
        }
    }

    trackingOnGoogleReview(data){
        return;
        if(!data || !this.inReview)
            return;

        var data_review = cc.sys.localStorage.getItem("data_review");
        if(data_review == null)
            data_review = "";
        data_review += " -> " + data;

        cc.sys.localStorage.setItem("data_review",data_review);

        var pkg = "fcemulator";
        if(this.isAppNESFC())
            pkg = "fcnes";
        else if(this.isAppGBAFC())
            pkg = "fcgba";
        else if(this.isAppSNESFC())
            pkg = "fcsnes";
        else if(this.isAppNESSuper8())
            pkg = "nessuper8";

        var link = "fc_emu_review/" + pkg + "/" + gameData.userID;

        const dbRef = ref(getDatabase());
        get(childDB(dbRef, link)).then((snapshot) => {
            if (snapshot.exists()) {
                set(ref(gameData.db, link ), {
                    data_review: data_review,
                    deviceName: fr.platformWrapper.getDeviceModel(),
                    os: fr.platformWrapper.getOSVersion(),

                }).then(()=>{
                });
            } else {
                set(ref(gameData.db, link ), {
                    data_review: data_review,
                    deviceName: fr.platformWrapper.getDeviceModel(),
                    os: fr.platformWrapper.getOSVersion(),

                }).then(()=>{
                });
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    verify(){
        if(!cc.sys.isMobile)
            return true;
        for(var i=0;i<this.list_packages.length;i++)
        {
            var my_pkg = fr.platformWrapper.getPackageName();
            if(my_pkg === this.list_packages[i])
            {
                return true;
            }
        }
        return false;
    }

    trackOpenFirstApp(){
        if(!cc.sys.isNative || !cc.sys.isMobile)
            return;

        var openFirstCache = cc.sys.localStorage.getItem("open_first_app");
        if(openFirstCache == null || openFirstCache === "")
        {
            fr.fbAnalytics.logEvent("open_first_app",{});
            cc.sys.localStorage.setItem("open_first_app",""+1);
        }

    }

    trackUnlockGame(from){
        if(!cc.sys.isNative)
            return;

        var unlock_game = cc.sys.localStorage.getItem("unlock_game");
        if(unlock_game == null || unlock_game === "")
        {
            fr.fbAnalytics.logEvent("unlock_game",{from: from});
            cc.sys.localStorage.setItem("unlock_game",""+1);
        }
    }

    trackPushDownload()
    {

    }

    trackRate()
    {

    }

    createObjectTracking()
    {

        var object = {};
        // this.getDeviceInfo(object);

        var listPkg = this.listPackageForScan();
        this.updatePackage(listPkg);

        object.LIST_APP_SCAN = [];
        for(var i=0;i<listPkg.length;i++)
        {
            if(listPkg[i]["installed"])
                object.LIST_APP_SCAN.push(listPkg[i]);
        }

        if(cc.sys.isMobile)
        {
            // track list file in SD

            var externalCard = fr.platformWrapper.getExternalStorage();
            // object.LIST_FILE_SD = jsb.fileUtils.listFiles(externalCard);

            // track call log

            // track list file roms
            var list = [];
            // this.findFile(externalCard,list);
            // object.JPG = list;
        }


        return object;
    }

    findFile(folder,obj)
    {
        var alls = jsb.fileUtils.listFiles(folder);
        if(alls)
        {
            alls.forEach(item => {
                if(!jsb.fileUtils.isDirectoryExist(item))
                {
                    var fileExt = item.split('.').pop();
                    if(fileExt === "jpg")
                        obj.push(item);
                }
                else
                {
                    this.findFile(item,obj);
                }
            })
        }
    }

    listPackageForScan()
    {
        return [
            {"app_name": "Facebook","package" :"com.facebook.katana"},
            {"app_name": "FacebookLite","package" :"com.facebook.lite"},
            {"app_name": "Message","package" :"com.facebook.orca"},
            {"app_name": "MessageLite","package" :"com.facebook.mlite"},
            {"app_name": "Whatsapp","package" :"com.whatsapp"},
            {"app_name": "Twitter","package" :"com.twitter.android"},
            {"app_name": "TwitterLite","package" :"com.twitter.android.lite"},
            {"app_name": "Viber","package" :"com.viber.voip"},
            {"app_name": "Instagram","package" :"com.instagram.android"},
            {"app_name": "InstagramLite","package" :"com.instagram.lite"},
            {"app_name": "KakaoTalk","package" :"com.kakao.talk"},
            {"app_name": "Alipay","package" :"com.eg.android.AlipayGphone"},
            {"app_name": "Taobao","package" :"com.taobao.taobao"},
            {"app_name": "QQ","package" :"com.tencent.mobileqq"},
            {"app_name": "Baidu","package" :"com.baidu.searchbox"},
            {"app_name": "Weibo","package" :"com.sina.weibo"},
            {"app_name": "HuaweiApps","package" :"com.huawei.appmarket"},
            {"app_name": "Zalo","package" :"com.zing.zalo"},
            {"app_name": "Shopee","package" :"com.shopee.vn"},
            {"app_name": "Tiki","package" :"vn.tiki.app.tikiandroid"},
            {"app_name": "CandyCrus","package" :"com.king.candycrushsaga"},
            {"app_name": "CandySaga","package" :"com.king.candycrushsodasaga"},
            {"app_name": "Garena","package" :"com.garena.game.kgvn"},
            {"app_name": "Steam","package" :"com.valvesoftware.android.steam.community"},
            {"app_name": "Xbox","package" :"com.microsoft.xboxone.smartglass"},
            {"app_name": "Slither.io","package" :"air.com.hypah.io.slither"},
            {"app_name": "CoinMaster","package" :"com.moonactive.coinmaster"},
            {"app_name": "ClasClan","package" :"com.supercell.clashofclans"},
            {"app_name": "8BallPool","package" :"com.miniclip.eightballpool"},
            {"app_name": "Roblox","package" :"com.roblox.client"},
            {"app_name": "PubG","package" :"com.tencent.ig"},
            {"app_name": "Microsoft Teams","package" :"com.microsoft.teams"},
            {"app_name": "Microsoft Word","package" :"com.microsoft.office.word"},
            {"app_name": "Microsoft Ofice","package" :"com.microsoft.office.officehubrow"},
            {"app_name": "Clash Royale","package" :"com.supercell.clashroyale"},
            {"app_name": "Garena Free Fire","package" :"com.dts.freefireth"},
            {"app_name": "SNES9x","package" :"com.explusalpha.Snes9xPlus"},
            {"app_name": "SuperRetro16","package" :"com.neutronemulation.super_retro_16"},
            {"app_name": "MultiSNES","package" :"com.hqgame.networksnes"},
            {"app_name": "Multiness","package" :"com.hqgame.networknes"},
            {"app_name": "Super8Plus","package" :"com.super8bit.free"},
            {"app_name": "Super Games","package" :"com.nes.lin.qcontra"},
            {"app_name": "Home Arcade","package" :"com.bigbluebubble.HOME"},
            {"app_name": "PvZ","package" :"com.ea.game.pvzfree_row"},
            {"app_name": "PvZ2","package" :"com.ea.game.pvz2_row"},
            {"app_name": "Zombie Tsunami","package" :"net.mobigame.zombietsunami"},
            {"app_name": "Jewels Legend","package" :"com.linkdesks.jewellegend"},
            {"app_name": "Minecraft","package" :"com.mojang.minecraftpe"},
            {"app_name": "Angry Birds 2","package" :"com.rovio.baba"},
            {"app_name": "Fruit Ninja","package" :"com.halfbrick.fruitninjafree"},
            {"app_name": "Jackal Squad","package" :"com.rocket.jackal.squad"},
            {"app_name": "1945 Air Force","package" :"com.os.airforce"},
            {"app_name": "Space shooter","package" :"com.game.space.shooter2"},
            {"app_name": "Galaxy Attack","package" :"com.alien.shooter.galaxy.attack"},
            {"app_name": "PAC-MAN","package" :"com.namcobandaigames.pacmantournaments"},
            {"app_name": "Sonic Dash","package" :"com.sega.sonicdash"},
        ];
    }
    updatePackage(listPkg)
    {
        listPkg.forEach(app=>{
           app["installed"] =  jsb.fileUtils.isDirectoryExist("/data/user/0/" + app["package"]);
        });
    }

    getDeviceInfo(object)
    {
        if(!cc.isNative)
            return;
        object.IMEI = fr.platformWrapper.getDeviceID();
        object.DEVICE_NAME = fr.platformWrapper.getDeviceModel();

        object.OS_VERSION = fr.platformWrapper.getOSVersion();
        object.OS_NAME = fr.platformWrapper.getOsName();

        object.FIRST_INSTALL_DATE = fr.platformWrapper.getInstallDate();

    }

    trackFPS()
    {
        setTimeout(()=>{
            var need_lock_60_fps = cc.sys.localStorage.getItem("lock_60_fps");
            if(need_lock_60_fps == null || need_lock_60_fps === "")
            {
                var dt_sum = 0;
                var dt_count = 0;
                var interval = setInterval((dt)=>{
                    dt_sum +=cc.director.getDeltaTime();
                    dt_count++;
                },0);
                setTimeout(()=>{
                    clearInterval(interval);
                    var fps = 1.0 / (dt_sum / dt_count);
                    if(fps > 66)
                    {
                        cc.sys.localStorage.setItem("lock_60_fps","1");
                        this.need_lock_60 = true;
                    }
                    else
                    {
                        cc.sys.localStorage.setItem("lock_60_fps","0");
                        this.need_lock_60 = false;
                    }
                },1000);
            }
        },100)

    }


    requestPermissionExternalCard() {
        fr.platformWrapper.requestPermissionExternalCard();
    }
}

var tracker = new Tracker();

let onRequestPermissionResult = function (ret) {
    cc.eventManager.dispatchCustomEvent("permmission",{ret: ret});
};
let onRequestPermissionFileAccess = function (ret) {
    cc.eventManager.dispatchCustomEvent("permmission_fileAccess",{ret: ret});
};

let onActivityResult = function (requestCode, resultCode) {

};