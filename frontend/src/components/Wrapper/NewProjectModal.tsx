import * as React from 'react';
import { Box, Button, Fade, Modal } from "@mui/material";
import StringPropInput from '../Tree/NodeStringPropInput';

interface NewProjectModalProps {
    showModal: boolean; 
    showProjectCreateModalHandler: (state: boolean) => void; 
    saveProjectHandler: (newProject: object)=>void
}

export function NewProjectModal({
    showModal, 
    showProjectCreateModalHandler, 
    saveProjectHandler
}: NewProjectModalProps
    ) {
        // local state
        const [project, setProject] = React.useState({
            name: '',
            "Design Quality": '1',
            "Comfort and health": '1',
            "Functionality": '1',
        });

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

        const saveProject = () => {
            const newProject = {
                name: project.name,
                weightsSet: {
                    "Design Quality": parseFloat(project["Design Quality"]),
                    "Comfort and health": parseFloat(project["Comfort and health"]),
                    "Functionality": parseFloat(project["Functionality"])
                },
                "tree": {
                    "name": "V2-2",
                    "attributes": {
                        "level": "Building Level"
                    },
                    "id": "h1aab",
                    "ifcFile": "V2-2.ifc",
                    "bimReference": "<some-urn>",
                    "decisionLevel": "construction",
                    "children": []
                }
            }
            setProject({
                name: '',
                "Design Quality": '1',
                "Comfort and health": '1',
                "Functionality": '1',
            })
            saveProjectHandler(newProject)
            showProjectCreateModalHandler(false)
        }
    
        return <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={showModal}
            onClose={() => {
                showProjectCreateModalHandler(false)
            }}
            closeAfterTransition
        >
            <Fade in={showModal}>
                <Box sx={modalStyle}>
                    <h1>Create new project</h1>
                    <StringPropInput
                        target={project}
                        updateFunction={setProject}
                        property={"name"}
                        propertyName={"Enter Name"}
                    />
                    <h2>Evaluation criteria group weights</h2>
                    <StringPropInput
                        target={project}
                        updateFunction={setProject}
                        property={"Design Quality"}
                        propertyName={"Design Quality"}
                    />
                    <StringPropInput
                        target={project}
                        updateFunction={setProject}
                        property={"Comfort and health"}
                        propertyName={"Comfort and health"}
                    />
                    <StringPropInput
                        target={project}
                        updateFunction={setProject}
                        property={"Functionality"}
                        propertyName={"Functionality"}
                    />
                    <Button onClick={saveProject}>
                        Save
                </Button>
                </Box>
            </Fade>
        </Modal>;
}