import * as React from "react";
import { View, Button, Text } from "react-native";
import { auth } from "../firebase/firebase";

function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-text/60">Home</Text>
    </View>
  );
}

export default HomeScreen;
