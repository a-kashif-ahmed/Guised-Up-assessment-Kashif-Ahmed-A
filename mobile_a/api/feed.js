import api from "./api";

export async function getFeed(page=1){

    const response=await api.get("/feed",{

        params:{

            page

        }

    });

    return response.data;

}

export async function refreshFeed(){

    const response=await api.get("/feed/refresh");

    return response.data;

}

export async function getFeedStats(){

    const response=await api.get("/feed/stats");

    return response.data;

}