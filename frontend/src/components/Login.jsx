import '../App.css'
import Box from '@mui/material/Box'; 
import MyTextField from './forms/MyTextField.jsx';
import PasswordField from './forms/PasswordField.jsx';
import MyButton from './forms/MyButton.jsx'
import MyRegButt from './forms/MyRegButt.jsx'
import { Link } from 'react-router-dom'

const Login = () => {
    return (
        <div className={"myBackground"}> 
            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>Login for Auth app</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField label={"Email"}/>
                </Box>
                <Box className={"itemBox"}>
                    <PasswordField label={"Password"}/>
                </Box>
                <Box className={"itemBox"}>
                    <MyButton label={"Log in"}/>
                </Box>
                <Box className={"itemBox"}>
                    <Link to="register" className={"myLink"}>No account yet? Register now!</Link>
                </Box>

            </Box>
        </div>
    )
}

export default Login;