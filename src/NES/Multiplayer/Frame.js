
class Frame{
    frameCounter = 0;
    frameDataWrapper = null;
    constructor(frameCounter,frameDataWrapper){
        this.frameCounter = frameCounter;
        this.frameDataWrapper = frameDataWrapper;
    }

    destroy(){
        this.frameDataWrapper.release();
    }
}

class FrameQueue {
    frames = [];
    frameMap = {};
    constructor(){

    }

    pushFrame(frame){
        if(!this.frameMap[""+frame.frameCounter]){
            this.frameMap[""+frame.frameCounter] = frame;
            this.frames.push(frame);
        }
    }

    pop(){
        if(this.frames.length > 0){
            var frame = this.frames[0];
            this.frames.splice(0,1);
            this.frameMap[""+frame.frameCounter] = null;
            return frame;
        }
        return null;
    }

    getFrame(frameCount){
        return this.frameMap[""+frameCount];
    }

    removeFrame(frameCount){
        var frame = this.getFrame(frameCount);
        if(frame)
        {
            var idx = this.frames.indexOf(frame);
            if(idx !== -1)
                this.frames.splice(idx,1);

            this.frameMap[""+frameCount] = null;
            frame.destroy();
        }
    }

    size(){
        return this.frames.length;
    }

    clear(){
        this.frames.forEach(frame=>{
            frame.destroy();
        });
        this.frames = [];
        this.frameMap = {};
    }
}

class MasterFrame {
    frameCounter = 0;
    keyStates = 0;
}

class Queue {
    constructor() {
        this.queue = [];
    }

    enqueue(item) {
        return this.queue.unshift(item);
    }

    dequeue() {
        return this.queue.pop();
    }

    peek() {
        return this.queue[this.length - 1];
    }

    get length() {
        return this.queue.length;
    }

    isEmpty() {
        return this.queue.length === 0;
    }
};