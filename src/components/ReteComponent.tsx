import { createElement, useEffect, useRef } from "react";
import { DagreLayout } from '@antv/layout';
import { Store } from "../store";

import { Graph, Model } from '@antv/x6';
import { autorun } from "mobx";
import { EdgeMxObject, OptionItem } from "../store/objects/OptionItem";
import { debounce } from "lodash-es";


//#region graph register
Graph.registerNode(
    'event',
    {
        inherit: 'circle',
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#5F95FF',
                fill: '#FFF',
            },
        },
    },
    true,
)

Graph.registerNode(
    'activity',
    {
        inherit: 'rect',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'label',
            },
        ],
        attrs: {
            body: {
                rx: 6,
                ry: 6,
                stroke: '#5F95FF',
                fill: '#EFF4FF',
                strokeWidth: 1,
            },
            label: {
                fontSize: 12,
                fill: '#262626',
            },
        },
    },
    true,
)


Graph.registerEdge(
    'bpmn-edge',
    {
        inherit: 'edge',
        router: {
            name: 'normal'
        },
        attrs: {
            line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
            },
        },
    },
    true,
)

//#endregion

export interface ReteComponentProps {
    store: Store;
}


export function ReteComponent(props: ReteComponentProps) {
    const graphRef = useRef<any>();

    useEffect(() => {
        //#region 实例化图表
        const graph: Graph = new Graph({
            container: graphRef.current,
            connecting: {
                router: 'orth',
            },
            autoResize: true,
            panning: {
                enabled: true,
                eventTypes: ['leftMouseDown', 'rightMouseDown', 'mouseWheel']
            },
            interacting: {
                edgeMovable: false,
                nodeMovable: false,
            },
            selecting: {
                enabled: true,
                multiple: true,
                rubberband: false,
                movable: false,
                showNodeSelectionBox: true,
                modifiers: 'ctrl'
            },
        });
        props.store.graph = graph;
        //#endregion

        //#region 图表事件
        graph.on('selection:changed', debounce((e) => {
            props.store.onSelect(e.selected.map((d: any) => d.id));
        }, 150))
        //#endregion

        //#region 响应mobx
        autorun(() => {
            const model: Model.FromJSONData = {
                nodes: Array.from<OptionItem>(props.store.options.values()).map(d => d.model),
                edges: Array.from<EdgeMxObject>(props.store.edges.values()).map(d => d.model),
            };

            const dagreLayout = new DagreLayout({
                type: 'dagre',
                rankdir: 'LR',
                align: 'UR',
                ranksep: 30,
                nodesep: 15,
                controlPoints: true,
            });

            graph.fromJSON(dagreLayout.layout(model as any))
            graph.zoomToFit({ padding: 10, maxScale: 1 });
        })
        //#endregion
    }, []);

    return <div className="mxcn-resize" ref={graphRef}></div>;
}

