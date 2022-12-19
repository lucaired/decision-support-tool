import {useState} from 'react';
import Tree from "react-d3-tree";
import {
    addNodeChild,
    removeNodeChild,
    RenderNode,
    setNodeControl,
    setNodeProperty,
    setParentNodeProperty
} from "./NodeHandler";

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

    const handleNodeControl = (nodeId: string) => {
        let tree = {...decisionTree};
        setNodeProperty(tree, nodeId, setNodeControl)
        setDecisionTree(tree)
    }
    const handleAddChild = (nodeId: string) => {
        let tree = {...decisionTree};
        setNodeProperty(tree, nodeId, addNodeChild)
        setDecisionTree(tree)
    }
    const handleRemoveChild = (nodeId: string) => {
        let tree = {...decisionTree};
        setParentNodeProperty(tree, nodeId, removeNodeChild)
        setDecisionTree(tree)
    }
    const handleAddSibling = (nodeId: string) => {
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
            // dimensions={{
            //    "width": 1200,
            //    "height": 800
            // }}
            renderCustomNodeElement={(rd3tProps) =>
                RenderNode({
                    ...rd3tProps,
                    foreignObjectProps,
                    handleNodeControl: handleNodeControl,
                    handleAddChild: handleAddChild,
                    handleAddSibling: handleAddSibling,
                    handleRemoveChild: handleRemoveChild,
                })
            }
        />
    </div>;
}

export default DecisionTreeHandler
