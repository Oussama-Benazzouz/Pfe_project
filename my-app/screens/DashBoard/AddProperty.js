import * as React from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  Picker,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { storage, firestore, auth } from "../../firebase/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from "react-native-toast-message";

function AddProperty({navigation}) {
  const user = auth.currentUser;
  const [title, setTitle] = React.useState("");
  const [image, setImage] = React.useState([]);
  const [Description, setDescription] = React.useState("");
  const [City, setCity] = React.useState("");
  const [Address, setAddress] = React.useState("");
  const [Price, setPrice] = React.useState("");
  const [Amenities, setAmenities] = React.useState([]);
  const cities = [
    { label: "Agadir", value: "Agadir" },
    { label: "Salé", value: "Salé" },
    { label: "Casablanca", value: "Casablanca" },
    { label: "Tanger", value: "Tanger" },
  ];
  const amenities = [
    { label: "Cuisine Equipé", value: "Cuisine Equipé" },
    { label: "Wifi", value: "Wifi" },
    { label: "Meublé", value: "Meublé" },
    { label: "Machine à laver", value: "Machine à laver" },
  ];

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      position: "bottom",
      text1: message,
      visibilityTime: 2000,
      autoHide: true,
    });
  };



  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      setImage([
        ...image,
        ...result.assets.map((asset) => ({ uri: asset.uri })),
      ]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImage(image.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    try {

      const propertiesRef = collection(
        firestore,
        "Properties",
        user.uid,
        "PropertiesIds"
      );
      const querySnapshot = await getDocs(
        query(propertiesRef, where("title", "==", title))
      );

      // If a property with the same title exists, show a toast message and abort
      if (!querySnapshot.empty) {
        showToast("error", "Property already exists");
        return;
      }


      const propertyData = {
        title,
        Description,
        City,
        Address,
        Price,
        Amenities,
        images: [],
      };

      // Reference to the user's document under Properties collection
      const userPropertiesRef = doc(firestore, "Properties", user.uid);

      // Add a new property document under the user's document
      const newPropertyRef = await addDoc(
        collection(userPropertiesRef, "PropertiesIds"),
        propertyData
      );

      // Upload images and update URLs in Firestore
      await Promise.all(
        image.map(async (image, index) => {
          const fileName = image.uri.substring(image.uri.lastIndexOf("/") + 1);

          // Construct the storage reference path
          const storagePath = `Images/${user.uid}/${newPropertyRef.id}/${fileName}`;
          const storageRef = ref(storage, storagePath);

          const blob = await fetch(image.uri).then((response) =>
            response.blob()
          );
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          propertyData.images.push(url);
        })
      );

      // Update the property document with image URLs
      await updateDoc(newPropertyRef, { images: propertyData.images });
      showToast("success", "Property added successfully");
      navigation.navigate("DashBoard");
      console.log("Property added successfully");
    } catch (error) {
      console.error("Error adding property: ", error);
    }
  };


  return (
    <SafeAreaView className="flex-1 items-center  bg-background">
      <ScrollView className="w-full h-full">
        <View className="items-center">
          <Text className="text-2xl font-bold mt-12 mb-6">
            Ajouter une annonce
          </Text>
          <View className="w-full">
            <TextInput
              placeholder="Titre de l'annonce"
              value={title}
              onChangeText={setTitle}
              className="mx-5 px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-2"
            />
            <TextInput
              placeholder="Description"
              value={Description}
              onChangeText={setDescription}
              className="mx-5 px-5 py-4 rounded-lg border-2 border-transparent  focus:border-text bg-blue-100 mb-2"
              multiline={true}
            />
            <Dropdown
              className="mx-5 px-5 py-3 rounded-lg bg-blue-100 mb-2"
              data={cities}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select City"
              searchPlaceholder="Search..."
              value={City}
              onChange={(item) => {
                setCity(item.value);
              }}
            />
            <TextInput
              placeholder="Adresse"
              value={Address}
              onChangeText={setAddress}
              className="mx-5 px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-2"
              multiline
            />
            <TextInput
              placeholder="Prix"
              value={Price}
              onChangeText={setPrice}
              className="mx-5 px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-2"
              keyboardType="numeric"
            />
            <MultiSelect
              className="mx-5 px-5 py-3 rounded-lg bg-blue-100 mb-2"
              data={amenities}
              labelField="label"
              valueField="value"
              placeholder="Select Amenities"
              value={Amenities}
              search
              searchPlaceholder="Search..."
              onChange={(item) => {
                setAmenities(item);
              }}
              renderSelectedItem={(item, unSelect) => (
                <TouchableOpacity
                  onPress={() => unSelect && unSelect(item)}
                  className="ml-2"
                >
                  <View className="flex-row items-center rounded-lg bg-white mt-2 mr-3 px-3 py-2">
                    <Text className="mr-1 text-xs">{item.label}</Text>
                    <AntDesign color="black" name="delete" size={17} />
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              className="mx-5 px-5 py-5 rounded-lg bg-text mb-2 flex-row items-center justify-center mt-2"
              onPress={pickImage}
            >
              <AntDesign name="camera" size={20} color="white" />
              <Text className="ml-2 text-white">Upload Property Pictures</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mx-5 px-5 py-5 rounded-lg bg-text mb-2 flex-row items-center justify-center mt-2"
              onPress={handleSubmit}
            >
              <Text className="ml-2 text-white">Ajouter Annonce</Text>
            </TouchableOpacity>
            <View className="flex-row mx-5">
              {image.map((image, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Image
                    source={{ uri: image.uri }}
                    style={{ width: 48, height: 48, marginRight: 10 }}
                  />
                  <TouchableOpacity onPress={() => handleRemoveImage(index)}>
                    <AntDesign name="delete" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AddProperty;
