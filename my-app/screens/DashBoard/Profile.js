import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Avatar, List, Divider } from "react-native-paper";
import { auth, firestore, storage } from "../../firebase/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { ref, deleteObject, getDownloadURL, listAll } from "firebase/storage";

function Profile({ navigation }) {
  const user = auth.currentUser;
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [photoURL, setPhotoURL] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const menuItems = [
    {
      title: "Informations Personnelles",
      icon: "account",
      navigateTo: "PersonalInfo",
    },
    {
      title: "FAQ",
      icon: "frequently-asked-questions",
      navigateTo: "FAQ",
    },
  ];

  const fetchUserData = async () => {
    const userDocRef = doc(firestore, "users", user.uid);
    try {
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setFullName(userData.fullName);
        setEmail(userData.email);
        setPhotoURL(userData.photoURL);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  React.useEffect(() => {
    fetchUserData();
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const handleMenuItemPress = (item) => {
    navigation.navigate(item.navigateTo);
  };

  

  const handleDeleteAccount = async () => {
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      await deleteDoc(userDocRef);

      const userPropertiesDocRef = doc(firestore, "properties", user.uid);
      await deleteDoc(userPropertiesDocRef);

      // Supprimer le dossier contenant les photos de profil de l'utilisateur dans le stockage Firebase
      const profilePicRef = ref(storage, `images/${user.uid}`);
      try {
        await deleteObject(profilePicRef);
        console.log("Profile picture deleted successfully.");
      } catch (error) {
        if (error.code === "storage/object-not-found") {
          console.log("Profile picture does not exist. No need to delete.");
        } else {
          throw error; // Rethrow the error if it's not related to the object not found
        }
      }

      // Finally, delete the user
      await deleteUser(user);
    } catch (error) {
      console.error("Error deleting user account:", error);
    }
  };

  if (loading) {
    // Render a loading indicator or placeholder while data is being fetched
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          animating={true}
          color={MD2Colors.blue200}
          size={"large"}
        />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <ScrollView>
        <View className="p-3 mt-20 mb-4 items-center">
          {photoURL ? (
            <Avatar.Image size={100} source={{ uri: photoURL }} />
          ) : (
            <Avatar.Icon size={100} icon="account" />
          )}
          <Text className="text-2xl font-bold mt-4">{fullName}</Text>
          <Text className="text-gray-400 text-base font-semibold mt-2">
            {email}
          </Text>
        </View>
        <Divider bold />
        <View className="mt-4">
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} onPress={() => handleMenuItemPress(item)}>
              <List.Item
                title={item.title}
                left={(props) => (
                  <List.Icon {...props} icon={item.icon} type="font-awesome" />
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className="bg-text p-3 rounded-lg mt-12"
            onPress={() => auth.signOut()}
          >
            <Text className="text-white text-center text-semibold py-1">
              Déconnexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white p-3 rounded-lg mt-2 border-2 border-red-500"
            onPress={() => handleDeleteAccount()}
          >
            <Text className="text-red-500 text-center text-bold py-1">
              Supprimer le compte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Profile;
