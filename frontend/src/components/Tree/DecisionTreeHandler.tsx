import * as React from 'react';
import {useState} from 'react';
import { useEffect } from 'react';
import Tree from "react-d3-tree";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import {
    addNodeChild,
    removeNodeChild,
    RenderNode,
    toggleNodeControl,
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
    border: '2px solid #1976d2',
    boxShadow: 24,
    p: 4,
};

export type DecisionLevel = 'construction' | 'building-part'

// @ts-ignore
function DecisionTreeHandler({activeVariantHandler, activeVariant, activeProjectTree, activeProjectTreeHandler}) {

    // node handlers
    const [activeNode, setActiveNode] = useState({})
    const [activeAction, setModalActiveAction] = useState('')

    const handleNodeControl = (nodeId: string) => {
        // @ts-ignore
        let tree = {...activeProjectTree};
        setNodeProperty(tree, nodeId, toggleNodeControl);
        activeProjectTreeHandler(tree);
    }

    const handleRemoveChild = (nodeId: string) => {
        // @ts-ignore
        let tree = {...activeProjectTree};
        setParentNodeProperty(tree, nodeId, removeNodeChild);
        activeProjectTreeHandler(tree);
    }

    // modal handling
    const handleAddChild = (nodeId: string) => {
        setActiveNode({id: nodeId})
        setModalActiveAction("addNodeChild")
        handleNodeModalOpen()
    }

    const handleAddSibling = (nodeId: string) => {
        setActiveNode({id: nodeId})
        setModalActiveAction("addNodeSibling")
        handleNodeModalOpen()
    }

    const [nodeModalOpen, setNodeModalOpen] = React.useState(false);
    
    const handleNodeModalOpen = () => setNodeModalOpen(true);
    
    const handleNodeModalClose = () => {
        setNodeModalOpen(false);
        setModalActiveAction('')
    }

    const nodeSize = {x: 300, y: 200};
    const foreignObjectProps = {width: nodeSize.x, height: nodeSize.y, x: 20};

    return <div id="treeWrapper" style={{height: "308px"}}>
        {activeProjectTree && <Tree
            data={activeProjectTree}
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
                    activeVariantHandler: activeVariantHandler
                })
            }
        />}
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={nodeModalOpen}
            onClose={handleNodeModalClose}
            closeAfterTransition
        >
            <Fade in={nodeModalOpen}>
                <Box sx={modalStyle}>
                    <h1>New design variant</h1>
                    {activeAction === 'addNodeChild' &&
                    <VariantCreatorStepper
                        decisionTree={activeProjectTree}
                        setDecisionTree={activeProjectTreeHandler}
                        setProperty={setNodeProperty}
                        addProperty={addNodeChild}
                        activeNodeId={activeNode}
                        setActiveNodeId={setActiveNode}
                        handleNodeModalClose={handleNodeModalClose}
                    />}
                    {activeAction === 'addNodeSibling' &&
                        <VariantCreatorStepper
                            decisionTree={activeProjectTree}
                            setDecisionTree={activeProjectTreeHandler}
                            setProperty={setParentNodeProperty}
                            addProperty={addNodeChild}
                            activeNodeId={activeNode}
                            setActiveNodeId={setActiveNode}
                            handleNodeModalClose={handleNodeModalClose}
                        />}
                </Box>
            </Fade>
        </Modal>
    </div>;
}

export default DecisionTreeHandler
