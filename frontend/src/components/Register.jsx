import '../App.css'
import Box from '@mui/material/Box'; 
import MyTextField from './forms/MyTextField.jsx';
import PasswordField from './forms/PasswordField.jsx';
import MyButton from './forms/MyButton.jsx'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'; 
import AxiosInstance from './AxiosInstance';
import { useNavigate } from 'react-router-dom';


const Register = () => {
    const navigate = useNavigate();
    const {handleSubmit, control} = useForm();
    const submission = (data) => {
        AxiosInstance.post("register/",{
            email: data.email, 
            password: data.password,
        })

        .then(()=> {
            navigate("/login")
        
        })
    }

    return (
        <div className={"myBackground"}> 
            <form onSubmit = {handleSubmit(submission)}>
            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>Register for Auth app</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField 
                    label={"Email"}
                    name={"email"}
                    control = {control}
                    />
                </Box>
                <Box className={"itemBox"}>
                    <PasswordField 
                    label={"Password"}
                    name={"password"}
                    control = {control}     
                    />
                </Box>
                <Box className={"itemBox"}>
                    <PasswordField 
                    label={"Confirm password"}
                    name={"password2"}
                    control = {control}
                    />
                </Box>
                <Box className={"itemBox"}>
                    <MyButton 
                    type={"submit"}
                    label={"Register"}/>
                </Box>
                <Box className={"itemBox"}>
                    <Link to="/" className={"myLink"}>Have an account? Log in</Link>
                </Box>

            </Box>
            </form>
        </div>
    )
}

export default Register;