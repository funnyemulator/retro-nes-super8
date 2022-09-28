/**
 * Created by hoangnguyen on 5/10/17.
 */

var gamContra = null;
var PREFIX_PATH = "https://raw.githubusercontent.com/hoangnq154/";
class RomInfo{
    constructor()
    {
        this.id = "";
        this.name = "";
        this.rate = 8;
        this.type = "Action";
        this.price = 0.99;
        this.intro = "";
        this.udlr = false;
        this.emu = EMULATOR_NES;

        this.uData = null;

        //snes info
        this.url = "";
        this.localFile = "";
        this.downloaded = 0;
        this.totalSize = 0;
        this.urlImage = "";
        this.fileName = "";
        this.md5 = "";

        this.inSDCard = false;

        this.type = -1;
    }

    createFileName()
    {
        var list = this.url.split('?');
        list = list[0].split('/');
        this.fileName = list[list.length-1];
    }
};

MAX_RECENT = 20;

var findID = function(id,array)
{
    var find = false;

    for(var i=0;i<array.length;i++)
    {
        if(array[i] === id)
        {
            return true;
        }
    }
    return find;
}

var DataManager = cc.Class.extend({
    ctor: function()
    {
        this.datas = [];
        this.dataSNES = [];
        this.dataGBA = [];
        this.dataN64 = [];
        this.mapDatas = {};
        this.promoDatas = [];

        this.romRecents = [];
        this.romRecentsSNES = [];
        this.romRecentsGBA = [];
        this.romRecentsN64 = [];

        this.romFavorites = [];
        this.romFavoritesSNES = [];
        this.romFavoritesGBA = [];
        this.romFavoritesN64 = [];
        this.romPurchaseds = [];


        this.dataNES_SD = [];
        this.dataSNES_SD = [];
        this.dataGBA_SD = [];
        this.dataN64_SD = [];

        this.loadFavorite();
        this.loadRecent();
        this.loadFromSD();
    },
    loadROM: function() {

        this.loadNES();
        this.loadDataSNES("res/db_snes");
        this.loadDataGBA("res/db_gba");
        this.loadDataN64("res/db_n64");

    },
    isEmpty: function(){
        return this.datas.length === 0 && this.dataSNES.length === 0 && this.dataGBA.length === 0;
    },

    loadNES: function(){
        this.loadData("res/db_nes");
    },
    loadFromSD: function(){
        var str = cc.sys.localStorage.getItem("nes_sd");
        if(!(str == null || str == ""))
        {
            this.dataNES_SD = JSON.parse(str)
        }

        str = cc.sys.localStorage.getItem("snes_sd");
        if(!(str == null || str == ""))
        {
            this.dataSNES_SD = JSON.parse(str)
        }
        str = cc.sys.localStorage.getItem("gba_sd");
        if(!(str == null || str == ""))
        {
            this.dataGBA_SD = JSON.parse(str)
        }
        str = cc.sys.localStorage.getItem("n64_sd");
        if(!(str == null || str == ""))
        {
            this.dataN64_SD = JSON.parse(str);
        }
    },
    loadData: function(file)
    {
        if(cc.sys.isNative)
        {
            var contents = jsb.fileUtils.getStringFromFile(file);

            var lines = contents.split('\n');
            for(var i=0;i<lines.length;i++)
            {
                this.addRomFromLine(lines[i]);
            }
        }
        else
        {
            var contents = FileUtils.getInstance().getTextFileData(file);

            var lines = contents.split('\n');
            for(var i=0;i<lines.length;i++)
            {
                this.addRomFromLine(lines[i]);
            }

        }


    },
    loadDataGBA: function(file)
    {
        var contents;
        if(cc.sys.isNative)
            contents = jsb.fileUtils.getStringFromFile(file);
        else
            contents = FileUtils.getInstance().getTextFileData(file);

        var lines = contents.split('\n');
        for(var i=0;i<lines.length;i++)
        {
            try{
                this.addRomGBAFromLine(lines[i]);
            }
            catch (e) {
                cc.log(i);
            }
        }
    },
    loadDataSNES: function(file)
    {
        var contents;
        if(cc.sys.isNative)
            contents = jsb.fileUtils.getStringFromFile(file);
        else
            contents = FileUtils.getInstance().getTextFileData(file);

        var lines = contents.split('\n');
        for(var i=0;i<lines.length;i++)
        {
            this.addRomSNESFromLine(lines[i]);
        }
    },
    loadDataN64: function(file)
    {
        var contents;
        if(cc.sys.isNative)
            contents = jsb.fileUtils.getStringFromFile(file);
        else
            contents = FileUtils.getInstance().getTextFileData(file);

        var lines = contents.split('\n');
        var id = 40001;
        for(var i=0;i<lines.length;i++)
        {
            this.addRomN64FromLine(lines[i],id++);
        }
    },
    addRomN64FromLine: function(line,id)
    {
        line = line.replace("\r","");
        var dats = line.split("^");

        var info = new RomInfo();
        info.type = EMULATOR_N64;
        info.emu = EMULATOR_N64;

        info.id = id;
        info.name = dats[0];
        info.md5 = dats[1];
        info.urlImage = dats[2];
        if(info.urlImage.indexOf("http") === -1)
            info.urlImage = "res/" + info.urlImage;
        info.url = dats[3];
        info.localFile = "res/" + info.url;

        if(info.url.indexOf("http") === -1)
            info.url = PREFIX_PATH + info.url;

        this.dataN64.push(info);
        this.mapDatas[""+info.id] = info;
        return info;
    },
    addRomFromLine: function(line)
    {
        line = line.replace("\r","");
        var dats = line.split("^");

        if(dats.length <= 1)
            return;
        var info = new RomInfo();
        info.emu = EMULATOR_NES;
        info.id = dats[0];
        info.name = dats[1];
        info.rate = dats[2];
        info.url = PREFIX_PATH + dats[3];
        info.localFile = dats[3];
        if(dats[4] !== undefined && dats[4] === "1")
        {
            info.udlr = true;
        }

        this.datas.push(info);
        this.mapDatas[""+info.id] = info;
        return info;
    },
    addRomSNESFromLine: function(line)
    {
        line = line.replace("\r","");
        var dats = line.split("^");

        if(dats.length <= 3)
            return;
        var info = new RomInfo();
        info.type = EMULATOR_SNES;
        info.emu = EMULATOR_SNES;
        info.name = dats[1];
        info.md5 = dats[2];
        info.urlImage = dats[3];
        if(info.urlImage.indexOf("http") == -1)
            info.urlImage = "res/" + info.urlImage;
        info.url = dats[4];
        info.localFile = "res/" + info.url;

        if(info.url.indexOf("http") == -1)
            info.url = PREFIX_PATH + info.url;

        info.id = dats[0];
        info.createFileName();

        if(cc.sys.isNative)
        {
            var romPath = jsb.fileUtils.getWritablePath() + info.localFile;
            if(!jsb.fileUtils.isFileExist(romPath))
            {
                if(jsb.fileUtils.isFileExist(info.localFile))
                    cc.EmuEngine.shared().copyData(info.localFile,romPath);
            }
        }

        this.dataSNES.push(info);
        this.mapDatas[""+info.id] = info;
        return info;
    },
    addRomGBAFromLine: function(line)
    {
        line = line.replace("\r","");
        var dats = line.split("^");

        if(dats.length <= 3)
            return;
        var info = new RomInfo();
        info.type = EMULATOR_GBA;
        info.emu = EMULATOR_GBA;
        info.name = dats[1];
        info.md5 = dats[2];
        info.urlImage = dats[3];
        if(info.urlImage.indexOf("http") == -1)
            info.urlImage = "res/" + info.urlImage;
        info.url = dats[4];
        info.localFile = "res/" + info.url;

        if(info.url.indexOf("http") == -1)
            info.url = PREFIX_PATH + info.url;

        info.id = dats[0];
        info.createFileName();

        if(cc.sys.isNative)
        {
            var romPath = jsb.fileUtils.getWritablePath() + info.localFile;
            if(!jsb.fileUtils.isFileExist(romPath))
            {
                if(jsb.fileUtils.isFileExist(info.localFile))
                    cc.EmuEngine.shared().copyData(info.localFile,romPath);
            }
        }

        this.dataGBA.push(info);
        this.mapDatas[""+info.id] = info;
        return info;
    },

    addRomRecent: function(id)
    {
        var recentList = [];
        var key = "recents";
        if(gameData.isNES())
        {
            recentList = this.romRecents;
            key = "recents";
        }
        else if(gameData.isSNES())
        {
            recentList = this.romRecentsSNES;
            key = "recentsSNES";
        }
        else if(gameData.isGBA())
        {
            recentList = this.romRecentsGBA;
            key = "recentsGBA";
        }
        else if(gameData.isN64())
        {
            recentList = this.romRecentsN64;
            key = "recentsN64";
        }

        var idx = -1;
        for(var i=0;i<recentList.length;i++)
        {
            if(recentList[i] == id)
            {
                recentList.splice(i,1);
                idx = i;
                break;
            }
        }
        recentList.splice(0,0,id);
        if(recentList.length > MAX_RECENT)
        {
            recentList.splice(recentList.length-1,1);
        }

        cc.sys.localStorage.setItem(key,this.createCache(recentList));

    },
    getCurrentFavoriteList: function(){
        var favoriteList = [];
        var key = "favorites";
        if(gameData.isNES())
        {
            favoriteList = this.romFavorites;
            key = "favorites";
        }
        else if(gameData.isSNES())
        {
            favoriteList = this.romFavoritesSNES;
            key = "favoritesSNES";
        }
        else if(gameData.isGBA())
        {
            favoriteList = this.romFavoritesGBA;
            key = "favoritesGBA";
        }
        else if(gameData.isN64())
        {
            favoriteList = this.romFavoritesN64;
            key = "favoritesN64";
        }
        return favoriteList;
    },
    addRomFavorite: function(id)
    {
        var favoriteList = [];
        var key = "favorites";
        if(gameData.isNES())
        {
            favoriteList = this.romFavorites;
            key = "favorites";
        }
        else if(gameData.isSNES())
        {
            favoriteList = this.romFavoritesSNES;
            key = "favoritesSNES";
        }
        else if(gameData.isGBA())
        {
            favoriteList = this.romFavoritesGBA;
            key = "favoritesGBA";
        }
        else if(gameData.isN64())
        {
            favoriteList = this.romFavoritesN64;
            key = "favoritesN64";
        }

        var idx = -1;
        for(var i=0;i<favoriteList.length;i++)
        {
            if(favoriteList[i] == id)
            {
                favoriteList.splice(i,1);
                idx = i;
                break;
            }
        }
        favoriteList.splice(0,0,id);

        cc.sys.localStorage.setItem(key,this.createCache(favoriteList));
    },
    removeRomFavorite: function(id)
    {

        var favoriteList = [];
        var key = "favorites";
        if(gameData.isNES())
        {
            favoriteList = this.romFavorites;
            key = "favorites";
        }
        else if(gameData.isSNES())
        {
            favoriteList = this.romFavoritesSNES;
            key = "favoritesSNES";
        }
        else if(gameData.isGBA())
        {
            favoriteList = this.romFavoritesGBA;
            key = "favoritesGBA";
        }
        else if(gameData.isN64())
        {
            favoriteList = this.romFavoritesN64;
            key = "favoritesN64";
        }

        for(var i=0;i<favoriteList.length;i++)
        {
            if(favoriteList[i] == id)
            {
                favoriteList.splice(i,1);
                break;
            }
        }
        cc.sys.localStorage.setItem(key,this.createCache(favoriteList));


    },
    createCache: function(array)
    {
        var ret = "";
        for(var i=0;i<array.length;i++)
        {
            ret += array[i];
            if(i != (array.length-1))
                ret += ",";
        }
        return ret;
    },
    loadRecent: function()
    {
        do
        {
            var str = cc.sys.localStorage.getItem("recents");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romRecents.push(parseInt(data[i]));
            }
        }
        while(0);

        do
        {
            var str = cc.sys.localStorage.getItem("recentsSNES");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romRecentsSNES.push(parseInt(data[i]));
            }
        }
        while(0);

        do
        {
            var str = cc.sys.localStorage.getItem("recentsGBA");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romRecentsGBA.push(parseInt(data[i]));
            }
        }
        while(0);
        do
        {
            var str = cc.sys.localStorage.getItem("recentsN64");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romRecentsN64.push(parseInt(data[i]));
            }
        }
        while(0);
    },
    loadFavorite: function()
    {
        do
        {
            var str = cc.sys.localStorage.getItem("favorites");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romFavorites.push(parseInt(data[i]));
            }
        }
        while(0);

        do
        {
            var str = cc.sys.localStorage.getItem("favoritesSNES");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romFavoritesSNES.push(parseInt(data[i]));
            }
        }
        while(0);

        do
        {
            var str = cc.sys.localStorage.getItem("favoritesGBA");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romFavoritesGBA.push(parseInt(data[i]));
            }
        }
        while(0);
        do
        {
            var str = cc.sys.localStorage.getItem("favoritesN64");
            if(str == null || str == "")
                break;
            var data = str.split(",");
            for(var i=0;i<data.length;i++)
            {
                this.romFavoritesN64.push(parseInt(data[i]));
            }
        }
        while(0);

    }
})

DataManager.sharedInstance = null;
DataManager.firstInit = true;

DataManager.getInstance = function(){
    if(DataManager.firstInit)
    {
        DataManager.sharedInstance = new DataManager();
        DataManager.firstInit = false;
    }
    return DataManager.sharedInstance;
}

var dataMgr;



function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}