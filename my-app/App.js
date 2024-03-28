import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import onboarding from "./screens/onboarding";
import DashBoard from "./screens/DashBoard";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import { auth, firestore } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Profile from "./screens/DashBoard/Profile";
import AddProperty from "./screens/DashBoard/AddProperty";

const Stack = createNativeStackNavigator();

function App() {
  const [user, setUser] = React.useState(auth.currentUser);
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
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
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return null; 
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            userRole === "Etudiant" ? (
              <Stack.Screen name="Home" component={HomeScreen} />
            ) : (
              <>
                <Stack.Screen name="DashBoard" component={DashBoard} />
                <Stack.Screen name="AddProperty" component={AddProperty}/>
              </>
            )
          ) : (
            <>
              <Stack.Screen name="onboarding" component={onboarding} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;
