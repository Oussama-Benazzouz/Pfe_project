import * as React from "react";
import { View, Text, Button } from "react-native";
import { auth } from "../firebase/firebase";
import DashBotNavigation from "../components/DashBotNavigation";

function DashBoard() {
  return (
    <View className="flex-1">
      <DashBotNavigation />
    </View>
  );
}

export default DashBoard;
