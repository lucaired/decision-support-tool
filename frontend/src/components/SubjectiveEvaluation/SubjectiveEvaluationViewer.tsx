import axios from 'axios';
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
import {useEffect} from "react";

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

    useEffect(() => {
        axios.get(`http://localhost:80/surveys/${activeVariantId}`)
            .then(function (response) {
                setSubjectiveEvaluations((subjectiveEvaluation) => response.data)
            }).catch((error) => console.log(error))
    }, [activeVariantId])

    const [subjectiveEvaluations, setSubjectiveEvaluations] = React.useState([]);
    useEffect(() => {
        computeTotalSubjectiveEvaluation()
    }, [subjectiveEvaluations])
    const [totalSubjectiveEvaluation, setTotalSubjectiveEvaluation] =
        React.useState({});

    const [currentUserEvaluation, setCurrentUserEvaluation] = React.useState({
        user: undefined,
        factorLabel: undefined,
    });

    const computeTotalSubjectiveEvaluation = () => {
        // Compute total evaluation factoring all evaluations from users,
        // @ts-ignore
        const totalEvaluation = subjectiveEvaluations.reduce((acc, evaluation) => {
            let update = {...acc}
            // apply the criteriaGroup array to the accumulator
            // @ts-ignore
            evaluation.factorRatings[0].criteriaGroups.forEach((criteriaGroup) => {
                // if criteriaGroup not in accumulator, we can just use it
                let updateCriteriaGroup = criteriaGroup

                // @ts-ignore
                const index = update.factorRatings[0]?.criteriaGroups?.findIndex((old) => old.label === criteriaGroup.label)
                // criteriaGroup is in the accumulator
                if (index !== -1 && index !== undefined) {
                    // @ts-ignore
                    let right = update.factorRatings[0].criteriaGroups[index].criteria
                    const updatedCriteria = mergeCriteriaGroupScores(criteriaGroup.criteria, right)
                    updateCriteriaGroup = {label: criteriaGroup.label, criteria: updatedCriteria}
                    // @ts-ignore
                    update.factorRatings[0].criteriaGroups[index] = updateCriteriaGroup
                } else {
                    // @ts-ignore
                    update.factorRatings[0].criteriaGroups = [updateCriteriaGroup, ...update.factorRatings[0].criteriaGroups]
                }
            })
            return update
        }, {'user': 'Total Score (Average)', 'factorRatings': [{'label': 'Social Factors', 'criteriaGroups': []}]})
        // @ts-ignore
        setTotalSubjectiveEvaluation((totalSubjectiveEvaluation) => totalEvaluation)
    }

    const mergeCriteriaGroupScores = (left: { label: string, rating: number }[], right: { label: string, rating: number }[]) => {
        const leftUpdate = left.map((leftScore) => {
            const index = right.findIndex((rightScore) => leftScore.label === rightScore.label)
            if (index !== -1) {
                return {label: leftScore.label, rating: (leftScore.rating + right[index].rating)}
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
    const handleSubjectiveEvaluationUpdate = (factorRating, userName: string) => {
        // @ts-ignore
        const index = subjectiveEvaluations.findIndex((evaluation) => evaluation.user === userName)
        if (index !== -1) {

            // @ts-ignore
            const evaluationIndex = subjectiveEvaluations.findIndex((evaluation) => evaluation.user === userName)
            const subjectiveEvaluation = subjectiveEvaluations[evaluationIndex]
            // @ts-ignore
            const factorRatings = subjectiveEvaluation.factorRatings || []
            // @ts-ignore
            const factorEvaluationIndex = factorRatings.findIndex((rating) => rating.label === factorRating.label)

            let update = [...subjectiveEvaluations]
            let updateRating = [...factorRatings]
            if (factorEvaluationIndex !== -1) {
                updateRating[factorEvaluationIndex] = factorRating
            } else {
                // @ts-ignore
                updateRating.push(factorRating)
            }
            // @ts-ignore
            update[evaluationIndex] = {
                // @ts-ignore
                ...subjectiveEvaluation,
                factorRatings: updateRating,
            }

            // @ts-ignore
            const surveyId = update[evaluationIndex]._id

            axios.put(`http://localhost:80/surveys/${surveyId}`, update[evaluationIndex])
                .then(function (response) {
                    setSubjectiveEvaluations((subjectiveEvaluations) => {
                        return update
                    })
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            const survey = {variantId: activeVariantId, user: userName, factorRatings: [factorRating]}
            axios.post('http://localhost:80/surveys/', survey)
                .then(function (response) {
                    const surveyId = response.data._id
                    setSubjectiveEvaluations((subjectiveEvaluation) => {
                        let update = [...subjectiveEvaluation]
                        // @ts-ignore
                        update.push({
                            user: userName,
                            factorRatings: [factorRating],
                            _id: surveyId,
                            variantId: activeVariantId
                        })
                        return update
                    })
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }
    const handleSubjectiveEvaluationRemoval = (user: string) => {
        // @ts-ignore
        const index = subjectiveEvaluations.findIndex((evaluation) => evaluation.user === user)
        if (index !== -1) {
            // @ts-ignore
            const surveyId = subjectiveEvaluations[index]._id

            axios.delete(`http://localhost:80/surveys/${surveyId}`)
                .then(function (response) {
                    setSubjectiveEvaluations((subjectiveEvaluation) => {
                        let update = [...subjectiveEvaluation]
                        update.splice(index, 1);
                        return update
                    })
                }).catch((error) => console.log(error))
        }
        computeTotalSubjectiveEvaluation()
    }

    const getFactorRating = () => {
        const factor = subjectiveEvaluations
            // @ts-ignore
            .filter((evaluation) => evaluation.user === currentUserEvaluation.user)
            // @ts-ignore
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
    const handleRatingModalUpdate = (rating: object, userName: string) => {
        handleSubjectiveEvaluationUpdate(rating, userName);
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
                        globalFactorWeight={1 / subjectiveEvaluations.length}
                        disableEvaluationRemoval={true}
                        subjectiveEvaluationStyle={{border: 'solid #1976d2 1.5px', marginBottom: '10px'}}
                    />
                }
                <SubjectiveEvaluationTable
                    subjectiveEvaluations={subjectiveEvaluations}
                    toggleShowSubjectiveEvaluationSurvey={toggleShowSubjectiveEvaluationSurvey}
                    setCurrentUserEvaluation={setCurrentUserEvaluation}
                    handleSubjectiveEvaluationRemoval={handleSubjectiveEvaluationRemoval}
                    globalFactorWeight={1}
                    disableEvaluationRemoval={false}
                    subjectiveEvaluationStyle={{}}
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

function computeCriteriaGroupScore(criteriaGroup: object, globalFactorWeight: number): number {
    // @ts-ignore
    const groupRating = criteriaGroup.criteria.reduce((acc, criterion) => acc + criterion.rating, 0)
    return Math.round(groupRating * globalFactorWeight * 100) / 100
}

function computeFactorScore(evaluation: object, globalFactorWeight: number): number {
    // @ts-ignore
    const score = evaluation.criteriaGroups?.reduce((acc, criteriaGroup) => {
        return acc + computeCriteriaGroupScore(criteriaGroup, globalFactorWeight)
    }, 0)
    return Math.round(score * 100) / 100
}

function CriteriaGroupScore(props: { onClick: () => void, criteriaGroup: any, globalFactorWeight: any }) {
    const criteriaGroupScore = computeCriteriaGroupScore(props.criteriaGroup, props.globalFactorWeight)
    const maxScore = props.criteriaGroup.criteria.length * weightForCriteriaGroup(props.criteriaGroup.label) * 3
    const scoreLabel = `${criteriaGroupScore}/${maxScore}`

    return <Paper
        variant="outlined"
        style={{
            cursor: "pointer",
            width: "90px",
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
        }}
        onClick={props.onClick}
    >
        <p style={{textAlign: "center"}}>{props.criteriaGroup.label}</p>
        <Chip label={scoreLabel}/>
    </Paper>;
}

function FactorScore(props: { factorRating: any, globalFactorWeight: any }) {
    const criteriaGroupScore = computeFactorScore(props.factorRating, props.globalFactorWeight)
    // @ts-ignore
    const maxScore = props.factorRating.criteriaGroups.reduce((acc, criteriaGroup) =>
            acc + criteriaGroup.criteria.length * weightForCriteriaGroup(criteriaGroup.label) * 3
        , 0)
    const scoreLabel = `${criteriaGroupScore}/${maxScore}`

    return <Paper
        elevation={1}
        style={{
            width: "90px",
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
        }}
    >
        <p style={{textAlign: "center"}}>{props.factorRating.label}</p>
        <Chip label={scoreLabel}/>
    </Paper>;
}

function SubjectiveEvaluationTable({
                                       // @ts-ignore
                                       subjectiveEvaluations: subjectiveEvaluations,
                                       // @ts-ignore
                                       toggleShowSubjectiveEvaluationSurvey,
                                       // @ts-ignore
                                       setCurrentUserEvaluation,
                                       // @ts-ignore
                                       handleSubjectiveEvaluationRemoval,
                                       // @ts-ignore
                                       globalFactorWeight,
                                       // @ts-ignore
                                       disableEvaluationRemoval,
                                       // @ts-ignore
                                       subjectiveEvaluationStyle,
                                   }) {

    // @ts-ignore
    return <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
        { /* @ts-ignore */}
        {subjectiveEvaluations?.map((evaluation) => (
            <Card
                key={`subjectiveEvaluation-${evaluation.user}`}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "15px",
                    ...subjectiveEvaluationStyle
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
                        <FactorScore factorRating={factorRating} globalFactorWeight={globalFactorWeight}/>
                        <div style={{display: "flex", gap: "5px"}}>
                            {/* @ts-ignore */}
                            {factorRating.criteriaGroups.sort((groupA, groupB) => {
                                return groupA.label < groupB.label ? -1 :
                                    groupA.label > groupB.label ? 1 : 0;
                            }).map((criteriaGroup: { label: string }) =>
                                <CriteriaGroupScore key={`${criteriaGroup.label}`} onClick={() => {
                                    toggleShowSubjectiveEvaluationSurvey(true)
                                    setCurrentUserEvaluation({
                                        user: evaluation.user,
                                        factorLabel: factorRating.label
                                    })
                                }} criteriaGroup={criteriaGroup} globalFactorWeight={globalFactorWeight}/>
                            )}
                        </div>
                    </div>)}
                <Button
                    disabled={disableEvaluationRemoval}
                    onClick={() => handleSubjectiveEvaluationRemoval(evaluation.user)}
                    startIcon={!disableEvaluationRemoval && <DeleteIcon/>}
                />
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
            return ['POOR - Fire protection requirements not considered; Safety requirements\n' +
            'not met (too long\n' +
            'escape routes); partly confusing escape routes\n',
                'AVERAGE - Fire safety requirements partly considered; Safety requirements\n' +
                'partially met; mostly\n' +
                'escape routes\n',
                'EXCELLENT - Fire safety requirements considered; Safety requirements met;\n' +
                'clear escape routes']
        case 'Sound insulation':
            return ['POOR - unfavorable orientation of vulnerable rooms; unfavorable' +
            'orientation of private open spaces (e.g. railway tracks); structural sound' +
            'insulation measures not recognizable; use conflicts | ',
                'AVERAGE - partly unfavorable orientation of vulnerable rooms; partly' +
                'unfavorable orientation of private open spaces; structural noise' +
                'protection measures partly considered; if necessary, use conflicts (z. B.' +
                'between exercise and rest rooms)\n',
                'EXCELLENT - favorable orientation of vulnerable areas; favorable\n' +
                'orientation of private open spaces; structural noise protection measures\n' +
                'considered; no conflicts of use\n']
        case 'Accessibility':
            return ['POOR - driveway not considered; supply and disposal not accessible; poor\n' +
            'access to the underground parking; poor positioning of bicycle parking\n' +
            'spaces; number of bicycle parking spaces not fulfilled (0 pcs.); main\n' +
            'entrance not recognizable; long internal ways\n',
                'AVERAGE - driveway considered in a limited way; supply and disposal not\n' +
                'fully accessible; average access to the underground parking; average\n' +
                'positioning of bicycle parking spaces; number of bicycle parking spaces\n' +
                'not fulfilled (5 pcs.); main entrance partially recognizable; average long\n' +
                'internal ways \n',
                'EXCELLENT - driveway considered; supply and disposal easily accessible;\n' +
                'good access to the underground parking; good positioning of bicycle\n' +
                'parking spaces; number of bicycle parking spaces fulfilled (10 pcs.); main\n' +
                'entrance well recognizable; short internal ways\n']
        case 'Public accessibility':
            return ['POOR - public accessibility not considered; structural requirements for the\n' +
            'opening of internal facilities not considered\n',
                'AVERAGE - public accessibility partially considered; structural requirements\n' +
                'for the opening of internal facilities partially considered\n',
                'EXCELLENT - considered public accessibility; structural requirements for the\n' +
                'opening of internal facilities considered']
        case 'Barrier-free access':
            return ['POOR - barrier-free access not possible (elevator missing); barrier-free\n' +
            'entrance not possible\n',
                'AVERAGE - barrier-free access to some of the rooms (elevator on some\n' +
                'floors); barrier-free entrance possibility (e.g. ramps inside entrance area)\n',
                'EXCELLENT - barrier-free access to all rooms (elevator on each floor);\n' +
                'Barrier-free entrance (ramps in entrance area)']
        case 'Social integration spaces':
            return ['POOR - offer of free spaces with possibilities to sit in the building is barely\n' +
            'existing, offer in the outdoor area (foyer, communication zones, outdoor areas) is barely existing',
                'AVERAGE - small offer of free spaces with possibilities to sit in the building,\n' +
                'small offer in the outdoor area (foyer, Communication zones, outdoor areas)\n',
                'EXCELLENT - varied offer of free spaces with possibilities to sit in the\n' +
                'building, varied offer in the outdoor area (foyer, communication zones,\n' +
                'outdoor areas)']
        case 'User and task-specific image':
        case 'Building quality':
        case 'External space quality':
        case 'Urban integration':
        default:
            return []
    }
}

function weightForCriteriaGroup(label: string): number {
    switch (label.toLowerCase()) {
        case 'comfort and health':
            return 2
        case 'design quality':
            return 1
        case 'functionality':
            return 1
        default:
            return 1
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
                    criterion.rating = newValue * weightForCriteriaGroup(criteriaGroupLabel)
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
                                <Tooltip placement="bottom" title={tooltipForCriterionRating(criterion).join('|')}>
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
                                                defaultValue={criterion.rating / weightForCriteriaGroup(criteriaGroup.label)}
                                                value={criterion.rating / weightForCriteriaGroup(criteriaGroup.label)}
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