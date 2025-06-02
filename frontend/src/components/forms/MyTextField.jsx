import * as React from 'react';
import "../../App.css"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function MyTextField(props) {

    const {label} = props
    return (
      <TextField 
      id="outlined-basic" 
      label={label} 
      variant="outlined"
      className={"myForm"}
    />
  );
}
