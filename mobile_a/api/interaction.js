import api from "./api";

export async function addInteraction(postId,type){

    const response=await api.post("/interactions",{

        post_id:postId,

        type

    });

    return response.data;

}

export async function viewPost(postId){

    return api.post(`/posts/${postId}/view`);

}

export async function react(postId){

    return api.post(`/posts/${postId}/reaction`);

}

export async function reply(postId){

    return api.post(`/posts/${postId}/reply`);

}