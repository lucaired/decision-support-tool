import * as React from 'react';
import Paper from '@mui/material/Paper';
import Card from "@mui/material/Card";
import {Avatar, Button, Chip, Slider, Stack, SvgIcon} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import StringPropInput from "../Tree/NodeStringPropInput";

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
function NewRatingModal({showRatingModal, handleRatingModalClose, handleRatingModalUpdate}) {

    const [user, setUser] = React.useState({name: ''});
    const handleSave = () => {
        setUser({name: ''})
        handleRatingModalUpdate(RatingConstructor("Social Factors"), user.name)
    }

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        border: '2px solid #1976d2',
        boxShadow: 24,
        p: 4,
    };

    return <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showRatingModal}
        onClose={handleRatingModalClose}
        closeAfterTransition
    >
        <Fade in={showRatingModal}>
            <Box sx={modalStyle}>
                <h1>Rate variant</h1>
                <div>
                    <StringPropInput
                        target={user}
                        updateFunction={setUser}
                        property={"name"}
                        propertyName={"Name"}
                    />
                    <Button onClick={() => handleSave()}>
                        Save
                    </Button>
                </div>
            </Box>
        </Fade>
    </Modal>;
}

// @ts-ignore
function SubjectiveEvaluationViewer({activeVariantId}) {
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

    const mockSubjectiveEvaluation = [
        {user: 'Architect Adrian', factorRatings: [mockFactorRating]},
        {user: 'Architect Bertha'},
        {user: 'Architect Chris'}
    ]

    const [subjectiveEvaluation, setSubjectiveEvaluation] = React.useState(mockSubjectiveEvaluation);

    // @ts-ignore
    const handleSubjectiveEvaluationUpdate = (factorRating, user: string) => {
        const index = subjectiveEvaluation.findIndex((evaluation) => evaluation.user === user)
        if (index !== -1) {
            setSubjectiveEvaluation((subjectiveEvaluation) => {
                const evaluationIndex = subjectiveEvaluation.findIndex((evaluation) => evaluation.user == user)
                const factorRatings = subjectiveEvaluation[evaluationIndex].factorRatings || []
                const factorEvaluationIndex = factorRatings.findIndex((rating) => rating.label == factorRating.label)

                let update = [...subjectiveEvaluation]
                let updateRating = [...factorRatings]
                if (factorEvaluationIndex !== -1) {
                    updateRating[factorEvaluationIndex] = factorRating
                } else {
                    // @ts-ignore
                    updateRating.push(factorRating)
                }
                update[evaluationIndex] = {user: user, factorRatings: updateRating}
                return update
            })
        } else {
            setSubjectiveEvaluation((subjectiveEvaluation) => {
                let update = [...subjectiveEvaluation]
                update.push({user: user, factorRatings: [factorRating]})
                return update
            })
        }
    }

    const [currentUserEvaluation, setCurrentUserEvaluation] = React.useState({
        user: undefined,
        factorLabel: undefined,
    });

    const getFactorRating = () => {
        const factor = subjectiveEvaluation
            .filter((evaluation) => evaluation.user === currentUserEvaluation.user)
            .map((evaluation) => evaluation.factorRatings)
            .flat()
            .filter((factorRating) =>
                factorRating?.label === currentUserEvaluation.factorLabel
            )[0] || undefined
        return factor
    }

    const [showSubjectiveEvaluationSurvey, toggleShowSubjectiveEvaluationSurvey] = React.useState(false);
    const handleShowSubjectiveEvaluationSurvey = (state: boolean) => toggleShowSubjectiveEvaluationSurvey(state);

    const [showRatingModal, setShowRatingModal] = React.useState(false);
    const handleRatingModalOpen = () => setShowRatingModal(true);
    const handleRatingModalClose = () => setShowRatingModal(false);
    const handleRatingModalUpdate = (rating: object,name: string) => {
        handleSubjectiveEvaluationUpdate(rating, name)
        setShowRatingModal(false);
    }

    return <div>
        {showSubjectiveEvaluationSurvey && currentUserEvaluation.user && currentUserEvaluation.factorLabel
            ? <SubjectiveEvaluationSurvey
                factorRating={getFactorRating()}
                handleShowSubjectiveEvaluationSurvey={handleShowSubjectiveEvaluationSurvey}
                setCurrentUserEvaluation={setCurrentUserEvaluation}
                currentUserEvaluation={currentUserEvaluation}
                handleSubjectiveEvaluationUpdate={handleSubjectiveEvaluationUpdate}
            /> :
            <div>
                <SubjectiveEvaluationTable
                    subjectiveEvaluation={subjectiveEvaluation}
                    toggleShowSubjectiveEvaluationSurvey={toggleShowSubjectiveEvaluationSurvey}
                    setCurrentUserEvaluation={setCurrentUserEvaluation}
                />
                <Button
                    onClick={() => handleRatingModalOpen()}
                    variant="outlined"
                    startIcon={<AddIcon/>}
                >
                    Rate variant
                </Button>
                <NewRatingModal
                    showRatingModal={showRatingModal}
                    handleRatingModalClose={handleRatingModalClose}
                    handleRatingModalUpdate={handleRatingModalUpdate}
                />
            </div>
        }
    </div>
}


function computeCriteriaGroupScore(criteriaGroup: object[]): number {
    // @ts-ignore
    return criteriaGroup.criteria.reduce((acc, criterion) => acc + criterion.rating, 0)
}

function computeFactorScore(evaluation: object): number {
    // @ts-ignore
    return evaluation.criteriaGroups?.reduce((acc, criteriaGroup) => acc + computeCriteriaGroupScore(criteriaGroup), 0) / evaluation.criteriaGroups?.length
}

// @ts-ignore
function SubjectiveEvaluationTable({
// @ts-ignore
                                      subjectiveEvaluation,
                                      // @ts-ignore
                                      toggleShowSubjectiveEvaluationSurvey,
                                      // @ts-ignore
                                      setCurrentUserEvaluation
                                  }) {

    return <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
        { /* @ts-ignore */}
        {subjectiveEvaluation?.map((evaluation) => (
            <Card
                key={`subjectiveEvaluation-${evaluation.user}`}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "15px",
                }}
            >
                <Card
                    elevation={4}
                    style={{
                        padding: "5px",
                        marginRight: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                    }}
                >
                    <Avatar {...stringAvatar(evaluation.user)} />
                    <p>{evaluation.user}</p>
                </Card>
                    {/* @ts-ignore */}
                    {evaluation.factorRatings?.map((factorRating) =>
                        <div
                            style={{display: "flex", flexDirection: "row", gap: "5px"}}
                            key={`${factorRating.label}`}
                        >
                            <Paper
                                elevation={1}
                                style={{
                                    width: "90px",
                                    padding: "5px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-around",
                                }}
                            >
                                <p style={{textAlign: "center"}}>{factorRating.label}</p>
                                <Chip label={computeFactorScore(factorRating)}/>
                            </Paper>
                            <div style={{display: "flex", gap: "5px"}}>
                                {/* @ts-ignore */}
                                {factorRating.criteriaGroups.map((criteriaGroup) =>
                                    <Paper
                                        key={`${criteriaGroup.label}`}
                                        variant="outlined"
                                        style={{
                                            cursor: "pointer",
                                            width: "90px",
                                            padding: "5px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-around",
                                        }}
                                        onClick={() => {
                                            toggleShowSubjectiveEvaluationSurvey(true)
                                            setCurrentUserEvaluation({user: evaluation.user, factorLabel: factorRating.label})
                                        }}
                                    >
                                        <p style={{textAlign: "center"}}>{criteriaGroup.label}</p>
                                        <Chip label={computeCriteriaGroupScore(criteriaGroup)}/>
                                    </Paper>
                                )}
                            </div>
                    </div>)}
                    <Button startIcon={<DeleteIcon/>}/>
            </Card>
        ))}
    </div>
}

function RatingConstructor(factorLabel: string) {
    switch (factorLabel) {
        case 'Social Factors':
            return {
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
            }
        default:
            return {}
    }
}

function SubjectiveEvaluationSurvey({
// @ts-ignore
                                       factorRating,
                                       // @ts-ignore
                                       handleShowSubjectiveEvaluationSurvey,
                                       // @ts-ignore
                                       setCurrentUserEvaluation,
                                       // @ts-ignore
                                       currentUserEvaluation,
                                       // @ts-ignore
                                       handleSubjectiveEvaluationUpdate
                                   }) {

    const [rating, setRating] = React.useState(factorRating);

    if (!rating) {
        setRating(RatingConstructor(currentUserEvaluation.factorLabel))
    }

    function handleChange(newValue: number, criteriaGroupLabel: string, criterionLabel: string) {
        // @ts-ignore
        const criteriaGroupIndex = rating.criteriaGroups.findIndex((criteriaGroup) => criteriaGroup.label === criteriaGroupLabel)
        if (criteriaGroupIndex !== -1) {
            // @ts-ignore
            let criteriaGroup = rating.criteriaGroups[criteriaGroupIndex]
            const criterionIndex = criteriaGroup.criteria.findIndex((criterion: { label: string; }) => criterion.label === criterionLabel)
            if (criterionIndex !== -1) {
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
                            handleShowSubjectiveEvaluationSurvey(false)
                            setCurrentUserEvaluation({user: undefined, factorLabel: undefined})
                        }}
                        component={CloseIcon}/></Button>
            </div>
            <h3 style={{textAlign: "center"}}>{currentUserEvaluation.factorLabel}</h3>
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
                        handleShowSubjectiveEvaluationSurvey(false)
                        setCurrentUserEvaluation({user: undefined, factorLabel: undefined})
                        handleSubjectiveEvaluationUpdate(rating, currentUserEvaluation.user)
                    }}
                    component={SaveIcon}
                />
            </Button>
        </div>
    </Card>
}

export default SubjectiveEvaluationViewer