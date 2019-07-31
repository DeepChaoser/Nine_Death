cc.Class({
    extends: cc.Component,

    properties: {
        textLabel: cc.Label,
        okButton: cc.Node,
        cancelButton: cc.Node
    },
    onLoad() {

        this.node.on("show-text-cb", (data) => {
            this._cb = data.CB;
            this.okButton.opacity = 0;
            this.cancelButton.opacity = 0;
            this.showText(data).then(() => {
                this.okButton.getComponent(cc.Button).interactable = true;
                this.cancelButton.getComponent(cc.Button).interactable = true;
                this.okButton.runAction(cc.fadeIn(0.5));
                this.cancelButton.runAction(cc.fadeIn(0, 5));
                this.node.height = this.textLabel.node.height + 75;
                this.okButton.y = this.textLabel.node.y - this.textLabel.node.height - this.okButton.height;
                this.cancelButton.y = this.textLabel.node.y - this.textLabel.node.height - this.cancelButton.height;
            });
        });
        this.node.on("show-text", (data) => {
            this.okButton.active = false;
            this.cancelButton.active = false;
            this.showText(data);
        });
    },
    onEnable(){
        this.textLabel.string = '';
    },
    showText(data) {
        return new Promise((resole, reject) => {
            this.textLabel.string = data.text;
            this.textLabel.node.opacity = 0;
            this.textLabel.node.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.fadeIn(0.5),
                cc.callFunc(() => {
                    this.node.height = this.textLabel.node.height + 10;
                    if (resole) {
                        resole();
                    }
                })
            ))
        });
    },
    onButtonClick(event, customData) {
        this.okButton.getComponent(cc.Button).interactable = false;
        this.cancelButton.getComponent(cc.Button).interactable = false;
        if (this._cb) {
            this._cb(customData);
        }
    },
    start() {

    },
    update(dt) {

    }
});
