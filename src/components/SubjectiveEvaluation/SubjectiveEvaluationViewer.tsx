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
import Tooltip from '@mui/material/Tooltip';

import StringPropInput from "../Tree/NodeStringPropInput";
import Typography from "@mui/material/Typography";

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
    const nameSplit = name.split(' ')
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: nameSplit.length === 2 ? `${nameSplit[0][0]}${nameSplit[1][0]}` : nameSplit[0][0],
    };
}

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
        onClose={() => {
            setUser({name: ''})
            handleRatingModalClose()
        }}
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
                        propertyName={"Enter your Name"}
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
                    },
                    {
                        label: 'User and task-specific image',
                        rating: 2
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
    ]

    const [subjectiveEvaluations, setSubjectiveEvaluations] = React.useState(mockSubjectiveEvaluation);
    const [totalSubjectiveEvaluation, setTotalSubjectiveEvaluation] =
        React.useState({});

    const [currentUserEvaluation, setCurrentUserEvaluation] = React.useState({
        user: undefined,
        factorLabel: undefined,
    });

    const computeTotalSubjectiveEvaluation = () => {
        // @ts-ignore
        const totalEvaluation = subjectiveEvaluations.reduce((acc, evaluation) => {
            let update = {...acc}
            // apply the criteriaGroup array to the accumulator
            evaluation.factorRatings[0].criteriaGroups.forEach((criteriaGroup) => {
                // if criteriaGroup not in accumulator, we can just use it
                let updateCriteriaGroup = criteriaGroup

                const index = update.factorRatings[0]?.criteriaGroups?.findIndex((old) => old.label === criteriaGroup.label)
                // criteriaGroup is in the accumulator
                if (index !== -1 && index !== undefined) {
                    let right = update.factorRatings[0].criteriaGroups[index].criteria
                    const updatedCriteria = mergeCriteriaGroupScores(criteriaGroup.criteria, right)
                    console.log(updatedCriteria)
                    updateCriteriaGroup = {label: criteriaGroup.label, criteria: updatedCriteria}
                    update.factorRatings[0].criteriaGroups[index] = updateCriteriaGroup
                } else {
                    update.factorRatings[0].criteriaGroups = [updateCriteriaGroup, ...update.factorRatings[0].criteriaGroups]
                }
            })
            return update
        }, {'user': 'Total Score', 'factorRatings': [{'label': 'Social Factors', 'criteriaGroups': []}]})
        // @ts-ignore
        setTotalSubjectiveEvaluation((totalSubjectiveEvaluation) => totalEvaluation)
    }

    const mergeCriteriaGroupScores = (left: { label: string, rating: number }[], right: { label: string, rating: number }[]) => {
        const leftUpdate = left.map((leftScore) => {
            const index = right.findIndex((rightScore) => leftScore.label === rightScore.label)
            if (index !== -1) {
                return {label: leftScore.label, rating: leftScore.rating + right[index].rating}
            } else {
                return leftScore
            }
        })
        // add missing criteria
        const missingCriteria = right.filter((score) => {
            const index = leftUpdate.findIndex((update) => update.label === score.label)
            if (index === -1) {
                leftUpdate.push(score)
            }
        })
        return leftUpdate
    }

    // @ts-ignore
    const handleSubjectiveEvaluationUpdate = (factorRating, user: string) => {
        const index = subjectiveEvaluations.findIndex((evaluation) => evaluation.user === user)
        if (index !== -1) {
            setSubjectiveEvaluations((subjectiveEvaluation) => {
                const evaluationIndex = subjectiveEvaluation.findIndex((evaluation) => evaluation.user === user)
                const factorRatings = subjectiveEvaluation[evaluationIndex].factorRatings || []
                const factorEvaluationIndex = factorRatings.findIndex((rating) => rating.label === factorRating.label)

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
            setSubjectiveEvaluations((subjectiveEvaluation) => {
                let update = [...subjectiveEvaluation]
                update.push({user: user, factorRatings: [factorRating]})
                return update
            })
        }
        computeTotalSubjectiveEvaluation()
    }
    const handleSubjectiveEvaluationRemoval = (user: string) => {
        const index = subjectiveEvaluations.findIndex((evaluation) => evaluation.user === user)
        if (index !== -1) {
            setSubjectiveEvaluations((subjectiveEvaluation) => {
                let update = [...subjectiveEvaluation]
                update.splice(index, 1);
                return update
            })
        }
        computeTotalSubjectiveEvaluation()
    }

    const getFactorRating = () => {
        const factor = subjectiveEvaluations
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
    const handleRatingModalUpdate = (rating: object, name: string) => {
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
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                {subjectiveEvaluations.length > 1 &&
                    // show aggregated score over all users
                    <SubjectiveEvaluationTable
                        subjectiveEvaluations={[totalSubjectiveEvaluation]}
                        toggleShowSubjectiveEvaluationSurvey={() => {
                        }}
                        setCurrentUserEvaluation={() => {
                        }}
                        handleSubjectiveEvaluationRemoval={() => {
                        }}
                    />
                }
                <SubjectiveEvaluationTable
                    subjectiveEvaluations={subjectiveEvaluations}
                    toggleShowSubjectiveEvaluationSurvey={toggleShowSubjectiveEvaluationSurvey}
                    setCurrentUserEvaluation={setCurrentUserEvaluation}
                    handleSubjectiveEvaluationRemoval={handleSubjectiveEvaluationRemoval}
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

function computeCriteriaGroupScore(criteriaGroup: object): number {
    // @ts-ignore
    const groupRating = criteriaGroup.criteria.reduce((acc, criterion) => acc + criterion.rating, 0)
    return Math.round(groupRating * 100) / 100
}

function computeFactorScore(evaluation: object): number {
    const criteriaGroupWeights = {
        'Design Quality': 1,
        'Functionality': 1,
        'Comfort and health': 1,
    }
    // @ts-ignore
    const score = evaluation.criteriaGroups?.reduce((acc, criteriaGroup) => {
        // @ts-ignore
        const weight = criteriaGroupWeights[criteriaGroup.label]
        return acc + weight * computeCriteriaGroupScore(criteriaGroup)
    }, 0)
    return Math.round(score * 100) / 100
}

function SubjectiveEvaluationTable({
                                       // @ts-ignore
                                       subjectiveEvaluations: subjectiveEvaluations,
                                       // @ts-ignore
                                       toggleShowSubjectiveEvaluationSurvey,
                                       // @ts-ignore
                                       setCurrentUserEvaluation,
                                       // @ts-ignore
                                       handleSubjectiveEvaluationRemoval
                                   }) {

    return <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
        { /* @ts-ignore */}
        {subjectiveEvaluations?.map((evaluation) => (
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
                        gap: "5px",
                        width: "155px"
                    }}
                >
                    <Avatar {...stringAvatar(evaluation.user)} />
                    <p>{evaluation.user}</p>
                </Card>
                {/* @ts-ignore */}
                {evaluation.factorRatings?.sort().map((factorRating) =>
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
                            {factorRating.criteriaGroups.sort((groupA,groupB) => groupA.label < groupB.label ).map((criteriaGroup) =>
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
                                        setCurrentUserEvaluation({
                                            user: evaluation.user,
                                            factorLabel: factorRating.label
                                        })
                                    }}
                                >
                                    <p style={{textAlign: "center"}}>{criteriaGroup.label}</p>
                                    <Chip label={computeCriteriaGroupScore(criteriaGroup)}/>
                                </Paper>
                            )}
                        </div>
                    </div>)}
                <Button onClick={() => handleSubjectiveEvaluationRemoval(evaluation.user)} startIcon={<DeleteIcon/>}/>
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

function tooltipForCriterion(criterion: {
    label: string;
    rating: number;
}) {
    switch (criterion.label) {
        case 'Safety':
            return 'Security contributes to social and economic stability. Users should feel' +
                'safe in the building itself, as well as in its environment and be protected' +
                'as far as possible. Accordingly, the objective hazard potentials (e.g. site-' +
                'specific natural hazards such as flooding, stumbling blocks, fire, etc.)' +
                'should be eliminated as far as possible and the subjective sense of' +
                'security (e.g. clarity, social control / animation, good visibility, etc.) should' +
                'be strengthen.'
        case 'Sound insulation':
            return 'Unwanted noise and acoustic conditions affect the well-being and can' +
                'affect the health. By appropriate conceptual and structural measures' +
                'pleasant acoustic conditions are to be established. This applies equally to' +
                'the structural sound insulation against external noise and noise pollution' +
                'between different rooms.'
        case 'Accessibility':
            return 'Based on the existing or projected road and traffic network, an external and internal development concept is to be developed that ensures good networking with the neighborhood, unmistakable orientation options, good clarity and secure accessibility. A high degree of cycling comfort should support the development of environmentally friendly mobility.'
        case 'Public accessibility':
            return 'A high degree of public accessibility promotes the integration and acceptance of the buildings within the neighborhood.'
        case 'Barrier-free access':
            return 'The barrier-free design should ensure unrestricted freedom of movement, increase communication in the building and enhance the spatial qualities of architecture and open space.'
        case 'Social integration spaces':
            return 'Caring for social contacts supports responsibility, creativity and building social networks. This is promoted by semi-public areas, communication-' +
                'promoting develooment and meeting areas and a well-coordinated interaction of the private, semi-public and public' +
                'areas of buildings and their environment. In addition, the widest possible' +
                'range of accommodation options should promote communication.'
        case 'User and task-specific image':
            return 'A proper self-presentation and identity formation can be achieved through equilibrium between the usability and design.'
        case 'Building quality':
            return 'As a contribution to the building culture the building ensemble should be of a high design quality and should have a specific Identity, as well as it should contribute to solution of current social problems.'
        case 'External space quality':
            return 'Creation of optimal local and user-specific social spaces for urban spaces and ground floor areas, as well as design of the roof as \'Fifth facade to promote a three-dimensional cityscape.'
        case 'Urban integration':
            return 'The building will significantly characterize the surrounding buildings and public street spaces. A solitaire is expected as an accent in the urban space, but at the same time it should fit the neighborhood, blend with the environment and altogether support the urban image of a place.'
        default:
            return ""
    }
}

function tooltipForCriterionRating(criterion: {
    label: string;
    rating: number;
}) {
    switch (criterion.label) {
        case 'Safety':
            return 'Security contributes to social and economic stability. Users should feel' +
                'safe in the building itself, as well as in its environment and be protected' +
                'as far as possible. Accordingly, the objective hazard potentials (e.g. site-' +
                'specific natural hazards such as flooding, stumbling blocks, fire, etc.)' +
                'should be eliminated as far as possible and the subjective sense of' +
                'security (e.g. clarity, social control / animation, good visibility, etc.) should' +
                'be strengthen.'
        case 'Sound insulation':
            return 'POOR - unfavorable orientation of vulnerable rooms; unfavorable' +
                'orientation of private open spaces (e.g. railway tracks); structural sound' +
                'insulation measures not recognizable; use conflicts | ' +
                'AVERAGE - partly unfavorable orientation of vulnerable rooms; partly' +
                'unfavorable orientation of private open spaces; structural noise' +
                'protection measures partly considered; if necessary, use conflicts (z. B.' +
                'between exercise and rest rooms)\n'
        case 'Accessibility':
            return 'Based on the existing or projected road and traffic network, an external and internal development concept is to be developed that ensures good networking with the neighborhood, unmistakable orientation options, good clarity and secure accessibility. A high degree of cycling comfort should support the development of environmentally friendly mobility.'
        case 'Public accessibility':
            return 'A high degree of public accessibility promotes the integration and acceptance of the buildings within the neighborhood.'
        case 'Barrier-free access':
            return 'The barrier-free design should ensure unrestricted freedom of movement, increase communication in the building and enhance the spatial qualities of architecture and open space.'
        case 'Social integration spaces':
            return 'Caring for social contacts supports responsibility, creativity and building social networks. This is promoted by semi-public areas, communication-' +
                'promoting develooment and meeting areas and a well-coordinated interaction of the private, semi-public and public' +
                'areas of buildings and their environment. In addition, the widest possible' +
                'range of accommodation options should promote communication.'
        case 'User and task-specific image':
            return 'A proper self-presentation and identity formation can be achieved through equilibrium between the usability and design.'
        case 'Building quality':
            return 'As a contribution to the building culture the building ensemble should be of a high design quality and should have a specific Identity, as well as it should contribute to solution of current social problems.'
        case 'External space quality':
            return 'Creation of optimal local and user-specific social spaces for urban spaces and ground floor areas, as well as design of the roof as \'Fifth facade to promote a three-dimensional cityscape.'
        case 'Urban integration':
            return 'The building will significantly characterize the surrounding buildings and public street spaces. A solitaire is expected as an accent in the urban space, but at the same time it should fit the neighborhood, blend with the environment and altogether support the urban image of a place.'
        default:
            return ""
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
            <Typography style={{textAlign: "center"}} gutterBottom variant="h5">
                {currentUserEvaluation.factorLabel}
            </Typography>
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
                        <Typography style={{paddingTop: "5px"}} gutterBottom variant="subtitle1">
                            {criteriaGroup.label}
                        </Typography>
                        {/* @ts-ignore */}
                        {criteriaGroup.criteria?.map((criterion) =>
                            <Tooltip placement="top" title={tooltipForCriterion(criterion)}>
                                <Tooltip placement="bottom" title={tooltipForCriterionRating(criterion)}>
                                    <Paper
                                        variant="outlined"
                                        style={{
                                            paddingLeft: "10px",
                                            paddingRight: "10px",
                                        }}
                                    >
                                        <Typography style={{paddingTop: "5px"}} gutterBottom variant="subtitle2">
                                            {criterion.label}
                                        </Typography>
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
                                </Tooltip>
                            </Tooltip>
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