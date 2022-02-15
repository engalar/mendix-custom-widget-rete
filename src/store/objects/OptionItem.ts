import { getReferencePart } from "@jeltemx/mendix-react-widget-utils";
import { Edge, Node } from "@antv/x6";
import { _W } from "../../../typings/ReteProps";
import { BaseMxObject } from "./BaseMxObject";
import { computed, makeObservable, observable } from "mobx";
import { Store } from "..";

export class EdgeMxObject extends BaseMxObject {
    source?: string;
    target?: string;
    constructor(guid: string, private opt: _W) {
        super(guid);
        makeObservable(this, { source: observable, target: observable, model: computed });
        this.update();
        this.onChange = () => {
            this.update();
        };
    }
    update() {
        if (this.mxObject) {
            this.source = this.mxObject.get(getReferencePart(this.opt.entitySource, "referenceAttr")) as string;
            this.target = this.mxObject.get(getReferencePart(this.opt.entityTarget, "referenceAttr")) as string;
        }
    }
    get model(): Edge.Metadata {
        return {
            id: this.guid,
            shape: "bpmn-edge",
            target: this.source,
            source: this.target
        };
    }
}

export class NodeMxObject extends BaseMxObject {
    label?: string;
    shape?: string;
    /**
     *
     * @param guid mxobj guid
     * @param idx option index
     */
    constructor(guid: string, private store: Store) {
        super(guid);
        makeObservable(this, { label: observable, shape: observable, model: computed });
        this.update();
        this.onChange = () => {
            this.update();
        };
    }
    update() {
        if (this.mxObject) {
            this.label = this.mxObject.get(this.store.mxOption.activityLabel) as string;
            this.shape = this.mxObject.get(this.store.mxOption.activityType) as string;
            //todo 临时方案
            this.store.graph?.getCellById(this.guid)?.setAttrByPath("text/text", this.label);
        }
    }
    get model(): Node.Metadata {
        return {
            id: this.guid,
            shape: this.shape ?? "activity",
            width: 100,
            height: 60,
            label: this.label
        };
    }
}
