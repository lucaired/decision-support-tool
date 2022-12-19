import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

// @ts-ignore
export default function StringPropInput({target, updateFunction, property, propertyName}) {

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        let update = {...target}
        update[property] = event.target.value;
        updateFunction(update);
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
                value={target[property]}
                onChange={handleChange}
            />
        </Box>
    );
}