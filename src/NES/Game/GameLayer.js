var gameViewer = null;
var nesViewer = null;
var snesViewer = null;
var gbaViewer = null;

var MAX_FRAME_QUEUE_SIZE = 300;
var MAX_FRAME_DELAY = 10;

var GameLayer = BaseLayer.extend({
    ctor: function () {
        this._super();
        Configuration.getInstance().listener = this;
        this.initWithBinaryFile("res/UI/GameLayer.json");
        adsMgr.resetAds();
    },
    initGUI: function () {
        this["lbCoin"].visible = false;
        this["iconCoin"].visible = false;
        this["btnCoin"].visible = false;

        this.joystick = new Joystick();
        this.addChild(this.joystick, 3);
        this.joystick.setListener(this);

        this.gamepad = new Gamepad();
        this.gamepad.setListener(this);

        if(nesViewer == null && cc.isNative)
        {
            nesViewer = new NESViewer();nesViewer.retain();
            snesViewer = new SNESViewer();snesViewer.retain();
            gbaViewer = new GBAViewer();gbaViewer.retain();
        }

        if(cc.isNative)
        {
            if(gameData.isNES())
                gameViewer = nesViewer;
            else if(gameData.isSNES())
                gameViewer = snesViewer;
            else if(gameData.isGBA())
                gameViewer = gbaViewer;
        }
        else
            gameViewer = new GameDisplay();

        this["Panel_Game"].addChild(gameViewer);

        this.game = gameViewer;

        if(tracker.inReview)
        {
            this.game.visible = false;
        }
        else {
            this.game.visible = true;
        }

        this.setEmulatorType(gameData.emulatorType);

        this.btnStart.addTouchEventListener(this.onTouchEventHandler,this);
        this.btnSelect.addTouchEventListener(this.onTouchEventHandler,this);
        this.btnOption.addTouchEventListener(this.onTouchEventHandler,this);
        this.btnExit.addTouchEventListener(this.onTouchEventHandler,this);
        if(this.btnStartSnes)
        {
            this.btnStartSnes.addTouchEventListener(this.onTouchEventHandler,this);
            this.btnMenuSnes.addTouchEventListener(this.onTouchEventHandler,this);
            this.btnSelectSnes.addTouchEventListener(this.onTouchEventHandler,this);
        }


        this.setVideoType(Configuration.getInstance().config.videoMode);
        this.setVideoType(Configuration.getInstance().config.videoMode);
        this.joystick.setTurbo(Configuration.getInstance().config.turbo);
        this.setJoystickType(Configuration.getInstance().config.joystickType);

        this.frameQueue = new FrameQueue();
        this.serverFrameQueue = new Queue();
    },
    onEnterTransitionDidFinish: function(){
        this._super();
        gameData.dispathCoinChange();
    },
    onEnter:function () {
        this._super();
        gameData.dispathCoinChange();
        MultiplayController.shared().addListener(this);
        this.gamepad.init(gameData.emulatorType);

        // for joystick
        this.keyStatesVirtual = 0;
        this.oldKeyStates = 0;

        this.hasNewState = false;

        // for gamepad
        this.keyStatesGamepad = 0;

        // from multiplayer
        this.keyStatesMultiplay = 0;

        // for multiplayer
        this.hasNewStateForSend = false;
        this.oldKeyStateForSend = 0;

        this.scheduleUpdateWithPriority(-1);

        this.coinChangeListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "coins",
            callback: (event)=>{
                var coins = event._userData.coins;
                this.onCoinChange(coins);
            }
        });
        cc.eventManager.addListener(this.coinChangeListener, this);

    },
    onExit: function () {
        cc.eventManager.removeListener(this.coinChangeListener);
        MultiplayController.shared().removeListener(this);
        this.gamepad.destroy();
        this.unscheduleUpdate();
        this._super();
    },
    onCoinChange: function(coins)
    {
        this["lbCoin"].string = "x " + StringUtility.standartNumber(coins);
    },
    update: function(dt){

        if(!cc.isNative){
            this.game.update(dt);
            return;
        }
        var fCount = cc.EmuEngine.shared().getFrameCount();

        /// client send state for master
        if(this.hasNewStateForSend){
            if(MultiplayController.shared().isConnected() && (!MultiplayController.shared().isMaster()))
            {
                var states = this.keyStatesGamepad | this.keyStatesVirtual;
                if(this.oldKeyStateForSend !== states)
                {
                    MultiplayController.shared().sendFrameState(fCount,states);
                    this.oldKeyStateForSend = states;
                }
            }
        }
        /// end client send

        if(this.hasNewState)
        {
            if(MultiplayController.shared().isConnected())
            {
                if(MultiplayController.shared().isMaster())
                {
                    var keyStates = this.keyStatesVirtual | this.keyStatesGamepad | this.keyStatesMultiplay;
                    if(this.oldKeyStates !== keyStates)
                    {

                        // send frame (frame counter && frame key) -> player minor playback
                        MultiplayController.shared().sendFrameState(fCount,keyStates);

                        // update my emulator
                        this.game.stateChangeForController(keyStates,0);
                        this.oldKeyStates = keyStates;
                    }
                } else /// player minor playback
                {
                    this.game.stateChangeForController(this.keyStatesMultiplay,0);
                }

            } else
            {
                var keyStates = this.keyStatesVirtual | this.keyStatesGamepad | this.keyStatesMultiplay
                if(this.oldKeyStates !== keyStates)
                {
                    this.game.stateChangeForController(keyStates,0);
                    this.oldKeyStates = keyStates;
                }
            }
        }

        this.keyStatesVirtual = 0;
        this.keyStatesGamepad = 0;
        this.keyStatesMultiplay = 0;
        this.hasNewStateForSend = false;
        this.hasNewState = false;

        {
            // handle server frame
            if(!this.serverFrameQueue.isEmpty())
            {
                var serverFrame = this.serverFrameQueue.peek();
                var fCurrentCount = cc.EmuEngine.shared().getFrameCount();
                if(fCurrentCount === serverFrame.frameCounter)
                {
                    this.game.stateChangeForController(serverFrame.keyStates,0);
                    this.serverFrameQueue.dequeue();
                }

            }
        }

        if(this.game)
            this.game.update(dt);

        // save frame to queue
        if(MultiplayController.shared().isConnected() && !MultiplayController.shared().isMaster())
        {
            if(this.frameQueue.size() >= MAX_FRAME_QUEUE_SIZE)
            {
                this.frameQueue.pop().destroy();
            }
            var fCount = cc.EmuEngine.shared().getFrameCount();
            var frameBuffer = cc.EmuEngine.shared().generateState();frameBuffer.retain();
            this.frameQueue.pushFrame(new Frame(fCount,frameBuffer));
        }


    },


    onCoinChange: function(coins)
    {
        this["lbCoin"].string = "x " +StringUtility.standartNumber(coins);
    },
    cleanup: function(){
        gameViewer.removeFromParent();
    },

    // joystick listener
    onKeyStateChage: function (state) {

        this.keyStatesVirtual = state;
        if(MultiplayController.shared().isConnected())
        {
            if(MultiplayController.shared().isMaster())
                this.hasNewState = true;
        }
        else
            this.hasNewState = true;

        this.hasNewStateForSend = true;

    },		// FOR NES EMU android
    onButtonTouchedJoystick: function (button) {
        this.game.reportButton(button ,true);
    },
    onButtonReleasedJoystick: function (button) {
        this.game.reportButton(button ,false);
    },

    onAnalog: function (xx, yy) {
        this.game.analogChanged(xx,yy);
    },
    onControlDirection: function(button,pressed)
    {
        if(button & GAMEPAD_UP)
            this.game.reportButton(GAMEPAD_UP ,pressed);
        if(button & GAMEPAD_DOWN)
            this.game.reportButton(GAMEPAD_DOWN ,pressed);
        if(button & GAMEPAD_LEFT)
            this.game.reportButton(GAMEPAD_LEFT ,pressed);
        if(button & GAMEPAD_RIGHT)
            this.game.reportButton(GAMEPAD_RIGHT ,pressed);
    },

    onTouch: function (event, pTouches) {

    },
    /// end joystick listener

    /// gamepad listener
    onGamepadKeyStates: function(state){
        this.keyStatesGamepad = state;
        if(MultiplayController.shared().isConnected())
        {
            if(MultiplayController.shared().isMaster())
                this.hasNewState = true;
        }
        else
            this.hasNewState = true;
        this.hasNewStateForSend = true;
    },
    ///

    /// multiplay controller listener
    onReceivedDataBuffer(action,inPkg,dataWrapper){
        switch (action) {
            case GAME_ACTION_KEYSTATE: {
                var keyStates = inPkg.getUnsignedInt();

                this.keyStatesMultiplay = keyStates;
                this.hasNewState = true;
                break;
            }
            case GAME_ACTION_GAMESTATE: {
                var fCount = inPkg.getUnsignedInt();
                cc.log("client load state " + fCount);
                cc.EmuEngine.shared().loadStateMemory(dataWrapper,6);
                cc.EmuEngine.shared().setFrameCount(fCount);

                break;
            }
            case GAME_ACTION_FRAMESTATE: {
                var frameCounter = inPkg.getUnsignedInt();
                var keyStates = inPkg.getUnsignedInt();
                var fCount = cc.EmuEngine.shared().getFrameCount();
                cc.log(frameCounter + " -- " + keyStates + "  -- " + fCount);

                if(MultiplayController.shared().isConnected())
                {
                    if(MultiplayController.shared().isMaster())
                    {
                        /// send game state -> client if delay > MAX_DELAY
                        if(fCount-frameCounter >= MAX_FRAME_DELAY){
                            cc.log("QUA' DELAY rOI -----------------------------------------")
                            var fCount = cc.EmuEngine.shared().getFrameCount();
                            var frameBuffer = cc.EmuEngine.shared().generateState(6);

//                            MultiplayController.shared().sendGameState(frameBuffer,fCount);
                        }
                        this.keyStatesMultiplay = keyStates;
                        this.hasNewState = true;
                    }
                    else {

                        var frame = this.frameQueue.getFrame(frameCounter);
                        if(frame)
                        {

                            cc.EmuEngine.shared().loadStateMemory(frame.frameDataWrapper);
                            cc.EmuEngine.shared().setFrameCount(frameCounter);

                            this.frameQueue.removeFrame(frameCounter);

                            this.keyStatesMultiplay = keyStates;
                            this.hasNewState = true;
                        }
                        else {
                            var frame_ = new MasterFrame();
                            frame_.frameCounter = frameCounter;
                            frame_.keyStates = keyStates;
                            this.serverFrameQueue.enqueue(frame_);
                        }
                    }
                }

                break;
            }
            case GAME_ACTION_CLIENT_HAS_READY:
            {
                cc.log("client has ready " + this.rom);
                if(MultiplayController.shared().isConnected() && MultiplayController.shared().isMaster()){
                    this.game.resume();
                }
                break;
            }
        }

    },
    ///

    realLoadGame: function (rom) {
        this.rom = rom;

        if(cc.isNative)
        {
            cc.EmuEngine.shared().lockFPS(tracker.needLock60FPS());
            {
                var romPath = jsb.fileUtils.getWritablePath() + rom.localFile;
                if(rom.inSDCard)
                    romPath = rom.localFile;
                var ret = this.game.loadROM(romPath);
                if(ret)
                {
                    this.game.audioStart();
                    this.game.resume();
                }
            }

        }

        this.joystick.setOnlyUDLR(rom.udlr);
    },
    loadGame: function(rom){
        this.rom = rom;

        if(MultiplayController.shared().isConnected()){
            if(MultiplayController.shared().isMaster())
            {
                var romPath = jsb.fileUtils.getWritablePath() + rom.localFile;
                if(rom.inSDCard)
                    romPath = rom.localFile;
                var ret = this.game.loadROM(romPath);
                if(ret) {
                    this.game.pause();
                    setTimeout(()=>{
                        MultiplayController.shared().sendOpenROM(rom);
                    },100);
                }

            }else{
                this.realLoadGame(rom);
                this.game.resume();
            }
        } else {
            this.realLoadGame(rom);
        }
    },

    ///
    onButtonReleased: function (btn,id) {
        if(!btn.isVisible())
            return;
        switch (id) {
            case 3: // start
            case 7:
            {
                // var countIgnoreAds = parseInt(sys.localStorage.getItem("ignoreAds") || "5");
                // countIgnoreAds--;
                // sys.localStorage.setItem("ignoreAds", countIgnoreAds);
                // if (countIgnoreAds < 0) {
                //     this.startCheckAds = true;
                //     if (this.enableAds) {
                //         if (cc.isNative)
                //             engine.AdmobHelper.showPageAds();
                //         this.enableAds = false;
                //     }
                //
                // }
                this.game.reportButton(GAMEPAD_START,false);
                adsMgr.showAds();
                break;
            }
            case 4: // select
            case 8:
            {
                this.game.reportButton(GAMEPAD_SELECT,false);
                break;
            }
            case 5:     // disconnect
            {
                // if(cc.isNative || cc.sys.os === cc.sys.OS_ANDROID)
                //     engine.MultiPlayerHandler.disconnect();
                //
                // this.btnDisconnect.setVisible(false);
                // this.lbConnect.setVisible(false);
                //
                // engine.EMUWrapper.setEMUView(true);
                //
                // gameData.multiplayerConnected = false;
                break;
            }
            case 1:    // option
            case 6:
            {
                this.addChild(new OptionLayer(this), 100);
                this.game.pause();
                // if (!cc.isNative || cc.sys.os === cc.sys.OS_IOS)
                //     this.gameDisplay.pause();
                // else if (cc.isNative || cc.sys.os === cc.sys.OS_ANDROID) {
                //     engine.EMUWrapper.pause();
                // }
                // gfx.BGFXRenderer.getInstance().toggleDebug();
                break;
            }
            case 2:     // exit
            {
                // this.pushDialogExit(false);
                // this.game.audioStop();


                this.game.pause();
                var dialog = Dialog.newDialog((dialog,ok)=> {
                    if(ok)
                    {
                        let scene = new cc.Scene();
                        let home = new Home();
                        scene.addChild(home);
                        cc.director.runScene(cc.TransitionSlideInL.create(0.2,scene));
                        adsMgr.showAds();
                        home.checkOpenRate();
                    }
                    else
                    {
                        this.game.resume();
                    }
                },"Do you want quit the game?");

                this.addChild(dialog,100);

                break;
            }

        }
        this.states = 0;
        this.onKeyStateChage(this.states);
    },
    onButtonTouched: function (btn, id) {
        cc.log(typeof (btn) + "  " + id);
        switch (id) {
            case 3: // start
            {
                this.game.reportButton(GAMEPAD_START,true);

                break;
            }
            case 4: // select
            {
                this.game.reportButton(GAMEPAD_SELECT,true);

                break;
            }
            case 1:    // option
            {

                break;
            }
            case 2:     // exit
            {
                break;
            }
            case 6:     // menu snes
            {
                break;
            }
            case 7:     // start snes
            {
                this.game.reportButton(GAMEPAD_START,true);

                break;
            }
            case 8:     // select snes
            {
                this.game.reportButton(GAMEPAD_SELECT,true);

                break;
            }

        }

        this.states = this.getStateFromTagButton(id);
        this.onKeyStateChage(this.states);
    },
    getStateFromTagButton: function (tag) {
        var states = 0;
        switch (tag) {
            case 3:
            case 7:
                states = GAMEPAD_START;
                break;
            case 4:
            case 8:
                states = GAMEPAD_SELECT;
                break;
            default:
                break;
        }
        return states;
    },
    onVideoChange: function (info) {
        this.setVideoType(info);
    },
    onMusicChange: function (info) {
        switch (info) {
            case MUSIC_ON:
            {
                // if (cc.isNative)
                //     engine.EMUWrapper.sound(true);
                break;
            }
            case MUSIC_OFF:
            {
                // if (cc.isNative)
                //     engine.EMUWrapper.sound(false);
                break;
            }
        }
    },
    onJoystickChange: function (info) {
        this.joystick.setJoystickType(info);
    },
    onTurboChange: function(info)
    {
        this.joystick.setTurbo(info);
    },
    onConfigChange: function(config)
    {
        var graphicType = config.graphicType;
        this.game.setSmooth(graphicType == GRAPHIC_SMOOTH);
    },
    setJoystickType: function (type) {
        this.joystick.setJoystickType(type);
    },
    setVideoType: function (type) {
        var fScaleOrigin = this.game.getWidth() / this.game.getHeight();
        // var scale = cc.winSize.width / cc.frameSize.width;

        var nes = this.game;
        if(gameData.isPortrait())
        {
            var nes_w = cc.winSize.width;
            var nes_h = nes_w / fScaleOrigin;
            nes.setScaleX(nes_w / getVideoWidth());
            nes.setScaleY(nes_h / getVideoHeight());

            this["Panel_Game"].setPosition(cc.p(nes_w / 2 , cc.winSize.height - nes_h / 2));

            var height_bg_menu = cc.winSize.height - cc.winSize.width / fScaleOrigin;
            var width_bg_menu = cc.winSize.width;

            this.bg_menu.setContentSize(cc.size(width_bg_menu,height_bg_menu));
            this.bg_menu.setPosition(cc.p(0,0));

            this.btnStart.setPositionY(height_bg_menu - 48);
            this.btnSelect.setPositionY(height_bg_menu - 48);
            this.btnOption.setPositionY(height_bg_menu - 48);
            this.btnExit.setPositionY(height_bg_menu - 48);

            // this.btnDisconnect.setPositionY(height_bg_menu - 93);


            this.joystick.nodeL.setPositionY(height_bg_menu - 35);
            this.joystick.nodeR.setPositionY(height_bg_menu - 35);



            return;
        }

        switch (type) {
            case VIDEO_PAL:
            {
                var LisHeight = cc.winSize.height;
                var LisWidth = LisHeight * fScaleOrigin;

                nes.setScaleX(LisWidth / nes.getWidth());
                nes.setScaleY(LisHeight / nes.getHeight());

            }
                break;
            case VIDEO_NTSC:
            {
                var LisHeight = cc.winSize.height;
                var LisWidth = LisHeight * 4.0 / 3;

                nes.setScaleX(LisWidth / nes.getWidth());
                nes.setScaleY(LisHeight / nes.getHeight());
            }
                break;
            case VIDEO_FULL:
            {
                var LisHeight = cc.winSize.height;
                var LisWidth = cc.winSize.width;

                nes.setScaleX(LisWidth / nes.getWidth());
                nes.setScaleY(LisHeight / nes.getHeight());

            }
                break;
            default:
                break;
        }

    },

    setEmulatorType: function(type)
    {
        this.emuType = type;
        this.joystick.setEmulatorType(this.emuType);
        switch (this.emuType)
        {
            case EMULATOR_NES:
            {
                this.btnOption.setVisible(true);
                this.btnSelect.setVisible(true);
                this.btnStart.setVisible(true);
                this.btnExit.setVisible(true);

                this.bg_menu = this.bg_menu_nes;
                if(this.bg_menu_nes !== undefined)
                {
                    this.bg_menu_nes.setVisible(true);
                    this.bg_menu_snes.setVisible(false);

                    this.btnMenuSnes.setVisible(false);
                    this.btnStartSnes.setVisible(false);
                    this.btnSelectSnes.setVisible(false);

                    this.lbMenu.setVisible(false);
                    this.lbStart.setVisible(false);
                    this.lbSelect.setVisible(false);
                }
                break;
            }
            case EMULATOR_SNES:
            {
                this.bg_menu = this.bg_menu_snes;
                this.btnOption.setVisible(gameData.screenType == SCREEN_LANSCAPE);
                this.btnSelect.setVisible(gameData.screenType == SCREEN_LANSCAPE);
                this.btnStart.setVisible(gameData.screenType == SCREEN_LANSCAPE);
                this.btnExit.setVisible(gameData.screenType == SCREEN_LANSCAPE);

                if(this.bg_menu_nes !== undefined && gameData.isPortrait())
                {
                    this.bg_menu_nes.setVisible(false);
                    this.bg_menu_snes.setVisible(true);

                    this.btnMenuSnes.setVisible(true);
                    this.btnStartSnes.setVisible(true);
                    this.btnSelectSnes.setVisible(true);

                    this.lbMenu.setVisible(true);
                    this.lbStart.setVisible(true);
                    this.lbSelect.setVisible(true);
                }

                break;
            }

        }
    },
})
