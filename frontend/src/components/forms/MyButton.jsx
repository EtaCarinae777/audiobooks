import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function MyButton(props) {
    const {label} = props;
    return (

        <Button variant="contained" 
        className={"myButton"}>{label}</Button>
        
    );
}
