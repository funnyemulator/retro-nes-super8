var n64Viewer = null;

var GameLayerN64 = GameLayer.extend({
    ctor: function () {
        BaseLayer.prototype.ctor.call(this);
        Configuration.getInstance().listener = this;
        this.initWithBinaryFile("res/UI/GameLayer_N64.json");
        adsMgr.resetAds();
    },
    initGUI: function () {
        this.joystick = new JoystickN64();
        this.addChild(this.joystick, 3);
        this.joystick.setListener(this);
        this.gamepad = new Gamepad();
        this.gamepad.setListener(this);

        if(n64Viewer == null ){
            n64Viewer = new N64Viewer();n64Viewer.retain();
        }
        gameViewer = n64Viewer;
        this["Panel_Game"].addChild(gameViewer);
        this.game = gameViewer;

        /// init

    },
    onEnter: function(){
        BaseLayer.prototype.onEnter.call(this);
        this.gamepad.init(gameData.emulatorType);
    },
    onExit: function(){
        BaseLayer.prototype.onExit.call(this);
        this.gamepad.destroy();
    },
    loadGame: function(gameInfo){
        if(cc.isNative){
            this.game.loadROM(gameInfo);
        }
    },
    cleanup: function(){
        gameViewer.removeFromParent();
    },
    // joystick listener
    onKeyStateChage: function (state) {

    },		// FOR NES EMU android
    onButtonTouchedJoystick: function (button) {
        this.game.reportButton(button,true);
    },
    onButtonReleasedJoystick: function (button) {
        this.game.reportButton(button,false);
    },

    onAnalog: function (xx, yy) {
        this.game.analogChanged(xx,yy);
    },
    onControlDirection: function(button,pressed)
    {
        if(button & GAMEPAD_UP)
            this.game.reportButton(N64_GAMEPAD_UP ,pressed);
        if(button & GAMEPAD_DOWN)
            this.game.reportButton(N64_GAMEPAD_DOWN ,pressed);
        if(button & GAMEPAD_LEFT)
            this.game.reportButton(N64_GAMEPAD_LEFT ,pressed);

        if(button & GAMEPAD_RIGHT)
            this.game.reportButton(N64_GAMEPAD_RIGHT ,pressed);
    },

    onTouch: function (event, pTouches) {

    },
    /// end joystick listener

    exit: function () {
        this.game.pause();
        var dialog = Dialog.newDialog((dialog,ok)=> {
            if(ok)
            {
                let scene = new cc.Scene();
                let home = new Home();
                scene.addChild(home);
                cc.director.runScene(cc.TransitionSlideInL.create(0.2,scene));
                this.game.stop();
                adsMgr.showAds();
                home.checkOpenRate();
            }
            else
            {
                this.game.resume();
            }
        },"Do you want to quit the game?");

        this.addChild(dialog,100);
    }
})