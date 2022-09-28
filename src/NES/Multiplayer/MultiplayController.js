
const MULTIPLAY_BLUETOOTH = 0;
const MULTIPLAY_WIFI = 1;
const MULTIPLAY_INTERNET = 2;

const MULTIPLAYER_STATE_NOT_CONNECTED = 0;
const MULTIPLAYER_STATE_SERVER_LISTENING = 1;
const MULTIPLAYER_STATE_CLIENT_CONNECTING = 2;
const MULTIPLAYER_STATE_CONNECTED = 3;



const GAME_ACTION_OPEN_ROM = 0;
const GAME_ACTION_RESET = 1;
const GAME_ACTION_KEYSTATE = 2;
const GAME_ACTION_FRAMESTATE = 3;
const GAME_ACTION_GAMESTATE = 4;
const GAME_ACTION_SEND_ROM = 5;
const GAME_ACTION_CLIENT_HAS_READY = 6;
const GAME_ACTION_CLIENT_REQUEST_GAME_STATE = 7;

const MESSAGE_TYPE_STRING = 0;
const MESSAGE_TYPE_BYTEBUFFER = 1;

class MultiplayControlListener {
    onReceivedAction(action,data){}
}

class MultiplayController {
    state = MULTIPLAYER_STATE_NOT_CONNECTED;
    type = MULTIPLAY_BLUETOOTH;
    isServer_ = false;
    listeners = [];

    constructor(){
        MultiplayAdapter.shared().addListener(this);
    }

    addListener(lis){
        this.listeners.push(lis);
    }
    removeListener(lis){
        if(this.listeners.indexOf(lis) !== -1)
        {
            this.listeners.splice(this.listeners.indexOf(lis),1);
        }
    }

    setState(state_){
        this.state = state_;
    }

    getState() {
        return this.state;
    }
    setType(type){
        this.type = type;
    }
    getType() {
        return this.type;
    }

    isConnected(){
        return this.state === MULTIPLAYER_STATE_CONNECTED;
    }

    disconnect(){

    }

    isServer(){
        return this.isServer_;
    }
    isMaster(){
        return this.isServer_;
    }

    sendKeyStates(keyStates){
        var pk = new OutPacket(GAME_ACTION_KEYSTATE);
        pk.putUnsignedInt(keyStates);
        MultiplayAdapter.shared().sendMessage(pk.generateBuffer());

    }

    sendFrameState(frameCount,keyStates){
        var pk = new OutPacket(GAME_ACTION_FRAMESTATE);
        pk.putUnsignedInt(frameCount);
        pk.putUnsignedInt(keyStates);

        MultiplayAdapter.shared().sendMessage(pk.generateBuffer());
    }

    sendGameState(gameStateWrapper,frameCount){
        var gameState = gameStateWrapper.getData();
        var view = new Uint8Array(gameState);
        view[0] = GAME_ACTION_GAMESTATE >> 8;
        view[1] = GAME_ACTION_GAMESTATE >> 0;
        view[2] = frameCount >> 24;
        view[3] = frameCount >> 16;
        view[4] = frameCount >> 8;
        view[5] = frameCount >> 0;
        MultiplayAdapter.shared().sendMessage(gameState);
    }

    sendOpenROM(romInfos){
        var pk = new OutPacket(GAME_ACTION_OPEN_ROM);
        pk.putString(JSON.stringify(romInfos));
        cc.log(JSON.stringify(romInfos));
        MultiplayAdapter.shared().sendMessage(pk.generateBuffer());
    }

    sendROM(){

    }

    sendAction(){

    }


    /// client check rom and send client's state
    checkROM(romInfos){
        var ready = true;

        if(ready)
        {
            var gamescene = this.openROMFromServer(romInfos);

            setTimeout(()=>{
                gamescene.game.resume();
                var pk = new OutPacket(GAME_ACTION_CLIENT_HAS_READY);
                pk.putBool(ready);
                MultiplayAdapter.shared().sendMessage(pk.generateBuffer());
            },100);
        }

    }
    openROMFromServer(romInfos){
        cc.EmuEngine.shared().setCurrent(romInfos.emu);

        var gamescene = new GameLayer();
        gamescene.loadGame(romInfos);

        var scene = new cc.Scene();
        scene.addChild(gamescene);
        cc.director.runScene(cc.TransitionSlideInR.create(0.2,scene));

        return gamescene;
    }

    // adapter listener
    onBluetoothConnected(device){
        this.state = MULTIPLAYER_STATE_CONNECTED;
    }
    onBluetoothDisconnect(error){
        this.state = MULTIPLAYER_STATE_NOT_CONNECTED;
    }
    onReceivedData(dataWrapper){
        var data = dataWrapper.getData();
        var pk = new InPacket();
        pk.init(new Uint8Array(data));
        var action = pk.getCmdId();

        cc.log(new Uint8Array(data))

        if(!this.isMaster() && action === GAME_ACTION_OPEN_ROM){
            var romInfo = JSON.parse(pk.getString());
            this.checkROM(romInfo);
            return;
        }

        this.listeners.forEach(lis=>{
            if(lis["onReceivedDataBuffer"])
                lis["onReceivedDataBuffer"](action,pk,dataWrapper)
        });
    }
    onBluetoothServerListening(serverDevice){
        this.isServer_ = true;
    }
    // end

    static ins = null;
    static shared(){
        if(MultiplayController.ins == null){
            MultiplayController.ins = new MultiplayController();
        }
        return MultiplayController.ins;
    }

}
