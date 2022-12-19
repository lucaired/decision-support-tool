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
                                    token={'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJjb2RlOmFsbCIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImJ1Y2tldDpyZWFkIl0sImNsaWVudF9pZCI6Im93N2xLY0VrbFlXNjVkUW9VMFZxWFVkd0JudFd6VkhRIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2Fqd3RleHA2MCIsImp0aSI6IkplR0JBS2dtclFxeUh6RTBTcDlHR2xDaUNRaXZtVWYyVEcyUXgxMERjZzlOVDk5Z1dEdGlEbklWN3BaTEdzSFkiLCJleHAiOjE2NjkyMDUxODN9.cECYNTRmfv0z_TZsuwWmSNrZqZlMlutF4pkW_bDanH4szMKL3C9jj6zCoqiruuIq2PaLh-HI2cWQy3Bi5SoYmNcEI-ScxST3KIjpfeR0DtqRRxzss59gMjcowsLNwj54XCk6RTYIsg_PeWDL6_eRmUiwyX_7bQ2avbBL-25ZLhjeENmI6y1ajw6aVb8J_vBKmRkjGtgPnINf9r91mc8WZy76YYRMAFQYarSJIYz0YZlx12toRLuacfkt7PckERxKdfpuCRJK36ku3hUJFZT-8F3HBBAxP5Ia9uRre9EG8dQlBkSsf_8XK_Es4AuwBdkhpSrsJQxNRc-Tfd9C1yPtQw'}
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
