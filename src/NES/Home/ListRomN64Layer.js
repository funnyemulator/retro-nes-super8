
var GAME_IN_ROW_N64 = 5;
var ListRomN64Layer = BaseLayer.extend({
    ctor: function (tableSize) {
        this._super();
        this.datas = [];

        this.tableView = new cc.TableView(this, tableSize);
        this.tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tableView.setDelegate(this);
        this.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tableView.reloadData();

        this.addChild(this.tableView);

        this.infoROM = null;
        this.home = null;

        var minWidth = 215;
        GAME_IN_ROW_N64 = Math.floor(cc.winSize.width / minWidth);
        this.time = 0;
        this.longClick = false;
    },
    onEnter: function()
    {
        this._super();
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: (touch,event)=>{
                this.startPoint = touch.getLocation();
                this.releasePoint = touch.getLocation();

                return true;},
            onTouchMoved: (touch,event)=>{
                this.releasePoint = touch.getLocation();
            },
            onTouchEnded: (touch,event)=>{
                this.releasePoint = touch.getLocation();
            }
        });
        cc.eventManager.addListener(this.touchListener,-1);
        this.tableView.setTouchEnabled(true);

    },
    onExit: function(){
        cc.eventManager.removeListener(this.touchListener);
        this._super();
    },
    loadData: function (data) {
        this.datas = [];

        if(data.length === 0)
        {
            this.tableView.reloadData();
            return;
        }

        var count = Math.floor(data.length / GAME_IN_ROW_N64);
        if (count <= 0) {
            this.datas.push(data);
        }
        else {
            for (var i = 0; i < count; i++) {
                var info = [];
                for (var j = 0; j < GAME_IN_ROW_N64; j++) {
                    info.push(data[i * GAME_IN_ROW_N64 + j]);
                }
                this.datas.push(info);
            }
            if (data.length - count * GAME_IN_ROW_N64 > 0) {
                var info = [];
                for (var i = count * GAME_IN_ROW_N64; i < data.length; i++) {
                    info.push(data[i]);
                }
                this.datas.push(info);
            }
        }
        this.tableView.reloadData();


    },
    tableCellTouched: function (table, cell) {

        return;
        if (!this.isVisible() || !table.isVisible())
            return;

        var releasePoint = cell.convertToNodeSpaceAR(this.releasePoint);
        for (var i = GAME_IN_ROW_N64-1; i >= 0; i--) {
            if (cell.layers[i].isVisible() && releasePoint.x >= (cell.layers[i].getPositionX())) {
                if (i <= 1 && releasePoint.x > (cell.layers[i].getPositionX() + cell.layers[i].sprite.getContentSize().width))
                    break;
                var infoReal = isNaN(cell.infos[i])?cell.infos[i]:DataManager.getInstance().mapDatas[cell.infos[i]];
                if(infoReal.id === 0)
                {
                    var exist = engine.PlatformWrapper.isPackageExist(infoReal.package);
                    cc.log("exsit :" + exist);
                    if(exist)
                    {
                        engine.PlatformWrapper.openApp(infoReal.package);
                    }
                    else
                    {
                        var promo = new PromoDialog();
                        promo.setInfo(infoReal);
                        this.getParent().addChild(promo,10);
                    }


                    return;
                }



                break;
            }
        }
        // this.infoROM.stopAllActions();
        // this.stopAllActions();
        // this.infoROM.runAction(cc.sequence(cc.show(), cc.moveTo(.2, cc.p(0, 0))));
        // this.runAction(cc.sequence(cc.moveTo(.2, cc.p(-cc.winSize.width, 0)), cc.hide()));



    },

    tableCellSizeForIndex: function (table, idx) {

        return cc.size(cc.winSize.width, 240);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new N64Cell(this);
        }
        cell.setInfo(this.datas[idx]);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        //cc.log(this.datas.length)
        return this.datas.length;
    },
    scrollViewDidScroll: function (view) {
    },
    scrollViewDidZoom: function (view) {
    },

    hasClick: function(){
        var sub = cc.pSub(this.releasePoint,this.startPoint);
        return cc.pLengthSQ(sub) < 10 * 10;
    },

    longClickToCell: function(infoReal){
        if(infoReal.inSDCard)
        {
            this.clickToCell(infoReal);
            return;
        }
        var popup = new DownloadPopupN64(this);
        popup.setInfo(infoReal);
        this.home.addChild(popup,10,11);
    },

    clickToCell: function (infoReal) {
        tracker.trackingOnGoogleReview(infoReal.name);
        if(infoReal.inSDCard )
        {
            if(jsb.fileUtils.isFileExist(infoReal.localFile))
            {
                if( gameData.minusOneCoin()) {
                    var intent = {
                        ROM_PATH: infoReal.localFile,
                        ROM_MD5: infoReal.md5,
                        ROM_CRC: "",
                        ROM_HEADER_NAME: "",
                        ROM_COUNTRY_CODE: 19,
                        ROM_ART_PATH:"",
                        ROM_GOOD_NAME:infoReal.name,
                        ROM_LEGACY_SAVE: "",
                        DO_RESTART: true
                    };
                    fr.gameAdapter.startGame(intent);
                }
                else
                    this.home.openShop();
            }

        }
        else if(downloadMgr.isFileExist(infoReal))
        {
            // copy image
            if(cc.sys.isNative){
                cc.EmuEngine.shared().copyData(infoReal.urlImage,jsb.fileUtils.getWritablePath() + "/tmp.jpg");
            }
            var intent = {
                ROM_PATH: cc.isNative?(jsb.fileUtils.getWritablePath() +infoReal.localFile): infoReal.localFile,
                ROM_MD5: infoReal.md5,
                ROM_CRC: "",
                ROM_HEADER_NAME: "",
                ROM_COUNTRY_CODE: 19,
                ROM_ART_PATH:cc.isNative?(jsb.fileUtils.getWritablePath() + "/tmp.jpg"):"",
                ROM_GOOD_NAME:infoReal.name,
                ROM_LEGACY_SAVE: "",
                DO_RESTART: true
            };
            if(gameData.minusOneCoin()) {
                DataManager.getInstance().addRomRecent(infoReal.id);
                fr.gameAdapter.startGame(intent);
				setTimeout(()=>{
					adsMgr.showAdsDirect();
				},500);
            }
            else
                this.home.openShop()

        } else
        {

            var popup = new DownloadPopupN64(this);
            popup.setInfo(infoReal);
            this.home.addChild(popup,10,11);
        }
    }
})

var N64Cell = cc.TableViewCell.extend({
    ctor: function (list) {
        this._super();
        this.listROM = list;

        this.layers = [];

        var w = 175;
        var padding = 20;
        var min = w / 2 + padding ;
        var max = cc.winSize.width - padding - w/2;
        var delta = (max - min) / (GAME_IN_ROW_N64 - 1);

        var poss = [];
        poss.push(cc.p(min-w/2,0));

        for(var i=0;i<GAME_IN_ROW_N64-2;i++)
        {
            poss.push(cc.p( min + (i + 1)* delta - w/2,0));
        }

        poss.push(cc.p(max -w/2,0));


        // var poss = [cc.p(10, 0), cc.p(232, 0), cc.p(455, 0), cc.p(700, 0), cc.p(920, 0)];

        for (var i = 0; i < GAME_IN_ROW_N64; i++) {
            var layer = new BaseLayer();
            layer.idx = i;
            layer.listROM = this.listROM;
            layer.cell = this;
            layer.touched =  function(sender, event){
                if(event === ccui.Widget.TOUCH_BEGAN)
                {
                    var infoRealID = this.cell.infos[this.idx];
                    var infoReal = isNaN(infoRealID)?infoRealID:DataManager.getInstance().mapDatas[infoRealID];

                    this.long_click = false;
                    this.intervalId = setTimeout(()=>{
                        if(this.listROM.hasClick()){
                            this.listROM.longClickToCell(infoReal);
                            this.long_click = true;
                        }

                    },750);
                } else if( event === ccui.Widget.TOUCH_ENDED || event === ccui.Widget.TOUCH_CANCELED){
                    clearTimeout(this.intervalId);

                    if(!this.listROM.hasClick())
                        return;
                    var infoRealID = this.cell.infos[this.idx];
                    var infoReal = isNaN(infoRealID)?infoRealID:DataManager.getInstance().mapDatas[infoRealID];
                    if(!this.long_click){
                        this.listROM.clickToCell(infoReal);
                    }

                }

            }.bind(layer);
            layer.initWithBinaryFile("res/UI/RomCell.json");
            layer["Panel_icon"].setSwallowTouches(false);

            layer.status.setVisible(true);
            this.addChild(layer);
            layer.setPosition(poss[i]);
            layer.starss= [];
            for(var j=1;j<=8;j++)
            {
                layer.starss.push(layer.stars.getChildByTag(j));
            }
            if(cc.isNative)
            {
                layer.promo_img = AsyncImage.create("res/UI/image/icon_promo.png","res/UI/image/icon_promo.png");
                layer.node.addChild(layer.promo_img);

                // if(tracker.inReview)
                // {
                //     layer.spriteSNES.getVirtualRenderer().setCullFaceSide(gl.FRONT);
                //     layer.spriteSNES.setFlippedX(true);
                //
                //     var material = gfx.Material.CreateNew("res/shaders/BlurSprite.mat");
                //     layer.spriteSNES.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
                //     layer.spriteSNES.material = material;
                //
                //     // layer.spriteSNES.addChild(new Sprite("res/UI/icons/snes.png"));
                //
                // }
                // else {
                //     layer.spriteSNES.getVirtualRenderer().setCullFaceSide(gl.BACK);
                //     layer.spriteSNES.setFlippedX(false);
                // }
            }

            this.layers.push(layer);
        }

    },
    setInfo: function (infos) {
        for (var i = 0; i < GAME_IN_ROW_N64; i++) {
            this.layers[i].setVisible(false);
        }
        for (var i = 0; i < infos.length; i++) {
            var infoReal = isNaN(infos[i])?infos[i]:DataManager.getInstance().mapDatas[infos[i]];

            this.layers[i].setVisible(true);
            this.layers[i].node.setVisible(false);
            this.layers[i].name.setString(infoReal.name);
            this.setRateFor1Layer(this.layers[i],infoReal.rate);
            this.layers[i].spriteN64.visible = true;
            this.layers[i].stars.visible = true;

            this.layers[i].n64.visible = false;
            if(infoReal.id === 0)        // promo
            {
                {
                    this.layers[i].sprite.setVisible(false);
                    this.layers[i].node.setVisible(true);
                    this.layers[i].name.setString(infoReal.name);
                    this.setRateFor1Layer(this.layers[i],infoReal.rate);
                    this.layers[i].promo_img.asyncExecuteWithUrl(infoReal.package,infoReal.link_img);
                }
                continue;
            }



            this.layers[i].sprite.setVisible(false);
            this.layers[i].spriteGBA.setVisible(false);
            this.layers[i].spriteSNES.setVisible(false);
            this.layers[i].spriteN64.setVisible(true);
            this.layers[i].spriteN64.loadTexture(infoReal.urlImage);

            //


            if(cc.sys.isNative)
            {
                if(tracker.inReview)
                {
                    // this.layers[i].spriteN64.getVirtualRenderer().setCullFaceSide(gl.FRONT);
                    // this.layers[i].spriteN64.setFlippedX(true);
                    //
                    // var texture = cc.textureCache.addImage(infoReal.urlImage);
                    // this.layers[i].spriteN64.material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(texture));

                }
                else {
                    this.layers[i].spriteN64.getVirtualRenderer().setCullFaceSide(gl.BACK);
                    this.layers[i].spriteN64.setFlippedX(false);
                    this.layers[i].spriteN64.loadTexture(infoReal.urlImage);
                }
            }



            if(infoReal.inSDCard)
            {
                this.layers[i].status.string = "";
                this.layers[i].spriteN64.visible = false;
                this.layers[i].n64.visible = true;
                this.layers[i].stars.visible = false;

            }
            else if(downloadMgr.isFileExist(infoReal))
            {
                this.layers[i].status.string = "";
            }
            else
            {
                if(downloadMgr.isDownloadThreadExist(infoReal))
                {
                    var downloadInfo = downloadMgr.getDownloadInfo(infoReal);
                    var mbDownload = (downloadInfo.byteDownloaded / (1024 * 1024)).toFixed(2)+ "MB";
                    var mbTotal= (downloadInfo.byteTotal / (1024 * 1024)).toFixed(2)+ "MB";
                    this.layers[i].status.string = "" + mbDownload + " "+ "/ " + mbTotal + "";

                }
                else
                {
                    this.layers[i].status.string = "(need download)";
                }
            }

        }

        this.infos = infos;
    },
    setRateFor1Layer: function(layer,rate)
    {
        if(rate == 0)
        {
            for(var i=0;i<layer.starss.length;i++)
            {

                layer.starss[i].setSpriteFrame("store/star_empty.png");
            }
        }
        else if(rate >= layer.starss.length)
        {
            for(var i=0;i<layer.starss.length;i++)
            {
                layer.starss[i].setSpriteFrame("store/star_full.png");
            }
        }
        else
        {
            var rateLamtron = Math.floor(rate);
            for(var i=0;i<rateLamtron;i++)
            {
                layer.starss[i].setSpriteFrame("store/star_full.png");
            }
            for(var i=rateLamtron;i<layer.starss.length;i++)
            {
                layer.starss[i].setSpriteFrame("store/star_empty.png");

            }
            if(rateLamtron < rate)
            {
                layer.starss[rateLamtron].setSpriteFrame("store/star_half.png");

            }

        }
    },
    onEnter: function () {
        this._super();
        this.scheduleUpdate()
    },
    onExit: function () {
        this.unscheduleUpdate();
        this._super();
    },
    update: function (dt) {
        var infos = this.infos;
        for (var i = 0; i < this.infos.length; i++) {
            var infoReal = isNaN(infos[i])?infos[i]:DataManager.getInstance().mapDatas[infos[i]];
            if(infoReal.inSDCard){
                if(jsb.fileUtils.isFileExist(infoReal.localFile))
                    this.layers[i].status.string = "";
                else
                    this.layers[i].status.string = "(missing)";
            }
            else
            {
                if(downloadMgr.isFileExist(infoReal))
                {
                    this.layers[i].status.string = "";
                }
                else
                {
                    if(downloadMgr.isDownloadThreadExist(infoReal))
                    {
                        var downloadInfo = downloadMgr.getDownloadInfo(infoReal);
                        var mbDownload = (downloadInfo.byteDownloaded / (1024 * 1024)).toFixed(2)+ "MB";
                        var mbTotal= (downloadInfo.byteTotal / (1024 * 1024)).toFixed(2)+ "MB";
                        this.layers[i].status.string = "" + mbDownload + " "+ "/ " + mbTotal + "";

                    }
                    else
                    {
                        this.layers[i].status.string = "(need download)";
                    }
                }
            }
        }
    }
});


var DownloadPopupN64 = BaseLayer.extend({
    ctor: function (listROMLayer) {
        this._super();
        this.initWithBinaryFile("res/UI/DownloadPopupSNES.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);

        this.listROMLayer = listROMLayer;

    },
    validate: function(){
        if(downloadMgr.isFileExist(this.info))
        {
            this.btnDownload.visible = false;
            this.btnPlay.visible = true;
            this.btnDelete.visible = false;
        }
        else {
            this.btnDownload.visible = true;
            this.btnPlay.visible = false;
            this.btnDelete.visible = false;
        }
    },
    download: function (btn) {
        var infoReal = this.info;

        tracker.trackingOnGoogleReview(btn.getName());


        if(!downloadMgr.isFileExist(infoReal))
        {
            if(downloadMgr.isDownloadThreadExist(infoReal))
            {

            }
            else
            {
                this.status.string = "(downloading...)";
                downloadMgr.addDownloadTask(infoReal);
            }
        }
    },
    play: function (btn) {

        tracker.trackingOnGoogleReview(btn.getName());
        cc.eventManager.dispatchCustomEvent("play_game",{});
        // copy image
        if(cc.sys.isNative){
            cc.EmuEngine.shared().copyData(this.info.urlImage,jsb.fileUtils.getWritablePath() + "/tmp.jpg");
        }
        var intent = {
            ROM_PATH: cc.isNative?(jsb.fileUtils.getWritablePath() +this.info.localFile): this.info.localFile,
            ROM_MD5: this.info.md5,
            ROM_CRC: "",
            ROM_HEADER_NAME: "",
            ROM_COUNTRY_CODE: 19,
            ROM_ART_PATH:jsb.fileUtils.getWritablePath() + "/tmp.jpg",
            ROM_GOOD_NAME:this.info.name,
            ROM_LEGACY_SAVE: "",
            DO_RESTART: true
        };

        // var gamescene = new GameLayerN64();
        // gamescene.loadGame(intent);

        if(gameData.minusOneCoin()) {
            DataManager.getInstance().addRomRecent(this.info.id);
            gameData.minusOneCoin();
            fr.gameAdapter.startGame(intent);
            this.removeFromParent(true);
			setTimeout(()=>{
                adsMgr.showAdsDirect();
            },500);
        }
        else
            this.listROMLayer.home.openShop();
        //
        // var scene = new cc.Scene();
        // scene.addChild(gamescene);
        // cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));

    },
    delete: function(){

    },
    setInfo: function (info) {
        var infoReal = isNaN(info)?info:DataManager.getInstance().mapDatas[info];

        this.name.setString(infoReal.name);
        this.intro.setString(infoReal.intro);
        // this.intro.setDimensions(cc.size(cc.winSize.width - 20,350));

        // this.icon.loadTexture(info.urlImage);

        // for (var i = 0; i < this.screenShots.length; i++) {
        //     var imageCheck = "res/data/" + info.id + "/" + info.id + "-" + (i + 1) + ".png";
        //     if (cc.isNative) {
        //         var exist = jsb.fileUtils.isFileExist( jsb.fileUtils.fullPathForFilename(imageCheck));
        //         if (exist) {
        //             this.screenShots[i].setVisible(true);
        //             this.screenShots[i].loadTexture(imageCheck);
        //         }
        //         else
        //             this.screenShots[i].setVisible(false);
        //     }
        //     else {
        //         if (i == 0 || i == 1) {
        //             this.screenShots[i].setVisible(true);
        //             this.screenShots[i].loadTexture(imageCheck);
        //
        //         }
        //         else
        //             this.screenShots[i].setVisible(false);
        //
        //     }
        // }

        if(tracker.inReview)
        {
            // this.icon.getVirtualRenderer().setCullFaceSide(gl.FRONT);
            // this.icon.setFlippedX(true);
            //
            // var material = gfx.Material.CreateNew("res/shaders/BlurSprite.mat");
            // this.icon.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
            // this.icon.material = material;
            //
            // var texture = cc.textureCache.addImage(infoReal.urlImage);
            // material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(texture));
            //
            // this.snes.visible = true;

        }
        else {
            this.icon.loadTexture(infoReal.urlImage);
        }

        this.info = infoReal;
        this.validate();

        this.favorite = dataMgr.getCurrentFavoriteList().indexOf(this.info.id) !== -1;
        if (this.favorite) {
            this.btnFavorite.loadTextures("store/yeuthich_select.png", "store/yeuthich_select.png", "store/yeuthich_select.png",ccui.Widget.PLIST_TEXTURE);

            this.addFavorite.setString("Added to Favorites");
        }
        else {
            this.btnFavorite.loadTextures("store/yeuthich_no_select.png", "store/yeuthich_no_select.png", "store/yeuthich_no_select.png",ccui.Widget.PLIST_TEXTURE);
            this.addFavorite.setString("Add to Favorites...");
        }
    },
    quit: function (btn,type) {
        if(type === ccui.Widget.TOUCH_ENDED)
            this.removeFromParent();
    },
    onEnter: function () {
        this._super();
        this.scheduleUpdate()
    },
    onExit: function () {
        this.unscheduleUpdate();
        this._super();
    },
    update: function (dt) {
        var infoReal = this.info;
        this.validate();
        this.downloading.visible = false;

        if(downloadMgr.isFileExist(infoReal))
        {
            this.status.string = "";
        }
        else {

            if(downloadMgr.isDownloadThreadExist(infoReal))
            {
                var downloadInfo = downloadMgr.getDownloadInfo(infoReal);
                var mbDownload = (downloadInfo.byteDownloaded / (1024 * 1024)).toFixed(2)+ "MB";
                var mbTotal= (downloadInfo.byteTotal / (1024 * 1024)).toFixed(2)+ "MB";
                this.status.string = "" + mbDownload + " "+ "/ " + mbTotal + "";
                this.downloading.visible = true;

            }
            else
            {
                this.status.string = "";
            }
        }
    },
    favorite: function(){
        this.addFavorite.stopAllActions();
        this.addFavorite.setVisible(false);
        this.addFavorite.setOpacity(0);
        if (!this.favorite) {
            DataManager.getInstance().addRomFavorite(this.info.id);
            this.favorite = true;
            this.btnFavorite.loadTextures("store/yeuthich_select.png", "store/yeuthich_select.png", "store/yeuthich_select.png",ccui.Widget.PLIST_TEXTURE);

            this.addFavorite.setString("Added to Favorites");
        }
        else {
            this.favorite = false;
            this.btnFavorite.loadTextures("store/yeuthich_no_select.png", "store/yeuthich_no_select.png", "store/yeuthich_no_select.png",ccui.Widget.PLIST_TEXTURE);
            this.addFavorite.setString("Removed from Favorites");
            DataManager.getInstance().removeRomFavorite(this.info.id);

        }
        this.addFavorite.runAction(cc.sequence(cc.show(),cc.fadeIn(.5),cc.delayTime(1),cc.fadeOut(.5),cc.hide()));
    },
})

