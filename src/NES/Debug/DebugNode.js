class DebugNode extends cc.Node{
    constructor() {
        super();
    }

    onEnter(){
        super.onEnter();
    }

    initWithBinaryFile(json){
        // cc.log("LOAD JSON : " + json);

        var start = new Date().getTime();
        this._layoutPath = json;
        var jsonLayout = ccs.load(json);

        this._actionList = jsonLayout.action;
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.winSize);
        // this._layout.setAnchorPoint(cc.p(0.5,0.5));
        // this._layout.setPosition(DESIGN_RESOLUTION_WIDTH/2,DESIGN_RESOLUTION_HEIGHT/2);
        ccui.helper.doLayout(this._layout);

        this.addChild(this._layout);

        this.syncWidgets(this._layout);

        var end = new Date().getTime();
        // cc.log("## Time Load " + json + " : " + (end - start));

        this.initGUI();
        var end2 = new Date().getTime();
        // cc.log("## Time Init " + json + " : " + (end2 - end));
    }

    initGUI(){

    }

    syncWidgets (root)
    {
        var thiz = this;
        var childs = root.getChildren();
        childs.forEach(child=>{
            if(child )
            {
                if(child.getName() !== "")
                {
                    thiz[child.getName()] = child;
                    root[child.getName()] = child;
                }
                if(typeof (child.callBackList) !== "undefined")
                {
                    child.callBackList.forEach(cb=>{

                        child[cb] = thiz[cb]?thiz[cb].bind(thiz):undefined;
                    })
                }

                thiz.syncWidgets(child);
            }
        });
    }
}

