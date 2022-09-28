
var GAME_IN_ROW_NES = 5;
var ListRomLayer = BaseLayer.extend({
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

        var minWidth = 195;
        GAME_IN_ROW_NES = Math.floor(cc.winSize.width / minWidth);
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
        this.scheduleUpdate();

        this.tableView.setTouchEnabled(true);
    },
    onExit: function(){
        cc.eventManager.removeListener(this.touchListener);
        this.unscheduleUpdate();
        this._super();
    },
    loadData: function (data) {
        this.datas = [];

        if(data.length === 0)
        {
            this.tableView.reloadData();
            return;
        }

        var count = Math.floor(data.length / GAME_IN_ROW_NES);
        if (count <= 0) {
            this.datas.push(data);
        }
        else {
            for (var i = 0; i < count; i++) {
                var info = [];
                for (var j = 0; j < GAME_IN_ROW_NES; j++) {
                    info.push(data[i * GAME_IN_ROW_NES + j]);
                }
                this.datas.push(info);
            }
            if (data.length - count * GAME_IN_ROW_NES > 0) {
                var info = [];
                for (var i = count * GAME_IN_ROW_NES; i < data.length; i++) {
                    info.push(data[i]);
                }
                this.datas.push(info);
            }
        }
        this.tableView.reloadData();


    },
    update: function(dt)
    {

    },
    tableCellTouched: function (table, cell) {

        return;
        if (!this.isVisible() || !table.isVisible())
            return;

        var releasePoint = cell.convertToNodeSpaceAR(this.releasePoint);
        for (var i = GAME_IN_ROW_NES-1; i >= 0; i--) {
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

                tracker.trackingOnGoogleReview(infoReal.name);

                if(infoReal.inSDCard )
                {
                    if(gameData.minusOneCoin())
                    {
                        if(jsb.fileUtils.isFileExist(infoReal.localFile))
                        {
                            var gamescene = new GameLayer();
                            gamescene.loadGame(infoReal);

                            var scene = new cc.Scene();
                            scene.addChild(gamescene);
                            cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
                        }
                    }
                    else {
                        this.home.openShop();
                    }

                }
                else if(downloadMgr.isFileExist(infoReal))
                {
                    if(gameData.minusOneCoin()) {
                        var gamescene = new GameLayer();
                        gamescene.loadGame(infoReal);
                        DataManager.getInstance().addRomRecent(infoReal.id);

                        var scene = new cc.Scene();
                        scene.addChild(gamescene);
                        cc.director.runScene(cc.TransitionSlideInR.create(0.2, scene));
                    }
                    else
                        this.home.openShop();
                }
                else
                {

                    var popup = new DownloadPopup(this);
                    popup.setInfo(infoReal);
                    this.home.addChild(popup,10,11);
                }
                break;
            }
        }

    },

    tableCellSizeForIndex: function (table, idx) {

        return cc.size(cc.winSize.width, 250);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new NESCell(this);
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
        var popup = new DownloadPopup(this);
        popup.setInfo(infoReal);
        this.home.addChild(popup,10,11);
    },
    clickToCell: function (infoReal) {
        tracker.trackingOnGoogleReview(infoReal.name);

        if(infoReal.inSDCard )
        {
            if(gameData.minusOneCoin())
            {
                if(jsb.fileUtils.isFileExist(infoReal.localFile))
                {
                    var gamescene = new GameLayer();
                    gamescene.loadGame(infoReal);

                    var scene = new cc.Scene();
                    scene.addChild(gamescene);
                    cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
                }
            }
            else {
                this.home.openShop();
            }

        }
        else if(downloadMgr.isFileExist(infoReal))
        {
            if(gameData.minusOneCoin()) {
                var gamescene = new GameLayer();
                gamescene.loadGame(infoReal);
                DataManager.getInstance().addRomRecent(infoReal.id);

                var scene = new cc.Scene();
                scene.addChild(gamescene);
                cc.director.runScene(cc.TransitionSlideInR.create(0.2, scene));
            }
            else
                this.home.openShop();
        }
        else
        {

            var popup = new DownloadPopup(this);
            popup.setInfo(infoReal);
            this.home.addChild(popup,10,11);
        }
    }
});

var NESCell = cc.TableViewCell.extend({
    ctor: function (list) {
        this._super();
        this.listROM = list;

        this.layers = [];

        var w = 175;
        var padding = 10;
        var min = w / 2 + padding ;
        var max = cc.winSize.width - padding - w/2;
        var delta = (max - min) / (GAME_IN_ROW_NES - 1);

        var poss = [];
        poss.push(cc.p(min-w/2,0));
        for(var i=0;i<GAME_IN_ROW_NES-2;i++)
        {
            poss.push(cc.p( min + (i + 1)* delta - w/2,0));
        }
        poss.push(cc.p(max -w/2,0));


        for (var i = 0; i < GAME_IN_ROW_NES; i++) {
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
            layer.status.setVisible(false);
            layer["Panel_icon"].setSwallowTouches(false);

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

                if(tracker.inReview)
                {
                    layer.sprite.getVirtualRenderer().setCullFaceSide(gl.FRONT);
                    layer.sprite.setFlippedX(true);

                    var material = gfx.Material.CreateNew("res/shaders/BlurSprite.mat");
                    layer.sprite.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
                    layer.sprite.material = material;
                    // layer.nes.visible = true;

                }
                else {
                    layer.sprite.getVirtualRenderer().setCullFaceSide(gl.BACK);
                    layer.sprite.setFlippedX(false);
                }
            }



            this.layers.push(layer);
        }

    },
    setInfo: function (infos) {
        for (var i = 0; i < GAME_IN_ROW_NES; i++) {
            this.layers[i].setVisible(false);
        }
        for (var i = 0; i < infos.length; i++) {
            var infoReal = isNaN(infos[i])?infos[i]:DataManager.getInstance().mapDatas[infos[i]];

            this.layers[i].setVisible(true);
            this.layers[i].node.setVisible(false);
            this.layers[i].status.setVisible(true);
            this.layers[i].sprite.visible = true;
            this.layers[i].stars.visible = true;
            this.layers[i].nes.visible = false;

            this.setRateFor1Layer(this.layers[i],infoReal.rate);
            this.layers[i].name.setString(infoReal.name);

            if(infoReal.id == 0)        // promo
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
            this.layers[i].sprite.setVisible(true);

            if(tracker.inReview)
            {
                // if(cc.sys.isNative)
                // {
                //     var texture = cc.textureCache.addImage("res/data/" + infoReal.id + "/" + infoReal.id + "-0.png");
                //     this.layers[i].sprite.material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(texture));
                // }
                // this.layers[i].name.visible = false;

            }
            else {
                if(!infoReal.inSDCard)
                    this.layers[i].sprite.loadTexture("res/data/" + infoReal.id + "/" + infoReal.id + "-0.png");
                else
                {
                    // this.layers[i].sprite.loadTexture(infoReal.urlImage);
                    this.layers[i].sprite.visible = false;
                    this.layers[i].nes.visible = true;
                    this.layers[i].stars.visible = false;
                }
            }

            if(infoReal.inSDCard)
            {
                this.layers[i].status.string = "";
                this.layers[i].status.setVisible(true);
            }
            else if(downloadMgr.isFileExist(infoReal))
            {
                this.layers[i].status.string = "";
                this.layers[i].status.setVisible(false);
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

var DownloadPopup = BaseLayer.extend({
    ctor: function (listROMLayer) {
        this._super();
        this.initWithBinaryFile("res/UI/DownloadPopup.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);

        this.screenShots = [];

        this.screenShots.push(this["sr0"]);
        this.screenShots.push(this["sr0_0"]);
        // this.screenShots.push(this["sr0_1"]);
        // this.screenShots.push(this["sr0_2"]);
        this.listROMLayer = listROMLayer;


    },
    validate: function(){
        if(downloadMgr.isFileExist(this.info))
        {
            this.btnDownload.visible = false;
            this.btnPlay.visible = true;
            this.btnDelete.visible = true;
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
        if(gameData.minusOneCoin())
        {
            cc.eventManager.dispatchCustomEvent("play_game",{});

            var gamescene = new GameLayer();
            gamescene.loadGame(this.info);
            DataManager.getInstance().addRomRecent(this.info.id);

            var scene = new cc.Scene();
            scene.addChild(gamescene);
            cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
        }
        else
            this.listROMLayer.home.openShop();

    },
    delete: function(){
        jsb.fileUtils.removeFile(jsb.fileUtils.getWritablePath() + this.info.localFile);
        this.validate();
    },
    setInfo: function (infoID) {
        var info = isNaN(infoID)?infoID:DataManager.getInstance().mapDatas[infoID];

        this.name.setString(info.name);
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
        if(tracker.inReview)
        {
            this.icon.getVirtualRenderer().setCullFaceSide(gl.FRONT);
            this.icon.setFlippedX(true);

            var material = gfx.Material.CreateNew("res/shaders/BlurSprite.mat");
            this.icon.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
            this.icon.material = material;

            var texture = cc.textureCache.addImage("res/data/" + info.id + "/" + info.id + "-0.png");
            material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(texture));


            this.screenShots[0].setVisible(false);
            this.screenShots[1].setVisible(false);

            // this.nes.visible = true;
            this.name.visible = false;
        }

        this.info = info;
        this.validate();

        this.favorite = dataMgr.getCurrentFavoriteList().indexOf(info.id) !== -1;
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
