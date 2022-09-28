var Test = BaseLayer.extend({
    ctor: function () {
        this._super();

        var tex_ = cc.Texture2D.makeEmpty(gfx.TextureFormat.RGB565,256,224,false);
        var sp = new cc.Sprite(tex_);
        sp.setPosition(700,300);
        sp.setScale(2);

        this.addChild(sp);

        this.tex_ = tex_;

    },
    onEnter: function(){
        this._super();
        this.scheduleUpdate();


        var romPath = jsb.fileUtils.getWritablePath() + "super_mario_kart_usa.smc";
        if(!jsb.fileUtils.isFileExist(romPath))
        {
            var path = "res/super_mario_kart_usa.smc";
            var copy = cc.EmuEngine.shared().copyData(path,romPath);
            cc.log("copy ret :" + copy);
        }

        var ret  = cc.EmuEngine.shared().loadGame(romPath);
        cc.log("ret load:" + ret);
    },
    onExit: function(){
        this.unscheduleUpdate();
        this._super();
    },
    update: function(dt)
    {
//    cc.log(dt);
        cc.EmuEngine.shared().frame();
        cc.EmuEngine.shared().render(this.tex_);
    },
})