var Shop = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("res/UI/Shop.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);
    },
    quit: function (btn,type) {
        if(type === ccui.Widget.TOUCH_ENDED)
            this.removeFromParent();
    },
    initGUI: function () {
        for(var i=0;i<6;i++)
        {
            this["lbCoin"+i].string = "+ " + StringUtility.standartNumber(ConfigShop[i].coins);
            if(this["price"+i])
                this["price"+i].string = ConfigShop[i].price + "$"
        }

        if(cc.sys.isNative && cc.sys.isMobile)
        {
            var skus = JSON.parse(fr.google.iap.getListSKU());
            if(skus.length == 5)
            {
                for(var i=1;i<6;i++)
                {
                    if(this["price"+i])
                        this["price"+i].string = skus[i-1]["price"];
                }
            }
            this.skus = skus;
        }


    },
    watch: function () {
        this.will_show_video = true;
        this.user_click = false;
        adsMgr.showVideo(
            {
                onAdsResult: (code,msg)=>{
                    cc.log("video ads code : " + code);
                    if(code === ADMOB.VIDEO_REWARD_USER_CLICK)
                    {
                        this.user_click = true;
                    }
                    else if( code === ADMOB.VIDEO_REWARD_NOT_READY)
                    {
                        // showToast("An error occurred. please try again. make sure network has ready!");
                    }
                },
                onPlayerGetPoints: (points)=>
                {
                    cc.log("video points " + points);

                    setTimeout(()=>{
                        // var coin_add = this.user_click?ConfigShop[0].coins * 2: ConfigShop[0].coins;
                        var coin_add = this.user_click?ConfigShop[0].coins * 2: ConfigShop[0].coins;
                        gameData.userData.rewardVideo++;
                        gameData.writeCoin();
                        gameData.changeCoin(coin_add);
                    },100);

                }
            });
    },
    buy: function (btn, evt) {
        if (btn.getComponent("ComExtensionData"))
        {
            var dat = btn.getComponent("ComExtensionData").getCustomProperty();
            var idx = parseInt(dat) -1;

            fr.google.iap.payForProduct(this.skus[idx]);
        }
    },
    onEnter:function () {
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
    onExit: function () {
        this._super();
        cc.eventManager.removeListener(this.coinChangeListener);

    },

    onCoinChange: function(coins)
    {
        this["lbCoin"].string = "x " +StringUtility.standartNumber(coins);
    },
})

var ConfigShop = [
    {
        name: "Reward",
        price: 0,
        coins: 10
    },
    {
        name: "pkg_1",
        price: 0.99,
        coins: 100
    },
    {
        name: "pkg_2",
        price: 1.99,
        coins: 200
    },
    {
        name: "pkg_3",
        price: 4.99,
        coins: 600
    },
    {
        name: "pkg_4",
        price: 9.99,
        coins: 1500
    },
    {
        name: "pkg_5",
        price: 19.99,
        coins: 5000
    },
]

var getCoinsByProductID = function(productID)
{
    for(var i=0;i<ConfigShop.length;i++)
    {
        if(ConfigShop[i].name === productID)
            return ConfigShop[i].coins;
    }
    return 0;
};