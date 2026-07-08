import api from './api';

export async function search(query) {

    const response = await api.get('/search', {

        params: {

            q: query

        }

    });

    return response.data;

}