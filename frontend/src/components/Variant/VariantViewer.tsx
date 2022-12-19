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
    activeVariantHandler: (activeVariant: DecisionTree) => void
    activeProjectTreeHandler: (projectTree: DecisionTree) => void
}

function VariantViewer({activeProject, activeVariant, activeVariantHandler, activeProjectTreeHandler}: VariantViewerProps) {
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
                                activeProjectTree={activeProject.tree}
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
                                    // path={'http://192.168.2.168:3000/0.svf'}
                                    urn={'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZGVjaXNpb24tc3VwcG9ydC1idWNrZXQvVjItMS5pZmM'}
                                    token={'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJjb2RlOmFsbCIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImJ1Y2tldDpyZWFkIl0sImNsaWVudF9pZCI6Im93N2xLY0VrbFlXNjVkUW9VMFZxWFVkd0JudFd6VkhRIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2Fqd3RleHA2MCIsImp0aSI6IkszN0J3VXFrNWo2UENucW5IcURZUXZrbTFWa1NkdERWclM4ZThSUDhjUGpkaDFHRDlYYkRkUmlralRNc3kzWU0iLCJleHAiOjE2NzA1ODkxOTB9.NqvCPPWiaoZv-uIAPz-lHX6bxD3crYWuQp6CYAl8J7Mo4Soj1zb7e4Oa7XZBsq9mbgkS1OGsSpJAQZCymvkt9nfJssxMHBFL0WLYNzF-gsWD0GR1cbgkFRmWmm67XnZclrMXmsSgRjeEJz0g2ogygvU3-Q9MGuaav1VULgS2F1bGjNFmmI6BZbnIN8f11_4toDxHMpSttnj6CX74GPy9eY6C70sIPldfSlB8bc8dICXmXjLYPNWK7PU6iYIF22jaIyvVRMP5rnotBN7fF1-WEO3gh4toCV0PkOBZ_Z6Wn2bpnnRtl8HYOoYv9hqaRx2nNiNDRnX5QggPFu8TK4wh9g'}
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
                                                    weightsSets={activeProject.weightsSets}
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
