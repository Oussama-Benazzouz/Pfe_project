import * as React from "react";
import { View, Text } from "react-native";
import { auth } from "../firebase/firebase";

function DashBoard() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-text/60">DashBoard</Text>
      <Button title="Se déconnecter" onPress={() => auth.signOut()} />
    </View>
  );
}

export default DashBoard;
