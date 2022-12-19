import {useState} from 'react';
import Tree from "react-d3-tree";

type DecisionTree = { id: any; showNodeControl: any; children: any };

const setNodeProperty = (tree: DecisionTree, id: number, func: (tree: DecisionTree) => void) => {
    if (tree.id === id) {
        func(tree)
    } else {
        if (tree.children) {
            tree.children.map((child: any) => setNodeProperty(child, id, func))
        }
    }
}

const setParentNodeProperty = (tree: DecisionTree, id: number, func: (tree: DecisionTree) => void) => {
    if (tree.children){
        if (tree.children.some((child: DecisionTree) => child.id === id)) {
            func(tree)
        } else {
            if (tree.children) {
                tree.children.map((child: any) => setParentNodeProperty(child, id, func))
            }
        }
    }
}


const setNodeControl = (tree: DecisionTree) => {
    tree.showNodeControl = !tree.showNodeControl;
}

const addNodeChild = (tree: DecisionTree) => {
    // TODO: make this collision-proof
    const id = (Math.random() + 1).toString(36).substring(7);
    const child = {
        name: 'Wood frame 1',
        attributes: {
            level: 'Building Part Type',
        },
        id: id,
        showNodeControl: false,
    }
    tree.children = tree.children ? [...tree.children, child] : [child]
}

// @ts-ignore
function RenderNode({nodeDatum, toggleNode, foreignObjectProps, handleNodeControl, handleAddChild, handleAddSibling}) {
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
                    }}>X</button>}
            </foreignObject>
        </g>
    )
}

function DecisionTreeHandler() {
    const [decisionTree, setDecisionTree] = useState({
        name: 'Building.Lab Project',
        attributes: {
            level: 'Building Level',
        },
        id: (Math.random() + 1).toString(36).substring(7),
        showNodeControl: false,
        children: [
            {
                name: 'Bricks',
                attributes: {
                    level: 'Construction Type',
                },
                id: (Math.random() + 1).toString(36).substring(7),
                showNodeControl: false,
            },
            {
                name: 'Wood',
                attributes: {
                    level: 'Construction Type',
                },
                id: (Math.random() + 1).toString(36).substring(7),
                showNodeControl: false,
            },
            {
                name: 'Reinforced Concrete',
                attributes: {
                    level: 'Construction Type',
                },
                id: (Math.random() + 1).toString(36).substring(7),
                showNodeControl: false,
            },
        ],
    })

    const handleNodeControl = (id: number) => {
        let tree = {...decisionTree};
        setNodeProperty(tree, id, setNodeControl)
        setDecisionTree(tree)
    }
    const handleAddChild = (nodeId: number) => {
        let tree = {...decisionTree};
        setNodeProperty(tree, nodeId, addNodeChild)
        setDecisionTree(tree)
    }

    const handleAddSibling = (nodeId: number) => {
        let tree = {...decisionTree};
        setParentNodeProperty(tree, nodeId, addNodeChild)
        setDecisionTree(tree)
    }

    const nodeSize = {x: 200, y: 200};
    const foreignObjectProps = {width: nodeSize.x, height: nodeSize.y, x: 20};

    return <div id="treeWrapper" style={{width: "1200px", height: "800px"}}>
        <Tree
            data={decisionTree}
            orientation={"vertical"}
            dimensions={{
                "width": 1200,
                "height": 800
            }}
            renderCustomNodeElement={(rd3tProps) =>
                RenderNode({
                    ...rd3tProps,
                    foreignObjectProps,
                    handleNodeControl: handleNodeControl,
                    handleAddChild: handleAddChild,
                    handleAddSibling: handleAddSibling,
                })
            }
        />
    </div>;
}

export default DecisionTreeHandler
