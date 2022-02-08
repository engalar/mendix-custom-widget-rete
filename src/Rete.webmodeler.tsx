import { Component, ReactNode, createElement } from "react";
import { ReteContainerProps, RetePreviewProps } from "../typings/ReteProps";

declare function require(name: string): string;

export class preview extends Component<RetePreviewProps> {
    render(): ReactNode {
        return <div>No preview available</div>;
    }
}

export function getPreviewCss(): string {
    return require("./ui/Rete.scss");
}
type VisibilityMap = {
    [P in keyof ReteContainerProps]: boolean;
};


export function getVisibleProperties(props: ReteContainerProps, visibilityMap: VisibilityMap): VisibilityMap {
    console.log(props);
    // visibilityMap.nodeConstraint = props.nodeDataSource === "xpath";
    // visibilityMap.nodeGetDataMicroflow = props.nodeDataSource === "microflow";
    // visibilityMap.nodeGetDataNanoflow = props.nodeDataSource === "nanoflow";

    return visibilityMap;
}