import * as React from 'react';
import Paper from '@mui/material/Paper';
import Card from "@mui/material/Card";
import {Avatar, Chip} from "@mui/material";

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

// @ts-ignore
function ObjectiveEvaluationViewer({activeVariant}) {
    return <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
        {activeVariant.objectiveEvaluation
        // @ts-ignore
        .map((evaluation) =>
        {return (
            <Card style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px",
            }}>
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
                    <Paper variant="outlined" style={{padding: "5px", textAlign: "center"}}>
                        <p>Category A</p>
                        <Chip label="8" />
                    </Paper>
                    <Paper variant="outlined" style={{padding: "5px", textAlign: "center"}}>
                        <p>Category B</p>
                        <Chip label="5" />
                    </Paper>
                    <Paper variant="outlined" style={{padding: "5px", textAlign: "center"}}>
                        <p>Category C</p>
                        <Chip label="7" />
                    </Paper>
                </div>
            </Card>
        )})}
    </div>
}
export default ObjectiveEvaluationViewer