import { useUnmount } from "ahooks";
import { createElement, useEffect, useMemo } from "react";


import { XflowContainerProps } from "../typings/XflowProps";
import { XflowComponent } from "./components/XflowComponent";
import { Store } from "./store";

import "./ui/Xflow.scss";

const parseStyle = (style = ""): { [key: string]: string } => {
    try {
        return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
            const pair = line.split(":");
            if (pair.length === 2) {
                const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                styleObject[name] = pair[1].trim();
            }
            return styleObject;
        }, {});
    } catch (_) {
        return {};
    }
};

export default function (props: XflowContainerProps) {
    const store = useMemo(() => new Store(props), []);

    useEffect(() => {
        store.mxOption = props;
        return () => {
        }
    }, [store, props])

    useUnmount(() => {
        store.dispose();
    })

    return <div style={parseStyle(props.style)}>
        <XflowComponent store={store}></XflowComponent>
    </div>;
}
