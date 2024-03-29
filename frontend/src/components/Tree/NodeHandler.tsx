import Button from "@mui/material/Button";
import { DecisionLevel } from "./DecisionTreeHandler";

export type DecisionTree = { 
    id: string;
    name: string;
    attributes: object;
    showNodeControl: boolean;
    decisionLevel: DecisionLevel,
    children: Array<DecisionTree>;
    ifcFile: string,
    bimReference: string;
    designEpisodeIds: string;
    pathLength: number;
};

export const setNodeProperty = (tree: DecisionTree, id: string, func: (tree: DecisionTree, id?: string, child?: DecisionTree) => void, newNode?: DecisionTree) => {
    if (tree.id === id) {
        func(tree, id, newNode)
    } else {
        if (tree.children) {
            tree.children.map((child: any) => setNodeProperty(child, id, func, newNode))
        }
    }
}


export const setParentNodeProperty = (tree: DecisionTree, id: string, func: (tree: DecisionTree, id?: string, child?: DecisionTree) => void, newNode?: DecisionTree) => {
    if (tree.children) {
        if (tree.children.some((child: DecisionTree) => child.id === id)) {
            func(tree, id, newNode)
        } else {
            if (tree.children) {
                tree.children.map((child: any) => setParentNodeProperty(child, id, func, newNode))
            }
        }
    }
}

export const toggleNodeControl = (tree: DecisionTree) => {
    tree.showNodeControl = !tree.showNodeControl;
}

export const unsetNodeControl = (tree: DecisionTree) => {
    tree.showNodeControl = false
}


export const addNodeChild = (tree: DecisionTree, id?: string, child?: DecisionTree) => {
    if (child) {
        child.pathLength = tree.pathLength + 1
        tree.children = tree.children ? [...tree.children, child] : [child]
    }
}
export const removeNodeChild = (tree: DecisionTree, nodeId?: string) => {
    if (tree.children) {
        let childIndex = tree.children.findIndex((child: DecisionTree) => child.id === nodeId)

        if (childIndex !== -1) {
            tree.children.splice(childIndex, 1)
        }
    }
}

// @ts-ignore
export function RenderNode({
    // @ts-ignore
    nodeDatum,
    // @ts-ignore
    toggleNode,
    // @ts-ignore
    foreignObjectProps,
    // @ts-ignore
    handleNodeControl,
    // @ts-ignore
    handleAddChild,
    // @ts-ignore
    handleAddSibling,
    // @ts-ignore
    handleRemoveChild,
    // @ts-ignore
    activeVariantHandler
}) {
    return (
        <g>
            <rect
                width="20"
                height="20"
                x="-10"
                fill="lightgrey"
                onClick={() => {
                    handleNodeControl(nodeDatum.id);
                    toggleNode();
                    activeVariantHandler(nodeDatum)
                }}
            />
            <foreignObject {...foreignObjectProps}>
                <div style={{ display: "flex", flexDirection: "column", color: "darkgrey", fontSize: "18pt" }}>
                    <span><strong>{nodeDatum.name} </strong></span>
                </div>
                {nodeDatum.showNodeControl &&
                    <Button variant="outlined" size="small" onClick={() => {
                        handleNodeControl(nodeDatum.id);
                        handleAddChild(nodeDatum.id);
                    }}>↓</Button>}
                {nodeDatum.showNodeControl &&
                    <Button variant="outlined" size="small" onClick={() => {
                        handleNodeControl(nodeDatum.id);
                        handleAddSibling(nodeDatum.id);
                    }}>↔</Button>}
                {nodeDatum.showNodeControl && nodeDatum.children?.length === 0 &&
                    <Button variant="outlined" size="small" onClick={() => {
                        handleNodeControl(nodeDatum.id);
                        handleRemoveChild(nodeDatum.id);
                    }}>X</Button>}
            </foreignObject>
        </g>
    )
}