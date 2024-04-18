import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import { Ionicons } from "@expo/vector-icons";
import { Card, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { firestore, auth } from "../../firebase/firebase";

function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [averageRatings, setAverageRatings] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = auth.currentUser.uid;
      try {
        const favoritesRef = collection(
          firestore,
          `favorites`,
          userId,
          "FavoritesIds"
        );
        const favoritesSnapshot = await getDocs(favoritesRef);
        const favoriteProperties = favoritesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(favoriteProperties);
        updateAverageRatings(favoriteProperties);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  const updateAverageRatings = async (favoriteProperties) => {
    try {
      const ratingsPromises = favoriteProperties.map(async (property) => {
        const averageRating = await getAverageRating(property.id);
        return { [property.id]: averageRating };
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsObject = Object.assign({}, ...ratingsResults);
      setAverageRatings(ratingsObject);
    } catch (error) {
      console.error("Error updating average ratings:", error);
    }
  };

  const getAverageRating = async (propertyId) => {
    try {
      const ratingsQuery = query(
        collection(firestore, "ratings"),
        where("property_id", "==", propertyId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);

      let totalMoyenAvis = 0;
      let totalReviews = 0;

      ratingsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalMoyenAvis += data.moyen_avis;
        totalReviews++;
      });

      if (totalReviews > 0) {
        return totalMoyenAvis / totalReviews;
      } else {
        return 0;
      }
    } catch (error) {
      console.error(
        "Error fetching average rating for property",
        propertyId,
        ":",
        error
      );
      return 0;
    }
  };

  const handleDeletefavoris = async (favoritesId) => {
    try {
      const favoritesRef = doc(
        firestore,
        `favorites/${auth.currentUser.uid}/FavoritesIds`,
        favoritesId
      );

      await deleteDoc(favoritesRef);
      console.log("Property deleted successfully");
      setFavorites(
        favorites.filter((favorites) => favorites.id !== favoritesId)
      );
    } catch (error) {
      console.error("Error deleting favoris:", error);
    }
  };

  const navigateToPropertyDetails = (property) => {
    navigation.navigate("PropertyDetails", {
      title: property.title,
      userId: property.userId,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToPropertyDetails(item)}>
      <View style={{ margin: 10 }}>
        <Card style={{ borderRadius: 5, overflow: "hidden", marginBottom: 10 }}>
          <View style={{ flexDirection: "row" }}>
            <Image
              style={{
                width: "50%",
                height: "100%",
                resizeMode: "cover",
                borderTopLeftRadius: 5,
                borderBottomLeftRadius: 5,
              }}
              source={{ uri: property.images[0] }}
            />
            <View style={{ flex: 1, padding: 10 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}
              >
                {property.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Ionicons
                  name="location"
                  size={14}
                  style={{ marginRight: 5 }}
                />
                <Text style={{ fontSize: 12, color: "#7D7F88" }}>
                  {property.city}, {property.address}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 5,
                }}
              >
                {property.amenities.map((amenity, index) => (
                  <Text
                    key={index}
                    style={{ fontSize: 12, color: "#7D7F88", marginRight: 5 }}
                  >
                    {amenity}
                  </Text>
                ))}
              </View>
              <Text style={{ fontSize: 14, color: "#7D7F88", marginBottom: 5 }}>
                Type: {property.type}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                >
                  {property.price} Dh
                </Text>
                <Text style={{ fontSize: 12, color: "#7D7F88", marginLeft: 5 }}>
                  / Month
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}
                  >
                    {property.averageRating.toFixed(1)}
                  </Text>
                  <Ionicons
                    name="star"
                    size={16}
                    color="gold"
                    style={{ marginLeft: 5 }}
                  />
                </View>
                <TouchableOpacity onPress={() => handleDeletefavoris(item.id)}>
                  <Ionicons name="heart" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Favoris</Text>
        </View>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ fontSize: 16, textAlign: "center", marginTop: 20 }}>
              Aucun favori pour le moment.
            </Text>
          }
        />

    </SafeAreaView>
  );
}

export default FavoritesScreen;
