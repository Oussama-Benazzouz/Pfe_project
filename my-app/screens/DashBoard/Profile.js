import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Avatar, List, Divider } from "react-native-paper";
import { auth, firestore } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";


function Profile({ navigation }) {
  const user = auth.currentUser;
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [photoURL, setPhotoURL] = React.useState("");

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

  React.useEffect(() => {
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
      }
    };
    fetchUserData();
  });

  const handleMenuItemPress = (item) => {
    navigation.navigate(item.navigateTo);
  };

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Profile;
