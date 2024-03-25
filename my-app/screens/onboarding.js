import * as React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

function Onboarding() {
  const navigation = useNavigation();


  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <View className="flex-grow justify-center">
        <Image source={require("../assets/images/LOGO.png")} />
      </View>
      <View className="flex my-10 w-full px-4">
        <TouchableOpacity
          className="bg-white py-3 rounded-lg mb-2"
          onPress={() => navigation.navigate("Login")}
        >
          <Text className="text-primary text-center font-bold">Connexion</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-primary py-3 rounded-lg border-white border-solid border-2"
          onPress={() => navigation.push("Signup")}
        >
          <Text className="text-white text-center font-bold">Inscription</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Onboarding;
