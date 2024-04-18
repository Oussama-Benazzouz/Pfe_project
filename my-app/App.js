import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import onboarding from "./screens/onboarding";
import DashBoard from "./screens/DashBoard";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import { auth, firestore } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AddProperty from "./screens/DashBoard/AddProperty";
import PersonalInfo from "./screens/DashBoard/Profile/PersonalInfo";
import FAQ from "./screens/DashBoard/Profile/FAQ";
import Toast from "react-native-toast-message";
import Profile from "./screens/DashBoard/Profile";
import EditProperty from "./screens/DashBoard/EditProperty";
import HomeScreenPro from "./screens/DashBoard/HomeScreenPro";
import EtuView from "./screens/EtuView";
import Favoris from "./screens/Student/Favoris";
import Home from "./screens/Home";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { View } from "react-native";
import PropertyDetails from "./screens/PropertyDetails";
import Avis from "./screens/Avis";


const Stack = createNativeStackNavigator();

function App() {
  const [user, setUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);

 React.useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setUser(user);
  });
  return unsubscribe;
}, []);

React.useEffect(() => {
  setUserRole(null);
  const fetchUserRole = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }
  };

  fetchUserRole();
}, [user]);


  const LoadingScreen = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator animating={true} color={MD2Colors.red500} />
      </View>
    );
  
  };

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            userRole === null ? (
              <Stack.Screen name="Loading" component={LoadingScreen} />
            ) : userRole === "Etudiant" ? (
              <>
                <Stack.Screen name="EtuView" component={EtuView} />
                <Stack.Screen name="Favoris" component={Favoris} />
                <Stack.Screen name="PropertyDetails" component={PropertyDetails} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Avis" component={Avis} />
              </>
            ) : (
              <>
                <Stack.Screen name="DashBoard" component={DashBoard} />
                <Stack.Screen name="AddProperty" component={AddProperty} />
                <Stack.Screen name="EditProperty" component={EditProperty} />
                <Stack.Screen name="HomeScreenPro" component={HomeScreenPro} />
              </>
            )
          ) : (
            <>
              <Stack.Screen name="onboarding" component={onboarding} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
            </>
          )}
          {/* Common screens for both roles */}
          <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
          <Stack.Screen name="FAQ" component={FAQ} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </>
  );
}

export default App;
