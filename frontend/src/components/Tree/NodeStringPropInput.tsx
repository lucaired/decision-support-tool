import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

interface StringPropInputProps {
    target: object;
    updateFunction: Function; 
    property: string;
    propertyName: string;
    transform?: (arg0: any) => any
}

export default function StringPropInput({target, updateFunction, property, propertyName, transform}: StringPropInputProps) {

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        let update = {...target}
        // @ts-ignore
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
                // @ts-ignore
                value={transform ? transform(target[property]) : target[property]}
                onChange={handleChange}
            />
        </Box>
    );
}