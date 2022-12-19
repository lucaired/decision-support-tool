import * as React from 'react';
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import './VariantViewer.css';
import DecisionTreeHandler from '../../components/Tree/DecisionTreeHandler';
import {ForgeViewer} from "../../components/ForgeViewer/viewer";
import VariantExplorerMenu from "../../components/Variant/VariantExplorerMenu";
import GWPEvaluation from "../../components/GWP/GWPEvaluation";
import SubjectiveEvaluationViewer from "../../components/SubjectiveEvaluation/SubjectiveEvaluationViewer";
import DesignEpisode from "../../components/DesignRationale/DesignEpisode";
import { DecisionTree } from '../../components/Tree/NodeHandler';

interface VariantViewerProps {
    activeProject?: any;
    activeVariant?: DecisionTree;
    activeProjectTree?: DecisionTree;
    activeVariantHandler: (activeVariant: DecisionTree) => void
    activeProjectTreeHandler: (projectTree: DecisionTree) => void
}

function VariantViewer({activeProject, activeVariant, activeProjectTree, activeVariantHandler, activeProjectTreeHandler}: VariantViewerProps) {
    const [activeVariantExplorationIndex, setActiveVariantExplorationIndex] = React.useState(1);
    const activeVariantExplorationHandler = (index: number) => {
        if (0 <= index && index <= 3) {
            setActiveVariantExplorationIndex(index)
        }
    }
    function isEmptyObject(activeVariant: DecisionTree) {
        return activeVariant // 👈 null and undefined check
        && Object.keys(activeVariant).length === 0
        && Object.getPrototypeOf(activeVariant) === Object.prototype
    }
    // @ts-ignore
    return (
        <div className="VariantViewer" style={{
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
                                activeVariant={activeVariant}
                                activeProjectTreeHandler={activeProjectTreeHandler}
                                activeProjectTree={activeProjectTree}
                            />
                        </CardContent>
                    </React.Fragment>
                </Card>
            </Box>
            {activeVariant && !isEmptyObject(activeVariant) && <Box>
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
                                    token={'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJjb2RlOmFsbCIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImJ1Y2tldDpyZWFkIl0sImNsaWVudF9pZCI6Im93N2xLY0VrbFlXNjVkUW9VMFZxWFVkd0JudFd6VkhRIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2Fqd3RleHA2MCIsImp0aSI6IlBidzM1UW1ETHdkSGxEa2dnakdYM3JTTjJlNWk0aXIzYlo3YUlReGlxeFFpMDBFMXN4U2oyejg3aE9oYlQ1QXoiLCJleHAiOjE2Njk2NTIyMjR9.XjjzN2ml1ILBfxEQMooeJ08ggszqkPohdJdcGaHSipf2AQD9YFWNkDJI5g2MV4c_wbMf2AHsg-WLNDMEkD1HSrGpo1RUFomDXM3-dqEwFStGSsR4YEKCZYsaVswUrZPeV1hgLyAhuZKT1GX5kMbgOQ7bW7X7FKEeD9BJSz5ie6wxy1k0pmwSYtNA32jBCh4I9tFc10WoA6otnDI-9TVhZFKcKK618BVyPeLBCKdKqtR-G534nRxyIoWuXcT7zGNduVvRqhD6ahjgtPV-8odwHpNWoRgZq1qOGAGmUil8yF8jZ7n52_QDyi--WKcUVqEKgwboxU-gSfNgvnXH8M7M6g'}
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
                                                    // @ts-ignore
                                                    weightsSets={activeProject.weightsSet}
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

export default VariantViewer;
