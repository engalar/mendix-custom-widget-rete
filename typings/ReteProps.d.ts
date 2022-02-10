/**
 * This file was generated from Rete.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

interface CommonProps {
    name: string;
    class: string;
    tabIndex: number;

    uniqueid: string;
    friendlyId?: string;
    mxform: mxui.lib.form._FormBase;
    mxObject?: mendix.lib.MxObject;
    style: string;
}

interface _W {
    // activityLabel: "Label"
    // activityType: "NodeType"
    // activitys: "MyFirstModule.Helper_DummyNode/MyFirstModule.DummyNode"
    // class: "mx-name-rete1 "
    // edges: "MyFirstModule.Helper_DummyEdge/MyFirstModule.DummyEdge"
    // entitySelect: "MyFirstModule.Helper_DummyNode_Select/MyFirstModule.DummyNode"
    // entitySource: "MyFirstModule.DummyEdge_DummyNode_Source/MyFirstModule.DummyNode"
    // entityTarget: "MyFirstModule.DummyEdge_DummyNode_Target/MyFirstModule.DummyNode"
    // friendlyId: "MyFirstModule.Home.rete1"
    // mfSelect: "MyFirstModule.Act_Select"

    activityLabel: string;
    activityType: string;
    activitys: string;
    class: string;
    edges: string;
    entitySelect: string;
    entitySource: string;
    entityTarget: string;
    friendlyId: string;
    mfSelect: string;
}

export interface ReteContainerProps extends _W, CommonProps {}

export interface RetePreviewProps extends _W {
    class: string;
    style: string;
    styleObject: CSSProperties;
}

export interface VisibilityMap extends _W {}
