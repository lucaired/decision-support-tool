import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {DecisionTree} from "./NodeHandler";
import NodeStringPropInput from './NodeStringPropInput';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'localhost'

const steps = ['Enter basic information', 'Forge urn', 'IFC file name', 'Upload IFC file', 'Design Episodes', 'Variant image resources'];

export default function VariantCreatorStepper({
// @ts-ignore
                                                  decisionTree,
// @ts-ignore
                                                  setDecisionTree,
// @ts-ignore
                                                  setProperty,
// @ts-ignore

                                                  addProperty,
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
        id: (Math.random() + 1).toString(36).substring(2),
        showNodeControl: false,
        ifcFile: 'V1-1.ifc',
        decisionLevel: 'construction',
        bimReference: '',
        designEpisodeIds: ''
    })

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleComplete = () => {
        let tree = {...decisionTree};
        setProperty(tree, activeNode.id, addProperty, node)
        setDecisionTree(tree)
        sendIfcFile()
        sendImageFiles()
        setActiveNodeId({id: undefined})
        setActiveStep(0);
        handleNodeModalClose()
    };

    // ifc file upload
    const [file, setFile] = React.useState<File>();
  
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) {
        return;
      }
      const file = e.target.files[0];
      setFile(file);  
    };

    const sendIfcFile = () => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        let formData = new FormData();
        //@ts-ignore
        formData.append('file', file)
          
        axios.post(`http://${backendUrl}:80/ifc/transform`, formData, config)
        .then(function (response) {
        console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
        console.log(error);
        });
    }

    // ifc file upload
    const [images, setImages] = React.useState<FileList>();

    const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
        return;
        }
        const files = e.target.files;
        setImages(files);  
    };

    const sendImageFiles = () => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        let formData = new FormData();
        //@ts-ignore
        for (const file of images) {
            formData.append('files', file)
        }
            
        axios.post(`http://${backendUrl}:80/projects/variant/${node.id}/images`, formData, config)
        .then(function (response) {
        console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
        console.log(error);
        });
    }

    return (
        <Box sx={{width: '100%'}}>
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
                        <Button onClick={handleComplete}>Complete</Button>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                        {activeStep === 0 && (<div>
                            <NodeStringPropInput
                                target={node}
                                updateFunction={setNode}
                                property={'name'}
                                propertyName={'Name'}
                            />
                        </div>)
                        }
                        {activeStep === 1 && <NodeStringPropInput
                            target={node}
                            updateFunction={setNode}
                            property={'bimReference'}
                            propertyName={'BIM Reference'}
                        />}
                        {activeStep === 2 && <NodeStringPropInput
                            target={node}
                            updateFunction={setNode}
                            property={'ifcFile'}
                            propertyName={'Ifc filename'}
                        />}
                        {activeStep === 3 && <Button variant="contained" component="label">
                            Upload IFC File
                            <input
                                type="file"
                                hidden
                                accept=".ifc"
                                onChange={handleFileUpload}
                            />
                            </Button>}
                        {activeStep === 4 && <NodeStringPropInput
                            target={node}
                            updateFunction={setNode}
                            property={'designEpisodeIds'}
                            propertyName={'Design Episode IDs'}
                        />}
                        {activeStep === 5 && <Button variant="contained" component="label">
                            Upload Variant image resource
                            <input
                                type="file"
                                hidden
                                accept="image/png, image/jpeg"
                                onChange={handleImageFilesUpload}
                            />
                            </Button>}
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
