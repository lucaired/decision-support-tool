import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {DecisionTree} from "./NodeHandler";
import NodeName from './NodeName';

const steps = ['Enter basic information', 'Upload BIM', 'Enter Neo4j graph reference'];

export default function VariantCreatorStepper({
// @ts-ignore
                                                  decisionTree,
// @ts-ignore
                                                  setDecisionTree,
// @ts-ignore
                                                  setNodeProperty,
// @ts-ignore

                                                  addNodeChild,
// @ts-ignore
                                                  activeNodeId: activeNode,
// @ts-ignore
                                                  setActiveNodeId,
// @ts-ignore
                                                  handleNodeModalClose
                                              }) {

    const [activeStep, setActiveStep] = React.useState(0);
    const [node, setNode] = React.useState<DecisionTree>({
        children: [],
        name: '',
        attributes: {
            level: 'Building Part Type',
        },
        id: (Math.random() + 1).toString(36).substring(7),
        showNodeControl: false
    })

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleComplete = () => {
        let tree = {...decisionTree};
        setNodeProperty(tree, activeNode.id, addNodeChild, node)
        setDecisionTree(tree)
        setActiveNodeId({id: undefined})
        setActiveStep(0);
        handleNodeModalClose()
    };

    return (
        <Box sx={{width: '100%'}}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
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
                        <Button onClick={handleComplete}>Complete</Button>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                        {activeStep == 0 && <NodeName
                            node={node}
                            setNode={setNode}
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
    );
}
