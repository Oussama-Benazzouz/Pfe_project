import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { firestore, auth, storage } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { MultiSelect, Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { deleteObject } from "firebase/storage";
import Toast from "react-native-toast-message";

const EditProperty = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const propertyId = route.params.propertyId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [type, setType] = useState("");
  const [images, setImages] = useState([]);

  const cities = [
    { label: "Agadir", value: "Agadir" },
    { label: "Salé", value: "Salé" },
    { label: "Casablanca", value: "Casablanca" },
    { label: "Tanger", value: "Tanger" },
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

  useEffect(() => {
    const getPropertyDetails = async () => {
      try {
        const propertyRef = doc(
          firestore,
          `Properties/${auth.currentUser.uid}/PropertiesIds`,
          propertyId
        );
        const propertyDoc = await getDoc(propertyRef);
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          setTitle(propertyData.title);
          setDescription(propertyData.Description);
          setCity(propertyData.City);
          setAddress(propertyData.Address);
          setPrice(propertyData.Price);
          setAmenities(propertyData.Amenities);
          setImages(propertyData.images);
          setType(propertyData.Type); // Mettre à jour le type
        } else {
          console.log("La propriété n'existe pas.");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails de la propriété:",
          error
        );
      }
    };

    getPropertyDetails();
  }, []);

  const handleSubmit = async () => {
    try {
      const propertyRef = doc(
        firestore,
        `Properties/${auth.currentUser.uid}/PropertiesIds`,
        propertyId
      );

      await updateDoc(propertyRef, {
        title,
        Description: description,
        City: city,
        Address: address,
        Price: price,
        Amenities: amenities,
        Type: type,
        images: images,
      });
      console.log("Propriété mise à jour avec succès");
      showToast("success", "Propriété mise à jour avec succès");
      navigation.navigate("HomeScreenPro");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la propriété:", error);
      showToast("error", "Erreur lors de la mise à jour de la propriété");
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    try {
      const imageUrl = images[indexToRemove];
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
      const newImages = images.filter((_, index) => index !== indexToRemove);
      setImages(newImages);

      const propertyRef = doc(
        firestore,
        `Properties/${auth.currentUser.uid}/PropertiesIds`,
        propertyId
      );
      await updateDoc(propertyRef, {
        images: newImages,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
    }
  };

  const handleAddImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission refusée pour accéder à la galerie d'images.");
        return;
      }

      const imagePickerResult = await ImagePicker.launchImageLibraryAsync();
      if (imagePickerResult.canceled === true) {
        return;
      }

      const selectedAssets = imagePickerResult.assets;
      if (selectedAssets.length > 0) {
        const firstSelectedAsset = selectedAssets[0];
        const imageUri = firstSelectedAsset.uri;

        const imageName = `${propertyId}_${Date.now()}.jpg`;

        const imageBlob = await fetch(imageUri).then((response) =>
          response.blob()
        );

        const storageRef = ref(
          storage,
          `Images/${auth.currentUser.uid}/${propertyId}/${imageName}`
        );

        await uploadBytes(storageRef, imageBlob);

        const imageUrl = await getDownloadURL(storageRef);

        setImages([...images, imageUrl]);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la photo:", error);
    }
  };

  return (
    <View className="flex-1 mx-5 mt-12">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full">
          <Text className="font-bold text-2xl mx-auto py-5">
            Modifier la propriété
          </Text>
          <Text className="font-bold text-xm mb-2">Titre de l'annonce</Text>
          <TextInput
            className="px-5 py-4 rounded-lg border-2 border-gray-300 focus:border-text bg-blue-100 mb-2"
            placeholder="Titre de l'annonce"
            value={title}
            onChangeText={setTitle}
          />
          <Text className="font-bold text-xm mb-2">Description</Text>
          <TextInput
            className="px-5 py-4 rounded-lg border-2 border-gray-300 focus:border-text bg-blue-100 mb-2"
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text className="font-bold text-xm mb-2">Adresse</Text>
          <TextInput
            className="px-5 py-4 rounded-lg border-2 border-gray-300 focus:border-text bg-blue-100 mb-2"
            placeholder="Adresse"
            value={address}
            onChangeText={setAddress}
          />
          <Text className="font-bold text-xm mb-2">Prix</Text>
          <TextInput
            className="px-5 py-4 rounded-lg border-2 border-gray-300 focus:border-text bg-blue-100 mb-2"
            placeholder="Prix"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <Text className="font-bold text-xm mb-2">Ville</Text>
          <Dropdown
            className="px-5 py-3 rounded-lg border-2 border-gray-300 bg-blue-100 mb-2"
            data={cities}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select City"
            searchPlaceholder="Search..."
            value={city}
            onChange={(item) => {
              setCity(item.value);
            }}
          />
          <Text className="font-bold text-xm mb-2">Type</Text>
          <Dropdown
            className="px-5 py-3 rounded-lg border-2 border-gray-300 bg-blue-100 mb-2"
            data={[
              { label: "Individuel", value: "Individuel" },
              { label: "Collocation", value: "Collocation" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Type"
            value={type}
            onChange={(item) => {
              setType(item.value);
            }}
          />
          <Text className="font-bold text-xm mb-2">Amenities</Text>
          <MultiSelect
            className="px-5 py-3 border-2 border-gray-300 rounded-lg bg-blue-100 mb-2"
            data={[
              { label: "Cuisine Equipé", value: "Cuisine Equipé" },
              { label: "Wifi", value: "Wifi" },
              { label: "Meublé", value: "Meublé" },
              { label: "Machine à laver", value: "Machine à laver" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Amenities"
            value={amenities}
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
                  <AntDesign name="delete" size={20} color="red" />
                </View>
              </TouchableOpacity>
            )}
          />
          <View className="mb-2.5">
            <Text className="font-bold text-xl">Images :</Text>
            {images.map((image, index) => (
              <View key={index} className="flex-row mb-2">
                <Image
                  source={{ uri: image }}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                />
                <TouchableOpacity onPress={() => handleRemoveImage(index)}>
                  <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={handleAddImage}
              className="bg-text p-3 items-center border rounded-lg mb-2"
            >
              <Text className="text-white font-bold">Ajouter une photo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-text p-3 items-center border rounded-lg "
          >
            <Text className="text-white font-bold">
              Enregistrer les modifications
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProperty;
