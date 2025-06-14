import React from 'react';
import { View, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from './App/components/HomeScreen';
import DiagnosisScreen from './App/components/DiagnosisScreen';
import SymptomForm from './App/components/SymptomForm';
import ImageDiagnosis from './App/components/ImageDiagnosis';

// Placeholder AccountScreen (replace with your own if needed)
function AccountScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FB',
      }}
    >
      <Text style={{ fontSize: 22, color: '#2A86FF', fontWeight: '600' }}>
        Account
      </Text>
      <Text style={{ color: '#666', marginTop: 10 }}>
        Your account details will appear here.
      </Text>
    </View>
  );
}

// Custom header with your icon and title
const HeaderWithCustomIcon = () => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', // Center horizontally
      flex: 1, // Take all available space
    }}
  >
    <Image
      source={require('./assets/healthcare.png')} // <-- Update this path if your icon is elsewhere
      style={{ width: 28, height: 28, resizeMode: 'contain' }}
    />
    <Text
      style={{
        marginLeft: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
      }}
    >
      AI Microclinic
    </Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: () => <HeaderWithCustomIcon />,
        headerTitleAlign: 'left',
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 10,
          position: 'absolute',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="home"
              size={28}
              color={focused ? '#2A86FF' : '#666'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Diagnosis"
        component={DiagnosisScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={28}
              color={focused ? '#2A86FF' : '#666'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="account"
              size={28}
              color={focused ? '#2A86FF' : '#666'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitle: () => <HeaderWithCustomIcon />,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 2,
            shadowOpacity: 0.1,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SymptomForm"
          component={SymptomForm}
          options={{ headerTitle: () => <HeaderWithCustomIcon /> }}
        />
        <Stack.Screen
          name="ImageDiagnosis"
          component={ImageDiagnosis}
          options={{ headerTitle: () => <HeaderWithCustomIcon /> }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
