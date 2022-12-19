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
                                    token={'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJjb2RlOmFsbCIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImJ1Y2tldDpyZWFkIl0sImNsaWVudF9pZCI6Im93N2xLY0VrbFlXNjVkUW9VMFZxWFVkd0JudFd6VkhRIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2Fqd3RleHA2MCIsImp0aSI6ImF1aUFhdmNwVER0MFNLTk4zS3B6WUtLRXNZR3VWRUZPcEluTmpkalBSaUpWSWl1OEZmbzE0OTM0TFc5d2pidG8iLCJleHAiOjE2NjkzMDAxMTN9.Vvbfm5UInoM2oZC7UnWe7TtV0VIB3cSXnGP0c6_kuXtOiFeW_XQR7SjLv7drV3iGXFD9S7ltmVIKpwjX4_5f1SymzXPTNgAfqmr47s4jeAFPNMVDwpxQULTVKzKpprKNtOdifzT_lOjXpMTg6A7ae9TwMFdTY46v0xP2sRVle7XcB1S-dsTwK6NINMn-9fAsMeFTgSMh9cdXVu9x68yqe2mMYcD_X2dgcsPQdKLa8nvsr-oBb5TaAcmN4OBfMWC3DMO5Xz4_3uueI1ZG5hK0FMhAPVdR50huJo4sf6CEz3sVFKUHxWxn2t6ttkwTFQ_ck1ncjZr9QekHNwwWq60UIQ'}
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
