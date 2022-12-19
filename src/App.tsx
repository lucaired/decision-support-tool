import * as React from 'react';
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import './App.css';
import DecisionTreeHandler from './components/Tree/DecisionTreeHandler';
import {ForgeViewer} from "./components/ForgeViewer/viewer";
import VariantExplorerMenu from "./components/VariantExplorerMenu";
import GWPEvaluation from "./components/GWP/GWPEvaluation";
import SubjectiveEvaluationViewer from "./components/SubjectiveEvaluation/SubjectiveEvaluationViewer";
import DesignEpisode from "./components/DesignRationale/DesignEpisode";

function App() {
    const [activeVariantExplorationIndex, setActiveVariantExplorationIndex] = React.useState(1);
    const activeVariantExplorationHandler = (index: number) => {
        if (0 <= index && index <= 3) {
            setActiveVariantExplorationIndex(index)
        }
    }

    const [activeVariant, setActiveVariant] = React.useState({});
    // @ts-ignore
    const activeVariantHandler = (variant) => {
        setActiveVariant(variant)
    }

    function isEmptyObject(activeVariant: {}) {
        return activeVariant // 👈 null and undefined check
        && Object.keys(activeVariant).length === 0
        && Object.getPrototypeOf(activeVariant) === Object.prototype
    }

    // @ts-ignore
    return (
        <div className="App" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        }}>
            <Box>
                <Card variant="outlined">
                    <React.Fragment>
                        <CardContent
                            style={{
                                height: '430px'
                            }}
                        >
                            <DecisionTreeHandler
                                activeVariantHandler={activeVariantHandler}
                            />
                        </CardContent>
                    </React.Fragment>
                </Card>
            </Box>
            {!isEmptyObject(activeVariant) && <Box>
                <Card variant="outlined">
                    <React.Fragment>
                        <CardContent
                            style={{
                                minHeight: '630px'
                            }}
                        >
                            <VariantExplorerMenu
                                activeVariantExplorationHandler={activeVariantExplorationHandler}
                                activeVariantExplorationIndex={activeVariantExplorationIndex}
                            />
                            {activeVariantExplorationIndex === 0 ?
                                <ForgeViewer
                                    key={"renderer-variant-exploration"}
                                    // local={true}
                                    // testing={true}
                                    // path={'http://localhost:3000/0.svf'}
                                    urn={'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGVjaXNpb24tc3VwcG9ydC1idWNrZXQvVjItMS5pZmM'}
                                    token={'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJjb2RlOmFsbCIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImJ1Y2tldDpyZWFkIl0sImNsaWVudF9pZCI6Im93N2xLY0VrbFlXNjVkUW9VMFZxWFVkd0JudFd6VkhRIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2Fqd3RleHA2MCIsImp0aSI6IkpFNnowSUtQYXVocWxGWUtQWGxZV0hSbEVRWkNmUW1RYmU1VTh5bk1ZVzRnSWNWQnB4Z0ZnbUFlYzhrdmRyNm0iLCJleHAiOjE2NjkxMTQ3MzB9.BYrblH-Crcw-h7cP2wbkHVObTZ8l7VTdeeTAd-dmlEYO1A3L40iCEo5MO4drcUsALXWVTcZZX-5qmasoT1hWwawLYzTuzHF63mcznR-I-oVDixa9oOPwjgtGW8XSy1SaKbhyyi88l-W7OneAYXdpG8bFnFNclTrqYURJB-lWM2qB0bWVuZZtzECfaG_FV-ddQE-9unMGlm8ERemkqlsL5MAPRDCCvCPqZEV-xY5uyO1t2hamudMrE-yaYx32gjyHYcOI6-FdiN6R4GuSDwHvcLzhEVGwJoRrSzZEh1UI5XjyHzE6EL-tEN7sVoN48CI8GeZBitiUojqThkKW3DaRXQ'}
                                /> :
                                activeVariantExplorationIndex === 1 ?
                                    <GWPEvaluation
                                        key={"gwp-variant-exploration"}
                                        activeVariant={activeVariant}
                                    /> :
                                    activeVariantExplorationIndex === 2 ?
                                        <div
                                            key={"design-rationale-variant-exploration"}
                                        >
                                            <DesignEpisode/>
                                        </div>
                                        : activeVariantExplorationIndex === 3 ?
                                            <div
                                                key={"subjective-evaluation-variant-exploration"}
                                            >
                                                <SubjectiveEvaluationViewer
                                                    key={"subjective-evaluation-viewer"}
                                                    // @ts-ignore
                                                    activeVariantId={activeVariant.id}
                                                />
                                            </div>
                                            : activeVariantExplorationIndex === 4 ?
                                                <div
                                                    key={"subjective-evaluation-exploration"}
                                                >
                                                    Not implemented
                                                </div> :
                                            <GWPEvaluation
                                                activeVariant={activeVariant}
                                            />
                            }
                        </CardContent>
                    </React.Fragment>
                </Card>
            </Box>}
        </div>
    );
}

export default App;
