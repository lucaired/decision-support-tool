import * as React from 'react';
import Paper from '@mui/material/Paper';
import Card from "@mui/material/Card";
import {Avatar, Button, Chip, Slider, Stack, SvgIcon} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

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
function ObjectiveEvaluationViewer({activeVariantId}) {
    // TODO: get evaluations for the activeVariant
    const mockFactorRating = {
        label: 'Social Factors',
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
    };

    const mockObjectiveEvaluation = [
        {user: 'Architect Adrian', factorRating: mockFactorRating},
        {user: 'Architect Bertha'},
        {user: 'Architect Chris'}
    ]

    const [objectiveEvaluation, setObjectiveEvaluation] = React.useState(mockObjectiveEvaluation);
    // @ts-ignore
    const handleObjectiveEvaluationUpdate = (factorRating, user: string) => {
        const index = objectiveEvaluation.findIndex((evaluation) => evaluation.user === user)
        if (index !== -1) {
            setObjectiveEvaluation((objectiveEvaluation) => {
                const index = objectiveEvaluation.findIndex((evaluation) => evaluation.user == user)
                let update = [...objectiveEvaluation]
                update[index] = {user: user, factorRating: factorRating}
                return update
            })
        }
    }
    const [currentUserEvaluation, setCurrentUserEvaluation] = React.useState({
        user: undefined,
        factor: undefined,
    });

    const getFactorRating = () => {
        const factor = objectiveEvaluation
            .filter((evaluation) => evaluation.user == currentUserEvaluation.user)
            .map((evaluation) => evaluation.factorRating)
            .filter((factorRating) => factorRating?.label == currentUserEvaluation.factor)[0]
        return factor
    }

    const [showObjectiveEvaluationSurvey, toggleShowObjectiveEvaluationSurvey] = React.useState(false);
    const handleShowObjectiveEvaluationSurvey = (state: boolean) => toggleShowObjectiveEvaluationSurvey(state);

    return <div>
        {showObjectiveEvaluationSurvey && currentUserEvaluation.user && currentUserEvaluation.factor
            ? <ObjectiveEvaluationSurvey
                factorRating={getFactorRating()}
                handleShowObjectiveEvaluationSurvey={handleShowObjectiveEvaluationSurvey}
                setCurrentUserEvaluation={setCurrentUserEvaluation}
                currentUserEvaluation={currentUserEvaluation}
                handleObjectiveEvaluationUpdate={handleObjectiveEvaluationUpdate}
            /> :
            <ObjectiveEvaluationTable
                objectiveEvaluation={objectiveEvaluation}
                toggleShowObjectiveEvaluationSurvey={toggleShowObjectiveEvaluationSurvey}
                setCurrentUserEvaluation={setCurrentUserEvaluation}
            />}
    </div>
}

// @ts-ignore
function ObjectiveEvaluationTable({
// @ts-ignore
                                      objectiveEvaluation,
                                      // @ts-ignore
                                      toggleShowObjectiveEvaluationSurvey,
                                      // @ts-ignore
                                      setCurrentUserEvaluation
                                  }) {
    return <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
        { /* @ts-ignore */}
        {objectiveEvaluation?.map((evaluation) => (
            <Card
                key={`objectiveEvaluation-${evaluation.user}`}
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
                            cursor: "pointer",
                            width: "120px",
                            padding: "5px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-around"
                        }}
                        onClick={() => {
                            toggleShowObjectiveEvaluationSurvey(true)
                            setCurrentUserEvaluation({user: evaluation.user, factor: 'Social Factors'})
                        }}
                    >
                        <p style={{maxWidth: "80px"}}>Social Factors</p>
                        <Chip label="8"/>
                    </Paper>
                    <Paper
                        variant="outlined"
                        style={{
                            cursor: "pointer",
                            width: "120px",
                            padding: "5px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-around"
                        }}
                        onClick={() => {
                            toggleShowObjectiveEvaluationSurvey(true)
                            setCurrentUserEvaluation({user: evaluation.user, factor: 'Economic Factors'})
                        }}
                    >
                        <p style={{maxWidth: "80px"}}>Economic Factors</p>
                        <Chip label="5"/>
                    </Paper>
                    <Paper variant="outlined"
                           style={{
                               cursor: "pointer",
                               width: "120px",
                               padding: "5px",
                               display: "flex",
                               flexDirection: "column",
                               justifyContent: "space-around"
                           }}
                           onClick={() => {
                               toggleShowObjectiveEvaluationSurvey(true)
                               setCurrentUserEvaluation({user: evaluation.user, factor: 'Environmental Factors'})
                           }}
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
    </div>
}

function ObjectiveEvaluationSurvey({
// @ts-ignore
                                       factorRating,
                                       // @ts-ignore
                                       handleShowObjectiveEvaluationSurvey,
                                       // @ts-ignore
                                       setCurrentUserEvaluation,
                                       // @ts-ignore
                                       currentUserEvaluation,
                                       // @ts-ignore
                                       handleObjectiveEvaluationUpdate
                                   }) {

    const [rating, setRating] = React.useState(factorRating);

    function handleChange(newValue: number, criteriaGroupLabel: string, criterionLabel: string) {
        // @ts-ignore
        const criteriaGroupIndex = rating.criteriaGroups.findIndex((criteriaGroup) => criteriaGroup.label === criteriaGroupLabel)
        if (criteriaGroupIndex !== -1) {
            // @ts-ignore
            let criteriaGroup = rating.criteriaGroups[criteriaGroupIndex]
            const criterionIndex = criteriaGroup.criteria.findIndex((criterion: { label: string; }) => criterion.label === criterionLabel)
            if (criterionIndex !== -1 ) {
                // @ts-ignore
                setRating(rating => {
                    let update = {...rating}
                    let criterion = criteriaGroup.criteria[criterionIndex]
                    criterion.rating = newValue
                    criteriaGroup.criteria[criterionIndex] = criterion
                    update.criteriaGroups[criteriaGroupIndex] = criteriaGroup
                    return update
                })
            }
        }
    }

    return <Card>
        <div>
            <div style={{paddingTop: "10px", paddingRight: "10px", display: "flex", justifyContent: "end"}}>
                <Button variant="contained">
                    <SvgIcon
                        onClick={() => {
                            handleShowObjectiveEvaluationSurvey(false)
                            setCurrentUserEvaluation({user: undefined, factor: undefined})
                        }}
                        component={CloseIcon}/></Button>
            </div>
            <h3 style={{textAlign: "center"}}>{currentUserEvaluation.factor}</h3>
        </div>
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                gap: "5px",
                justifyContent: "space-around",
                padding: "20px"
            }}
        >
            {/* @ts-ignore */}
            {rating?.criteriaGroups?.map((criteriaGroup) =>
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
                                        value={criterion.rating}
                                        onChange={(event: Event, newValue: number | number[]) => {
                                            handleChange(newValue as number, criteriaGroup.label, criterion.label)
                                        }}
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
        <div style={{paddingBottom: "10px", paddingRight: "10px", display: "flex", justifyContent: "end"}}>
            <Button variant="contained">
                <SvgIcon
                    onClick={() => {
                        handleShowObjectiveEvaluationSurvey(false)
                        setCurrentUserEvaluation({user: undefined, factor: undefined})
                        handleObjectiveEvaluationUpdate(rating, currentUserEvaluation.user)
                    }}
                    component={SaveIcon}
                />
            </Button>
        </div>
    </Card>
}

export default ObjectiveEvaluationViewer