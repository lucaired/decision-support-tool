import * as React from 'react';
import { Box, Button, Fade, Modal, Step, StepLabel, Stepper, Typography } from "@mui/material";
import StringPropInput from '../Tree/NodeStringPropInput';
import { node } from 'prop-types';
import NodeStringPropInput from '../Tree/NodeStringPropInput';
import NodeStringPropSelect from '../Tree/NodeStringPropSelect';

interface NewProjectModalProps {
    showModal: boolean; 
    showProjectCreateModalHandler: (state: boolean) => void; 
    saveProjectHandler: (newProject: object)=>void
}

const steps = ['Enter project information', 'Root variant', 'Upload BIM', 'Enter Neo4j graph reference'];
const emptyProject = {
    name: '',
    "weightsSets Design Quality": '1',
    "weightsSets Comfort and health": '1',
    "weightsSets Functionality": '1',
    treeName: '',
    treeBimReference: '',
    treeIfcFile: '',
}

export function NewProjectModal({
    showModal, 
    showProjectCreateModalHandler, 
    saveProjectHandler
}: NewProjectModalProps
    ) {
        // local state
        //@ts-ignore
        const [project, setProject] = React.useState(emptyProject);

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
                weightsSets: {
                    "Design Quality": parseFloat(project["weightsSets Design Quality"]),
                    "Comfort and health": parseFloat(project["weightsSets Comfort and health"]),
                    "Functionality": parseFloat(project["weightsSets Functionality"])
                },
                tree: {
                    name: project.treeName,
                    bimReference: project.treeBimReference,
                    ifcFile: project.treeIfcFile,
                    attributes: {
                        level: "Building Level"
                    },
                    id: (Math.random() + 1).toString(36).substring(8),
                    decisionLevel: "construction",
                    children: [],
                    showNodeControl: false
                }
            }
            saveProjectHandler(newProject);
            setProject(emptyProject);
            showProjectCreateModalHandler(false);
            setActiveStep(0);
        }

        const handleNext = () => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        };
    
        const handleBack = () => {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        };

        const [activeStep, setActiveStep] = React.useState(0);
    
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
                    <Stepper activeStep={activeStep}>
                    {steps.map((label) => {
                        const stepProps: { completed?: boolean } = {};
                        const labelProps: {} = {};
                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                    </Stepper>
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            <Typography sx={{mt: 2, mb: 1}}>
                                All steps completed - you&apos;re finished
                            </Typography>
                            <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                                <Box sx={{flex: '1 1 auto'}}/>
                                <Button onClick={saveProject}>Complete</Button>
                            </Box>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                                {activeStep === 0 && (<div>
                                    <h3>Project name</h3>
                                    <StringPropInput
                                        target={project}
                                        updateFunction={setProject}
                                        property={'name'}
                                        propertyName={'Name'}
                                    />
                                    <h3>Evaluation criteria group weights</h3>
                                    <StringPropInput
                                        target={project}
                                        updateFunction={setProject}
                                        property={"weightsSets Design Quality"}
                                        propertyName={"Design Quality"}
                                    />
                                    <StringPropInput
                                        target={project}
                                        updateFunction={setProject}
                                        property={"weightsSets Comfort and health"}
                                        propertyName={"Comfort and health"}
                                    />
                                    <StringPropInput
                                        target={project}
                                        updateFunction={setProject}
                                        property={"weightsSets Functionality"}
                                        propertyName={"Functionality"}
                                    />
                                </div>)}
                                {activeStep === 1 && <StringPropInput
                                    /* @ts-ignore */
                                    target={project}
                                    updateFunction={setProject}
                                    property={'treeName'}
                                    propertyName={'Name'}
                                />}
                                {activeStep === 2 && <StringPropInput
                                    /* @ts-ignore */
                                    target={project}
                                    updateFunction={setProject}
                                    property={'treeBimReference'}
                                    propertyName={'Urn Reference'}
                                />}
                                {activeStep === 3 && <StringPropInput
                                    /* @ts-ignore */
                                    target={project}
                                    updateFunction={setProject}
                                    property={'treeIfcFile'}
                                    propertyName={'Neo4j Reference'}
                                />}
                                <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                                    <Button
                                        color="inherit"
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        sx={{mr: 1}}
                                    >
                                        Back
                                    </Button>
                                    <Box sx={{flex: '1 1 auto'}}/>
                                    <Button onClick={handleNext}>
                                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </Box>
                        </React.Fragment>
                    )}
                </Box>
            </Fade>
        </Modal>;
}