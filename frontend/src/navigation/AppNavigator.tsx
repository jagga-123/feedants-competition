import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompetitionDetailsScreen from '../screens/CompetitionDetailsScreen';

export type RootStackParamList = {
  CompetitionDetails: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CompetitionDetails" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CompetitionDetails" component={CompetitionDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
