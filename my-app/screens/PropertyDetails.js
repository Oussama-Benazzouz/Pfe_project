import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { IconButton, Paragraph, Button } from "react-native-paper";
import Carousel from "react-native-snap-carousel";
import { Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function PropertyDetails({ route }) {
  const { title, userId, refresh, userOwner } = route.params;
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const propertiesIdsCollection = collection(
          firestore,
          `Properties/${userId}/PropertiesIds`
        );
        const propertiesSnapshot = await getDocs(propertiesIdsCollection);

        for (const docRef of propertiesSnapshot.docs) {
          const propertyRef = doc(
            firestore,
            `Properties/${userId}/PropertiesIds`,
            docRef.id
          );
          const propertyDoc = await getDoc(propertyRef);
          if (propertyDoc.exists() && propertyDoc.data().title === title) {
            setPropertyDetails(propertyDoc.data());
            setPropertyId(docRef.id);
            console.log("Property ID:", docRef.id);
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    };

    fetchPropertyDetails();
  }, [title, userId, refresh]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDocRef = doc(firestore, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          setUserDetails(userDocSnapshot.data());
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        if (propertyId) {
          const ratingsQuery = query(
            collection(firestore, "ratings"),
            where("property_id", "==", propertyId)
          );
          const unsubscribe = onSnapshot(ratingsQuery, (snapshot) => {
            let totalMoyenAvis = 0;
            let totalReviews = 0;

            snapshot.forEach((doc) => {
              const data = doc.data();
              totalMoyenAvis += data.moyen_avis;
              totalReviews++;
            });

            if (totalReviews > 0) {
              const averageRating = totalMoyenAvis / totalReviews;
              setAverageRating(averageRating);
            }
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };

    fetchAverageRating();
  }, [propertyId]);

  const handleNavigateToAvis = () => {
    navigation.navigate("Avis", {
      userId: propertyDetails.ownerId,
      propertyId: propertyId,
      refresh: true,
      userOwner,
    });
  };

  const handleCall = () => {
    const phoneNumber = userDetails.phoneNumber;
    let phoneNumberUrl = "";
    if (Platform.OS === "android") {
      phoneNumberUrl = `tel:${phoneNumber}`;
    } else {
      phoneNumberUrl = `telprompt:${phoneNumber}`;
    }
    Linking.openURL(phoneNumberUrl);
  };

  const handleMessage = () => {
    const phoneNumber = userDetails.phoneNumber;
    const phoneNumberUrl = `sms:${phoneNumber}`;
    Linking.openURL(phoneNumberUrl);
  };

  if (!propertyDetails || !userDetails) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderIconForAmenity = (amenity) => {
    switch (amenity) {
      case "Cuisine Equipé":
        return <Ionicons name="restaurant" size={24} color="black" />;
      case "Wifi":
        return <Ionicons name="wifi" size={24} color="black" />;
      case "Meublé":
        return <Ionicons name="bed" size={24} color="black" />;
      case "Machine à laver":
         return (
           <MaterialCommunityIcons
             name="washing-machine"
             size={24}
             color="black"
           />
         );
      default:
        return null;
    }
  };


  return (
    <ScrollView>
      <View style={{ flex: 1 }}>
        <View>
          {propertyDetails.images.length > 1 ? (
            <Carousel
              layout={"default"}
              data={propertyDetails.images}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: "100%", height: 300 }}
                />
              )}
              sliderWidth={450}
              itemWidth={450}
            />
          ) : (
            propertyDetails.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: "100%", height: "40%" }}
              />
            ))
          )}
        </View>
        <View className="mx-5">
          <View className="mt-5">
            <Text className="font-bold text-xl">{title}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location" size={20} color="black" />
              <Text className="font-normal text-base ml-1">
                {propertyDetails.City}, {propertyDetails.Address}
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <View className="flex-row items-center">
              <Avatar.Image source={{ uri: userDetails.photoURL }} size={46} />
              <View className="ml-2">
                <Text className="font-bold text-lg">
                  {userDetails.fullName}
                </Text>
                <Text>{userDetails.role}</Text>
              </View>
              <View className="ml-auto flex-row">
                <IconButton onPress={handleMessage} icon="message" />
                <IconButton icon="phone" onPress={handleCall} />
              </View>
            </View>
          </View>

          <View className="mt-5">
            <View>
              <Text className="font-bold text-lg">Équipements</Text>
            </View>
            <View className="mt-1">
              {propertyDetails.Amenities.map((amenity, index) => (
                <View key={index} className="flex-row items-center my-1">
                  {renderIconForAmenity(amenity)}
                  <Text className="ml-2">{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-5">
            <Text className="font-bold text-lg">
              About location's neighborhood
            </Text>
            <Paragraph className="mt-2 text-[13px] text-gray-500">
              {propertyDetails.Description}
            </Paragraph>
          </View>

          <View className="mt-5">
            <TouchableOpacity className="w-full px-5 py-4 flex-row justify-between items-center bg-text rounded-lg ">
              <Text className="text-white font-bold text-lg">Loyer</Text>
              <Text className="text-white font-bold text-lg">
                {propertyDetails.Price} DHS/month
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-5">
            <View className="flex-row items-center">
              <Text className="font-bold text-lg">Moyenne des avis</Text>
              <Text className="font-bold text-lg ml-5">
                {averageRating.toFixed(1)}{" "}
                <Ionicons name="star" size={20} color="gold" />
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <View>
              {[...Array(5)].map((_, index) => (
                <View key={index} className="flex-row items-center">
                  <Text className="mr-2">{index + 1}</Text>
                  <View className="w-[170px] h-[10px] bg-gray-200 rounded-md">
                    <View
                    className="h-[10px] bg-gold rounded-md"
                      style={[
                        {
                          width: `${(index + 1) * 20}%`,
                          backgroundColor:
                            averageRating > index ? "#FFD700" : "#ddd",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-5">
            <TouchableOpacity
              onPress={handleNavigateToAvis}
              className="bg-text w-full py-4 rounded-lg items-center justify-center"
            >
              <Text className="text-white font-bold">Donner mon avis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const ProgressBar = ({ rating, averageRating }) => {
  const isFilled = rating <= averageRating;

  return (
    <View style={styles.progressBar}>
      <View
        style={[
          styles.progress,
          {
            width: `${(rating / 5) * 100}%`,
            backgroundColor: isFilled ? "gold" : "#ddd",
          },
        ]}
      />
    </View>
  );
};



export default PropertyDetails;
