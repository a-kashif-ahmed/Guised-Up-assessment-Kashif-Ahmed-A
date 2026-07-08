
import React, {

    useState

} from 'react';

import {

    View,

    FlatList,

    Text,

    ActivityIndicator,

    StyleSheet

} from 'react-native';

import { search } from '../api/search';

import SearchBar from '../components/SearchBar';

import PostCard from '../components/PostCard';

export default function SearchScreen() {

    const [query, setQuery] = useState('');

    const [results, setResults] = useState([]);

    const [loading, setLoading] = useState(false);

    async function handleSearch() {

        if (!query.trim()) {

            setResults([]);

            return;

        }

        try {

            setLoading(true);

            const response = await search(query);

            if (Array.isArray(response)) {

                setResults(response);

            }

            else if (response.data) {

                setResults(response.data);

            }

            else {

                setResults([]);

            }

        }

        catch (error) {

            console.log(error);

            setResults([]);

        }

        setLoading(false);

    }

    return (

        <View style={styles.container}>

            <SearchBar

                value={query}

                onChange={setQuery}

                onSearch={handleSearch}

            />

            {

                loading &&

                <ActivityIndicator

                    size="large"

                    style={styles.loading}

                />

            }

            <FlatList

                data={results}

                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item }) => (

                    <PostCard

                        post={item}

                    />

                )}

                ListEmptyComponent={

                    !loading ?

                    <View style={styles.empty}>

                        <Text>

                            No search results

                        </Text>

                    </View>

                    : null

                }

            />

        </View>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: '#F3F3F3'

    },

    loading: {

        marginTop: 30

    },

    empty: {

        marginTop: 50,

        alignItems: 'center'

    }

});