import * as React from 'react';
import Paper from '@mui/material/Paper';
import Card from "@mui/material/Card";
import {Avatar, Button, Chip, Slider, Stack} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name: string) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}

// TODO: compute overall score from evaluations

// @ts-ignore
function ObjectiveEvaluationViewer({activeVariant}) {
    const [showObjectiveEvaluationSurvey, toggleShowObjectiveEvaluationSurvey] = React.useState(false);

    return <div>
        {showObjectiveEvaluationSurvey ? <ObjectiveEvaluationSurvey
            factorRating={{
                factor: 'Social Factor',
                criteriaGroups: [
                    {
                        label: 'Design Quality',
                        criteria: [
                            {
                                label: 'Urban integration',
                                rating: 3
                            },
                            {
                                label: 'External space quality',
                                rating: 3
                            },
                            {
                                label: 'Building quality',
                                rating: 3
                            }
                        ]
                    },
                    {
                        label: 'Functionality',
                        criteria: [
                            {
                                label: 'Accessibility',
                                rating: 2
                            },
                            {
                                label: 'Public accessibility',
                                rating: 3
                            },
                            {
                                label: 'Barrier-free access',
                                rating: 2
                            },
                            {
                                label: 'Social integration spaces',
                                rating: 3
                            },
                        ]
                    },
                    {
                        label: 'Comfort and health',
                        criteria: [
                            {
                                label: 'Safety',
                                rating: 1
                            },
                            {
                                label: 'Sound insulation',
                                rating: 3
                            }
                        ]
                    }
                ]
            }}
        /> : <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
            { /* @ts-ignore */}
            {activeVariant.objectiveEvaluation?.map((evaluation) => (
                <Card
                    key={`objectiveEvaluation-${activeVariant.id}-${evaluation.user}`}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "15px",
                    }}
                >
                    <Card style={{
                        padding: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                    }}>
                        <Avatar {...stringAvatar(evaluation.user)} />
                        <p>{evaluation.user}</p>
                    </Card>
                    <div style={{display: "flex", gap: "5px"}}>
                        <Paper
                            variant="outlined"
                            style={{
                                width: "120px",
                                padding: "5px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-around"
                            }}
                        >
                            <p style={{maxWidth: "80px"}}>Overall score</p>
                            <Chip label="6.6"/>
                        </Paper>
                        <Paper
                            variant="outlined"
                            style={{
                                width: "120px",
                                padding: "5px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-around"
                            }}
                            onClick={() => toggleShowObjectiveEvaluationSurvey(true)}
                        >
                            <p style={{maxWidth: "80px"}}>Social Factors</p>
                            <Chip label="8"/>
                        </Paper>
                        <Paper
                            variant="outlined"
                            style={{
                                width: "120px",
                                padding: "5px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-around"
                            }}
                            onClick={() => toggleShowObjectiveEvaluationSurvey(true)}
                        >
                            <p style={{maxWidth: "80px"}}>Economic Factors</p>
                            <Chip label="5"/>
                        </Paper>
                        <Paper variant="outlined"
                               style={{
                                   width: "120px",
                                   padding: "5px",
                                   display: "flex",
                                   flexDirection: "column",
                                   justifyContent: "space-around"
                               }}
                               onClick={() => toggleShowObjectiveEvaluationSurvey(true)}
                        >
                            <p style={{maxWidth: "80px"}}>Environmental Factors</p>
                            <Chip label="7"/>
                        </Paper>
                        <Button startIcon={<DeleteIcon/>}/>
                    </div>
                </Card>
            ))}
            <Button variant="outlined" startIcon={<AddIcon/>}>
                Rate variant
            </Button>
        </div>}

    </div>
}

// @ts-ignore
function ObjectiveEvaluationSurvey({factorRating}) {
    return <Card>
        <h3 style={{textAlign: "center"}}>{factorRating.factor}</h3>
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                gap: "5px",
                justifyContent: "space-around",
                padding: "10px"
            }}
        >
            {/* @ts-ignore */}
            {factorRating.criteriaGroups?.map((criteriaGroup) =>
                <div style={{textAlign: "center"}}>
                    <Card
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "5px",
                            gap: "5px"
                        }}
                    >
                        <h4>{criteriaGroup.label}</h4>
                        {/* @ts-ignore */}
                        {criteriaGroup.criteria?.map((criterion) =>
                            <Paper
                                variant="outlined"
                                style={{
                                    paddingLeft: "10px",
                                    paddingRight: "10px",
                                }}
                            >
                                <p>{criterion.label}</p>
                                <Stack style={{minWidth: "160px"}} spacing={2} direction="row" sx={{mb: 1}}
                                       alignItems="center">
                                    <p>poor</p>
                                    <Slider
                                        aria-label="Rating"
                                        defaultValue={criterion.rating}
                                        valueLabelDisplay="auto"
                                        step={1}
                                        marks
                                        min={1}
                                        max={3}
                                    />
                                    <p>excellent</p>
                                </Stack>
                            </Paper>
                        )}
                    </Card>
                </div>
            )}
        </div>
    </Card>
}

export default ObjectiveEvaluationViewer