import * as React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { firestore, auth, storage } from "../../firebase/firebase";
import { ref, deleteObject } from "firebase/storage";
import { FontAwesome } from "@expo/vector-icons";

function HomeScreenPro() {
  const navigation = useNavigation();
  const [properties, setProperties] = React.useState([]);

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const user = auth.currentUser;
        const userPropertiesRef = doc(firestore, "Properties", user.uid);
        const propertiesIdsCollection = collection(
          userPropertiesRef,
          "PropertiesIds"
        );
        const propertiesSnapshot = await getDocs(propertiesIdsCollection);

        const propertiesData = [];

        for (const docRef of propertiesSnapshot.docs) {
          const propertyRef = doc(
            firestore,
            "Properties",
            user.uid,
            "PropertiesIds",
            docRef.id
          );
          const propertyDoc = await getDoc(propertyRef);
          if (propertyDoc.exists()) {
            const property = {
              id: propertyDoc.id,
              title: propertyDoc.data().title,
              price: propertyDoc.data().Price,
              images: propertyDoc.data().images,
            };
            propertiesData.push(property);
          }
        }

        setProperties(propertiesData);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();

    const unsubscribe = onSnapshot(
      collection(firestore, `Properties/${auth.currentUser.uid}/PropertiesIds`),
      () => {
        fetchProperties();
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDeleteProperty = async (propertyId, images) => {
    try {
      const propertyRef = doc(
        firestore,
        `Properties/${auth.currentUser.uid}/PropertiesIds`,
        propertyId
      );
      const deleteImagePromises = images.map(async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      });
      await Promise.all(deleteImagePromises);
      await deleteDoc(propertyRef);
      console.log("Property deleted successfully");
      setProperties(
        properties.filter((property) => property.id !== propertyId)
      );
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handleViewMore = (propertyId) => {
    console.log("View More Info pressed for propertyId:", propertyId);
  };

  const handleEditProperty = (propertyId) => {
    navigation.navigate("EditProperty", { propertyId });
  };

  return (
    <View className="flex-1 items-center  bg-background">
      <Text className="text-2xl font-bold mt-12">Mes annonces</Text>

      <ScrollView className="w-full mt-6" showsVerticalScrollIndicator={false}>
        {properties.map((property) => (
          <View
            key={property.id}
            className="mx-5 border border-gray-300 rounded-lg p-4 mb-4"
          >
            <Text className="text-lg font-bold mb-2">{property.title}</Text>
            <View className="flex flex-row justify-between mb-2">
              <TouchableOpacity
                style="bg-gray-200 px-2 py-1 rounded-md mr-2"
                onPress={() => handleEditProperty(property.id)}
              >
                <FontAwesome name="edit" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style="bg-gray-200 px-2 py-1 rounded-md"
                onPress={() =>
                  handleDeleteProperty(property.id, property.images)
                }
              >
                <FontAwesome name="trash" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row justify-between">
              <TouchableOpacity
                style="bg-gray-200 px-2 py-1 rounded-md mr-2"
                onPress={() => handleViewMore(property.id)}
              >
                <Text>View More Info</Text>
              </TouchableOpacity>
              <Text className="text-base">Price: {property.price} MAD</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <FAB
        className="absolute right-4 bottom-4 bg-white"
        icon="plus"
        onPress={() => {
          navigation.navigate("AddProperty");
        }}
      />
    </View>
  );
}

export default HomeScreenPro;
