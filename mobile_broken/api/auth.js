import api from "./api";
import {saveToken, removeToken} from "../storage/token";

export async function register(data){

    const response=await api.post("/register",data);

    await saveToken(response.data.token);

    return response.data;

}

export async function login(email,password){

    const response=await api.post("/login",{

        email,

        password

    });

    await saveToken(response.data.token);

    return response.data;

}

export async function logout(){

    await api.post("/logout");

    await removeToken();

}

export async function me(){

    const response=await api.get("/me");

    return response.data;

}