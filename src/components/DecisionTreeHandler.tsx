import * as React from 'react';
import {useState} from 'react';
import Tree from "react-d3-tree";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import {
    addNodeChild,
    removeNodeChild,
    RenderNode,
    setNodeControl,
    setNodeProperty,
    setParentNodeProperty
} from "./NodeHandler";
import VariantCreatorStepper from "./NodeCreator";

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function DecisionTreeHandler() {
    // node handling
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
        // node handlers
    })
    const [activeNode, setActiveNode] = useState({})
    const handleNodeControl = (nodeId: string) => {
        let tree = {...decisionTree};
        setNodeProperty(tree, nodeId, setNodeControl)
        setDecisionTree(tree)
    }
    const handleAddChild = (nodeId: string) => {
        setActiveNode({id: nodeId})
        handleNodeModalOpen()
    }
    const handleRemoveChild = (nodeId: string) => {
        let tree = {...decisionTree};
        setParentNodeProperty(tree, nodeId, removeNodeChild)
        setDecisionTree(tree)
    }
    const handleAddSibling = (nodeId: string) => {
        // let tree = {...decisionTree};
        // setParentNodeProperty(tree, nodeId, addNodeChild)
        // setDecisionTree(tree)
    }

    // modal handling
    const [nodeModalOpen, setNodeModalOpen] = React.useState(false);
    const handleNodeModalOpen = () => setNodeModalOpen(true);
    const handleNodeModalClose = () => setNodeModalOpen(false);


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
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={nodeModalOpen}
            onClose={handleNodeModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={nodeModalOpen}>
                <Box sx={modalStyle}>
                    <h1>New design variant</h1>
                    <VariantCreatorStepper
                        decisionTree={decisionTree}
                        setDecisionTree={setDecisionTree}
                        setNodeProperty={setNodeProperty}
                        addNodeChild={addNodeChild}
                        activeNodeId={activeNode}
                        setActiveNodeId={setActiveNode}
                        handleNodeModalClose={handleNodeModalClose}
                    />
                </Box>
            </Fade>
        </Modal>
    </div>;
}

export default DecisionTreeHandler
