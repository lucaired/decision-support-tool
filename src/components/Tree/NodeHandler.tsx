import Button from "@mui/material/Button";

export type DecisionTree = { id: string; name: string; attributes: object; showNodeControl: any; children: Array<DecisionTree>; neo4JReference: string, bimReference: string };

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
export const setNodeControl = (tree: DecisionTree) => {
    tree.showNodeControl = !tree.showNodeControl;
}
export const addNodeChild = (tree: DecisionTree, id?: string, child?: DecisionTree) => {
    if (child) {
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
                               handleRemoveChild
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
                }}
            />
            <foreignObject {...foreignObjectProps}>
                <p>{nodeDatum.name}</p>
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
                {nodeDatum.showNodeControl &&
                    <Button variant="outlined" size="small" onClick={() => {
                    }}>G</Button>}
                {nodeDatum.showNodeControl && nodeDatum.children?.length === 0 &&
                    <Button variant="outlined" size="small" onClick={() => {
                        handleNodeControl(nodeDatum.id);
                        handleRemoveChild(nodeDatum.id);
                    }}>X</Button>}
            </foreignObject>
        </g>
    )
}