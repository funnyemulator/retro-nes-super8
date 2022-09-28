var GAME_IN_ROW_GBA = 5;
var ListRomGBALayer = BaseLayer.extend({
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
        GAME_IN_ROW_GBA = Math.floor(cc.winSize.width / minWidth);
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

        var count = Math.floor(data.length / GAME_IN_ROW_GBA);
        if (count <= 0) {
            this.datas.push(data);
        }
        else {
            for (var i = 0; i < count; i++) {
                var info = [];
                for (var j = 0; j < GAME_IN_ROW_GBA; j++) {
                    info.push(data[i * GAME_IN_ROW_GBA + j]);
                }
                this.datas.push(info);
            }
            if (data.length - count * GAME_IN_ROW_GBA > 0) {
                var info = [];
                for (var i = count * GAME_IN_ROW_GBA; i < data.length; i++) {
                    info.push(data[i]);
                }
                this.datas.push(info);
            }
        }
        this.tableView.reloadData();


    },
    onTouchEnded: function(touch,event)
    {
        this.releasePoint = touch.getLocation();
    },
    tableCellTouched: function (table, cell) {
        return;
        if (!this.isVisible() || !table.isVisible())
            return;

        var releasePoint = cell.convertToNodeSpaceAR(this.releasePoint);
        for (var i = GAME_IN_ROW_GBA-1; i >= 0; i--) {
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

                // if(!downloadMgr.isFileExist(infoReal))
                // {
                //     if(downloadMgr.isDownloadThreadExist(infoReal))
                //     {
                //
                //     }
                //     else
                //     {
                //         cell.layers[i].status.string = "(downloading...)";
                //         downloadMgr.addDownloadTask(infoReal);
                //     }
                // }
                // else
                // {
                //     if(gameData.minusOneCoin())
                //     {
                //         DataManager.getInstance().addRomRecent(infoReal.id);
                //         listROM.removeFromParent(false);
                //         var gamescene = new GameLayer();
                //         gamescene.loadGame(infoReal);
                //         var scene = new cc.Scene();
                //         scene.addChild(gamescene);
                //         cc.director.runScene(scene);
                //     }
                //     else
                //     {
                //         this.home.openShop();
                //     }
                //
                // }
                tracker.trackingOnGoogleReview(infoReal.name);

                if(infoReal.inSDCard )
                {
                    if(jsb.fileUtils.isFileExist(infoReal.localFile))
                    {
                        if(gameData.minusOneCoin())
                        {
                            var gamescene = new GameLayer();
                            gamescene.loadGame(infoReal);

                            var scene = new cc.Scene();
                            scene.addChild(gamescene);
                            cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
                        }else
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
                } else
                {

                    var popup = new DownloadPopupGBA(this);
                    popup.setInfo(infoReal);
                    this.home.addChild(popup,10,11);
                }


                break;
            }
        }

    },

    tableCellSizeForIndex: function (table, idx) {

        return cc.size(cc.winSize.width, 240);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new GBACell(this);
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
        var popup = new DownloadPopupGBA(this);
        popup.setInfo(infoReal);
        this.home.addChild(popup,10,11);
    },
    clickToCell: function (infoReal) {
        tracker.trackingOnGoogleReview(infoReal.name);

        if(infoReal.inSDCard )
        {
            if(jsb.fileUtils.isFileExist(infoReal.localFile))
            {
                if(gameData.minusOneCoin())
                {
                    var gamescene = new GameLayer();
                    gamescene.loadGame(infoReal);

                    var scene = new cc.Scene();
                    scene.addChild(gamescene);
                    cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));
                }else
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
        } else
        {

            var popup = new DownloadPopupGBA(this);
            popup.setInfo(infoReal);
            this.home.addChild(popup,10,11);
        }
    }
});

var GBACell = cc.TableViewCell.extend({
    ctor: function (list) {
        this._super();
        this.listROM = list;
        this.layers = [];

        var w = 175;
        var padding = 20;
        var min = w / 2 + padding ;
        var max = cc.winSize.width - padding - w/2;
        var delta = (max - min) / (GAME_IN_ROW_GBA - 1);

        var poss = [];
        poss.push(cc.p(min-w/2,0));

        for(var i=0;i<GAME_IN_ROW_GBA-2;i++)
        {
            poss.push(cc.p( min + (i + 1)* delta - w/2,0));
        }

        poss.push(cc.p(max -w/2,0));


        // var poss = [cc.p(10, 0), cc.p(232, 0), cc.p(455, 0), cc.p(700, 0), cc.p(920, 0)];

        for (var i = 0; i < GAME_IN_ROW_GBA; i++) {
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
            layer.status.setVisible(true);
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
                    layer.spriteGBA.getVirtualRenderer().setCullFaceSide(gl.FRONT);
                    layer.spriteGBA.setFlippedX(true);

                    var material = gfx.Material.CreateNew("res/shaders/BlurSprite.mat");
                    layer.spriteGBA.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
                    layer.spriteGBA.material = material;
                    // layer.spriteGBA.addChild(new Sprite("res/UI/icons/gba.png"));


                }
                else {
                    layer.spriteGBA.getVirtualRenderer().setCullFaceSide(gl.BACK);
                    layer.spriteGBA.setFlippedX(false);
                }
            }



            this.layers.push(layer);
        }

    },
    setInfo: function (infos) {
        for (var i = 0; i < GAME_IN_ROW_GBA; i++) {
            this.layers[i].setVisible(false);
        }
        for (var i = 0; i < infos.length; i++) {
            var infoReal = isNaN(infos[i])?infos[i]:DataManager.getInstance().mapDatas[infos[i]];

            this.layers[i].setVisible(true);
            this.layers[i].node.setVisible(false);
            this.layers[i].name.setString(infoReal.name);
            this.layers[i].spriteGBA.visible = true;
            this.layers[i].stars.visible = true;
            this.layers[i].gba.visible = false;
            this.setRateFor1Layer(this.layers[i],infoReal.rate);

            this.layers[i].name.visible = !tracker.inReview;
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
            this.layers[i].spriteSNES.setVisible(false);
            this.layers[i].spriteGBA.setVisible(true);
            this.layers[i].spriteGBA.loadTexture(infoReal.urlImage);


            if(cc.sys.isNative)
            {
                if(tracker.inReview)
                {
                    // this.layers[i].spriteGBA.getVirtualRenderer().setCullFaceSide(gl.FRONT);
                    // this.layers[i].spriteGBA.setFlippedX(true);
                    // var texture = cc.textureCache.addImage(infoReal.urlImage);
                    // this.layers[i].spriteGBA.material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(texture));
                }
                else {
                    this.layers[i].spriteGBA.getVirtualRenderer().setCullFaceSide(gl.BACK);
                    this.layers[i].spriteGBA.setFlippedX(false);
                }
            }


            if(infoReal.inSDCard)
            {
                this.layers[i].status.string = "";
                this.layers[i].spriteGBA.visible = false;
                this.layers[i].stars.visible = false;
                this.layers[i].gba.visible = true;
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


var DownloadPopupGBA = BaseLayer.extend({
    ctor: function (listROM) {
        this._super();
        this.initWithBinaryFile("res/UI/DownloadPopupGBA.json");
        this.runAction(this._actionList);
        this._actionList.play("start",false);

        this.listROMLayer = listROM;

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
    download: function () {

        var infoReal = this.info;

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

    },
    setInfo: function (infoID) {
        var info = isNaN(infoID)?infoID:DataManager.getInstance().mapDatas[infoID];
        this.name.setString(info.name);
        this.intro.setString(info.intro);
        // this.intro.setDimensions(cc.size(cc.winSize.width - 20,350));


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
            this.icon.getVirtualRenderer().setCullFaceSide(gl.FRONT);
            this.icon.setFlippedX(true);

            var material = gfx.Material.CreateNew("res/shaders/BlurSprite.mat");
            this.icon.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
            this.icon.material = material;

            var texture = cc.textureCache.addImage(info.urlImage);
            material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(texture));

            this.gba.visible = true;
            this.name.visible = false;
        }
        else {
            this.icon.loadTexture(info.urlImage);

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

