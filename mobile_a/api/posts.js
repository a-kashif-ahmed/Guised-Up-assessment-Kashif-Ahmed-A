import api from "./api";

export async function getPosts(){

    const response=await api.get("/posts");

    return response.data;

}

export async function createPost(text,imageUrl=null){

    const response=await api.post("/posts",{

        text_content:text,

        image_url:imageUrl

    });

    return response.data;

}

export async function updatePost(id,text,imageUrl=null){

    const response=await api.put(`/posts/${id}`,{

        text_content:text,

        image_url:imageUrl

    });

    return response.data;

}

export async function deletePost(id){

    return api.delete(`/posts/${id}`);

}