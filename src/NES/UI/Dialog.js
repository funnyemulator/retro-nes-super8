var Dialog = BaseLayer.extend({
    ctor: function (selector) {
        this._super();
        this.selector = selector;
        this.initWithBinaryFile("res/UI/Dialog.json");

    },
    onEnter: function(){
        this._super();
        this.runAction(this._actionList);
        this._actionList.play("start",false);

    },
    ok: function(){
        if(this.selector)
            this.selector(this,1);

        this.removeFromParent();
    },
    cancel: function(){
        if(this.selector)
            this.selector(this,0);
        this.removeFromParent();
    },
    quit: function (btn,type) {
        if(type !==ccui.Widget.TOUCH_ENDED)
            return;
        if(this.selector)
            this.selector(this,0);
        // var out = this._actionList.clone();
        // out.play("start",false);
        // this.runAction(out);

        // this.runAction(cc.sequence(cc.delayTime(0.25),cc.removeSelf()));
        this.removeFromParent();
    }
})


Dialog.newDialog = function(selector,message)
{
    var dialog = new Dialog(selector);
    dialog.lbMessage.setString(message);
    return dialog;
}