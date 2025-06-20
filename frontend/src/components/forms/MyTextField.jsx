import * as React from 'react';
import "../../App.css"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';

export default function MyTextField(props) {
    // ✅ Poprawka 1: Dodaj control z props + usunięto konflikt nazwy Controller
    const { label, name, control } = props;
    
    return (
        <Controller
            name={name}
            control={control}
            render={({
                field: { onChange, value },
                fieldState: { error },
                formState,
            }) => (  // ✅ Poprawka 2: Poprawna składnia arrow function
                <TextField 
                    id="outlined-basic" 
                    onChange={onChange}
                    value={value}
                    label={label} 
                    variant="outlined"
                    className="myForm"
                    error={!!error}
                    helperText={error?.message}  
                />
            )}  // ✅ Poprawka 3: Poprawne zamknięcie render function
        />
    );
}