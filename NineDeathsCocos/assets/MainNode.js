class State {
    constructor() {
        this._state = 'invalide';
        this._oldState = this._state;
        this._register = {};
    }
    setState(state) {
        if (state == this._state) {
            return;
        }
        if (this._register[state]) {
            let handlerList = this._register[state];
            for (let i = 0; i < handlerList.length; i++) {
                let handler = handlerList[i];
                handler.call(null);
            }
        }
        this._oldState = this._state;
        this._state = state;

    }
    addState(state, cb) {
        if (this._register[state]) {
            this._register[state].push(cb)
        } else {
            this._register[state] = [cb];
        }
    }
    getState(state) {
        if (state && state === this._state) {
            return true;
        }
        return this._state;
    }
    getOldState() {
        return this._oldState;
    }
}
cc.Class({
    extends: cc.Component,

    properties: {
        jsonData: {
            type: cc.JsonAsset,
            default: undefined
        },
        cellPrefab: cc.Prefab
    },
    onLoad() {
        this._currentLevel = JSON.parse(cc.sys.localStorage.getItem("level_number"));
        if (!this._currentLevel) {
            this._currentLevel = 0;
        }
        this._state = new State();
        this._state.setState("run");
        this._speed = 100;

        // this._nodePool = new cc.NodePool();
        // for (let i = 0; i < 5; i++) {
        //     let node = cc.instantiate(this.cellPrefab);
        //     this._nodePool.put(node);
        // }
        this._currentTime = 0;
        this._cellNodeList = [];
    },

    start() {

    },

    addOneCell() {
        for (let i = 0; i < this._cellNodeList.length; i++) {
            let node = this._cellNodeList[i];
            let endY = this._cellNodeList[this._cellNodeList.length - 1].height;
            node.runAction(cc.moveTo(0.5, cc.v2(0, node.y + endY)));
        }
        for (let i = 0; i < this._cellNodeList.length; i++) {
            let node = this._cellNodeList[i];
            if (node.y > cc.view.getVisibleSize().height * 0.5) {
                // this._nodePool.put(node);
                node.destroy();
                this._cellNodeList.splice(i, 1);
                i--;
            }
        }
        return new Promise((resole, reject) => {
            let data = this.jsonData.json['level_' + this._currentLevel];
            console.log('data', data);
            let node = undefined;
            // if (this._nodePool.size() > 0) {
            //     node = this._nodePool.get();
            // } else {
            node = cc.instantiate(this.cellPrefab);

            // }
            node.parent = this.node;
            this._cellNodeList.push(node);
            node.y = 0;
            if (data.jump) {
                if (data.jump.length === 2) {
                    node.emit('show-text-cb', {
                        text: data.text,
                        CB: (type) => {
                            this._currentLevel = type === 'ok' ? data.jump[0] : data.jump[1];
                            cc.sys.localStorage.setItem("level_number", this._currentLevel);
                            if (resole) {
                                resole();
                            }
                        },
                    })
                } else {
                    node.emit('show-text', data);
                    this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(() => {
                        this._currentLevel = data.jump[0];
                        cc.sys.localStorage.setItem("level_number", this._currentLevel);
                        if (resole) {
                            resole();
                        }
                    })));
                }
            }
        });
    },
    update(dt) {

        if (this._state.getState() === 'run') {

            if (this._currentTime > 0.4) {
                this._currentTime = 0;
                this._state.setState('wait');
                this.addOneCell().then(() => {
                    this._state.setState('run')
                }).catch((err) => {
                    //游戏结束
                    console.log("Game Over", err);
                    this._state.setState("end");
                });
            } else {
                this._currentTime += dt;
            }
        }
    }
});


