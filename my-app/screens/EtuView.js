import * as React from "react";
import { View, Text, Button } from "react-native";
import { auth } from "../firebase/firebase";
import DashBotNavigationEtu from "../components/DashBotNavigationEtu";

function EtuView() {
  return (
    <View className="flex-1">
      <DashBotNavigationEtu />
    </View>
  );
}

export default EtuView;
