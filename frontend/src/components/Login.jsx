import '../App.css'
import Box from '@mui/material/Box'; 
import MyTextField from './forms/MyTextField.jsx';
import PasswordField from './forms/PasswordField.jsx';
import MyButton from './forms/MyButton.jsx'
import MyRegButt from './forms/MyRegButt.jsx'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import AxiosInstance from './AxiosInstance';
import { useNavigate } from 'react-router-dom';



const Login = () => {
    const {handleSubmit, control} = useForm();
    const navigate = useNavigate();
    const submission = (data) => {
        AxiosInstance.post("login/",{
            email: data.email, 
            password: data.password,
        })

        .then((response)=> {
            console.log(response)
            //zapisuje token w localStorge
            localStorage.setItem("Token", response.data.token)
            //po zalogowaniu przekierowuje mnie do home
            navigate("/home")
        
        })
        .catch((error) => {
            console.error("There was an error logging in!", error);
        });
    }

    return (
        <div className={"myBackground"}> 
            <form onSubmit = {handleSubmit(submission)}>

            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"login-title"}>Log in</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField 
                    label={"Email"}
                    name={"email"}
                    control={control}
                    />

                </Box>
                <Box className={"itemBox"}>
                    <PasswordField 
                    label={"Password"}
                    name={"password"}
                    control={control}    
                    />
                </Box>
                <Box className={"itemBox"}>
                    <MyButton 
                    type={"submit"}
                    label={"Log in"}
                        
                    />
                </Box>
                <Box className={"itemBox"}>
                    <Link to="register" className={"myLink"}>No account yet? Register now!</Link>
                </Box>

            </Box>
            </form>
        </div>
    )
}

export default Login;