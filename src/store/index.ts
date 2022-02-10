import { getObjects, getReferencePart } from "@jeltemx/mendix-react-widget-utils";
import { configure, makeObservable, observable, when } from "mobx";
import { ReteContainerProps } from "../../typings/ReteProps";
import { EdgeMxObject, OptionItem } from "./objects/OptionItem";

configure({ enforceActions: "observed", isolateGlobalState: true, useProxies: "never" });

export class Store {
    /**
     * dispose
     */
    public dispose() {
        this.options?.forEach(d => d.dispose());
    }

    options?: OptionItem[];
    edgets?: EdgeMxObject[];

    constructor(public mxOption: ReteContainerProps) {
        makeObservable(this, { mxOption: observable, edgets: observable, options: observable });
        when(
            () => !!this.mxOption.mxObject,
            () => {
                const guids = this.mxOption.mxObject?.getReferences(
                    getReferencePart(this.mxOption.activitys, "referenceAttr")
                );
                if (guids) {
                    getObjects(guids).then(objs => {
                        this.options = objs?.map(
                            d => new OptionItem(d.getGuid(), d.get(this.mxOption.activityLabel) as string)
                        );
                    });
                }

                const edgeGuids = this.mxOption.mxObject?.getReferences(
                    getReferencePart(this.mxOption.edges, "referenceAttr")
                );
                if (edgeGuids) {
                    getObjects(edgeGuids).then(objs => {
                        this.edgets = objs?.map(d => new EdgeMxObject(d.getGuid(), this.mxOption));
                    });
                }
            },
            {
                onError(e) {
                    console.error(e);
                }
            }
        );
    }
}
