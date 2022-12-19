import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {DecisionTree} from "./NodeHandler";

// @ts-ignore
export default function NodeName({node, setNode}) {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        let update = {...node}
        update.name = event.target.value;
        setNode(update);
    };

    return (
        <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <TextField
                id="outlined-name"
                label="Name"
                value={node.name}
                onChange={handleChange}
            />
        </Box>
    );
}