import { DagreLayout } from "@antv/layout";
import { Graph, Model } from "@antv/x6";
import { executeMicroflow, getObjectContext, getObjects, getReferencePart } from "@jeltemx/mendix-react-widget-utils";
import { difference } from "lodash-es";
import { autorun, computed, configure, makeObservable, observable, when } from "mobx";
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
            rankdir: "LR",
            align: "UR",
            ranksep: 30,
            nodesep: 15,
            controlPoints: true
        });

        return dagreLayout.layout(model as any);
    }

    update() {
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

        getObjects(edgeGuids).then(objs => {
            objs?.map(d => {
                const newEdge = new EdgeMxObject(d.getGuid(), this.mxOption);
                this.edges.set(d.getGuid(), newEdge);
            });
        });

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

    constructor(public mxOption: ReteContainerProps) {
        makeObservable(this, {
            mxOption: observable,
            edges: observable,
            nodes: observable,
            model: computed,
            selectedGuids: observable,
            graph: observable
        });

        autorun(
            () => {
                //#region 更新视图的选择集
                if (this.graph && this.mxOption.mxObject !== undefined) {
                    this.selectedGuids =
                        this.mxOption.mxObject.getReferences(
                            getReferencePart(mxOption.entitySelect, "referenceAttr")
                        ) ?? [];
                    const selected = this.graph.getSelectedCells().map(d => d.id);
                    if (
                        difference(this.selectedGuids, selected).length > 0 ||
                        difference(selected, this.selectedGuids).length > 0
                    )
                        this.graph.resetSelection(this.selectedGuids);
                }
                //#endregion
            },
            { name: "更新视图(选择集)" }
        );

        when(
            () => !!this.mxOption.mxObject,
            () => {
                this.update();

                this.sub = mx.data.subscribe(
                    {
                        guid: this.mxOption.mxObject!.getGuid(),
                        callback: () => {
                            this.update();
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
}
