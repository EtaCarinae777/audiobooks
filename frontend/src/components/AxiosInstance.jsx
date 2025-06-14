import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/'

const AxiosInstance = axios.create({
    baseURL : baseUrl, 
    timeout : 5000,
    headers : {
        "Content-Type": "application/json",
        accept : "application/json",

    }
})

// Automatycznie dodaj token do każdego zapytania
AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('Token');
        if (token) {
            config.headers.Authorization = `Token ${token}`
        }
        else ( // Jeśli nie ma tokena, to nie dodawaj go
            config.headers.Authorization = ``
        )
        return config;
    }
    // },
    // (error) => {
    //     return Promise.reject(error);
    // }
);

// Automatycznie wyloguj gdy token wygaśnie
AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jeśli serwer mówi "nie masz uprawnień" - wyloguj
        if (error.response && error.response.status === 401) { //401 - Unauthorized/iNVALID
            localStorage.removeItem('Token')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
);

export default AxiosInstance;