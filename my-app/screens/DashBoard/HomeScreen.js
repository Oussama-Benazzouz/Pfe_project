import * as React from "react";
import { View, Text } from "react-native";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center  bg-background">
      <Text className="text-2xl font-bold mt-12">Mes annonces</Text>

      <FAB
        className="absolute right-4 bottom-4 bg-white"
        icon="plus"
        onPress={() => {navigation.navigate("AddProperty")}}
      />
    </View>
  );
}

export default HomeScreen;
