import React, {

    useState

} from 'react';

import {

    View,

    Text,

    TextInput,

    TouchableOpacity,

    StyleSheet,

    Alert,

    ScrollView

} from 'react-native';

import { createPost } from '../api/posts';

export default function CreatePostScreen({

    navigation

}) {

    const [textContent, setTextContent] = useState('');

    const [imageUrl, setImageUrl] = useState('');

    const [loading, setLoading] = useState(false);

    async function handleCreatePost() {

        if (!textContent.trim()) {

            Alert.alert(

                "Validation",

                "Post content is required."

            );

            return;

        }

        try {

            setLoading(true);

            await createPost(

                textContent,

                imageUrl || null

            );

            Alert.alert(

                "Success",

                "Post created successfully."

            );

            navigation.goBack();

        }

        catch (error) {

            Alert.alert(

                "Error",

                error?.response?.data?.message ||

                "Unable to create post."

            );

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <ScrollView

            style={styles.container}

            contentContainerStyle={styles.content}

        >

            <Text style={styles.title}>

                Create New Post

            </Text>

            <TextInput

                style={styles.textArea}

                multiline

                numberOfLines={6}

                placeholder="What's on your mind?"

                value={textContent}

                onChangeText={setTextContent}

                textAlignVertical="top"

            />

            <TextInput

                style={styles.input}

                placeholder="Image URL (optional)"

                value={imageUrl}

                onChangeText={setImageUrl}

                autoCapitalize="none"

            />

            <TouchableOpacity

                style={[

                    styles.button,

                    loading && styles.disabled

                ]}

                onPress={handleCreatePost}

                disabled={loading}

            >

                <Text style={styles.buttonText}>

                    {

                        loading

                        ?

                        "Posting..."

                        :

                        "Create Post"

                    }

                </Text>

            </TouchableOpacity>

        </ScrollView>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#F5F5F5"

    },

    content: {

        padding: 20

    },

    title: {

        fontSize: 28,

        fontWeight: "bold",

        marginBottom: 25

    },

    textArea: {

        backgroundColor: "#fff",

        borderWidth: 1,

        borderColor: "#ddd",

        borderRadius: 10,

        padding: 15,

        height: 180,

        marginBottom: 20

    },

    input: {

        backgroundColor: "#fff",

        borderWidth: 1,

        borderColor: "#ddd",

        borderRadius: 10,

        padding: 15,

        marginBottom: 20

    },

    button: {

        backgroundColor: "#1976D2",

        padding: 16,

        borderRadius: 10,

        alignItems: "center"

    },

    disabled: {

        opacity: 0.6

    },

    buttonText: {

        color: "#fff",

        fontSize: 18,

        fontWeight: "bold"

    }

});