/**
 * Created by HOANGNGUYEN on 7/23/2017.
 */

var START_COIN = 20;

class UserData{

    constructor(){
        this.coins = 0;
        var now = new Date();
        this.lastActiveDate = now.getDate() + "-" + (now.getMonth()+1) + "-" + now.getFullYear();
        this.installDate = fr.platformWrapper.getInstallDate();
        this.deviceName = fr.platformWrapper.getDeviceModel();
        this.os = fr.platformWrapper.getOSVersion();
        this.rewardVideo = 0;
        this.coinsByPay = 0;
        this.hasSyncWithFirebase = false;
    }

    save(){
        if(this.hasSyncWithFirebase)
            cc.sys.localStorage.setItem("userData",JSON.stringify(this));
    }

    load(){
        var userDataCache = cc.sys.localStorage.getItem("userData");
        if(userDataCache !== null && userDataCache !== "")
        {
            var userData = JSON.parse(userDataCache);
            this.coins = userData.coins;
            this.installDate = userData.installDate;
            this.deviceName = userData.deviceName;
            this.os = userData.os;
            this.rewardVideo = userData.rewardVideo;
            this.coinsByPay = userData.coinsByPay;
            this.hasSyncWithFirebase = userData.hasSyncWithFirebase;
            return true;
        }
        return false;
    }
}

class DataListener {
    constructor(){

    }

    onShowGame(showGame)
    {

    }

    onCoinChange(coin)
    {

    }
}

var GameData = cc.Class.extend({
    ctor: function()
    {
        this.jsonData = null;

        this.fake = false;
        this.save = false;
        // this.urlRate = "market://details?id="+(cc.isNative?engine.PlatformWrapper.getPackageName():localized("PACKAGE_ANDROID"));

        this.promotionDatas = [];

        this.multiplayerConnected = false;
        this.multiplayerIsServer = false;

        this.count_show_icon = 2;
        this.enableADS = false;

        this.screenType = SCREEN_LANSCAPE;
        this.emulatorType = EMULATOR_NES;
        this.isPremium = false;

        // cc.log("isPremium: " + this.isPremium);

        this.listeners = [];
        this.showGame = false;

    },
    addListener: function(listener)
    {
        if(this.enableCoinFunc)
            this.listeners.push(listener);
    },
    removeListener: function(listener)
    {
        if(!this.enableCoinFunc)
            return;

        var idx = this.listeners.indexOf(listener);
        if(idx !== -1)
            this.listeners.splice(idx,1);
    },

    init: function(){

        this.userData = new UserData();
        this.userData.coins = START_COIN;
        this.enableCoinFunc = true;

        this.emulatorType = EMULATOR_NES;
        this.screenType = SCREEN_LANSCAPE;


        // firebase config
        var contents;
        if(cc.sys.isNative)
            contents = jsb.fileUtils.getStringFromFile("res/db_config/default.json");
        else
            contents = FileUtils.getInstance().getTextFileData("res/db_config/default.json");
        var configs = JSON.parse(contents);

        var config = configs["default"];
        var my_pkg = fr.platformWrapper.getPackageName();
        if(my_pkg !== "" && configs[my_pkg])
        {
            config = configs[my_pkg];
            cc.log("using firebase config : " + my_pkg);
        }
        else
        {
            cc.log("using firebase default config");

        }



        this.firebaseApp = initializeApp(config);
        this.db = getDatabase(this.firebaseApp);

        this.userID = fr.platformWrapper.getDeviceID();
        cc.log("userID : " + this.userID);

        if(cc.sys.isNative && cc.sys.isMobile)
        {
            // callback IAP
            fr.google.iap.pluginIAP.setListener({
                onPayResult: (ret,string,sku)=>{
                    cc.log("tom pay :" + ret + string + JSON.stringify(sku));
                    if(ret === 0)
                    {
                        var coin = getCoinsByProductID(sku["productId"]);
                        this.userData.coinsByPay += coin;
                        this.writeCoin();
                        this.changeCoin(coin);

                        // consume purchase
                        fr.google.iap.consumePurchase(string);
                    }
                }
            });
        }

        this.loadCoinDB();
    },
    validate: function()
    {
        if(cc.sys.isNative)
        {
            var emulator = cc.EmuEngine.shared().getEmulatorName();
            if(emulator === "nes")
            {
                this.emulatorType = EMULATOR_NES;
                this.screenType = SCREEN_LANSCAPE;
            }
            else  if(emulator === "snes")
            {
                this.emulatorType = EMULATOR_SNES;
                this.screenType = SCREEN_LANSCAPE;
            }
            else  if(emulator === "gba")
            {
                this.emulatorType = EMULATOR_GBA;
                this.screenType = SCREEN_LANSCAPE;
            }
            else  if(emulator === "n64")
            {
                this.emulatorType = EMULATOR_N64;
                this.screenType = SCREEN_LANSCAPE;
            }
        }

    },
    isPortrait: function(){
        return this.screenType === SCREEN_PORTRAIT;
    },
    isNES: function(){
        this.validate();
        return this.emulatorType === EMULATOR_NES;
    },
    isSNES: function(){
        this.validate();
        return this.emulatorType === EMULATOR_SNES;
    },
    isGBA: function(){
        this.validate();
        return this.emulatorType === EMULATOR_GBA;
    },
    isN64: function(){
        this.validate();
        return this.emulatorType === EMULATOR_N64;
    },
    initWithJson: function(json)
    {
        if(!json || json === "")
            return;
        this.json = json;
        cc.log("start game with config: " +this.json);
        this.jsonData = JSON.parse(this.json);


        this.urlRate = (this.jsonData.urlRate && this.jsonData.urlRate != "")?this.jsonData.urlRate :("market://details?id=" +(cc.isNative?engine.PlatformWrapper.getPackageName():localized("PACKAGE_ANDROID")));
        this.fake = (this.jsonData.vc_fake || 0) == engine.PlatformWrapper.getVersionCode();
        this.urlUpdate = this.jsonData.urlUpdate || "";
        this.admob_id = (this.jsonData.admob_id && this.jsonData.admob_id != "")?this.jsonData.admob_id:engine.AdmobHelper.getAdsID();

        this.save = true;
        this.promotionDatas =  this.jsonData.promotion || [];
        this.count_show_icon = (this.jsonData.count_show_icon === undefined)?2:this.jsonData.count_show_icon;
        this.enableADS = this.jsonData.enable_ads || false;

        if(!this.fake)      // neu da tung khong fake thi luu lai , sau service co tra ve fake thi van bat game bt;
        {
            sys.localStorage.setItem("no_fake","yes");
        }
        var check = sys.localStorage.getItem("no_fake");
        if(check != null && check === "yes")
            this.fake = false;

        cc.log("check :" + engine.PlatformWrapper.getVersionCode() +" :" + this.jsonData.vc_fake +" :" + this.fake);

        for(var i=0;i<this.promotionDatas.length;i++)
        {
            var promo = new PromotionData();
            promo.id = 0;
            promo.name = this.promotionDatas[i].newgame_name || "";
            promo.intro = this.promotionDatas[i].newgame_des || "";
            promo.package = this.promotionDatas[i].newgame_package || "";

            var test = "https://raw.githubusercontent.com/hoangnq154/promotion_art/master/tennis.png";

            promo.link_img = this.promotionDatas[i].newgame_img || "";
            promo.force_display = this.promotionDatas[i].force_display || false;
            promo.link = "market://details?id=" + promo.package;

            var exist = engine.PlatformWrapper.isPackageExist(promo.package);
            if(!exist || promo.force_display)
            {
                DataManager.getInstance().promoDatas.push(promo);
            }

        }
    },
    saveScreenType: function(screenType)
    {
        this.screenType = screenType;
        if(cc.isNative)
        {
            engine.PlatformWrapper.saveScreenType(screenType);
        }
    },
    isShowGame: function () {
        return this.showGame;
    },

    checkLocalCoin: function(){
        if(this.userData.load())
            this.dispathCoinChange();
    },

    loadCoinDB: function(){
        // load coin cache
        if(this.userData.load())
        {
            this.dispathCoinChange();
        }
        else if(!this.userData.hasSyncWithFirebase) {
            // load from db
            const dbRef = ref(getDatabase(),`users/${this.userID}`);
            onValue(dbRef,(snapshot)=>{
                if (snapshot.exists()) {
                    console.log("user data from firebase: " + JSON.stringify(snapshot.val()));
                    this.userData.coins = snapshot.val()["coins"];
                    this.userData.hasSyncWithFirebase = true;
                    this.userData.save();
                    this.dispathCoinChange();
                } else {
                    console.log("No data available from firebase, write new....");
                    this.userData.coins = START_COIN;
                    this.userData.hasSyncWithFirebase = true;
                    this.writeCoin();
                    this.dispathCoinChange();
                }
            });
        }


    },
    writeCoin: function(){
        cc.log("user data saved");
        this.userData.save();
        set(ref(this.db, 'users/' + this.userID),this.userData);
    },
    initDB: function(cb){
        const dbRef = ref(getDatabase(),`users/${this.userID}`);
        onValue(dbRef,(snapshot)=>{
            if (snapshot.exists()) {
                if(cb)
                    cb(true);

            } else {
                set(ref(this.db, 'users/' + this.userID ),this.userData).then(()=>{
                    if(cb)
                        cb(true);
                }).catch((e)=>{

                });
            }
        }, {onlyOnce: true});

    },

    minusOneCoin: function(){
        return true;
        if(this.userData.coins <= 0)
            return false;
        this.userData.coins--;

        this.writeCoin();
        this.dispathCoinChange();
        return true;
    },
    changeCoin: function(coin)
    {
        this.userData.coins += coin;
        if(this.userData.coins < 0)
            return this.userData.coins = 0;
        this.writeCoin();
        this.dispathCoinChange();
    },

    dispathShowGame: function () {

    },
    dispathCoinChange: function () {
        cc.log("current coins : " + this.userData.coins);
        cc.eventManager.dispatchCustomEvent("coins",{coins: this.userData.coins});
    },

});

var PromotionData = cc.Class.extend({
    ctor: function()
    {
        this.id = 0;
        this.name = "Metal Slug MAME";
        this.intro = "Classic game";
        this.link = "";
        this.link_img = "";
        this.rate = 8;
        this.type = "Action";
    }
});



GameData.sharedInstance = null;
GameData.firstInit = true;

GameData.getInstance = function(){
    if(GameData.firstInit)
    {
        GameData.sharedInstance = new GameData();
        GameData.firstInit = false;
    }
    return GameData.sharedInstance;
}

var gameData = GameData.getInstance();