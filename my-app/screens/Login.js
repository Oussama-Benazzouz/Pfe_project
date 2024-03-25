import * as React from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";

function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <View className="flex-1 items-center justify-around bg-primary">
      <View className="w-full px-6">
        <View className="flex items-center pb-10">
          <Text className="text-white font-bold text-xl pb-2">
            Se Connecter
          </Text>
          <Text className="text-text font-semibold text-sm">
            Bienvenue, vous nous avez manqué !
          </Text>
        </View>
        <View className="items-center mt-6">
          <TextInput
            className="w-full px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-4"
            placeholder="Email"
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            className="w-full px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100"
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <View className="items-end py-4">
          <TouchableOpacity>
            <Text className="text-white font-base text-sm">
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center mt-4">
          <TouchableOpacity className="w-full bg-text py-4 rounded-lg">
            <Text className="text-white text-center font-bold">
              Se Connecter
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center mt-4">
          <TouchableOpacity className="w-full bg-white py-3 rounded-lg">
            <Text className="text-text text-center font-light text-xs">
              Créer un compte
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-full items-center px-8">
        <Text className="text-text font-bold pb-4 text-xs">Ou Continuez avec</Text>
        <TouchableOpacity className="w-full bg-white py-2 rounded-lg flex-row items-center justify-center">
          <Image source={require("../assets/images/google.png")} className="w-8 h-8" />
          <Text className="text-text/60 text-center font-medium text-sm ml-7">
            Continuer avec Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Login;
