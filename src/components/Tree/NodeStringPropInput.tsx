import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

// @ts-ignore
export default function NodeStringPropInput({node, setNode, property, propertyName}) {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        let update = {...node}
        update[property] = event.target.value;
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
                label={propertyName}
                value={node[property]}
                onChange={handleChange}
            />
        </Box>
    );
}