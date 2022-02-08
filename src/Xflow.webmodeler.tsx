import { Component, ReactNode, createElement } from "react";
import { XflowContainerProps, XflowPreviewProps } from "../typings/XflowProps";

declare function require(name: string): string;

export class preview extends Component<XflowPreviewProps> {
    render(): ReactNode {
        return <div>No preview available</div>;
    }
}

export function getPreviewCss(): string {
    return require("./ui/Xflow.scss");
}
type VisibilityMap = {
    [P in keyof XflowContainerProps]: boolean;
};


export function getVisibleProperties(props: XflowContainerProps, visibilityMap: VisibilityMap): VisibilityMap {
    console.log(props);
    // visibilityMap.nodeConstraint = props.nodeDataSource === "xpath";
    // visibilityMap.nodeGetDataMicroflow = props.nodeDataSource === "microflow";
    // visibilityMap.nodeGetDataNanoflow = props.nodeDataSource === "nanoflow";

    return visibilityMap;
}