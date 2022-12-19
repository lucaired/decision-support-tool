import * as React from 'react';
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

// @ts-ignore
export default function NodeStringPropSelect({node, setNode, property, propertyName, options}) {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        let update = {...node}
        update[property] = event.target.value;
        setNode(update);
    };

    return (
        <FormControl
            sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
            }}
        >
            <InputLabel id="demo-simple-select-label">Decision Level</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={node[property]}
                label={propertyName}
                // @ts-ignore
                onChange={handleChange}
            >
                {options.map((option: string) =>
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                )
                }
            </Select>
        </FormControl>
    );
}