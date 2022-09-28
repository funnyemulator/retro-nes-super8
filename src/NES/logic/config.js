/**
 * Created by hoangnguyen on 5/10/17.
 */

var ConfigInfomation = cc.Class.extend({
    ctor: function()
    {
        this.screenType = SCREEN_LANSCAPE;
        this.videoMode = VIDEO_PAL;
        this.joystickType = JOYSTICK_DIGITAL;
        this.musicType = MUSIC_ON;
        this.graphicType = GRAPHIC_8BIT;
        this.turbo = false;
    }
})

var ConfigulationDelegate = cc.Class.extend({

    onVideoChange: function(info){},
    onMusicChange: function(info){},
    onJoystickChange: function(info){},
    onTurboChange: function(info){}

});

var Configuration = cc.Class.extend({
    ctor: function()
    {
        this.config = new ConfigInfomation();
        this.configInfomarion = this.config;
        this.listener = null;
    },
    readConfig: function()
    {
        var configStr = cc.sys.localStorage.getItem("config") || "0,1,0,0,0,0";
        var configArray = configStr.split(',');

        if(configArray[0] == "0")
        {
            this.config.musicType = MUSIC_ON;
        }
        else
        {
            this.config.musicType = MUSIC_OFF;
        }
        //video
        if(configArray[1] == "0")
        {
            this.config.videoMode = VIDEO_PAL;
        }
        else if(configArray[1] == "1")
        {
            this.config.videoMode = VIDEO_NTSC;
        }
        else
        {
            this.config.videoMode = VIDEO_FULL;
        }
        //
        if(configArray[2] == "0")
        {
            this.config.joystickType = JOYSTICK_DIGITAL;
        }
        else
        {
            this.config.joystickType = JOYSTICK_ANALOG;
        }
        //
        if(configArray[4] === "0")
        {
            this.config.turbo = false;
        }
        else
        {
            this.config.turbo = true;
        }
        if(configArray[5] === "0")
        {
            this.config.graphicType = GRAPHIC_8BIT;
        }
        else
        {
            this.config.graphicType = GRAPHIC_SMOOTH;
        }
    },
    push: function()
    {
        var str = ""+this.config.musicType+","+this.config.videoMode+","+this.config.joystickType+","+this.config.screenType+","+(this.config.turbo?1:0) +","+ this.config.graphicType;
        cc.sys.localStorage.setItem("config",str);
    },
    dispatchVideo: function()
    {
        if(this.listener)
            this.listener.onVideoChange(this.config.videoMode);
    },

    dispatchMusic: function()
    {
        if(this.listener)
            this.listener.onMusicChange(this.config.musicType);
    },

    dispatchJoystick: function()
    {
        if(this.listener)
            this.listener.onJoystickChange(this.config.joystickType);
    },
    dispatchTurbo: function()
    {
        if(this.listener)
            this.listener.onTurboChange(this.config.turbo);
    },
    dispatch: function () {
        if(this.listener && this.listener.onConfigChange)
            this.listener.onConfigChange(this.config);
    }
})

var configInstane = null;
Configuration.getInstance = function()
{
    if(configInstane == null)
    {
        configInstane = new Configuration();
        configInstane.readConfig();
    }
    return configInstane;
}