import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  StyleSheet,
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
import { firestore, auth } from "../firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Searchbar } from "react-native-paper";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import CheckBox from "expo-checkbox";
import FavoritesScreen from "./Student/Favoris";

// Component for rendering property item
const PropertyItem = ({ property, onPress }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [favorites, setFavorites] = useState([]); // Ajout de l'état des favoris

  const addToFavorites = async (property) => {
    try {
      const userId = auth.currentUser.uid;
      const favoritesCollectionRef = collection(
        firestore,
        `favorites`,
        userId,
        "FavoritesIds"
      );
      const existingFavoritesSnapshot = await getDocs(favoritesCollectionRef);
      const existingFavorites = existingFavoritesSnapshot.docs.map((doc) =>
        doc.data()
      );
      const isAlreadyFavorite = existingFavorites.some(
        (favorite) => favorite.id === property.id
      );

      if (isAlreadyFavorite) {
        console.log(`Property '${property.title}' is already in favorites`);
        return;
      }

      // Assurez-vous que property contient toutes les données nécessaires avant d'ajouter à Firestore
      // Assurez-vous que le chemin vers votre collection de favoris et votre document est correct
      // Assurez-vous que les données que vous essayez d'ajouter à Firestore sont correctement formatées
      await setDoc(doc(favoritesCollectionRef, property.id), property);
      console.log(`Property '${property.title}' added to favorites`);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const ratingsQuery = query(
          collection(firestore, "ratings"),
          where("property_id", "==", property.id)
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
          const averageRating = totalMoyenAvis / totalReviews;
          setAverageRating(averageRating);
        }
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };

    fetchAverageRating();
  }, [property.id]);

  // Ajout de l'état des favoris

  return (
    <TouchableOpacity onPress={onPress}>
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
                    {index === property.amenities.length - 1
                      ? amenity
                      : amenity + ","}
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
                <TouchableOpacity onPress={() => addToFavorites(property)}>
                  <Ionicons name="heart" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </TouchableOpacity>
  );
};

// Main component
function Home() {
  const [properties, setProperties] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [ratingFilters, setRatingFilters] = useState({
    zeroPlus: false,
    onePlus: false,
    twoPlus: false,
    threePlus: false,
    fourPlus: false,
  });
  const [filteringActive, setFilteringActive] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const ownersQuery = query(
        collection(firestore, "users"),
        where("role", "==", "Propriétaire")
      );
      const ownersSnapshot = await getDocs(ownersQuery);
      const ownerIdList = ownersSnapshot.docs.map((doc) => doc.id);
      await fetchProperties(ownerIdList);
    } catch (error) {
      console.error("Error fetching owners:", error);
      setLoading(false);
    }
  };

  const fetchProperties = async (userIds) => {
    try {
      const propertiesData = [];

      for (const userId of userIds) {
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
          if (propertyDoc.exists()) {
            const propertyId = docRef.id;
            const averageRating = await getAverageRating(propertyId);
            const property = {
              id: propertyId,
              userId: userId,
              title: propertyDoc.data().title,
              price: propertyDoc.data().Price,
              amenities: propertyDoc.data().Amenities,
              city: propertyDoc.data().City,
              address: propertyDoc.data().Address,
              type: propertyDoc.data().Type,
              images: propertyDoc.data().images,
              averageRating: averageRating,
            };
            propertiesData.push(property);
          }
        }
      }

      setProperties(propertiesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setLoading(false);
    }
  };

  const navigateToPropertyDetails = (property) => {
    navigation.navigate("PropertyDetails", {
      title: property.title,
      userId: property.userId,
    });
  };

  const amenities = [
    { label: "Cuisine Equipé", value: "Cuisine Equipé" },
    { label: "Wifi", value: "Wifi" },
    { label: "Meublé", value: "Meublé" },
    { label: "Machine à laver", value: "Machine à laver" },
  ];

  const types = [
    { label: "Individuel", value: "Individuel" },
    { label: "Collocation", value: "Collocation" },
  ];

  const toggleAmenity = (amenity) => {
    const index = selectedAmenities.indexOf(amenity);
    if (index === -1) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(
        selectedAmenities.filter((item) => item !== amenity)
      );
    }
  };

  const toggleType = (type) => {
    const index = selectedTypes.indexOf(type);
    if (index === -1) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter((item) => item !== type));
    }
  };

  const toggleRatingFilter = (filter) => {
    setRatingFilters((prevState) => ({
      ...prevState,
      [filter]: !prevState[filter],
    }));
  };

  const filterProperties = () => {
    try {
      let filteredProperties = properties.filter((property) => {
        const averageRating = property.averageRating;
        return (
          (!ratingFilters.zeroPlus ||
            (averageRating >= 0 && averageRating < 1)) &&
          (!ratingFilters.onePlus ||
            (averageRating >= 1 && averageRating < 2)) &&
          (!ratingFilters.twoPlus ||
            (averageRating >= 2 && averageRating < 3)) &&
          (!ratingFilters.threePlus ||
            (averageRating >= 3 && averageRating < 4)) &&
          (!ratingFilters.fourPlus ||
            (averageRating >= 4 && averageRating <= 5)) &&
          selectedTypes.includes(property.type)
        );
      });

      filteredProperties = filteredProperties.filter(
        (property) =>
          parseFloat(property.price) >= priceRange[0] &&
          parseFloat(property.price) <= priceRange[1] &&
          selectedAmenities.every((amenity) =>
            property.amenities.includes(amenity)
          )
      );

      setProperties(filteredProperties);
      setModalVisible(false);
      setLoading(false);
      setFilteringActive(true);
    } catch (error) {
      console.error("Error filtering properties:", error);
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setSearchText("");
    setPriceRange([0, 10000]);
    setLoading(true);
    fetchOwners();
    setFilteringActive(false);
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchText.toLowerCase()) ||
      property.city.toLowerCase().includes(searchText.toLowerCase())
  );

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
        return 0; // Retourne 0 si aucune évaluation n'a été trouvée
      }
    } catch (error) {
      console.error(
        "Error fetching average rating for property",
        propertyId,
        ":",
        error
      );
      return 0; // Retourne 0 en cas d'erreur
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, marginVertical: 25 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 10 }}>
          <Searchbar
            placeholder="Search..."
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
          />
          <TouchableOpacity
            style={{ position: "absolute", right: 25, top: 25 }}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <View>
            {filteredProperties.map((property, index) => (
              <PropertyItem
                key={index}
                property={property}
                onPress={() => navigateToPropertyDetails(property)}
                onRemoveFromFavorites={() => removeFromFavorites(property.id)} // Passer la fonction de suppression des favoris
              />
            ))}
          </View>
        )}
      </ScrollView>

      {filteringActive && (
        <TouchableOpacity
          style={styles.clearFilterButton}
          onPress={clearFilter}
        >
          <Text style={styles.clearFilterButtonText}>Clear Filter</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <ScrollView>
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 20, marginBottom: 10 }}>
                Advanced Filtering
              </Text>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: "bold" }}>Price (in DH)</Text>
                <MultiSlider
                  values={[priceRange[0], priceRange[1]]}
                  sliderLength={280}
                  onValuesChange={(values) => setPriceRange(values)}
                  min={0}
                  max={10000}
                  step={100}
                  allowOverlap
                  snapped
                />
                <Text>
                  Min: {priceRange[0]} DH - Max: {priceRange[1]} DH
                </Text>
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: "bold" }}>Amenities</Text>
                {amenities.map((amenity, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <CheckBox
                      style={{ marginRight: 10 }}
                      value={selectedAmenities.includes(amenity.value)}
                      onValueChange={() => toggleAmenity(amenity.value)}
                    />
                    <Text>{amenity.label}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: "bold" }}>Type</Text>
                {types.map((type, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <CheckBox
                      style={{ marginRight: 10 }}
                      value={selectedTypes.includes(type.value)}
                      onValueChange={() => toggleType(type.value)}
                    />
                    <Text>{type.label}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: "bold" }}>Rating</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <CheckBox
                    style={{ marginRight: 10 }}
                    value={ratingFilters.zeroPlus}
                    onValueChange={() => toggleRatingFilter("zeroPlus")}
                  />
                  <Text>0+</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <CheckBox
                    style={{ marginRight: 10 }}
                    value={ratingFilters.onePlus}
                    onValueChange={() => toggleRatingFilter("onePlus")}
                  />
                  <Text>1+</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <CheckBox
                    style={{ marginRight: 10 }}
                    value={ratingFilters.twoPlus}
                    onValueChange={() => toggleRatingFilter("twoPlus")}
                  />
                  <Text>2+</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <CheckBox
                    style={{ marginRight: 10 }}
                    value={ratingFilters.threePlus}
                    onValueChange={() => toggleRatingFilter("threePlus")}
                  />
                  <Text>3+</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <CheckBox
                    style={{ marginRight: 10 }}
                    value={ratingFilters.fourPlus}
                    onValueChange={() => toggleRatingFilter("fourPlus")}
                  />
                  <Text>4+</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={filterProperties}
              >
                <Text style={styles.filterButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  filterButton: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  filterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearFilterButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  clearFilterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
