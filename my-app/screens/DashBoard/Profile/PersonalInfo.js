import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { auth, firestore, storage } from "../../../firebase/firebase";
import { Avatar, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Toast from "react-native-toast-message";

function PersonalInfo({navigation}) {
  const user = auth.currentUser;
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [photoURL, setPhotoURL] = React.useState("");
  const [disabled, setDisabled] = React.useState(true);
  const [newPhotoURL, setNewPhotoURL] = React.useState("");

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setFullName(userData.fullName);
          setEmail(userData.email);
          setPhoneNumber(userData.phoneNumber);
          setPhotoURL(userData.photoURL || "");
          setNewPhotoURL(userData.photoURL || "");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setNewPhotoURL(result.assets[0].uri);
    }
  };

  const showToast = () => {
    Toast.show({
      type: "success",
      position: "bottom",
      text1: "Profile updated successfully",
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const handleUpdate = async () => {
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDataToUpdate = {
        fullName,
        email,
        phoneNumber,
      };

      if (newPhotoURL) {
        const fileName = "profilePic.jpg";
        const storageRef = ref(
          storage,
          `images/${user.uid}/profilePic/${fileName}`
        );
        const blob = await fetch(newPhotoURL).then((response) =>
          response.blob()
        );
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        userDataToUpdate.photoURL = url;
      }

      await updateDoc(userDocRef, userDataToUpdate);

      console.log("Profile updated successfully");
      showToast();
      setPhotoURL(newPhotoURL);
      navigation.navigate("Profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View className="flex-1 items-center bg-background mx-6">
      <Text className="text-2xl font-bold my-12">
        Informations Personnelles
      </Text>
      <TouchableOpacity onPress={pickImage}>
        {photoURL ? (
          <Avatar.Image size={100} source={{ uri: newPhotoURL }} />
        ) : (
          <Avatar.Icon size={100} icon="account" />
        )}
      </TouchableOpacity>
      <View className="w-full items-center mt-6">
        <TextInput
          label="Nom complet"
          className="w-full bg-blue-100 my-2"
          value={fullName}
          onChangeText={(text) => setFullName(text)}
          mode="outlined"
          right={
            <TextInput.Icon
              icon={disabled ? "pencil" : "check-bold"}
              onPress={() => setDisabled(!disabled)}
            />
          }
          disabled={disabled}
        />
        <TextInput
          label="Email"
          className="w-full bg-blue-100 my-2"
          value={email}
          onChangeText={(text) => setEmail(text)}
          mode="outlined"
          right={
            <TextInput.Icon
              icon={disabled ? "pencil" : "check-bold"}
              onPress={() => setDisabled(!disabled)}
            />
          }
          disabled={disabled}
        />
        <TextInput
          label="Numéro de téléphone"
          className="w-full bg-blue-100 my-2"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          mode="outlined"
          right={
            <TextInput.Icon
              icon={disabled ? "pencil" : "check-bold"}
              onPress={() => setDisabled(!disabled)}
            />
          }
          disabled={disabled}
        />
        <TouchableOpacity
          className="w-full px-5 py-5 rounded-lg bg-text mb-2 flex-row items-center justify-center mt-6"
          onPress={handleUpdate}
        >
          <Text className="ml-2 text-white font-semibold">
            Confirmer Modifications
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default PersonalInfo;
