import '../App.css'
import Box from '@mui/material/Box'; 
import MyTextField from './forms/MyTextField.jsx';
import PasswordField from './forms/PasswordField.jsx';
import MyButton from './forms/MyButton.jsx'
import { Link } from 'react-router-dom'

const Register = () => {
    return (
        <div className={"myBackground"}> 
            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>Register for Auth app</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField label={"Email"}/>
                </Box>
                <Box className={"itemBox"}>
                    <PasswordField label={"Password"}/>
                </Box>
                <Box className={"itemBox"}>
                    <PasswordField label={"Confirm password"}/>
                </Box>
                <Box className={"itemBox"}>
                    <MyButton label={"Register"}/>
                </Box>
                <Box className={"itemBox"}>
                    <Link to="/" className={"myLink"}>Have an account? Log in</Link>
                </Box>

            </Box>
        </div>
    )
}

export default Register;