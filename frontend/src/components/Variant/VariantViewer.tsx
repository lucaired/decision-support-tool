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
import { ImageViewer } from './ImageViewer';

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
                                height: '310px'
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
                                minHeight: '600px'
                            }}
                        >
                            <VariantExplorerMenu
                                activeVariantExplorationHandler={activeVariantExplorationHandler}
                                activeVariantExplorationIndex={activeVariantExplorationIndex}
                            />
                            {activeVariantExplorationIndex === 0 && activeVariant.bimReference !== '' ?
                                <ForgeViewer
                                    key={"renderer-variant-exploration"}
                                    urn={activeVariant.bimReference}
                                    token={'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJjb2RlOmFsbCIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImJ1Y2tldDpyZWFkIl0sImNsaWVudF9pZCI6Im93N2xLY0VrbFlXNjVkUW9VMFZxWFVkd0JudFd6VkhRIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2Fqd3RleHA2MCIsImp0aSI6IjVvVHJFTkFRY0h3MXFYbWFsMzUwb3ZLTm1abElnNHowRUZ4SXhKRVFObkVjV1BieE5UOWo3a3BZdUxPeXkzZmUiLCJleHAiOjE2NzI0MTgwNjh9.dXefDizkMOj97RMRe3IDsVfhhNFYKtKY2MGhGfCiXAW6OfqTdAsGDH1VsvdM91mT9UTHfriIlMivxWD9FS3ugm8C_q2XdK_zzafghyl4YcWhPTZUgCNeKnmowoOiynrJraLX-pQvv3a82CQblhZEZ2uOBVXhFwnXMnOYFJcnv29JgxoA-HwvAmo_nDa3hraOkfbFNgGemQY_trDF5Z6-Vrkn9tHkYrn3JrXh2g1cHlMN3Duuux67iTmYY1_-0aRMZr1SbLk3bTvshx1QJKdJffxmg6OWSfpJoCxXL2LRc_sS-T0q2WJAOfm1iapblH81vRhmKsvH7xxwuFmvigmgwg'}
                                /> : 
                                activeVariantExplorationIndex === 0 && activeVariant.bimReference === '' ?
                                <ImageViewer activeVariantId={activeVariant.id}/> :
                                activeVariantExplorationIndex === 1 ?
                                    <GWPEvaluation
                                        key={"gwp-variant-exploration"}
                                        activeVariant={activeVariant}
                                    /> :
                                    activeVariantExplorationIndex === 2 ?
                                        <div
                                            key={"design-rationale-variant-exploration"}
                                        >
                                            <DesignEpisode designEpisodeIds={activeVariant.designEpisodeIds}/>
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
