import * as React from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showErrors, setShowErrors] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const getErrors = (email, password) => {
    const errors = {};
    if (!email) {
      errors.email = "Veuillez saisir un email";
    } else if (!email.includes("@") || !email.includes(".com")) {
      errors.email = "Veuillez saisir un email valide";
    }
    if (!password) {
      errors.password = "Veuillez saisir un mot de passe";
    } else if (password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    return errors;
  };

  const handleLogin = () => {
    const errors = getErrors(email, password);
    if (Object.keys(errors).length > 0) {
      setErrors(showErrors && errors);
      setShowErrors(true);
      return;
    } else {
      setErrors({});
      setShowErrors(false);
      console.log("Registered");
    }
  };

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
            className="w-full px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-2"
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          {showErrors && errors.email && (
            <Text className="text-red-600 text-xs mb-2 ">{errors.email}</Text>
          )}
          <TextInput
            className="w-full px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-2"
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          {showErrors && errors.password && (
            <Text className="text-red-600 text-xs mb-2 ">{errors.password}</Text>
          )}
        </View>
        <View className="items-end py-4">
          <TouchableOpacity>
            <Text className="text-white font-base text-sm">
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center mt-4">
          <TouchableOpacity
            className="w-full bg-text py-4 rounded-lg"
            onPress={() => handleLogin()}
          >
            <Text className="text-white text-center font-bold">
              Se Connecter
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center mt-4">
          <TouchableOpacity
            className="w-full bg-white py-3 rounded-lg"
            onPress={() => navigation.navigate("Signup")}
          >
            <Text className="text-text text-center font-light text-xs">
              Créer un compte
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-full items-center px-8">
        <Text className="text-text font-bold pb-4 text-xs">
          Ou Continuez avec
        </Text>
        <TouchableOpacity className="w-full bg-white py-2 rounded-lg flex-row items-center justify-center">
          <Image
            source={require("../assets/images/google.png")}
            className="w-8 h-8"
          />
          <Text className="text-text/60 text-center font-medium text-sm ml-7">
            Continuer avec Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Login;
