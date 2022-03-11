import { DagreLayout } from "@antv/layout";
import { Graph, Model } from "@antv/x6";
import { executeMicroflow, getObjectContext, getReferencePart } from "@jeltemx/mendix-react-widget-utils";
import { difference } from "lodash-es";
import { autorun, computed, configure, makeObservable, observable, toJS } from "mobx";
import { ReteContainerProps } from "../../typings/ReteProps";
import { EdgeMxObject, NodeMxObject } from "./objects/OptionItem";

configure({ enforceActions: "observed", isolateGlobalState: true, useProxies: "never" });

export class Store {
    sub?: number;
    graph?: Graph;
    /**
     * dispose
     */
    public dispose() {
        this.nodes.forEach(d => d.dispose());
        if (this.sub) {
            mx.data.unsubscribe(this.sub);
        }
    }

    nodes: Map<string, NodeMxObject> = new Map();
    edges: Map<string, EdgeMxObject> = new Map();
    selectedGuids: string[] = [];

    public get model(): Model.FromJSONData {
        const model: Model.FromJSONData = {
            nodes: Array.from<NodeMxObject>(this.nodes.values()).map(d => d.model),
            edges: Array.from<EdgeMxObject>(this.edges.values()).map(d => d.model)
        };

        const dagreLayout = new DagreLayout({
            type: "dagre",
            rankdir: "TB",
            align: "DL",
            ranksep: 40,
            nodesep: 35,
            controlPoints: true
        });

        return dagreLayout.layout(model as any);
    }

    update() {
        if (this.mxOption.mxObject) {
            this.selectedGuids =
                this.mxOption.mxObject.getReferences(getReferencePart(this.mxOption.entitySelect, "referenceAttr")) ??
                [];
        }
        //#region 更新节点
        const activityRefPart = getReferencePart(this.mxOption.activitys, "referenceAttr");
        const nodeGuids = this.mxOption.mxObject?.getReferences(activityRefPart) ?? [];

        const deleteGuids = difference(Array.from(this.nodes.keys()), nodeGuids);
        deleteGuids.forEach(d => {
            this.nodes.get(d)!.dispose();
            this.nodes.delete(d);
        });

        const addNodeGuids = difference(nodeGuids, Array.from(this.nodes.keys()));
        addNodeGuids.forEach(d => {
            const newNode = new NodeMxObject(d, this);
            this.nodes.set(d, newNode);
        });
        //#endregion

        //#region 更新边
        const edgeGuids =
            this.mxOption.mxObject?.getReferences(getReferencePart(this.mxOption.edges, "referenceAttr")) ?? [];

        const deleteEdgeGuids = difference(Array.from(this.edges.keys()), edgeGuids);
        deleteEdgeGuids.forEach(d => {
            this.edges.get(d)!.dispose();
            this.edges.delete(d);
        });

        const addEdgeGuids = difference(edgeGuids, Array.from(this.edges.keys()));
        addEdgeGuids.forEach(d => {
            const newEdge = new EdgeMxObject(d, this.mxOption);
            this.edges.set(d, newEdge);
        });
        //#endregion
    }

    drawSelection() {
        if (this.graph && this.mxOption.mxObject !== undefined) {
            const selected = this.graph.getSelectedCells().map(d => d.id);
            if (!isSameGuids(this.selectedGuids, selected)) {
                this.graph.resetSelection(toJS(this.selectedGuids));
            }
        }
    }

    constructor(public mxOption: ReteContainerProps) {
        makeObservable(this, {
            mxOption: observable,
            edges: observable,
            nodes: observable,
            model: computed,
            selectedGuids: observable,
            graph: observable
        });

        autorun(() => {
            console.log(this.mxOption.mxObject);
            if (this.mxOption.mxObject) {
                this.update();
                if (this.sub) {
                    mx.data.unsubscribe(this.sub);
                }

                this.sub = mx.data.subscribe(
                    {
                        guid: this.mxOption.mxObject!.getGuid(),
                        callback: () => {
                            this.update();
                            //等待视图刷新
                            setTimeout(() => {
                                this.drawSelection();
                            }, 1);
                        }
                    },
                    //@ts-ignore
                    this.mxOption.mxform
                );
            }
        });
    }

    onSelect(guids: string[]) {
        console.debug("rete[select:view]", guids, this.selectedGuids.toString());
        if (!this.mxOption.mxObject || isSameGuids(guids, this.selectedGuids)) {
            console.debug("rete[select:view] 视图 和 模型 一致，不触发选择动作", guids, this.selectedGuids);
            return;
        }
        this.mxOption.mxObject.set(getReferencePart(this.mxOption.entitySelect, "referenceAttr"), guids);
        executeMicroflow(this.mxOption.mfSelect, getObjectContext(this.mxOption.mxObject), this.mxOption.mxform);
    }
}

function isSameGuids(a: string[], b: string[]): boolean {
    return difference(a, b).length === 0 && difference(b, a).length === 0;
}
