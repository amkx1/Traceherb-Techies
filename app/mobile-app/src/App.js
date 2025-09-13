import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CollectorRegister from './components/CollectorRegister';
import CollectionEventForm from './components/CollectionEventForm';
import QRCodeScanner from './components/QRCodeScanner';
import ProvenanceDisplay from './components/ProvenanceDisplay';
import RecallNotification from './components/RecallNotification';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="CollectorRegister" component={CollectorRegister} />
        <Stack.Screen name="CollectionEventForm" component={CollectionEventForm} />
        <Stack.Screen name="QRCodeScanner" component={QRCodeScanner} />
        <Stack.Screen name="ProvenanceDisplay" component={ProvenanceDisplay} />
        <Stack.Screen name="RecallNotification" component={RecallNotification} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
