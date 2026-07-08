import React, { useState } from 'react';

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';

import { register } from '../api/auth';

export default function RegisterScreen({ navigation }) {

    const [name, setName] = useState('');

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);

    async function handleRegister() {

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            Alert.alert(
                'Error',
                'All fields are required.'
            );

            return;

        }

        if (password !== confirmPassword) {

            Alert.alert(
                'Error',
                'Passwords do not match.'
            );

            return;

        }

        try {

            setLoading(true);

            await register({

                name,

                email,

                password,

                password_confirmation: confirmPassword

            });

            Alert.alert(
                'Success',
                'Registration successful.'
            );

            navigation.goBack();

        } catch (error) {

            Alert.alert(
                'Registration Failed',
                error?.response?.data?.message ??
                'Unable to register.'
            );

        }

        setLoading(false);

    }

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                Create Account
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Creating...' : 'Register'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.link}>
                    Already have an account? Login
                </Text>
            </TouchableOpacity>

        </View>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        justifyContent: 'center',

        padding: 24,

        backgroundColor: '#fff'

    },

    title: {

        fontSize: 30,

        fontWeight: 'bold',

        textAlign: 'center',

        marginBottom: 40

    },

    input: {

        borderWidth: 1,

        borderColor: '#ccc',

        borderRadius: 8,

        padding: 14,

        marginBottom: 15

    },

    button: {

        backgroundColor: '#4CAF50',

        padding: 15,

        borderRadius: 8

    },

    buttonText: {

        textAlign: 'center',

        color: '#fff',

        fontWeight: 'bold'

    },

    link: {

        marginTop: 20,

        textAlign: 'center',

        color: '#1E88E5'

    }

});