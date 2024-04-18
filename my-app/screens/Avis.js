import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebase";
import { Ionicons } from "@expo/vector-icons";

function Avis({ route }) {
  const user = auth.currentUser;
  const userId = user.uid;
  const { propertyId } = route.params;

  const [ratings, setRatings] = useState({
    security: 0,
    cleanliness: 0,
    equipements: 0,
    priceCorrespondence: 0,
    comfort: 0,
  });
  const [existingRatingId, setExistingRatingId] = useState(null);
  const navigation = useNavigation();

  // Function to fetch existing ratings
  const fetchExistingRating = async () => {
    try {
      const ratingsQuery = query(
        collection(firestore, "ratings"),
        where("user_id", "==", userId),
        where("property_id", "==", propertyId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);

      if (!ratingsSnapshot.empty) {
        const doc = ratingsSnapshot.docs[0];
        setExistingRatingId(doc.id);

        const data = doc.data();
        setRatings({
          security: data.security,
          cleanliness: data.cleanliness,
          equipements: data.equipements,
          priceCorrespondence: data.priceCorrespondence,
          comfort: data.comfort,
        });
      }
    } catch (error) {
      console.error("Error fetching existing rating: ", error);
    }
  };

  useEffect(() => {
    fetchExistingRating();
  }, [userId, propertyId]);

  const handleStarPress = (category, stars) => {
    setRatings({ ...ratings, [category]: stars });
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      const userId = user.uid;

      const average = calculateAverage(ratings);

      if (existingRatingId) {
        const ratingRef = doc(
          collection(firestore, "ratings"),
          existingRatingId
        );

        await setDoc(ratingRef, {
          user_id: userId,
          property_id: propertyId,
          ...ratings,
          moyen_avis: average,
          updated_at: Timestamp.now(),
        });

        console.log("Rating updated successfully");
      } else {
        const ratingsRef = doc(collection(firestore, "ratings"));
        await setDoc(ratingsRef, {
          user_id: userId,
          property_id: propertyId,
          ...ratings,
          moyen_avis: average,
          created_at: Timestamp.now(),
        });

        console.log("New rating added successfully");
      }

      fetchExistingRating();

      if (route.params && route.params.refresh) {
        navigation.navigate("PropertyDetails", { userId, propertyId });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error adding/updating rating: ", error);
    }
  };

  const calculateAverage = (ratings) => {
    const total = Object.values(ratings).reduce((acc, curr) => acc + curr, 0);
    return total / Object.keys(ratings).length;
  };

  return (
    <View className="flex-1 mt-20 bg-gray-100 mx-5">
      <Text className="font-bold text-center text-xl mb-5">Mon Avis</Text>
      {Object.entries(ratings).map(([category, value]) => (
        <View
          key={category}
          className="w-full flex-col mb-2 border border-gray-300 px-5 py-4 rounded-lg"
        >
          <Text className="mr-3 font-normal text-[20px] text-gray-500">
            {category}{" "}
          </Text>
          <View className="flex-row mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(category, star)}
              >
                <Ionicons
                  name={value >= star ? "star" : "star-outline"}
                  size={28}
                  color={value >= star ? "gold" : "black"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity className="w-full bg-text py-4 rounded-lg">
        <Text
          className="text-white text-center font-bold"
          onPress={handleSubmit}
        >
          Enregistrer
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default Avis;
