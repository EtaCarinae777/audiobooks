import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function TextButtons(props) {
    const label = {props}
    return (
      <Button href="./register"
      className='myForm'>{label}</Button>

  );
}
