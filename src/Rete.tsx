import { useUnmount } from "ahooks";
import classNames from "classnames";
import { createElement, useEffect, useMemo } from "react";


import { ReteContainerProps } from "../typings/ReteProps";
import { ReteComponent } from "./components/ReteComponent";
import { Store } from "./store";

import "./ui/Rete.scss";

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

export default function (props: ReteContainerProps) {
    const store = useMemo(() => new Store(props), []);

    useEffect(() => {
        store.mxOption = props;
        return () => {
        }
    }, [store, props])

    useUnmount(() => {
        store.dispose();
    })

    return <div className={classNames(props.class)} style={parseStyle(props.style)}>
        <ReteComponent store={store}></ReteComponent>
    </div>;
}
