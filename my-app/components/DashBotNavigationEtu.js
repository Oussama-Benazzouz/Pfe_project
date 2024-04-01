import * as React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import Profile from "../screens/DashBoard/Profile";
import Explore from "../screens/Student/Explore";
import Favoris from "../screens/Student/Favoris";

const Tab = createBottomTabNavigator();

const homeName = "Accueil";
const exploreName = "Explorer";
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
          } else if (route.name === exploreName) {
            iconName = focused ? "compass" : "compass-outline";
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
      <Tab.Screen name={homeName} component={HomeScreen} />
      <Tab.Screen name={exploreName} component={Explore} />
      <Tab.Screen name={favorisName} component={Favoris} />
      <Tab.Screen name={profileName} component={Profile} />
    </Tab.Navigator>
  );
}

export default DashBotNavigationEtu;
