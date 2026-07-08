import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import CreatePostScreen from '../screens/CreatePostScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Feed: undefined;
  Search: undefined;
  'Create Post': undefined;
};

const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const MainStackNav = createNativeStackNavigator<MainStackParamList>();

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

function MainStack() {
  return (
    <MainStackNav.Navigator>
      <MainStackNav.Screen name="Feed" component={FeedScreen} />
      <MainStackNav.Screen name="Search" component={SearchScreen} />
      <MainStackNav.Screen name="Create Post" component={CreatePostScreen} />
    </MainStackNav.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return user ? <MainStack /> : <AuthStack />;
}
