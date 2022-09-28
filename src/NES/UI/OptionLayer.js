
var visible_virtual_joystick = true;
var OptionLayer = BaseLayer.extend({
    ctor: function (gameLayer) {
        this._super();
        this.gameScene = gameLayer;
        this.initWithBinaryFile("res/UI/Options.json");
        this.customJoystick = false;

        this.touchedAnalog = false;
        this.touchedButton = false;
        this.touchedScale = false;
        this.touchedScaleButton = false;

        this.point_touch_began = cc.p(0,0);
        this.time_touch_began = 0;
        this.long_click = false;
    },
    initGUI: function(){
        this.setStringWithConfig(Configuration.getInstance().config);

        this["Slider_Analog"].addEventListener(this.analog_change,this);
        this["Slider_Button"].addEventListener(this.button_change,this);
    },
    onEnter: function(){
        this._super();
        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: (touch,event)=>{this.lastPoint = touch.getLocation();return true;},
            onTouchMoved: (touch,event)=>{this.lastPoint = touch.getLocation();},
            onTouchEnded: (touch,event)=>{this.lastPoint = touch.getLocation();}
        });

        cc.eventManager.addListener(this._listener,-1);
    },
    onExit: function(){
        cc.eventManager.removeListener(this._listener);
        this._super();
    },
    setStringWithConfig: function (config) {
        // var music = this.musicLb;
        var video = this.videoLb;
        var joystick = this.joystickLb;
        // var joystick2 =this.joystickLb2;
        //
        // joystick2.setString(visible_virtual_joystick?"Virtual joystick: VISIBLE":"Virtual joystick :INVISIBLE");
        // this.gameScene.joystick.setVisible(visible_virtual_joystick);
        var turboLb = this.turboLb;

        turboLb.setString(config.turbo?"Turbo key: ON":"Turbo key: OFF");

        // switch (config.musicType) {
        //     case MUSIC_ON:
        //     {
        //         music.setString("Music: ON");
        //     }
        //         break;
        //     case MUSIC_OFF:
        //     {
        //         music.setString("Music: OFF");
        //         break;
        //     }
        //
        //     default:
        //         break;
        // }

        switch (config.videoMode) {
            case VIDEO_PAL:
            {
                video.setString("Video Mode: STANDART");
            }
                break;
            case VIDEO_NTSC:
            {
                video.setString("Video Mode: NTSC");
                break;
            }
            case VIDEO_FULL:
            {
                video.setString("Video Mode: FULLSCREEN");
                break;
            }

            default:
                break;
        }

        switch (config.joystickType) {
            case JOYSTICK_ANALOG:
            {
                joystick.setString("Joystick: ANALOG");

            }
                break;
            case JOYSTICK_DIGITAL:
            {
                joystick.setString("Joystick: DIGITAL");

                break;
            }
            case JOYSTICK_HIDDEN:
            {
                joystick.setString("Joystick: HIDDEN");
                break;
            }
            default:
                break;
        }

        switch (config.graphicType) {
            case GRAPHIC_8BIT:
            {
                this.graphicLb.setString("Graphic mode: 8BIT");

            }
                break;
            case GRAPHIC_SMOOTH:
            {
                this.graphicLb.setString("Graphic mode: SMOOTH");

                break;
            }
            default:
                break;
        }
    },
    exit: function (btn,type) {

        if(type !== 0)
            return;
        if( this["Panel_Save"].visible)
        {
            this["Panel_Save"].visible = false;
            this["Panel_Main"].visible = true;
            return;
        }

        this.quit();
    },
    quit: function(){
        this.gameScene.game.resume();
        this.removeFromParent();
    },
    reset: function () {
        this.removeFromParent();
        this.gameScene.game.reset();
    },
    video: function () {
        if (Configuration.getInstance().configInfomarion.videoMode == VIDEO_PAL) {
            Configuration.getInstance().configInfomarion.videoMode = VIDEO_NTSC;
        }
        else if (Configuration.getInstance().configInfomarion.videoMode == VIDEO_NTSC) {
            Configuration.getInstance().configInfomarion.videoMode = VIDEO_FULL;
        }
        else {
            Configuration.getInstance().configInfomarion.videoMode = VIDEO_PAL;
        }
        Configuration.getInstance().push();
        Configuration.getInstance().dispatchVideo();
        this.setStringWithConfig(Configuration.getInstance().configInfomarion);
    },
    graphics: function () {
        if (Configuration.getInstance().configInfomarion.graphicType === GRAPHIC_8BIT) {
            Configuration.getInstance().configInfomarion.graphicType = GRAPHIC_SMOOTH;
        }
        else {
            Configuration.getInstance().configInfomarion.graphicType = GRAPHIC_8BIT;
        }
        Configuration.getInstance().push();
        Configuration.getInstance().dispatch();
        this.setStringWithConfig(Configuration.getInstance().configInfomarion);
    },
    joystick: function () {
        if (Configuration.getInstance().configInfomarion.joystickType === JOYSTICK_DIGITAL) {
            Configuration.getInstance().configInfomarion.joystickType = JOYSTICK_ANALOG;
        }
        else if (Configuration.getInstance().configInfomarion.joystickType === JOYSTICK_ANALOG) {
            Configuration.getInstance().configInfomarion.joystickType = JOYSTICK_HIDDEN;
        } else {
            Configuration.getInstance().configInfomarion.joystickType = JOYSTICK_DIGITAL;
        }
        Configuration.getInstance().push();
        Configuration.getInstance().dispatchJoystick();
        this.setStringWithConfig(Configuration.getInstance().configInfomarion);
    },
    turbo: function () {
        Configuration.getInstance().configInfomarion.turbo = !Configuration.getInstance().configInfomarion.turbo;
        Configuration.getInstance().push();
        Configuration.getInstance().dispatchTurbo();
        this.setStringWithConfig(Configuration.getInstance().configInfomarion);
        this.gameScene.joystick.saveJoystick();
    },
    saveload: function(){
        this["Panel_Main"].visible = false;
        this["Panel_Save"].visible = true;

        this.loadSlot();
    },
    loadSlot: function(){
        if(!cc.isNative)
            return;
        for(var i=1;i<=4;i++) {
            var directory = jsb.fileUtils.getWritablePath() + this.gameScene.rom.id + "/";
            var tag = i;
            var screenShotName = this.gameScene.rom.id +"_"+tag+".ss";
            var paletteName = this.gameScene.rom.id + ".palette";
            var stateSlotName = this.gameScene.rom.id +"_"+tag+".bin";

            if(jsb.fileUtils.isFileExist(directory + stateSlotName))
            {
                this.loadTextureForButton(this["btnSlot"+tag],directory +screenShotName,directory +paletteName);
            }
        }

    },
    loadTextureForButton: function(btn,ssPath,palettePath)
    {
        if(gameData.isNES())
        {
            var _textureNES = cc.Texture2D.createFromRawFile(gfx.TextureFormat.A8,256,224,ssPath,false);
            var _texturePalette = cc.Texture2D.createFromRawFile(gfx.TextureFormat.BGRA8888,256,1,palettePath,false);

            var material = gfx.Material.CreateNew("res/shaders/NES.mat");
            material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(_textureNES));
            material.getParameter("u_paletteTex").setSampler(cc.Sampler.create(_texturePalette));

            material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
            material.getParameter("u_paletteTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);

            var sprite = btn.getChildByName("sp");
            sprite.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
        }
        else if(gameData.isSNES())
        {
            var _texture = cc.Texture2D.createFromRawFile(gfx.TextureFormat.RGB565,256,224,ssPath,false);
            var sprite = btn.getChildByName("sp");
            sprite.setTexture(_texture);

            var material = gfx.Material.CreateNew("res/shaders/GBA.mat");
            material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(_texture));

            material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
            sprite.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
        }
        else if(gameData.isGBA())
        {
            var _texture = cc.Texture2D.createFromRawFile(gfx.TextureFormat.BGRA8888,240,160,ssPath,false);
            var sprite = btn.getChildByName("sp");
            sprite.setTexture(_texture);

            var material = gfx.Material.CreateNew("res/shaders/GBA.mat");
            material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(_texture));

            material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
            sprite.setGLProgramState(cc.GLProgramState.createWithMaterial(material));
        }
    },

    slot1Touch: function (btn,type) {
        var tag = btn.getTag();

        if(type === ccui.Widget.TOUCH_ENDED)
        {
            if(tag == this.slotID)
            {
                var delta = Date.now() - this.time_touch_began;
                if(delta < 750)
                {
                    this.clickSlot(tag);
                }
                else
                {
                    // this.longClick(this.slotID);
                }
            }
            this.slotID = -1;
        }
        else  if(type === ccui.Widget.TOUCH_BEGAN)
        {
            this.slotID = tag;
            this.time_touch_began = Date.now();

            setTimeout(()=>{
                if(this.slotID !== -1 )
                {
                    this.longClick(this.slotID);
                }
            },750)
        }
        else
        {
            if(this.containTouch(btn,this.lastPoint))
            {
                this.slotID = btn.getTag();
            }
            else
                this.slotID = -1;
        }
    },
    clickSlot: function(tag)
    {
        var directory = jsb.fileUtils.getWritablePath() + this.gameScene.rom.id + "/";
        if(!jsb.fileUtils.isDirectoryExist(directory))
            jsb.fileUtils.createDirectory(directory);

        cc.EmuEngine.shared().setBaseDIR(directory);

        var stateSlotName = this.gameScene.rom.id +"_"+tag+".bin";
        var screenShotName = this.gameScene.rom.id +"_"+tag+".ss";
        var paletteName = this.gameScene.rom.id + ".palette";

        if(!jsb.fileUtils.isFileExist(directory + stateSlotName))
        {
            var ret = cc.EmuEngine.shared().saveState(directory +stateSlotName);
            ret &= cc.EmuEngine.shared().saveScreenShot(directory + screenShotName, directory + paletteName);
            this.loadTextureForButton(this["btnSlot"+tag],directory +screenShotName,directory +paletteName);

            cc.log("save " + ret + " in slot" + tag);
        }
        else
        {
            var ret = cc.EmuEngine.shared().loadState(directory + stateSlotName);
            this.quit();
            cc.log("load " + ret + " in slot" + tag);
            adsMgr.showAdsDirect();
            gameData.minusOneCoin();
        }
    },
    longClick: function(tag)
    {
        var dialog = Dialog.newDialog((dialog,ok)=> {
            if(ok)
            {
                var directory = jsb.fileUtils.getWritablePath() + this.gameScene.rom.id + "/";

                var stateSlotName = this.gameScene.rom.id +"_"+tag+".bin";
                var screenShotName = this.gameScene.rom.id +"_"+tag+".ss";
                var paletteName = this.gameScene.rom.id + ".palette";

                var ret = cc.EmuEngine.shared().saveState(directory +stateSlotName);
                ret &= cc.EmuEngine.shared().saveScreenShot(directory + screenShotName, directory + paletteName);
                this.loadTextureForButton(this["btnSlot"+tag],directory +screenShotName,directory +paletteName);

                cc.log("override " + ret + " in slot" + tag);
            }
            else
            {

            }
        },"Do you want to override Slot " + (tag) +"?");

        this.addChild(dialog,100);
    },
    control: function(){
        this["Panel_Main"].visible = false;
        this["Panel_Control"].visible = true;
        this["Panel_Controlling"].visible = true;
        this["Slider_Analog"].setPercent(50);
        this["Slider_Button"].setPercent(50);
        this.initCustom();

    },
    initCustom: function()
    {
        this.customJoystick = true;
        this.node_analog.setVisible(true);
        this.node_button.setVisible(true);
        this.setDigitalJoystick(Configuration.getInstance().configInfomarion.joystickType == JOYSTICK_DIGITAL);

        this.oldScale = this.gameScene.joystick.bg_joystick.getScale();
        this.oldScaleButton = this.gameScene.joystick.node_button.getScale();

        this.bg_joystick.setScale(this.oldScale);
        this.joystick.setScale(this.oldScale);
        this.digitalImg.setScale(this.oldScale);
        this.color_analog.setScale(this.oldScale);

        this.node_button.setScale(this.oldScaleButton);

        this.node_analog.setPosition(this.gameScene.joystick.node_analog.getPosition());
        this.node_button.setPosition(this.gameScene.joystick.node_button.getPosition());

        this.node_scale.setVisible(true);
        this.node_scale_button.setVisible(true);

        if(this.gameScene.joystick.turbo)
        {
            this.node_button_4.setVisible(true);
            this.node_button_2.setVisible(false);
        }
        else
        {
            this.node_button_4.setVisible(false);
            this.node_button_2.setVisible(true);
        }

        if(visible_virtual_joystick)
        {
            this.node_analog.setVisible(true);
            this.node_button.setVisible(true);
        }
        else
        {
            this.node_analog.setVisible(false);
            this.node_button.setVisible(false);
        }

        this.setEmulatorType(gameData.emulatorType)

    },
    setEmulatorType: function(type){

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

                }
                else
                {
                    this.node_button_2.setVisible(true);
                    this.node_button_4.setVisible(false);
                    this.nodeL.setVisible(false);
                    this.nodeR.setVisible(false);
                }
                break;
            }
            case EMULATOR_SNES:
            {
                this.node_button_2.setVisible(false);
                this.node_button_4.setVisible(true);

                this.nodeL.setVisible(true);
                this.nodeR.setVisible(true);

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

                break;
            }
        }
    },
    closeCustom: function()
    {
        this.customJoystick = false;
        this.node_analog.setVisible(false);
        this.node_button.setVisible(false);
        this.node_scale.setVisible(false);
        this.node_scale_button.setVisible(false);


    },
    setDigitalJoystick: function(isDigital)
    {
        if(isDigital)
        {
            this.bg_joystick.setVisible(false);
            this.joystick.setVisible(false);
            this.digitalImg.setVisible(true);
        }
        else
        {
            this.bg_joystick.setVisible(true);
            this.joystick.setVisible(true);
            this.digitalImg.setVisible(false);
        }
    },
    controlling: function (sender, event) {

        switch (event) {
            case ccui.Widget.TOUCH_BEGAN:
            {
                var pTouch = this.lastPoint;
                this.prevPoint = this.lastPoint;
                this.touchedAnalog = false;
                this.touchedButton = false;
                if(this.customJoystick && this.containTouch(this.color_analog,pTouch))
                {
                    //Toast.makeToast(.25,"analog");
                    this.touchedAnalog = true;
                }
                else if(this.customJoystick && this.containTouch(this.color_button,pTouch))
                {
                    //Toast.makeToast(.25,"button");
                    this.touchedButton = true;
                }
                break;
            }
            case ccui.Widget.TOUCH_MOVED:
            {
                if(this.customJoystick) {
                    var pTouch = this.lastPoint;
                    var delta = cc.pSub(pTouch,this.prevPoint);
                    this.prevPoint = this.lastPoint;


                    if (this.touchedAnalog) {
                        this.node_analog.setPosition(cc.pAdd(this.node_analog.getPosition(),delta));
                        this.gameScene.joystick.node_analog.setPosition(this.node_analog.getPosition());

                        //this.gameScene.joystick.saveJoystick();
                    } else if (this.touchedButton) {
                        this.node_button.setPosition(cc.pAdd(this.node_button.getPosition(),delta));
                        this.gameScene.joystick.node_button.setPosition(this.node_button.getPosition());
                        //this.gameScene.joystick.saveJoystick();


                    }
                }
                break;
            }
            case ccui.Widget.TOUCH_ENDED:
            {
                if(this.customJoystick) {
                    if(!this.touchedAnalog && !this.touchedButton)
                    {
                        this["Panel_Main"].visible = true;
                        this["Panel_Control"].visible = false;
                        this["Panel_Controlling"].visible = false;
                        this.node_scale.setVisible(false);
                        this.node_scale_button.setVisible(false);
                        this.node_analog.setVisible(false);
                        this.node_button.setVisible(false);
                        this.gameScene.joystick.saveJoystick();
                        this.closeCustom();
                    }
                }
                break;
            }
        }
    },
    containTouch: function(node,location)
    {
        var pos = node.getPosition();
        var size = node.getContentSize();
        //size.width *= node.getScaleX();
        //size.height *= node.getScaleY();
        var convert = node.convertToNodeSpaceAR(location);

        var rect = cc.rect(-size.width / 2 - 30, -size.height / 2 - 15, size.width + 60, size.height + 30);

        return cc.rectContainsPoint(rect,convert);
    },
    analog_change: function (slider,type) {
        if(type === ccui.Slider.EVENT_PERCENT_CHANGED)
        {
            var perCent = slider.getPercent() / 100 ;
            var scale = 1 + (perCent>=0.5? (perCent  - 0.5):(-(0.5-perCent)) * 0.5);

            this.color_analog.setScale(this.oldScale * scale);
            this.bg_joystick.setScale(this.oldScale * scale);
            this.joystick.setScale(this.oldScale * scale);
            this.digitalImg.setScale(this.oldScale * scale);
            this.gameScene.joystick.bg_joystick.setScale(this.oldScale * scale);
            this.gameScene.joystick.joystick.setScale(this.oldScale * scale);
            this.gameScene.joystick.digitalImg.setScale(this.oldScale * scale);

            this.gameScene.joystick.R = R_JOYSTICK_4_7 * this.oldScale * scale;
            this.gameScene.joystick.r = r_JOYSTICK_4_7 * this.oldScale * scale;
            this.gameScene.joystick.R_MAX = R_MAX_JOYSTICK_4_7 * this.oldScale * scale;
        }
    },

    button_change: function (slider,type) {
        if(type === ccui.Slider.EVENT_PERCENT_CHANGED)
        {
            var perCent = slider.getPercent() / 100 ;
            var scale = 1 + (perCent>=0.5? (perCent  - 0.5):(-(0.5-perCent)) * 0.5);
            this.node_button.setScale(this.oldScaleButton * scale);
            this.gameScene.joystick.node_button.setScale(this.oldScaleButton * scale);
        }
    }

})