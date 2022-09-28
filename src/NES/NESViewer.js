var NESViewer = cc.Node.extend({
    ctor: function () {
        this._super();
        this.init_();
    },
    init_: function(){
        this._textureNES = cc.Texture2D.makeEmpty(gfx.TextureFormat.A8,256,224,false);
        this._texturePalette = cc.Texture2D.makeEmpty(gfx.TextureFormat.BGRA8888,256,1,false);

        this.sprite = new cc.Sprite(this._textureNES);
        this.addChild(this.sprite);

        var material = gfx.Material.CreateNew("res/shaders/NES.mat");
        material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(this._textureNES));
        material.getParameter("u_paletteTex").setSampler(cc.Sampler.create(this._texturePalette));

        material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
        material.getParameter("u_paletteTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);

        this.sprite.setGLProgramState(cc.GLProgramState.createWithMaterial(material));

        this.setContentSize(cc.size(256,224));
        this.pause_ = false;
    },
    getWidth: function(){
        return 256;
    },
    getHeight: function(){
        return 224;
    },
    onEnter: function(){
        this._super();
        // this.scheduleUpdateWithPriority(100);
    },
    onExit: function(){
        // this.unscheduleUpdate();
        // cc.EmuEngine.shared().pause();
        this._super();
    },
    update: function(dt)
    {
        if(!this.pause_)
        {
            cc.EmuEngine.shared().frame();
            cc.EmuEngine.shared().render(this._textureNES);
        }
    },
    loadROM: function(path)
    {
//        cc.EmuEngine.shared().power();
        var ret = cc.EmuEngine.shared().loadGame(path);
        if(ret)
        {
            this.path = path;
            cc.log("load game : " + ret);
            this.pause_ = false;
            cc.EmuEngine.shared().render(this._textureNES);
            cc.EmuEngine.shared().renderPalette(this._texturePalette);
        }
        return ret;
    },
    reset: function()
    {
        this.pause_ = false;
        cc.EmuEngine.shared().reset();
        cc.EmuEngine.shared().resume();
        //cc.EmuEngine.shared().loadGame(this.path);
    },
    pause: function()
    {
        this.pause_ = true;
        cc.EmuEngine.shared().pause();
    },
    resume: function(){
        this.pause_ = false;
        cc.EmuEngine.shared().resume();
    },
    play: function()
    {
        cc.EmuEngine.shared().resume();
    },
    stateChangeForController: function(states,controller)
    {
        cc.EmuEngine.shared().setKeyStates(states);
    },
    audioStart: function () {
        var initAudio = jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioCreate", "(III)Z",22050,16,2);
        if(initAudio)
        {
            jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioStart", "()V");
        }
        cc.log("init Audio :" + initAudio);
    },
    audioStop: function () {
        jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioStop", "()V");
    },
    reportButton: function(button,pressed)
    {
        cc.EmuEngine.shared().reportButton(button | PLAYER_MASK,pressed);
    },
    analogChanged: function(x,y){

    },
    setSmooth: function (isSmooth) {

    }

});

var GBAViewer = cc.Node.extend({
    ctor: function () {
        this._super();
        this.init_();
    },
    init_: function(){
        this._texture = cc.Texture2D.makeEmpty(gfx.TextureFormat.BGRA8888,240,160,false);


        this.sprite = new cc.Sprite(this._texture);
        this.addChild(this.sprite);


        var material = gfx.Material.CreateNew("res/shaders/GBA.mat");
        material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(this._texture));

        material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
        this.sprite.setGLProgramState(cc.GLProgramState.createWithMaterial(material));

        this.material = material;

        this.setContentSize(cc.size(240,160));
        this.pause_ = false;
    },
    getWidth: function(){
        return 240;
    },
    getHeight: function(){
        return 160;
    },
    onEnter: function(){
        this._super();
        // this.scheduleUpdate();
    },
    onExit: function(){
        // this.unscheduleUpdate();
        this._super();
    },
    update: function(dt)
    {
        if(!this.pause_)
        {

            cc.EmuEngine.shared().frame();
            cc.EmuEngine.shared().render(this._texture);
        }
    },
    loadROM: function(path)
    {
        var ret = cc.EmuEngine.shared().loadGame(path);
        if(ret)
        {
            this.path = path;
            cc.log("load game : " + ret);
            this.pause_ = false;
            cc.EmuEngine.shared().render(this._texture);
            this.stateChangeForController(0,0);

        }
        return ret;
    },
    reset: function()
    {
        this.pause_ = false;
        cc.EmuEngine.shared().reset();
        cc.EmuEngine.shared().resume();

    },
    pause: function()
    {
        this.pause_ = true;
        cc.EmuEngine.shared().pause();
    },
    resume: function(){
        this.pause_ = false;
        cc.EmuEngine.shared().resume();
    },
    play: function()
    {
        cc.EmuEngine.shared().resume();
    },
    stateChangeForController: function(state,controller)
    {
        cc.EmuEngine.shared().setKeyStates(state);
    },
    audioStart: function () {
        var initAudio = jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioCreate", "(III)Z",32768,16,2);
        if(initAudio)
        {
            jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioStart", "()V");
        }
        cc.log("init Audio :" + initAudio);
    },
    audioStop: function () {
        jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioStop", "()V");
    },
    reportButton: function(button,pressed)
    {
        cc.EmuEngine.shared().reportButton(button | PLAYER_MASK,pressed);
    },
    analogChanged: function(x,y){

    },
    setSmooth: function (isSmooth) {
        if(isSmooth)
            this.material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.LINEAR,gfx.TextureFilter.LINEAR);
        else
            this.material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
    }
});

var SNESViewer = cc.Node.extend({
    ctor: function () {
        this._super();
        this.init_();
    },
    init_: function(){
        this._textureNES = cc.Texture2D.makeEmpty(gfx.TextureFormat.RGB565,256,224,false);

        this.sprite = new cc.Sprite(this._textureNES);
        this.addChild(this.sprite);

        var material = gfx.Material.CreateNew("res/shaders/GBA.mat");
        material.getParameter("u_diffuseTex").setSampler(cc.Sampler.create(this._textureNES));

        material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
        this.sprite.setGLProgramState(cc.GLProgramState.createWithMaterial(material));

        this.material = material;

        this.setContentSize(cc.size(256,224));
        this.pause_ = false;
    },
    getWidth: function(){
        return 256;
    },
    getHeight: function(){
        return 224;
    },
    onEnter: function(){
        this._super();
        // this.scheduleUpdate();
    },
    onExit: function(){
        // this.unscheduleUpdate();
        this._super();
    },
    update: function(dt)
    {
        if(!this.pause_)
        {
            cc.EmuEngine.shared().frame();
            cc.EmuEngine.shared().render(this._textureNES);
        }
    },
    loadROM: function(path)
    {
        var ret = cc.EmuEngine.shared().loadGame(path);
        if(ret)
        {
            this.path = path;
            cc.log("load game : " + ret);
            this.pause_ = false;
            cc.EmuEngine.shared().render(this._textureNES);
        }
        return ret;
    },
    reset: function()
    {
        this.pause_ = false;
        cc.EmuEngine.shared().reset();
        cc.EmuEngine.shared().resume();

    },
    pause: function()
    {
        this.pause_ = true;
        cc.EmuEngine.shared().pause();
    },
    resume: function(){
        this.pause_ = false;
        cc.EmuEngine.shared().resume();
    },
    play: function()
    {
        cc.EmuEngine.shared().resume();
    },
    stateChangeForController: function(state,controller)
    {
        cc.EmuEngine.shared().setKeyStates(state);
    },
    audioStart: function () {
        var initAudio = jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioCreate", "(III)Z",32040,16,2);
        if(initAudio)
        {
            jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioStart", "()V");
        }
        cc.log("init Audio :" + initAudio);
    },
    audioStop: function () {
        jsb.reflection.callStaticMethod("org/cocos2dx/cpp/AudioMedia", "audioStop", "()V");
    },
    reportButton: function(button,pressed)
    {
        cc.EmuEngine.shared().reportButton(button | PLAYER_MASK,pressed);
    },
    analogChanged: function(x,y){

    },
    setSmooth: function (isSmooth) {
        if(isSmooth)
            this.material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.LINEAR,gfx.TextureFilter.LINEAR);
        else
            this.material.getParameter("u_diffuseTex").getSampler().setFilterMode(gfx.TextureFilter.NEAREST,gfx.TextureFilter.NEAREST);
    }

});


class N64Viewer extends cc.Node {
    constructor(){
        super();
    }

    loadROM(romInfos) {
        fr.gameAdapter.startGame(romInfos);
    }
    pause(){
        fr.gameAdapter.pause();
    }
    resume(){
        fr.gameAdapter.resume();

    }
    stop(){
        fr.gameAdapter.shutdown();
    }
    reportButton(button,pressed)
    {
        if(cc.isNative)
        {
            fr.gameAdapter.reportButton(pressed,button);
        }
    }
    analogChanged(x,y){
        if(cc.isNative){
            fr.gameAdapter.analogChanged(x,y);
        }
    }
}
