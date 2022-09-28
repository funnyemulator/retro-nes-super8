
/**
 * Created by hoangnq on 5/8/17.
 */

var TOUCH_DOWN = 0;
var TOUCH_MOVED = 1;
var TOUCH_ENDED = 2;
var TOUCH_CANCELED = 3;

var nesControllerButtonUp = 0;
var nesControllerButtonDown = 1;
var nesControllerButtonLeft = 2;
var nesControllerButtonRight = 3;
var nesControllerButtonA = 4;
var nesControllerButtonB = 5;
var nesControllerButtonAB = 6;
var nesControllerButtonATurbo = 7;
var nesControllerButtonBTurbo = 8;
var nesControllerButtonABTurbo = 9;
var nesControllerButtonStart = 10;
var nesControllerButtonSelect = 11;



kmVec2Dot = function (pV1, pV2) {
    return pV1.x * pV2.x + pV1.y * pV2.y;
};

kmSQR = function(s){
    return s*s;
};

kmVec2Length = function (pIn) {
    return Math.sqrt(kmSQR(pIn.x) + kmSQR(pIn.y));
};

var JoystickListener = cc.Class.extend({

    onKeyStateChage: function(states){

    },		// FOR Lis_EMU
    onButtonTouchedJoystick: function(button){

    },
    onButtonReleasedJoystick: function(button){

    },

    onAnalog: function(xx, yy){

    },
    onControlDirection: function(button,pressed)
    {

    },

    onTouch: function(event,pTouches){

    }

})

var Control = cc.Class.extend({
    ctor: function()
    {
        this.radius = 0;
        this.touchID = -1;
        this.state_constant = 0;
        this.state = 0;
        this.button = 0;
        this.image = null;
    }
});


var Joystick = BaseLayer.extend({
    ctor: function()
    {
        this._super();
        this.listener = null;
        this.R = R_JOYSTICK_4_7;
        this.R_MAX = R_MAX_JOYSTICK_4_7;
        this.r = r_JOYSTICK_4_7;
        this.initWithBinaryFile("res/UI/JoystickNES.json");

    },
    initGUI: function() {

        this.udlr = false;
        this.turbo = false;
        this._controllers = [0x0001FF00,0x0002FF00];
        this.touched = false;
        this.touchID = -1;
        this.stateanalog = 0;
        this.states = 0;
        this.controls = [];
        this.controlTurbo = [];
        this.controlSNES = [];
        this.controlGBA = [];

        this.controlActive = null;

        // init control normal for nes
        var controlBtnA = new Control();controlBtnA.touchID = -1;controlBtnA.image = this.shoot;controlBtnA.state_constant = NES_GAMEPAD_B;controlBtnA.button = nesControllerButtonB;controlBtnA.radius = 100;this.controls.push(controlBtnA);
        var controlBtnB = new Control();controlBtnB.touchID = -1;controlBtnB.image = this.jump;controlBtnB.state_constant = NES_GAMEPAD_A;controlBtnB.button = nesControllerButtonA;controlBtnB.radius = 100;this.controls.push(controlBtnB);
        var controlBtnAB = new Control();controlBtnAB.touchID = -1;controlBtnAB.image = this.ab;controlBtnAB.state_constant = NES_GAMEPAD_AB;controlBtnAB.button = nesControllerButtonAB;controlBtnAB.radius = 100;this.controls.push(controlBtnAB);

        // init control turbo for nes

        var controlBtnA = new Control();controlBtnA.touchID = -1;controlBtnA.image = this.btnA;controlBtnA.state_constant = NES_GAMEPAD_A;controlBtnA.button = -1;controlBtnA.radius = 65;this.controlTurbo.push(controlBtnA);
        var controlBtnB = new Control();controlBtnB.touchID = -1;controlBtnB.image = this.btnB;controlBtnB.state_constant = NES_GAMEPAD_B;controlBtnB.button = -1;controlBtnB.radius = 65;this.controlTurbo.push(controlBtnB);
        var controlBtnX = new Control();controlBtnX.touchID = -1;controlBtnX.image = this.btnX;controlBtnX.state_constant = NES_GAMEPAD_AB_TURBO;controlBtnX.button = -1;controlBtnX.radius = 65;this.controlTurbo.push(controlBtnX);
        var controlBtnY = new Control();controlBtnY.touchID = -1;controlBtnY.image = this.btnY;controlBtnY.state_constant = NES_GAMEPAD_B_TURBO;controlBtnY.button = -1;controlBtnY.radius = 65;this.controlTurbo.push(controlBtnY);


        // init control for snes
        var controlBtnA = new Control();controlBtnA.touchID = -1;controlBtnA.image = this.btnA;controlBtnA.state_constant = SNES_GAMEPAD_A;controlBtnA.button = -1;controlBtnA.radius = 65;this.controlSNES.push(controlBtnA);
        var controlBtnB = new Control();controlBtnB.touchID = -1;controlBtnB.image = this.btnB;controlBtnB.state_constant = SNES_GAMEPAD_B;controlBtnB.button = -1;controlBtnB.radius = 65;this.controlSNES.push(controlBtnB);
        var controlBtnX = new Control();controlBtnX.touchID = -1;controlBtnX.image = this.btnX;controlBtnX.state_constant = SNES_GAMEPAD_X;controlBtnX.button = -1;controlBtnX.radius = 65;this.controlSNES.push(controlBtnX);
        var controlBtnY = new Control();controlBtnY.touchID = -1;controlBtnY.image = this.btnY;controlBtnY.state_constant = SNES_GAMEPAD_Y;controlBtnY.button = -1;controlBtnY.radius = 65;this.controlSNES.push(controlBtnY);
        var controlBtnL = new Control();controlBtnL.touchID = -1;controlBtnL.image = this.btnL;controlBtnL.state_constant = SNES_GAMEPAD_TL;controlBtnL.button = -1;controlBtnL.radius= 65;this.controlSNES.push(controlBtnL);
        var controlBtnR = new Control();controlBtnR.touchID = -1;controlBtnR.image = this.btnR;controlBtnR.state_constant = SNES_GAMEPAD_TR;controlBtnR.button = -1;controlBtnR.radius= 65;this.controlSNES.push(controlBtnR);

        // gba
        var controlBtnA = new Control();controlBtnA.touchID = -1;controlBtnA.image = this.a;controlBtnA.state_constant = GBA_GAMEPAD_A;controlBtnA.button = -1;controlBtnA.radius = 65;this.controlGBA.push(controlBtnA);
        var controlBtnB = new Control();controlBtnB.touchID = -1;controlBtnB.image = this.b;controlBtnB.state_constant = GBA_GAMEPAD_B;controlBtnB.button = -1;controlBtnB.radius = 65;this.controlGBA.push(controlBtnB);

        var controlBtnL = new Control();controlBtnL.touchID = -1;controlBtnL.image = this.btnL;controlBtnL.state_constant = GBA_GAMEPAD_L;controlBtnL.button = -1;controlBtnL.radius= 65;this.controlGBA.push(controlBtnL);
        var controlBtnR = new Control();controlBtnR.touchID = -1;controlBtnR.image = this.btnR;controlBtnR.state_constant = GBA_GAMEPAD_R;controlBtnR.button = -1;controlBtnR.radius= 65;this.controlGBA.push(controlBtnR);

        var scaleLR = this.nodeL.getScale();
        if(gameData.screenType == SCREEN_PORTRAIT)
        {
            this.opacityForImage(255);

        }
        else
        {
            this.opacityForImage(150);
            this.nodeL.setScale(scaleLR *.74);
            this.nodeR.setScale(scaleLR *.74);

        }

        // default
        this.setEmulatorType(EMULATOR_NES);
        this.setTurbo(false);
        //

        this.setOnlyUDLR(false);
        this.setJoystickType(JOYSTICK_DIGITAL);

        // load from local storage
        this.loadJoystick();

    },
    onEnter: function () {
        // this.setTouchPriority(-1);
        // this.setTouchMode(cc.TOUCH_ALL_AT_ONCE);
        // this.setTouchEnabled(true);
        this.touchEvent = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: this.onTouchesBegan.bind(this),
            onTouchesMoved: this.onTouchesMoved.bind(this),
            onTouchesEnded: this.onTouchesEnded.bind(this),
        });
        cc.eventManager.addListener(this.touchEvent,this);
        this._super();
    },
    onExit: function () {
        cc.eventManager.removeListener(this.touchEvent);
        // this.setTouchEnabled(false);
        this._super();
    },
    setListener: function(listener)
    {
        this.listener = listener;
    },
    setButtonForControllerWithFlag: function(button,index,flag){
        switch (button) {

            case nesControllerButtonUp:
                if (flag) {

                    this._controllers[index] &= 0xFFFFFFCF; // FIXME: Currently, we clear up and down to prevent errors. Perhaps I should clear all directions?
                    this._controllers[index] |= 0x10; // Up
                }
                else {
                    this._controllers[index] &= 0xFFFFFFEF; // Clear up
                }
                break;
            case nesControllerButtonLeft:
                if (flag) {

                    this._controllers[index] &= 0xFFFFFF3F; // Clear left and right to prevent errors
                    this._controllers[index] |= 0x40; // Left
                }
                else {
                    this._controllers[index] &= 0xFFFFFFBF;
                }
                break;
            case nesControllerButtonDown:
                if (flag) {

                    this._controllers[index] &= 0xFFFFFFCF;
                    this._controllers[index] |= 0x20; // Down
                }
                else {
                    this._controllers[index] &= 0xFFFFFFDF;
                }
                break;
            case nesControllerButtonRight:
                if (flag) {

                    this._controllers[index] &= 0xFFFFFF3F;
                    this._controllers[index] |= 0x80; // Right
                }
                else {
                    this._controllers[index] &= 0xFFFFFF7F;
                }
                break;
            case nesControllerButtonA:
                if (flag) {

                    this._controllers[index] |= 0x1; // A button fire
                }
                else {
                    this._controllers[index] &= 0xFFFFFFFE; // A button release
                }
                break;
            case nesControllerButtonAB:
                if (flag) {

                    this._controllers[index] |= 0x2; // B button fire
                    this._controllers[index] |= 0x1; // A button fire
                }
                else {
                    this._controllers[index] &= 0xFFFFFFFD; // B button release
                    this._controllers[index] &= 0xFFFFFFFE; // A button release
                }
                break;
            case nesControllerButtonB:
                if (flag) {

                    this._controllers[index] |= 0x2; // B button fire
                }
                else {
                    this._controllers[index] &= 0xFFFFFFFD; // B button release
                }
                break;
            case nesControllerButtonSelect:
                if (flag) {

                    this._controllers[index] |= 0x4; // Select button fire
                }
                else {
                    this._controllers[index] &= 0xFFFFFFFB; // Select button fire
                }
                break;
            case nesControllerButtonStart:
                if (flag) {

                    this._controllers[index] |= 0x8; // Start button fire
                }
                else {
                    this._controllers[index] &= 0xFFFFFFF7; // Start button fire
                }
                break;
            default:
                break;
        }

    },
    setOnlyUDLR: function(udlr){
        this.udlr = udlr;
    },
    setTurbo: function(turbo)
    {
        this.turbo = turbo;

        if(this.emuType === EMULATOR_NES)
        {
            if(this.turbo)
            {
                this.node_button_2.setVisible(false);
                this.node_button_4.setVisible(true);

                this.nodeL.setVisible(false);
                this.nodeR.setVisible(false);

                this.controlActive = this.controlTurbo;
            }
            else
            {
                this.node_button_2.setVisible(true);
                this.node_button_4.setVisible(false);
                this.nodeL.setVisible(false);
                this.nodeR.setVisible(false);

                this.controlActive = this.controls;
            }
        }

    },

    // helper function
    getStateFromPos : function(x,y){
        var states = 0;
        if(x >= this.r)
        {
            if(y >= this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_UP | GAMEPAD_RIGHT;
            }
            else if (y<= -this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_DOWN | GAMEPAD_RIGHT;
            }
            else
            {
                states = GAMEPAD_RIGHT;
            }
        }
        else if(x <= -this.r)
        {
            if(y >= this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_UP | GAMEPAD_LEFT;
            }
            else if (y<= -this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_DOWN | GAMEPAD_LEFT;
            }
            else
            {
                states = GAMEPAD_LEFT;
            }
        }
        else
        {
            if(y >= this.r)
            {
                states = GAMEPAD_UP;
            }
            else if (y<= -this.r)
            {
                states = GAMEPAD_DOWN;
            }
            else
            {

            }
        }
        return states;
    },
    setButonForAnalogFromPos :function(x,y,index,flag){
        if(x >= this.r)
        {
            if(y >= this.r)
            {
                if(!this.udlr)
                {
                    this.setButtonForControllerWithFlag(nesControllerButtonUp, index, flag);
                    this.setButtonForControllerWithFlag(nesControllerButtonRight, index, flag);
                }

            }
            else if (y<= -this.r)
            {
                if(!this.udlr)
                {
                    this.setButtonForControllerWithFlag(nesControllerButtonDown, index, flag);
                    this.setButtonForControllerWithFlag(nesControllerButtonRight, index, flag);
                }
            }
            else
            {
                this.setButtonForControllerWithFlag(nesControllerButtonRight, index, flag);
            }
        }
        else if(x <= -this.r)
        {
            if(y >= this.r)
            {
                if(!this.udlr)
                {

                    this.setButtonForControllerWithFlag(nesControllerButtonUp, index, flag);
                    this.setButtonForControllerWithFlag(nesControllerButtonLeft, index, flag);
                }

            }
            else if (y<= -this.r)
            {
                if(!this.udlr)
                {
                    this.setButtonForControllerWithFlag(nesControllerButtonDown, index, flag);
                    this.setButtonForControllerWithFlag(nesControllerButtonLeft, index, flag);
                }

            }
            else
            {
                this.setButtonForControllerWithFlag(nesControllerButtonLeft, index, flag);
            }
        }
        else
        {
            if(y >= this.r)
            {
                this.setButtonForControllerWithFlag(nesControllerButtonUp, index, flag);
            }
            else if (y<= -this.r)
            {
                this.setButtonForControllerWithFlag(nesControllerButtonDown, index, flag);
            }
            else
            {

            }
        }
    },
    checkTouchControl :function(control, pTouch){
        var size = control.image.getContentSize();
        var anchor = control.image.getAnchorPoint();
        var posToNode = control.image.convertToNodeSpaceAR(pTouch.getLocation());

        return ((posToNode.x * posToNode.x + posToNode.y * posToNode.y) < control.radius * control.radius);
    },
    findControl : function(pTouch){
        for (var i = 0; i < this.controlActive.length; i++)
        {
            if (this.checkTouchControl(this.controlActive[i], pTouch))
            {
                return i;
            }
        }
        return -1;
    },
    setDigitalTexture :function(x,y){
        if(x >= this.r)
        {
            if(y >= this.r)
            {

                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_up_right.png");
            }
            else if (y<= -this.r)
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_down_right.png");
            }
            else
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_right.png");
            }
        }
        else if(x <= -this.r)
        {
            if(y >= this.r)
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_up_left.png");
            }
            else if (y<= -this.r)
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_down_left.png");
            }
            else
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_left.png");
            }
        }
        else
        {
            if(y >= this.r)
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_up.png");
            }
            else if (y<= -this.r)
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_down.png");        }
            else
            {
                this.digitalImg.setTexture("res/UI/digital_control/lig_dpad_none.png");
            }
        }
    },
    customDefaultJoystick :function()          // suport ipad, tab ....
    {
        return;
        var circleBG = this.bg_joystick;
        var circle = this.joystick;
        var digitalImg = this.digitalImg;

        var height = 175;
        var gim_w = 165;
        var fScaleOrigin = getVideoWidth() / getVideoHeight();
        var nes_w = cc.winSize.width;
        var nes_h = nes_w / fScaleOrigin;

        if(gameData.screenType == SCREEN_PORTRAIT)
        {
            height = (cc.winSize.height - nes_h) / 2 - 30;
        }

        var  device_inch = cc.isNative?engine.PlatformWrapper.getInches():4.7;
        cc.log("device inches : "+device_inch);
        if(device_inch > 4.7)
        {
            if(device_inch > 7) device_inch = 7;

            circleBG.setScale(circleBG.getScale() * 4.7 / device_inch);
            circle.setScale(circle.getScale() * 4.7 / device_inch);
            digitalImg.setScale(digitalImg.getScale() * 4.7 / device_inch);
            this.R *= 4.7 / device_inch;
            this.r *= 4.7 / device_inch;

            if(device_inch > 5.5)
            {
                this.gimLeft(this.node_analog, gim_w * .85);
                this.gimBottom(this.node_analog, height * .85);

                this.node_button.setScale(1 * 4.7 / device_inch);
                this.gimBottom(this.node_button, height * .85);
                this.gimRight(this.node_button, gim_w * .85);
            }
            else
            {
                this.gimLeft(this.node_analog, gim_w * .95);
                this.gimBottom(this.node_analog, height * .95);

                this.node_button.setScale(1 * 4.7 / device_inch);
                this.gimBottom(this.node_button, height * .95);
                this.gimRight(this.node_button, gim_w * .95);
            }
        }
        else
        {
            this.gimLeft(this.node_analog, gim_w * 1);
            this.gimBottom(this.node_analog, height * 1);

            this.node_button.setScale(1);
            this.gimBottom(this.node_button, height * 1);
            this.gimRight(this.node_button, gim_w * 1);
        }
    },
    opacityForImage: function(opacity)
    {
        this.bg_joystick.setOpacity(opacity);
        this.joystick.setOpacity(opacity);
        this.digitalImg.setOpacity(opacity);

        this.btnL.setOpacity(255);
        this.btnR.setOpacity(255);

        this.y_bg.setOpacity(opacity);
        this.shoot.setOpacity(opacity);
        this.jump.setOpacity(opacity);
        this.a.setOpacity(opacity);
        this.b.setOpacity(opacity);

        this.bg_button.setOpacity(opacity);
        this.btnX.setOpacity(opacity);
        this.btnY.setOpacity(opacity);
        this.btnA.setOpacity(opacity);
        this.btnB.setOpacity(opacity);
    },

    loadJoystick: function()
    {
        this.customDefaultJoystick();

        var customStr = (gameData.screenType == SCREEN_LANSCAPE)?cc.sys.localStorage.getItem("custom_joystick_lanscape"):cc.sys.localStorage.getItem("custom_joystick_portrait");
        if(customStr == null || customStr == "")
            return;

        var datas = customStr.split(",");

        var posAnalog = cc.p(parseFloat(datas[0]),parseFloat(datas[1]));
        var posButton = cc.p(parseFloat(datas[2]),parseFloat(datas[3]));

        var scaleAnalog = parseFloat(datas[4]);
        var scaleButton = parseFloat(datas[5]);


        this.node_analog.setPosition(posAnalog);
        this.node_button.setPosition(posButton);

        this.bg_joystick.setScale(scaleAnalog);
        this.joystick.setScale(scaleAnalog);
        this.digitalImg.setScale(scaleAnalog);

        this.node_button.setScale(scaleButton);

        this.R = R_JOYSTICK_4_7 * scaleAnalog;
        this.r = r_JOYSTICK_4_7 * scaleAnalog;

    },
    saveJoystick: function()
    {
        var posAnalog = this.node_analog.getPosition();
        var posButton = this.node_button.getPosition();

        var str = "" +posAnalog.x+","+posAnalog.y+","+posButton.x+","+posButton.y+","+this.bg_joystick.getScale()+","+this.node_button.getScale()+"," + (this.turbo?1:0);

        if(gameData.screenType == SCREEN_LANSCAPE)
            cc.sys.localStorage.setItem("custom_joystick_lanscape",str);
        else
            cc.sys.localStorage.setItem("custom_joystick_portrait",str);


    },

    setJoystickType: function(type){
        this.js_type = type;
        this.visible = true;

        switch (this.js_type) {
            case JOYSTICK_ANALOG:
                this.digitalImg.setVisible(false);
                this.joystick.setVisible(true);
                this.bg_joystick.setVisible(true);
                break;
            case JOYSTICK_DIGITAL:
                this.digitalImg.setVisible(true);
                this.joystick.setVisible(false);
                this.bg_joystick.setVisible(false);
                break;
            case JOYSTICK_HIDDEN:
                this.visible = false;
                break;
            default:
                break;
        }

    },
    setEmulatorType: function(type){
        this.emuType = type;
        setGamepadForEmulator(this.emuType);

        this.a.visible = false;
        this.b.visible = false;
        this.y_bg.visible = true;
        this.shoot.visible = true;
        this.jump.visible = true;

        switch (this.emuType)
        {
            case EMULATOR_NES:
            {
                if(this.turbo)
                {
                    this.node_button_2.setVisible(false);
                    this.node_button_4.setVisible(true);

                    this.nodeL.setVisible(false);
                    this.nodeR.setVisible(false);

                    this.controlActive = this.controlTurbo;
                }
                else
                {
                    this.node_button_2.setVisible(true);
                    this.node_button_4.setVisible(false);
                    this.nodeL.setVisible(false);
                    this.nodeR.setVisible(false);

                    this.controlActive = this.controls;
                }

                break;
            }
            case EMULATOR_SNES:
            {
                this.node_button_2.setVisible(false);
                this.node_button_4.setVisible(true);

                this.nodeL.setVisible(true);
                this.nodeR.setVisible(true);

                this.controlActive = this.controlSNES;
                break;
            }
            case EMULATOR_GBA:
            {
                this.node_button_2.setVisible(true);
                this.node_button_4.setVisible(false);

                this.nodeL.setVisible(true);
                this.nodeR.setVisible(true);

                this.a.visible = true;
                this.b.visible = true;
                this.y_bg.visible = false;
                this.shoot.visible = false;
                this.jump.visible = false;

                this.controlActive = this.controlGBA;
                break;
            }
        }
    },

    // touch delegate
    onTouchesBegan: function(pTouches, pEvent)
    {
        this.onTouch(TOUCH_DOWN,pTouches);
    },
    onTouchesMoved: function(pTouches, pEvent)
    {
        this.onTouch(TOUCH_MOVED,pTouches);
    },
    onTouchesEnded: function(pTouches, pEvent)
    {
        this.onTouch(TOUCH_ENDED,pTouches);
    },
    onTouchesCancelled: function(pTouches, pEvent)
    {
        this.onTouch(TOUCH_CANCELED,pTouches);
    },
    onTouch: function(event,pTouches){
        if(!this.isVisible())
            return;
        if(this.listener)
            this.listener.onTouch(event,pTouches);

        switch (event)
        {
            case TOUCH_DOWN:
                break;
            case TOUCH_MOVED:
            {
                break;
            }
            case TOUCH_ENDED:
            case TOUCH_CANCELED:
            {
                for(var i=0;i<pTouches.length;i++)
                {
                    var pTouch = pTouches[i];
                    if(pTouch.getID() === this.touchID) // analog tha? ra
                    {
                        this.joystick.runAction(cc.EaseBackOut.create(cc.moveTo(.1, cc.p(0, 0))));
                        this.touchID = -1;
                        var old = this.stateanalog;
                        this.stateanalog = 0;

                        if (this.listener)
                        {
                            this.listener.onControlDirection(old,false);

                            this.listener.onAnalog(0, 0);

                            this.listener.onKeyStateChage(this.states);
                            this.setDigitalTexture(0,0);
                        }

                        continue;
                    }
                    else        // check cac button khi tha ra
                    {
                        this.states = 0;
                        if (this.touchID != -1)		// analog van~ dang giu~
                        {
                            if (this.listener)
                                this.listener.onKeyStateChage(this.stateanalog);
                        }
                        else        // ko co analog
                        {
                            if (this.listener)
                                this.listener.onKeyStateChage(0);
                        }

                    }

                    // button release
                    for (var i = 0; i < this.controlActive.length; i++)
                    {
                        if (this.controlActive[i].touchID == pTouch.getID())
                        {
                            this.controlActive[i].touchID = -1;
                            if(this.controlActive[i].button == nesControllerButtonAB)
                            {
                                this.controlActive[0].image.runAction(cc.scaleTo(.025, 1));
                                this.controlActive[1].image.runAction(cc.scaleTo(.025, 1));
                            }
                            else
                            {
                                this.controlActive[i].image.runAction(cc.scaleTo(.025, 1));

                            }

                        }
                    }

                    var controlidx = this.findControl(pTouch);
                    if (controlidx != -1)
                    {
                        if( event == TOUCH_ENDED)
                        {
                            if (this.listener)
                                this.listener.onButtonReleasedJoystick(this.controlActive[controlidx].state_constant);
                        }
                    }
                }
                return;
                break;
            }
        }


        //this.states = 0;

        for (var i=0; i< pTouches.length; i++)
        {
            var  pTouch = pTouches[i];
            var controlidx = this.findControl(pTouch);
            if (controlidx != -1)
            {
                this.states |= this.controlActive[controlidx].state_constant;

                if (event == TOUCH_DOWN)
                {
                    if (this.listener)
                        this.listener.onButtonTouchedJoystick(this.controlActive[controlidx].state_constant);

                }
                else if( event == TOUCH_ENDED)
                {
                    if (this.listener)
                        this.listener.onButtonReleasedJoystick(this.controlActive[controlidx].state_constant);
                }


            }
            if (event == TOUCH_DOWN)
            {
                /* analog display*/
                if (this.touchID == -1)
                {
                    var pos = this.node_analog.convertToNodeSpaceAR(pTouch.getLocation());
                    if ((pos.x * pos.x + pos.y * pos.y) <= this.R * this.R)
                    {
                        this.touchID = pTouch.getID();

                        this.joystick.stopAllActions();
                        this.joystick.setPosition(this.validateAnalogPosition(pos));
                        if (!( (pos.x > -this.r && pos.x < this.r && pos.y > -this.r && pos.y < this.r) ))
                        {
                            this.stateanalog = this.getStateFromPos(pos.x, pos.y);
                            this.setDigitalTexture(pos.x, pos.y);
                        }
                        else
                        {
                            this.stateanalog = 0;
                            this.setDigitalTexture(0, 0);
                        }



                        if (this.listener)
                        {
                            this.listener.onControlDirection(this.stateanalog,true);
                            this.listener.onAnalog(pos.x / this.R, pos.y / this.R);

                        }
                    }
                    else
                        this.touchID = -1;
                }
                /*------------button display----------*/
                if (controlidx != -1)
                {
                    if (this.controlActive[controlidx].touchID == -1)
                    {
                        if(this.controlActive[controlidx].button == nesControllerButtonAB)
                        {
                            this.controlActive[controlidx].touchID = pTouch.getID();
                            this.controlActive[0].image.stopAllActions();
                            this.controlActive[0].image.setScale(1);

                            this.controlActive[0].image.runAction(cc.scaleTo(.025, 0.9));
                            this.controlActive[1].image.stopAllActions();
                            this.controlActive[1].image.setScale(1);

                            this.controls[1].image.runAction(cc.scaleTo(.025,0.9));

                            //Utility::vibrate(10);
                        }
                        else
                        {
                            this.controlActive[controlidx].touchID = pTouch.getID();
                            this.controlActive[controlidx].image.stopAllActions();
                            this.controlActive[controlidx].image.setScale(1);

                            this.controlActive[controlidx].image.runAction(cc.scaleTo(.025, 0.9));
                            //Utility::vibrate(10);
                        }

                    }

                }

            }
            else if (event == TOUCH_MOVED)
            {
                if (pTouch.getID() == this.touchID)
                {
                    var pos = this.node_analog.convertToNodeSpaceAR(pTouch.getLocation());

                    if ((pos.x * pos.x + pos.y * pos.y) <= this.R * this.R)
                    {

                        this.joystick.setPosition(this.validateAnalogPosition(pos));
                        var old_stateanalog = this.stateanalog;
                        if (!( (pos.x > -this.r && pos.x < this.r && pos.y > -this.r && pos.y < this.r) ))
                        {
                            this.stateanalog = this.getStateFromPos(pos.x, pos.y);
                            this.setDigitalTexture(pos.x, pos.y);
                        }
                        else
                        {
                            this.stateanalog = 0;
                            this.setDigitalTexture(0,0);
                        }

                        if (this.listener)
                        {
                            if(old_stateanalog !== this.stateanalog)
                            {
                                this.listener.onControlDirection(old_stateanalog,false);
                                this.listener.onControlDirection(this.stateanalog,true);
                            }
                            this.listener.onAnalog(pos.x / this.R, pos.y / this.R);

                        }

                    }
                    else
                    {
                        var xx = cc.p(1,0)
                        var vv = cc.p(pos.x,pos.y);

                        var cosalpha = kmVec2Dot(xx, vv) / (kmVec2Length(vv) * kmVec2Length(xx));
                        var alpha = Math.acos(cosalpha);

                        var newPos = cc.p(this.R* cosalpha, this.R * Math.sin(alpha) * (pos.y > 0 ? 1 : -1));
                        this.joystick.setPosition(this.validateAnalogPosition(newPos));

                        if (this.listener)
                            this.listener.onAnalog(newPos.x / this.R, newPos.y / this.R);

                        alpha = pos.y >= 0 ? alpha : (2 * Math.PI - alpha);

                        this.stateanalog = this.getStateFromPos(pos.x, pos.y);
                        this.setDigitalTexture(pos.x, pos.y);

                    }
                }
            }
        }

        if (this.listener)
            this.listener.onKeyStateChage(this.states | this.stateanalog);
    },
    validateAnalogPosition: function (pos) {
        if ((pos.x * pos.x + pos.y * pos.y) <= this.R_MAX * this.R_MAX)
            return pos;
        else {
            var xx = cc.p(1,0)
            var vv = cc.p(pos.x,pos.y);

            var cosalpha = kmVec2Dot(xx, vv) / (kmVec2Length(vv) * kmVec2Length(xx));
            var alpha = Math.acos(cosalpha);

            var newPos = cc.p(this.R_MAX* cosalpha, this.R_MAX * Math.sin(alpha) * (pos.y > 0 ? 1 : -1));

            return newPos;
        }
    }
});

var JoystickN64 = Joystick.extend({
    ctor: function () {
        BaseLayer.prototype.ctor.call(this);
        this.listener = null;
        this.R = R_JOYSTICK_4_7;
        this.R_MAX = R_MAX_JOYSTICK_4_7;
        this.r = r_JOYSTICK_4_7;
        this.initWithBinaryFile("res/UI/JoystickN64.json");
    },
    opacityForImage: function(opacity)
    {
        this.bg_joystick.setOpacity(opacity);
        this.joystick.setOpacity(opacity);
        this.digitalImg.setOpacity(opacity);

        this.btnL.setOpacity(opacity);
        this.btnR.setOpacity(opacity);
        this.btnZ.setOpacity(opacity);
        this.btnStart.setOpacity(opacity);

        this.shoot.setOpacity(opacity);
        this.jump.setOpacity(opacity);

        this.btnX.setOpacity(opacity);
        this.btnY.setOpacity(opacity);
        this.btnA.setOpacity(opacity);
        this.btnB.setOpacity(opacity);
    },
    setEmulatorType: function(type){

    },
    initGUI: function() {

        this.udlr = false;
        this.turbo = false;
        this._controllers = [0x0001FF00,0x0002FF00];
        this.touched = false;
        this.touchID = -1;
        this.stateanalog = 0;
        this.states = 0;
        this.controls = [];
        this.controlN64 = [];

        this.controlActive = null;


        // init control for snes
        var controlBtnA = new Control();controlBtnA.touchID = -1;controlBtnA.image = this.btnA;controlBtnA.state_constant = N64_GAMEPAD_C_RIGHT;controlBtnA.button = -1;controlBtnA.radius = 45;this.controlN64.push(controlBtnA);
        var controlBtnB = new Control();controlBtnB.touchID = -1;controlBtnB.image = this.btnB;controlBtnB.state_constant = N64_GAMEPAD_C_DOWN;controlBtnB.button = -1;controlBtnB.radius = 45;this.controlN64.push(controlBtnB);
        var controlBtnX = new Control();controlBtnX.touchID = -1;controlBtnX.image = this.btnX;controlBtnX.state_constant = N64_GAMEPAD_C_UP;controlBtnX.button = -1;controlBtnX.radius = 45;this.controlN64.push(controlBtnX);
        var controlBtnY = new Control();controlBtnY.touchID = -1;controlBtnY.image = this.btnY;controlBtnY.state_constant = N64_GAMEPAD_C_LEFT;controlBtnY.button = -1;controlBtnY.radius = 45;this.controlN64.push(controlBtnY);

        var controlBtnAA = new Control();controlBtnAA.touchID = -1;controlBtnAA.image = this.shoot;controlBtnAA.state_constant = N64_GAMEPAD_A;controlBtnAA.button = -1;controlBtnAA.radius = 45;this.controlN64.push(controlBtnAA);
        var controlBtnBB = new Control();controlBtnBB.touchID = -1;controlBtnBB.image = this.jump;controlBtnBB.state_constant = N64_GAMEPAD_B;controlBtnBB.button = -1;controlBtnBB.radius = 45;this.controlN64.push(controlBtnBB);
        var controlBtnStart = new Control();controlBtnStart.touchID = -1;controlBtnStart.image = this.btnStart;controlBtnStart.state_constant = N64_GAMEPAD_START;controlBtnStart.button = -1;controlBtnStart.radius = 45;this.controlN64.push(controlBtnStart);


        var controlBtnL = new Control();controlBtnL.touchID = -1;controlBtnL.image = this.btnL;controlBtnL.state_constant = N64_GAMEPAD_L;controlBtnL.button = -1;controlBtnL.radius= 65;this.controlN64.push(controlBtnL);
        var controlBtnR = new Control();controlBtnR.touchID = -1;controlBtnR.image = this.btnR;controlBtnR.state_constant = N64_GAMEPAD_R;controlBtnR.button = -1;controlBtnR.radius= 65;this.controlN64.push(controlBtnR);
        var controlBtnZ = new Control();controlBtnZ.touchID = -1;controlBtnZ.image = this.btnZ;controlBtnZ.state_constant = N64_GAMEPAD_Z;controlBtnZ.button = -1;controlBtnZ.radius= 65;this.controlN64.push(controlBtnZ);

        this.controlActive = this.controlN64;

        if(gameData.screenType === SCREEN_PORTRAIT)
        {
            this.opacityForImage(255);

        }
        else
        {
            this.opacityForImage(150);
            // this.nodeL.setScale(scaleLR *.74);
            // this.nodeR.setScale(scaleLR *.74);

        }

        this.setJoystickType(JOYSTICK_DIGITAL);

        // load from local storage
        this.loadJoystick();

    },
    // helper function
    getStateFromPos : function(x,y){
        var states = 0;
        if(x >= this.r)
        {
            if(y >= this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_UP | GAMEPAD_RIGHT;
            }
            else if (y<= -this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_DOWN | GAMEPAD_RIGHT;
            }
            else
            {
                states = GAMEPAD_RIGHT;
            }
        }
        else if(x <= -this.r)
        {
            if(y >= this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_UP | GAMEPAD_LEFT;
            }
            else if (y<= -this.r)
            {
                if(!this.udlr)
                    states = GAMEPAD_DOWN | GAMEPAD_LEFT;
            }
            else
            {
                states = GAMEPAD_LEFT;
            }
        }
        else
        {
            if(y >= this.r)
            {
                states = GAMEPAD_UP;
            }
            else if (y<= -this.r)
            {
                states = GAMEPAD_DOWN;
            }
            else
            {

            }
        }
        return states;
    },
})
