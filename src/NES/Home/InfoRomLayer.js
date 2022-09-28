var InfoROMLayer = BaseLayer.extend({
    ctor: function () {
        this._super();

        var gui_path = "res/UI/RomInfo.json";
        if(gameData.screenType == SCREEN_PORTRAIT)
            gui_path = "res/UI/RomInfoP.json";

        this.initWithBinaryFile(gui_path);

        var container = this.scrollView.getChildByName("root");

        this.syncWidgets(container);

        // this.name = container.getChildByTag(10);
        // this.type = container.getChildByTag(15);
        // this.icon = container.getChildByTag(11);
        // this.intro = container.getChildByTag(16);

        this.stars = [];
        for (var i = 1; i <= 8; i++) {
            this.stars.push(this["Panel_stars"].getChildByTag(i));
        }

        this.screenShots = [];

        this.screenShots.push(container.getChildByTag(17));
        this.screenShots.push(container.getChildByTag(18));
        this.screenShots.push(container.getChildByTag(19));
        this.screenShots.push(container.getChildByTag(20));

        this.gimRight(this.btnPlay);

        this.favorite = false;

        this.listROM = null;
    },
    setInfo: function (info) {
        this.name.setString(info.name);
        this.type.setString(info.type);

        this.intro.setString(info.intro);
        // this.intro.setDimensions(cc.size(cc.winSize.width - 20,350));

        this.icon.loadTexture("res/data/" + info.id + "/" + info.id + "-0.png");


        for (var i = 0; i < this.screenShots.length; i++) {
            var imageCheck = "res/data/" + info.id + "/" + info.id + "-" + (i + 1) + ".png";
            if (cc.isNative) {
                var exist = jsb.fileUtils.isFileExist( jsb.fileUtils.fullPathForFilename(imageCheck));
                if (exist) {
                    this.screenShots[i].setVisible(true);
                    this.screenShots[i].loadTexture(imageCheck);
                }
                else
                    this.screenShots[i].setVisible(false);
            }
            else {
                if (i == 0 || i == 1) {
                    this.screenShots[i].setVisible(true);
                    this.screenShots[i].loadTexture(imageCheck);

                }
                else
                    this.screenShots[i].setVisible(false);

            }
        }

        if (findID(info.id, DataManager.getInstance().romFavorites)) {
            this.favorite = true;
            this.btnFavorite.loadTextures("res/UI/store/yeuthich_select.png", "res/UI/store/yeuthich_select.png");
            this.addFavorite.setString("Added to Favorites");
        }
        else {
            this.favorite = false;
            this.btnFavorite.loadTextures("res/UI/store/yeuthich_no_select.png", "res/UI/store/yeuthich_no_select.png");
            this.addFavorite.setString("");
        }
        this.info = info;
        this.setRate(info.rate);
    },
    setViewSize: function (size) {
        this.scrollView.setContentSize(size);
        // this.scrollView.setInnerContainerSize(cc.size(1136,1000));
        // this.scrollView.setContentOffset(cc.p(0, size.height - this.scrollView.getContainer().getContentSize().height));
    },
    setPrice: function (price) {

    },
    setRate: function(rate){
        if(rate == 0)
        {
            for(var i=0;i<this.stars.length;i++)
            {
                this.stars[i].loadTexture("res/UI/store/star_empty.png");
            }
        }
        else if(rate >= this.stars.length)
        {
            for(var i=0;i<this.stars.length;i++)
            {
                this.stars[i].loadTexture("res/UI/store/star_full.png");
            }
        }
        else
        {
            var rateLamtron = Math.floor(rate);
            for(var i=0;i<rateLamtron;i++)
            {
                this.stars[i].loadTexture("res/UI/store/star_full.png");
            }
            for(var i=rateLamtron;i<this.stars.length;i++)
            {
                this.stars[i].loadTexture("res/UI/store/star_empty.png");
            }
            if(rateLamtron < rate)
            {
                this.stars[rateLamtron].loadTexture("res/UI/store/star_half.png");
            }

        }
    },

    back: function(){
        this.listROM.runAction(cc.sequence(cc.show(), cc.moveTo(.2, cc.p(0, 0))));
        this.runAction(cc.sequence(cc.moveTo(.2, cc.p(cc.winSize.width, 0)), cc.hide()));
    },
    favorite: function(){
        this.addFavorite.stopAllActions();
        this.addFavorite.setVisible(false);
        this.addFavorite.setOpacity(0);
        if (!this.favorite) {
            DataManager.getInstance().addRomFavorite(this.info.id);
            this.favorite = true;
            this.btnFavorite.loadTextures("res/UI/store/yeuthich_select.png", "res/UI/store/yeuthich_select.png");

            this.addFavorite.setString("Added to Favorites");
        }
        else {
            this.favorite = false;
            this.btnFavorite.loadTextures("res/UI/store/yeuthich_no_select.png", "res/UI/store/yeuthich_no_select.png");
            this.addFavorite.setString("Removed from Favorites");
            DataManager.getInstance().removeRomFavorite(this.info.id);

        }
        this.addFavorite.runAction(cc.sequence(cc.show(),cc.fadeIn(.5),cc.delayTime(1),cc.fadeOut(.5),cc.hide()));
    },
    play: function(){
        if(gameData.minusOneCoin())
        {
            DataManager.getInstance().addRomRecent(this.info.id);
            listROM.removeFromParent(false);
            var gamescene = new GameLayer();
            gamescene.loadGame(this.info);
            var scene = new cc.Scene();
            scene.addChild(gamescene);
            cc.director.runScene(scene);
        }
    },


})