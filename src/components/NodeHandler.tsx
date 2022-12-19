export type DecisionTree = { id: string; name: string; attributes: object; showNodeControl: any; children: any };

export const setNodeProperty = (tree: DecisionTree, id: string, func: (tree: DecisionTree) => void) => {
    if (tree.id === id) {
        func(tree)
    } else {
        if (tree.children) {
            tree.children.map((child: any) => setNodeProperty(child, id, func))
        }
    }
}
export const setParentNodeProperty = (tree: DecisionTree, id: string, func: (tree: DecisionTree, id?: string) => void) => {
    if (tree.children) {
        if (tree.children.some((child: DecisionTree) => child.id === id)) {
            func(tree, id)
        } else {
            if (tree.children) {
                tree.children.map((child: any) => setParentNodeProperty(child, id, func))
            }
        }
    }
}
export const setNodeControl = (tree: DecisionTree) => {
    tree.showNodeControl = !tree.showNodeControl;
}
export const addNodeChild = (tree: DecisionTree) => {
    // TODO: make this collision-proof
    const id = (Math.random() + 1).toString(36).substring(7);
    const child = {
        name: id,
        attributes: {
            level: 'Building Part Type',
        },
        id: id,
        showNodeControl: false,
    }
    tree.children = tree.children ? [...tree.children, child] : [child]
}
export const removeNodeChild = (tree: DecisionTree, nodeId?: string) => {
    if (tree.children) {
        const childIndex = tree.children.indexOf((child: DecisionTree) => child.id == nodeId, 0)
        tree.children.splice(childIndex, 1)
        if (tree.children.lenght == 0) {
            tree.children = undefined
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
                onClick={() => {
                    handleNodeControl(nodeDatum.id);
                    toggleNode();
                }}
            />
            <foreignObject {...foreignObjectProps}>
                <p>{nodeDatum.name}</p>
                {nodeDatum.showNodeControl &&
                    <button onClick={() => {
                        handleNodeControl(nodeDatum.id);
                        handleAddChild(nodeDatum.id);
                    }}>↓</button>}
                {nodeDatum.showNodeControl &&
                    <button onClick={() => {
                        handleNodeControl(nodeDatum.id);
                        handleAddSibling(nodeDatum.id);
                    }}>↔</button>}
                {nodeDatum.showNodeControl && !nodeDatum.children &&
                    <button onClick={() => {
                        handleNodeControl(nodeDatum.id);
                        handleRemoveChild(nodeDatum.id);
                    }}>X</button>}
            </foreignObject>
        </g>
    )
}