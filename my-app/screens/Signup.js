import * as React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import OAuthButton from "../components/OAuthButton";

function Signup() {
  const navigation = useNavigation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState("");
  const roles = [
    { label: "Etudiant", value: "Etudiant" },
    { label: "Propriétaire", value: "Propriétaire" },
  ];
  const [showErrors, setShowErrors] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const getErrors = (email, password, confirmPassword) => {
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
    if (!confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!role) {
      errors.role = "Veuillez sélectionner un rôle";
    }
    return errors;
  };

  const handleRegister = () => {
    const errors = getErrors(email, password, confirmPassword);
    if (Object.keys(errors).length > 0) {
      setErrors(showErrors && errors);
      setShowErrors(true);
      return;
    } else {
      register();
      setErrors({});
      setShowErrors(false);
      console.log("Registered");
    }
  };

  const register = async () => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = response.user;
      const userDoc = {
        email: user.email,
        role: role,
        phoneNumber: user.phoneNumber,
        photoUrl: user.photoURL,
        displayName: user.displayName,
      };
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, userDoc);
    } catch (error) {
      console.log("Sign up error: ", error.message);
      return error;
    }
  };

  return (
    <View className="flex-1 items-center justify-around bg-primary">
      <View className="w-full px-6">
        <View className="flex items-center pb-10">
          <Text className="text-white font-bold text-xl pb-2">
            Créer un compte
          </Text>
          <Text className="text-text font-semibold text-sm">
            Créez un compte pour découvrir toutes les
          </Text>
          <Text className="text-text font-semibold text-sm">
            offres disponibles
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
            className="w-full px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-4"
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          {showErrors && errors.password && (
            <Text className="text-red-600 text-xs mb-2 ">
              {errors.password}
            </Text>
          )}
          <TextInput
            className="w-full px-5 py-4 rounded-lg border-2 border-transparent focus:border-text bg-blue-100 mb-4"
            placeholder="Cofirm Password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
          />
          {showErrors && errors.confirmPassword && (
            <Text className="text-red-600 text-xs mb-2 ">
              {errors.confirmPassword}
            </Text>
          )}
          <Dropdown
            className="w-full px-5 py-3 rounded-lg bg-blue-100 mb-2"
            data={roles}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select item"
            searchPlaceholder="Search..."
            value={role}
            onChange={(item) => {
              setRole(item.value);
            }}
          />
          {showErrors && (errors.role || userError) && (
            <Text className="text-red-600 text-xs mb-2 ">
              {errors.role || FIREBASE_ERRORS[userError?.message]}
            </Text>
          )}
        </View>
        <View className="items-center mt-12">
          <TouchableOpacity
            className="w-full bg-text py-4 rounded-lg"
            onPress={() => handleRegister()}
          >
            <Text className="text-white text-center font-bold">
              Créer un compte
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center mt-4">
          <TouchableOpacity className="w-full bg-white py-3 rounded-lg">
            <Text
              className="text-text text-center font-light text-xs"
              onPress={() => navigation.navigate("Login")}
            >
              Vous avez déjà un compte ?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-full items-center px-8">
        <Text className="text-text font-bold pb-4 text-xs">
          Ou Continuez avec
        </Text>
        <OAuthButton role={role} />
      </View>
    </View>
  );
}

export default Signup;
