import { getReferencePart } from "@jeltemx/mendix-react-widget-utils";
import { Edge, Node } from "@antv/x6";
import { _W } from "../../../typings/ReteProps";
import { BaseMxObject } from "./BaseMxObject";

export class EdgeMxObject extends BaseMxObject {
    source: string;
    target: string;
    constructor(guid: string, public opt: _W) {
        super(guid);
        this.source = this.mxObject.get(getReferencePart(opt.entitySource, "referenceAttr")) as string;
        this.target = this.mxObject.get(getReferencePart(opt.entityTarget, "referenceAttr")) as string;
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

export class OptionItem extends BaseMxObject {
    /**
     *
     * @param guid mxobj guid
     * @param idx option index
     */
    constructor(guid: string, public label: string) {
        super(guid);
    }
    get model(): Node.Metadata {
        return {
            id: this.guid,
            shape: "activity",
            width: 100,
            height: 60,
            label: this.label
        };
    }
}
