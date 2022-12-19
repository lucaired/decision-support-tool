import * as React from 'react';
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import './App.css';
import DecisionTreeHandler from './components/Tree/DecisionTreeHandler';
import {ForgeViewer} from "./components/ForgeViewer/viewer";
import VariantExplorerMenu from "./components/VariantExplorerMenu";
import GWPEvaluation from "./components/GWP/GWPEvaluation";
import ObjectiveEvaluationViewer from "./components/ObjectiveEvaluation/ObjectiveEvaluationViewer";

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
                            />
                            {activeVariantExplorationIndex === 0 ?
                                <ForgeViewer
                                    key={"renderer-variant-exploration"}
                                    local={true}
                                    path={'http://localhost:3000/0.svf'}
                                    //urn={urn}
                                    //testing={true}
                                    //token={token}
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
                                            Not implemented
                                        </div>
                                        : activeVariantExplorationIndex === 3 ?
                                            <div
                                                key={"objective-evaluation-variant-exploration"}
                                            >
                                                <ObjectiveEvaluationViewer
                                                    key={"objective-evaluation-viewer"}
                                                    activeVariant={activeVariant}
                                                />
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
