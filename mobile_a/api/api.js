import axios from "axios";
import {API_URL} from "../constants";
import {getToken} from "../storage/token";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000
});

api.interceptors.request.use(async config => {

    const token = await getToken();

    if(token){

        config.headers.Authorization = `Bearer ${token}`;

    }

    config.headers.Accept="application/json";

    return config;

});

export default api;