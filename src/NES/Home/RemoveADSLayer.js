var RemoveADSLayer = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("res/UI/RemoveADSLayer.json");
    },
    onEnter: function(){
        this._super();
        this.runAction(this._actionList);
        this._actionList.play("start",false);
    },
    exit: function (btn,type) {
        if(type === ccui.Widget.TOUCH_ENDED)
            this.removeFromParent();
    },
    watch: function () {
        fr.admob.showVideo(
            {
                onAdsResult: function(code,msg){
                    cc.log("tom code : " + code);
                },
                onPlayerGetPoints: function(points)
                {
                    cc.log("tom points" + points);
                }
            });
    }
})