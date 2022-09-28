class EmuControllerMap {
    constructor() {
        this.emulatorType = EMULATOR_NES;
        this.isPlayer2 = false;
        this.controllerMap = {};
        this.default();
    }
    default() {

    }

    loadFromStorage() {

    }

    getKey(keyCode,extra){
        if(this.controllerMap[keyCode])
            return this.isPlayer2?(this.controllerMap[keyCode].key << 16):this.controllerMap[keyCode].key;
        return 0;
    }
    getKeyName(keyCode){
        if(this.controllerMap[keyCode])
            return this.controllerMap[keyCode].name;
        return "";
    }
}

class NESControllerMap extends EmuControllerMap {
    constructor(){
        super();
        this.emulatorType = EMULATOR_NES;

    }
    default() {
        this.controllerMap[cc.BUTTON_X] = {key: NES_GAMEPAD_B_TURBO,name: "X"};
        this.controllerMap[cc.BUTTON_Y] = {key: NES_GAMEPAD_A_TURBO,name: "Y"};
        this.controllerMap[cc.BUTTON_B] = {key: NES_GAMEPAD_A,name: "B"};
        this.controllerMap[cc.BUTTON_A] = {key: NES_GAMEPAD_B,name: "A"};

        this.controllerMap[cc.BUTTON_DPAD_UP] = {key: NES_GAMEPAD_UP,name: "UP"};
        this.controllerMap[cc.BUTTON_DPAD_DOWN] = {key: NES_GAMEPAD_DOWN,name: "DOWN"};
        this.controllerMap[cc.BUTTON_DPAD_LEFT] = {key: NES_GAMEPAD_LEFT,name: "LEFT"};
        this.controllerMap[cc.BUTTON_DPAD_RIGHT] = {key: NES_GAMEPAD_RIGHT,name: "RIGHT"};

        this.controllerMap[cc.BUTTON_START] = {key: NES_GAMEPAD_START,name: "START"};
        this.controllerMap[cc.BUTTON_SELECT] = {key: NES_GAMEPAD_SELECT,name: "SELECT"};
    }
}

class SNESControllerMap extends EmuControllerMap {
    constructor(){
        super();
        this.emulatorType = EMULATOR_SNES;
    }
    default() {
        this.controllerMap[cc.BUTTON_X] = {key: SNES_GAMEPAD_Y,name: "X"};
        this.controllerMap[cc.BUTTON_Y] = {key: SNES_GAMEPAD_X,name: "Y"};
        this.controllerMap[cc.BUTTON_B] = {key: SNES_GAMEPAD_A,name: "A"};
        this.controllerMap[cc.BUTTON_A] = {key: SNES_GAMEPAD_B,name: "B"};

        this.controllerMap[cc.BUTTON_DPAD_UP] = {key: SNES_GAMEPAD_UP,name: "UP"};
        this.controllerMap[cc.BUTTON_DPAD_DOWN] = {key: SNES_GAMEPAD_DOWN,name: "DOWN"};
        this.controllerMap[cc.BUTTON_DPAD_LEFT] = {key: SNES_GAMEPAD_LEFT,name: "LEFT"};
        this.controllerMap[cc.BUTTON_DPAD_RIGHT] = {key: SNES_GAMEPAD_RIGHT,name: "RIGHT"};

        this.controllerMap[cc.BUTTON_START] = {key: SNES_GAMEPAD_START,name: "START"};
        this.controllerMap[cc.BUTTON_SELECT] = {key: SNES_GAMEPAD_SELECT,name: "SELECT"};

        this.controllerMap[cc.BUTTON_LEFT_SHOULDER] = {key: SNES_GAMEPAD_TL,name: "TL"};
        this.controllerMap[cc.BUTTON_RIGHT_SHOULDER] = {key: SNES_GAMEPAD_TR,name: "TR"};

        this.controllerMap[cc.BUTTON_LEFT_TRIGGER] = {key: SNES_GAMEPAD_TL,name: "TL"};
        this.controllerMap[cc.BUTTON_RIGHT_TRIGGER] = {key: SNES_GAMEPAD_TR,name: "TR"};

        // this.controllerMap[cc.BUTTON_LEFT_THUMBSTICK] = {key: SNES_GAMEPAD_TL,name: "TL"};
        // this.controllerMap[cc.BUTTON_RIGHT_THUMBSTICK] = {key: SNES_GAMEPAD_TR,name: "TR"};
    }
}

class GBAControllerMap extends EmuControllerMap {
    constructor(){
        super();
        this.emulatorType = EMULATOR_GBA;
    }
    default() {
        this.controllerMap[cc.BUTTON_X] = {key: GBA_GAMEPAD_A,name: "A"};
        this.controllerMap[cc.BUTTON_Y] = {key: GBA_GAMEPAD_B,name: "B"};
        this.controllerMap[cc.BUTTON_B] = {key: GBA_GAMEPAD_A,name: "A"};
        this.controllerMap[cc.BUTTON_A] = {key: GBA_GAMEPAD_B,name: "B"};

        this.controllerMap[cc.BUTTON_DPAD_UP] = {key: GBA_GAMEPAD_UP,name: "UP"};
        this.controllerMap[cc.BUTTON_DPAD_DOWN] = {key: GBA_GAMEPAD_DOWN,name: "DOWN"};
        this.controllerMap[cc.BUTTON_DPAD_LEFT] = {key: GBA_GAMEPAD_LEFT,name: "LEFT"};
        this.controllerMap[cc.BUTTON_DPAD_RIGHT] = {key: GBA_GAMEPAD_RIGHT,name: "RIGHT"};

        this.controllerMap[cc.BUTTON_START] = {key: GBA_GAMEPAD_START,name: "START"};
        this.controllerMap[cc.BUTTON_SELECT] = {key: GBA_GAMEPAD_SELECT,name: "SELECT"};

        this.controllerMap[cc.BUTTON_LEFT_SHOULDER] = {key: GBA_GAMEPAD_L,name: "TL"};
        this.controllerMap[cc.BUTTON_RIGHT_SHOULDER] = {key: GBA_GAMEPAD_R,name: "TR"};

        this.controllerMap[cc.BUTTON_LEFT_TRIGGER] = {key: GBA_GAMEPAD_L,name: "TL"};
        this.controllerMap[cc.BUTTON_RIGHT_TRIGGER] = {key: GBA_GAMEPAD_R,name: "TR"};

        // this.controllerMap[cc.BUTTON_LEFT_THUMBSTICK] = {key: GBA_GAMEPAD_L,name: "TL"};
        // this.controllerMap[cc.BUTTON_RIGHT_THUMBSTICK] = {key: GBA_GAMEPAD_R,name: "TR"};
    }
}

class N64ControllerMap extends EmuControllerMap {
    constructor(){
        super();
        this.emulatorType = EMULATOR_N64;
    }
    default() {
        this.controllerMap[cc.BUTTON_X] = {key: N64_GAMEPAD_A,name: "X"};
        this.controllerMap[cc.BUTTON_Y] = {key: N64_GAMEPAD_B,name: "Y"};
        this.controllerMap[cc.BUTTON_B] = {key: N64_GAMEPAD_A,name: "B"};
        this.controllerMap[cc.BUTTON_A] = {key: N64_GAMEPAD_B,name: "A"};

        this.controllerMap[cc.BUTTON_DPAD_UP] = {key: N64_GAMEPAD_UP,name: "UP"};
        this.controllerMap[cc.BUTTON_DPAD_DOWN] = {key: N64_GAMEPAD_DOWN,name: "DOWN"};
        this.controllerMap[cc.BUTTON_DPAD_LEFT] = {key: N64_GAMEPAD_LEFT,name: "LEFT"};
        this.controllerMap[cc.BUTTON_DPAD_RIGHT] = {key: N64_GAMEPAD_RIGHT,name: "RIGHT"};

        this.controllerMap[cc.BUTTON_START] = {key: N64_GAMEPAD_START,name: "START"};

        this.controllerMap[cc.BUTTON_LEFT_SHOULDER] = {key: N64_GAMEPAD_L,name: "TL"};
        this.controllerMap[cc.BUTTON_RIGHT_SHOULDER] = {key: N64_GAMEPAD_R,name: "TR"};

        this.controllerMap[cc.BUTTON_LEFT_TRIGGER] = {key: N64_GAMEPAD_Z,name: "TL"};
        // this.controllerMap[cc.BUTTON_RIGHT_TRIGGER] = {key: SNES_GAMEPAD_TR,name: "TR"};
        //
        // this.controllerMap[cc.BUTTON_LEFT_THUMBSTICK] = {key: SNES_GAMEPAD_TL,name: "TL"};
        // this.controllerMap[cc.BUTTON_RIGHT_THUMBSTICK] = {key: SNES_GAMEPAD_TR,name: "TR"};
    }
    getKey(keyCode,isUp){
        if(isUp !== undefined)
        {
            if(keyCode === cc.THUMBSTICK_RIGHT_X)
                if(isUp)
                    return N64_GAMEPAD_C_RIGHT;
                else return N64_GAMEPAD_C_LEFT;
            else if(keyCode === cc.THUMBSTICK_RIGHT_Y){
                return (!isUp)?N64_GAMEPAD_C_UP:N64_GAMEPAD_C_DOWN;
            }
        }else if(this.controllerMap[keyCode])
            return this.controllerMap[keyCode].key;
        return 0;
    }
}


class Gamepad {
    constructor() {
        this.eventListener = null;
        this.currentControllerMap = null;
        this.states = 0;


        this.up_axisX = 0;
        this.up_axisY = 0;
    }

    setListener(lis){
        this.eventListener = lis;
    }

    loadMap(emuType){
        switch (emuType) {
            case EMULATOR_NES:
                this.currentControllerMap = new NESControllerMap();
                break;
            case EMULATOR_SNES:
                this.currentControllerMap = new SNESControllerMap();
                break;
            case EMULATOR_GBA:
                this.currentControllerMap = new GBAControllerMap();
                break;
            case EMULATOR_N64:
                this.currentControllerMap = new N64ControllerMap();
                break;
            default:
                this.currentControllerMap = new NESControllerMap();
                break;
        }
    }

    init(emuType) {
        this.loadMap(emuType);
        if(!cc.isNative)
            return;
        this.listener = cc.EventListener.create({
            event: cc.EventListener.CONTROLLER,
            onConnected: (controller,event)=>{

                this.states = 0;
            },
            onDisconnected: (controller,event)=>{
                this.states = 0;

            },
            onKeyDown: (controller,keyCode,event)=>{
                var keyState = this.currentControllerMap.getKey(keyCode);
                this.states |= keyState;

                if(this.eventListener){
                    this.eventListener.onKeyStateChage(this.states);
                    this.eventListener.onButtonTouchedJoystick(keyState);
                }
            },
            onKeyUp: (controller,keyCode,event)=>{
                var keyState = this.currentControllerMap.getKey(keyCode);
                this.states &= ~keyState;

                if(this.eventListener){
                    this.eventListener.onKeyStateChage(this.states);
                    this.eventListener.onButtonReleasedJoystick(keyState);
                }
            },
            onKeyRepeat: (controller,keyCode,event)=>{

            },
            onAxisEvent: (controller,keyCode,event)=>{
                // cc.log(JSON.stringify(controller.getKeyStatus(keyCode)));
                // cc.director.getNotificationNode()["Text_Analog"].string = JSON.stringify(controller.getKeyStatus(keyCode));
                if(keyCode === cc.THUMBSTICK_LEFT_X || keyCode === cc.THUMBSTICK_LEFT_Y){
                    var axisX = controller.getKeyStatus(cc.THUMBSTICK_LEFT_X).value;
                    var axisY = controller.getKeyStatus(cc.THUMBSTICK_LEFT_Y).value;

                    if(this.eventListener){
                        this.eventListener.onAnalog(axisX,-axisY);
                    }
                }

                if(keyCode === cc.THUMBSTICK_RIGHT_X){
                    var axisX = controller.getKeyStatus(cc.THUMBSTICK_RIGHT_X).value;

                    if(axisX >= 0.3 && this.up_axisX !== 1){
                        this.up_axisX = 1;
                        var keyState = this.currentControllerMap.getKey(keyCode,true);
                        this.states |= keyState;

                        if(this.eventListener){
                            this.eventListener.onKeyStateChage(this.states);
                            this.eventListener.onButtonTouchedJoystick(keyState);
                        }
                    } else if(axisX <= -0.3 && this.up_axisX !== -1){
                        this.up_axisX = -1;

                        var keyState = this.currentControllerMap.getKey(keyCode,false);
                        this.states |= keyState;

                        if(this.eventListener){
                            this.eventListener.onKeyStateChage(this.states);
                            this.eventListener.onButtonTouchedJoystick(keyState);
                        }
                    } else if(axisX >= -0.3 && axisX <= 0.3 && this.up_axisX !== 0){

                        this.states &= ~(this.currentControllerMap.getKey(keyCode,true));
                        this.states &= ~(this.currentControllerMap.getKey(keyCode,false));

                        if(this.eventListener){
                            this.eventListener.onKeyStateChage(this.states);
                            if(this.up_axisX > 0)
                                this.eventListener.onButtonReleasedJoystick(this.currentControllerMap.getKey(keyCode,true));
                            else
                                this.eventListener.onButtonReleasedJoystick(this.currentControllerMap.getKey(keyCode,false));
                        }

                        this.up_axisX = 0;
                    }
                }

                if(keyCode === cc.THUMBSTICK_RIGHT_Y){
                    var axisY = controller.getKeyStatus(cc.THUMBSTICK_RIGHT_Y).value;
                    if(axisY >= 0.3 && this.up_axisY !== 1){
                        this.up_axisY = 1;

                        var keyState = this.currentControllerMap.getKey(keyCode,true);
                        this.states |= keyState;

                        if(this.eventListener){
                            this.eventListener.onKeyStateChage(this.states);
                            this.eventListener.onButtonTouchedJoystick(keyState);
                        }
                    } else if(axisY <= -0.3 && this.up_axisY !== -1){
                        this.up_axisY = -1;

                        var keyState = this.currentControllerMap.getKey(keyCode,false);
                        this.states |= keyState;

                        if(this.eventListener){
                            this.eventListener.onKeyStateChage(this.states);
                            this.eventListener.onButtonTouchedJoystick(keyState);
                        }
                    } else if(axisY <= 0.3 && axisY >= -0.3 && this.up_axisY !== 0){
                        this.states &= ~(this.currentControllerMap.getKey(keyCode,true));
                        this.states &= ~(this.currentControllerMap.getKey(keyCode,false));
                        if(this.eventListener){
                            this.eventListener.onKeyStateChage(this.states);
                            if(this.up_axisY > 0)
                                this.eventListener.onButtonReleasedJoystick(this.currentControllerMap.getKey(keyCode,true));
                            else
                                this.eventListener.onButtonReleasedJoystick(this.currentControllerMap.getKey(keyCode,false));
                        }

                        this.up_axisY = 0;

                    }
                }

            }

        });

        cc.eventManager.addListener(this.listener,-1);
    }

    destroy() {
        cc.eventManager.removeListener(this.listener);
    }

}
