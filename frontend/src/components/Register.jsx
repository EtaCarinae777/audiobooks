import '../App.css'
import Box from '@mui/material/Box'; 
import MyTextField from './forms/MyTextField.jsx';
import PasswordField from './forms/PasswordField.jsx';
import MyButton from './forms/MyButton.jsx'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'; 
import AxiosInstance from './AxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Register = () => {
    const navigate = useNavigate();
    const {handleSubmit, control, watch, getValues} = useForm();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [emailStatus, setEmailStatus] = useState(''); // '', 'checking', 'available', 'taken'
    
    const watchedEmail = watch('email'); // Obserwuj zmiany w polu email

    // Sprawdź email gdy się zmieni
    useEffect(() => {
        const checkEmail = async () => {
            if (watchedEmail && watchedEmail.includes('@')) {
                setEmailStatus('checking');
                try {
                    const response = await AxiosInstance.post('check-email/', {
                        email: watchedEmail
                    });
                    
                    if (response.data.exists) {
                        setEmailStatus('taken');
                    } else {
                        setEmailStatus('available');
                    }
                } catch (error) {
                    console.error('Błąd sprawdzania email:', error);
                    setEmailStatus('');
                }
            } else {
                setEmailStatus('');
            }
        };

        // Opóźnienie 500ms żeby nie wysyłać requestów przy każdej literze
        const timer = setTimeout(checkEmail, 500);
        return () => clearTimeout(timer);
    }, [watchedEmail]);

    const submission = async (data) => {
        setLoading(true);
        setMessage('');

        // Sprawdź czy email jest dostępny
        if (emailStatus === 'taken') {
            setMessage('Ten email jest już zarejestrowany. Wybierz inny email.');
            setLoading(false);
            return;
        }

        // Walidacja hasła
        if (data.password !== data.password2) {
            setMessage('Hasła nie są identyczne');
            setLoading(false);
            return;
        }

        try {
            await AxiosInstance.post("register/", {
                email: data.email, 
                password: data.password,
            });

            setMessage('Rejestracja pomyślna! Możesz się teraz zalogować. Przekierowuję...');
            
            setTimeout(() => {
                navigate("/");
            }, 3000);

        } catch (registerError) {
            console.error('Błąd rejestracji:', registerError);
            
            if (registerError.response?.data?.email) {
                const emailError = registerError.response.data.email[0];
                if (emailError.includes('already exists') || emailError.includes('unique')) {
                    setMessage('Ten email jest już zarejestrowany. Spróbuj się zalogować.');
                } else {
                    setMessage(`Błąd email: ${emailError}`);
                }
            } else if (registerError.response?.data?.password) {
                setMessage(`Błąd hasła: ${registerError.response.data.password[0]}`);
            } else {
                setMessage('Błąd rejestracji. Spróbuj ponownie.');
            }
            
            setLoading(false);
        }
    }

    const getEmailStatusMessage = () => {
        switch(emailStatus) {
            case 'checking':
                return { text: 'Sprawdzam dostępność...', color: '#ff9800' };
            case 'available':
                return { text: '✓ Email dostępny', color: '#4caf50' };
            case 'taken':
                return { text: '✗ Email już zarejestrowany', color: '#f44336' };
            default:
                return null;
        }
    };

    const emailStatusInfo = getEmailStatusMessage();

    return (
        <div className={"myBackground"}> 
            <form onSubmit={handleSubmit(submission)}>
                <Box className={"whiteBox"}>
                    <Box className={"itemBox"}>
                        <Box className={"title"}>Register for Auth app</Box>
                    </Box>
                    
                    {message && (
                        <Box className={"itemBox"}>
                            <div style={{ 
                                padding: '10px', 
                                borderRadius: '4px',
                                backgroundColor: message.includes('Błąd') ? '#ffebee' : '#e8f5e8',
                                color: message.includes('Błąd') ? '#c62828' : '#2e7d32',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                {message}
                                {message.includes('pomyślna') && (
                                    <div style={{ marginTop: '10px' }}>
                                        <Link 
                                            to="/login" 
                                            style={{
                                                color: '#1976d2',
                                                textDecoration: 'underline',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Przejdź do logowania teraz
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </Box>
                    )}

                    <Box className={"itemBox"}>
                        <MyTextField 
                            label={"Email"}
                            name={"email"}
                            control={control}
                        />
                        {/* Status email */}
                        {emailStatusInfo && (
                            <div style={{
                                fontSize: '12px',
                                color: emailStatusInfo.color,
                                marginTop: '5px',
                                textAlign: 'left'
                            }}>
                                {emailStatusInfo.text}
                            </div>
                        )}
                    </Box>
                    
                    <Box className={"itemBox"}>
                        <PasswordField 
                            label={"Password"}
                            name={"password"}
                            control={control}     
                        />
                    </Box>
                    <Box className={"itemBox"}>
                        <PasswordField 
                            label={"Confirm password"}
                            name={"password2"}
                            control={control}
                        />
                    </Box>
                    <Box className={"itemBox"}>
                        <MyButton 
                            type={"submit"}
                            label={loading ? "Rejestracja..." : "Register"}
                            disabled={loading || emailStatus === 'taken'}
                        />
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