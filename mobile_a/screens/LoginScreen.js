import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuth from '../hooks/useAuth';

import Loading from '../components/Loading';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import CreatePostScreen from '../screens/CreatePostScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="Register"
                component={RegisterScreen}
            />
        </Stack.Navigator>
    );
}

function MainStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Feed"
                component={FeedScreen}
            />

            <Stack.Screen
                name="Search"
                component={SearchScreen}
            />

            <Stack.Screen
                name="Create Post"
                component={CreatePostScreen}
            />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {

    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    return user ? <MainStack /> : <AuthStack />;
}