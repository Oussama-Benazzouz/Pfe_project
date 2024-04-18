import * as React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Profile from "../screens/DashBoard/Profile";
import Favoris from "../screens/Student/Favoris";
import Home from "../screens/Home";

const Tab = createBottomTabNavigator();

const homeName = "Accueil";
const favorisName = "Favoris";
const profileName = "Profil";

function DashBotNavigationEtu() {
  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === homeName) {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === favorisName) {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === profileName) {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name={homeName} component={Home} />
      <Tab.Screen name={favorisName} component={Favoris} />
      <Tab.Screen name={profileName} component={Profile} />
    </Tab.Navigator>
  );
}

export default DashBotNavigationEtu;
