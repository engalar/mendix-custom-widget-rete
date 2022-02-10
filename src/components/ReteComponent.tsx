import { createElement, useEffect, useRef } from "react";
import { DagreLayout } from '@antv/layout';
import { Store } from "../store";

import { Graph, Model } from '@antv/x6';
import { autorun } from "mobx";


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
            }
        });


        autorun(() => {
            const model: Model.FromJSONData = {
                nodes: props.store.options?.map(d => d.model),
                edges: props.store.edgets?.map(d => d.model),
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

    }, []);

    return <div className="mxcn-resize" ref={graphRef}></div>;
}

