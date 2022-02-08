import { createElement, useEffect, useRef } from "react";
import { Store } from "../store";

import { Edge, Graph, Model, Node } from '@antv/x6'
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

export interface XflowComponentProps {
    store: Store;
}


export function XflowComponent(props: XflowComponentProps) {
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
                nodes: [{
                    "id": "start",
                    "shape": "event",
                    "width": 40,
                    "height": 40,
                    "position": {
                        "x": -20,
                        "y": -20
                    }
                },
                {
                    "id": "end",
                    "shape": "event",
                    "width": 40,
                    "height": 40,
                    "position": {
                        "x": -20,
                        "y": -20 + 500
                    },
                    "attrs": {
                        "body": {
                            "strokeWidth": 4
                        }
                    }
                }],
                edges: [],
            };
            let edgetId = 0;
            let nodes: Node.Metadata[] = [];
            let edges: Edge.Metadata[] = [];
            props.store.options?.forEach((item, idx, array) => {
                edges.push({
                    "id": `f${edgetId}`,
                    "shape": "bpmn-edge",
                    "source": "start",
                    "target": item.guid
                }, {
                    "id": `t${edgetId}`,
                    "shape": "bpmn-edge",
                    "source": item.guid,
                    "target": "end"
                })
                edgetId += 1;
                nodes.push({
                    "id": item.guid,
                    "shape": "activity",
                    "width": 100,
                    "height": 60,
                    "position": {
                        "x": -50 + 120 * (idx - (array.length - 1) / 2),
                        "y": 220
                    },
                    "label": item.label
                })
            })

            model.nodes!.splice(0, 0, ...nodes);
            model.edges!.splice(0, 0, ...edges);

            graph.fromJSON(model)
            graph.zoomToFit({ padding: 10, maxScale: 1 });
        })

    }, []);

    return <div className="mxcn-resize" ref={graphRef}></div>;
}

