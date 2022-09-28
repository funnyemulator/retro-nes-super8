/**
 * Created by hoangnguyen on 4/27/18.
 */


var STATUS_NOT_DOWNLOAD = 0;
var STATUS_DOWNLOADING = 1;
var STATUS_DOWNLOADED = 2;
var STATUS_DOWNLOAD_FAILED = 3;


class ObjectDownload {
    constructor(){
        this.status = STATUS_NOT_DOWNLOAD;
        this.byteDownloaded = 0;
        this.byteTotal = 0;
        this.url = "";
    }
}

var DownloadManager = cc.Class.extend({
    ctor: function()
    {
        this.obj = {}
    },
    __callback_download__ : function()
    {

    },
    isFileExist: function(gameInfoData)
    {
        if(cc.isNative)
        {
            var path = jsb.fileUtils.getWritablePath() + gameInfoData.localFile;
            return jsb.fileUtils.isFileExist(path);
        }
        return true;
    },
    addDownloadTask: function(gameInfoData){
        if(cc.isNative)
        {
            var url = gameInfoData.url;
            var destPath = jsb.fileUtils.getWritablePath() + gameInfoData.localFile;
            var objectDownload = new ObjectDownload();
            objectDownload.status = STATUS_DOWNLOADING;
            objectDownload.url = url;
            var callback_ = function(byteReceived,byteTotal)
            {
                this.byteDownloaded = byteReceived;
                this.byteTotal = byteTotal;

                if(byteReceived === -1) // tai thanh cong
                {
                    delete downloadMgr.obj[this.url];
                }
                else if(byteReceived === -2) // tai loi~
                {
                    delete downloadMgr.obj[this.url];
                }

            }.bind(objectDownload);
            this.obj[url] = objectDownload;
            fr.download.downloadFile(url,destPath,"",callback_);
            return true;
        }
        return false;
    },
    getDownloadInfo: function(gameInfoData){
        if(cc.sys.isNative)
        {
            return this.obj[gameInfoData.url];
        }
        return "{}";
    },
    isDownloadThreadExist: function(gameInfoData){
        if(cc.sys.isNative)
        {
            return this.obj[gameInfoData.url] !== undefined;
        }
        return this.obj[gameInfoData.url] !== undefined;
    },
    isDownloadThreadPaused: function(gameInfoData){
        if(cc.isNative)
        {
            return engine.DownloadManager.isDownloadThreadPaused(url);
        }
        return false;
    },
    pauseDownloadThread: function(gameInfoData){
        if(cc.isNative)
        {
            engine.DownloadManager.pauseDownloadThread(url);
        }
    },
    resumeDownloadThread: function(gameInfoData){
        if(cc.isNative)
        {
            engine.DownloadManager.resumeDownloadThread(url);
        }
    }
});

var downloadMgr = new DownloadManager();