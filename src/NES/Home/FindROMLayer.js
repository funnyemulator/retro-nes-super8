
var ext_find = ["nes"];

class Asset{
    constructor(){
        this.parent = null;
        this.isFolder = true;
        this.listAssets = [];
        this.checkCount = 0;

        this.path = "";
        this.validated = false;
    }



    nextAsset()
    {
        if(!this.isFolder)
        {
            if(this.parent)
                return this.parent.nextAsset();
            return null;
        }else{
            this.validate();
            if(this.listAssets.length > 0 && this.checkCount < this.listAssets.length)
                return this.listAssets[this.checkCount++];
            else if(this.parent)
                return this.parent.nextAsset();
            else
                return null;
        }
    }

    validate() {
        if(this.isFolder && !this.validated)
        {
            var child_paths = jsb.fileUtils.listFiles(this.path);
            this.validated = true;

            child_paths.forEach((path)=>{
                if(path.indexOf("/.") == -1)
                {
                    var asset = new Asset();
                    asset.parent = this;
                    asset.path = path;
                    asset.isFolder = jsb.fileUtils.isDirectoryExist(path);

                    if(asset.isFolder || (!asset.isFolder && Asset.check(ext_find,path.split('.').pop())))
                        this.listAssets.push(asset);
                }
            })
        }
    }

    static check(list_ext, ext){
        for(var i=0;i<list_ext.length;i++)
        {
            if(list_ext[i] === ext)
                return true;
        }
        return false;
    }
}



var FindROMLayer = BaseLayer.extend({
    initGUI: function () {

        if(gameData.isNES())
        {
            ext_find = ["nes","zip"];
            dataMgr.dataNES_SD = [];
        }

        else if(gameData.isSNES())
        {
            ext_find = ["smc","sfc","zip"];
            dataMgr.dataSNES_SD = [];
        }
        else if(gameData.isGBA())
        {
            ext_find = ["gba","zip"];
            dataMgr.dataGBA_SD = [];
        }
        else if(gameData.isN64())
        {
            ext_find = ["n64","z64","zip"];
            dataMgr.dataN64_SD = [];
        }


        this.rootAsset = new Asset();
        this.rootAsset.path = fr.platformWrapper.getExternalStorage();
        this.currentAsset = this.rootAsset;

    },
    ctor: function () {
        this._super();
        this.initWithBinaryFile("res/UI/FindROMLayer.json")
    },
    load: function(){

    },
    onEnter: function(){
        this._super();
        this.runAction(this._actionList);
        this._actionList.play("start",false);
        this.scheduleUpdate();
    },
    onExit: function(){
        this.unscheduleUpdate();
        this._super();
    },
    update: function(){
        this.currentAsset = this.currentAsset.nextAsset();
        if(!this.currentAsset)
        {
            if(gameData.isNES())
            {
                cc.sys.localStorage.setItem("nes_sd",JSON.stringify(dataMgr.dataNES_SD));
            }
            else if(gameData.isSNES())
            {
                cc.sys.localStorage.setItem("snes_sd",JSON.stringify(dataMgr.dataSNES_SD));
            }
            else if(gameData.isGBA())
            {
                cc.sys.localStorage.setItem("gba_sd",JSON.stringify(dataMgr.dataGBA_SD));
            }else if(gameData.isN64())
            {
                cc.sys.localStorage.setItem("n64_sd",JSON.stringify(dataMgr.dataN64_SD));
            }

            cc.eventManager.dispatchCustomEvent("refresh_rom",{});
            this.removeFromParent(true);
        }
        else
        {
            this["lbFile"].string = this.currentAsset.path;

            if(!this.currentAsset.isFolder)
            {
                if(gameData.isN64())
                {    if(!fr.gameAdapter.isValidRom(this.currentAsset.path))
                    return;
                }
                else if(!cc.EmuEngine.shared().isValidRom(this.currentAsset.path))
                    return;
                var rom = new RomInfo();
                rom.inSDCard = true;
                rom.md5 = "12345";
                rom.localFile = this.currentAsset.path;
                rom.id = rom.fileName = rom.name =  rom.localFile.replace(/^.*[\\\/]/, '');
                rom.urlImage = "res/snes/master/rom_arts/actraiser_usa.jpg";

                if(gameData.isNES())
                {
                    dataMgr.dataNES_SD.push(rom);
                    rom.urlImage = "res/UI/icons/nes.png";
                }

                else if(gameData.isSNES())
                {
                    dataMgr.dataSNES_SD.push(rom);
                    rom.urlImage = "res/UI/icons/snes.png";
                }
                else if(gameData.isGBA())
                {
                    dataMgr.dataGBA_SD.push(rom);
                    rom.urlImage = "res/UI/icons/gba.png";
                }else if(gameData.isN64())
                {
                    dataMgr.dataN64_SD.push(rom);
                    rom.urlImage = "res/UI/icons/snes.png";
                }
            }
        }

    },
    cancel: function (btn) {

        if(gameData.isNES())
        {
            cc.sys.localStorage.setItem("nes_sd",JSON.stringify(dataMgr.dataNES_SD));
        }
        else if(gameData.isSNES())
        {
            cc.sys.localStorage.setItem("snes_sd",JSON.stringify(dataMgr.dataSNES_SD));
        }
        else if(gameData.isGBA())
        {
            cc.sys.localStorage.setItem("gba_sd",JSON.stringify(dataMgr.dataGBA_SD));
        } else if(gameData.isN64())
        {
            cc.sys.localStorage.setItem("n64_sd",JSON.stringify(dataMgr.dataN64_SD));
        }

        cc.eventManager.dispatchCustomEvent("refresh_rom",{});
        this.removeFromParent(true);
    }
})