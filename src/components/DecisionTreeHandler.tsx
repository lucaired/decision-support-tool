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

const setNodeControl = (tree: DecisionTree) => {
        tree.showNodeControl = !tree.showNodeControl;
}

const addNodeChild = (tree: DecisionTree) => {
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
function RenderNode({nodeDatum, toggleNode, foreignObjectProps, handleNodeControl, handleAddChild}) {
    return (
        <g>
            <rect
                width="20"
                height="20"
                x="-10"
                onClick={() => {
                    toggleNode();
                    handleNodeControl(nodeDatum.id);
                }}
            />
            <foreignObject {...foreignObjectProps}>
                <p>{nodeDatum.name}</p>
                {nodeDatum.showNodeControl &&
                    <button onClick={() => {
                        handleAddChild(nodeDatum.id);
                        handleNodeControl(nodeDatum.id);
                    }}>+</button>}
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
        var tree = {...decisionTree}
        setNodeProperty(tree, id, setNodeControl)
        setDecisionTree(tree)
    }
    const handleAddChild = (parentId: number) => {
        var tree = {...decisionTree}
        setNodeProperty(tree, parentId, addNodeChild)
        setDecisionTree(tree)
    }

    const nodeSize = { x: 200, y: 200 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };

    return <div id="treeWrapper" style={{width: "100em", height: "50em"}}>
        <Tree
            data={decisionTree}
            orientation={"vertical"}
            dimensions={{
                "width": 800,
                "height": 500
            }}
            renderCustomNodeElement={(rd3tProps) =>
                RenderNode({
                    ...rd3tProps, foreignObjectProps, handleNodeControl: handleNodeControl, handleAddChild: handleAddChild
                })
            }
        />
    </div>;
}

export default DecisionTreeHandler
