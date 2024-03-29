import * as React from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  Picker,
} from "react-native";

function AddProperty() {

  const [title, setTitle] = React.useState("");


  return (
    <View className="flex-1 items-center  bg-background">
      <Text className="text-2xl font-bold mt-12">Ajouter une annonce</Text>
    </View>
  );
}

export default AddProperty;
