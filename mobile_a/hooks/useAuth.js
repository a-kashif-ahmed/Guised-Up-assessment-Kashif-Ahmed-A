import {useEffect,useState} from "react";
import {me} from "../api/auth";

export default function useAuth(){

    const [user,setUser]=useState(null);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        async function load(){

            try{

                const response=await me();

                setUser(response.user);

            }catch{

                setUser(null);

            }

            setLoading(false);

        }

        load();

    },[]);

    return{

        user,

        loading

    };

}