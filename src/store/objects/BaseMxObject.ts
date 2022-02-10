export class BaseMxObject {
    sub?: number;
    constructor(public guid: string) {
        this.sub = mx.data.subscribe({
            guid: guid,
            callback: guid => {
                //@ts-ignore
                this.onChange(guid);
            }
        });
    }
    get mxObject(): mendix.lib.MxObject {
        //@ts-ignore
        return mx.data.getCachedObject(this.guid);
    }
    public dispose(): void {
        if (this.sub) {
            mx.data.unsubscribe(this.sub);
            this.sub = undefined;
        }
    }
    onChange?: (guid: string) => void;
}
