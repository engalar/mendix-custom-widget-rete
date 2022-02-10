import { Graph } from "@antv/x6";
import {
    executeMicroflow,
    getObject,
    getObjectContext,
    getObjects,
    getReferencePart
} from "@jeltemx/mendix-react-widget-utils";
import { difference } from "lodash-es";
import { configure, makeObservable, observable, when } from "mobx";
import { ReteContainerProps } from "../../typings/ReteProps";
import { EdgeMxObject, OptionItem } from "./objects/OptionItem";

configure({ enforceActions: "observed", isolateGlobalState: true, useProxies: "never" });

export class Store {
    sub?: number;
    graph?: Graph;
    /**
     * dispose
     */
    public dispose() {
        this.options.forEach(d => d.dispose());
        if (this.sub) {
            mx.data.unsubscribe(this.sub);
        }
    }

    options: Map<string, OptionItem> = new Map();
    edges: Map<string, EdgeMxObject> = new Map();

    constructor(public mxOption: ReteContainerProps) {
        makeObservable(this, { mxOption: observable, edges: observable, options: observable });
        when(
            () => !!this.mxOption.mxObject,
            () => {
                const activityRefPart = getReferencePart(this.mxOption.activitys, "referenceAttr");
                const guids = this.mxOption.mxObject?.getReferences(activityRefPart);
                if (guids) {
                    getObjects(guids).then(objs => {
                        objs?.forEach(d => {
                            const newNode = new OptionItem(d.getGuid(), d.get(this.mxOption.activityLabel) as string);
                            newNode.onChange = this.onNodeChange.bind(this);
                            this.options.set(d.getGuid(), newNode);
                        });
                    });
                }

                const edgeGuids = this.mxOption.mxObject?.getReferences(
                    getReferencePart(this.mxOption.edges, "referenceAttr")
                );
                if (edgeGuids) {
                    getObjects(edgeGuids).then(objs => {
                        objs?.map(d => {
                            const newEdge = new EdgeMxObject(d.getGuid(), this.mxOption);
                            newEdge.onChange = this.onEdgeChange.bind(this);
                            this.edges.set(d.getGuid(), newEdge);
                        });
                    });
                }

                this.sub = mx.data.subscribe(
                    {
                        guid: this.mxOption.mxObject!.getGuid(),
                        callback: () => {
                            //#region 响应来自实体选择变化
                            const selectedGuids =
                                this.mxOption.mxObject?.getReferences(
                                    getReferencePart(mxOption.entitySelect, "referenceAttr")
                                ) ?? [];
                            if (this.graph) {
                                const selected = this.graph.getSelectedCells().map(d => d.id);
                                if (
                                    difference(selectedGuids, selected).length > 0 ||
                                    difference(selected, selectedGuids).length > 0
                                )
                                    this.graph.resetSelection(selectedGuids);
                            }
                            //#endregion

                            const guids = this.mxOption.mxObject?.getReferences(activityRefPart);
                            if (guids) {
                                guids.forEach(guid => {
                                    if (!this.options.has(guid)) {
                                        getObject(guid).then(d => {
                                            if (d) {
                                                const newNode = new OptionItem(
                                                    d.getGuid(),
                                                    d.get(this.mxOption.activityLabel) as string
                                                );
                                                newNode.onChange = this.onNodeChange.bind(this);
                                                this.options.set(guid, newNode);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    },
                    //@ts-ignore
                    this.mxOption.mxform
                );
            },
            {
                onError(e) {
                    console.error(e);
                }
            }
        );
    }

    onSelect(guids: string[]) {
        if (!this.mxOption.mxObject) {
            return;
        }
        this.mxOption.mxObject.set(getReferencePart(this.mxOption.entitySelect, "referenceAttr"), guids);
        executeMicroflow(this.mxOption.mfSelect, getObjectContext(this.mxOption.mxObject), this.mxOption.mxform);
    }
    onEdgeChange(guid: string) {
        this.edges.delete(guid);
    }
    onNodeChange(guid: string) {
        //@ts-ignore
        const d = mx.data.getCachedObject(guid);
        if (!d) {
            //@ts-ignore
            this.options.delete(guid);
        } else {
            //@ts-ignore
            this.options.get(guid)!.label = d.get(this.mxOption.activityLabel);
            this.graph?.getCellById(guid).setAttrByPath("text/text", d.get(this.mxOption.activityLabel));
        }
    }
}
