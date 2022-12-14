
var AdsMap = {
    "" : ""
};

var ADSTYPE = {
    ADMOB: 0,
    IRONSRC: 1,
    FAN: 2
}

class AdsMgr {
    constructor(){
        this.adsAvaiable = true;
        this.timeAds = 0;
        // setInterval(this.update.bind(this),0);
        cc.director.getScheduler().scheduleUpdateForTarget(this,-1,false);

        this.next_time_enable_ads = 0;
        this.disableAdsByWatched = false;
    }

    init() {

        this.adsType = ADSTYPE.ADMOB;
        this.ads = null;

        var contents;
        if(cc.sys.isNative)
            contents = jsb.fileUtils.getStringFromFile("res/db_config/default.json");
        else
            contents = FileUtils.getInstance().getTextFileData("res/db_config/default.json");
        var configs = JSON.parse(contents);
        var pkg = fr.platformWrapper.getPackageName();

        if(!configs[pkg])
            return false;

        if(this.adsType === ADSTYPE.IRONSRC)
        {
            this.ads = fr.ironSrc;
            this.ads.init(configs[pkg]["ironsrcId"]);
        }
        else if(this.adsType === ADSTYPE.ADMOB)
        {
            this.ads = fr.admob;
            this.ads.init({
                adsID: configs[pkg]["admob_interId"],
                videoID: configs[pkg]["admob_rewardId"]
            });
        }
        return true;
    }

    isAdsDisabled(){
        return this.disableAdsByWatched;
    }

    update(dt){
        if(!this.adsAvaiable)
        {
            this.timeAds += dt;
            if(this.timeAds>=AdsMgr.TIME_FOR_SHOW)
            {
                this.adsAvaiable = true;
                this.timeAds = 0;
            }
        }
    }

    resetAds() {
        this.adsAvaiable = false;
        this.timeAds = 0;
    }

    showAds(){
        if(this.adsAvaiable)
        {
            this.adsAvaiable = false;
            this.timeAds = 0;

            this.ads.showAds();
            return true;
        }
        return false;
    }

    showAdsDirect() {
        this.ads.showAds();

    }

    showVideo(cb){
        if(this.ads)
            this.ads.showVideo(cb);
    }
}

AdsMgr.TIME_FOR_SHOW = 30;
var adsMgr = new AdsMgr();