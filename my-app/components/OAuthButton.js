import * as React from "react";
import { Text, TouchableOpacity, Image } from "react-native";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, firestore } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

function OAuthButton({ role }) {
  const handleSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: role,
        phoneNumber: user.phoneNumber,
        photoUrl: user.photoURL,
        displayName: user.displayName,
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <>
      <TouchableOpacity
        className="w-full bg-white py-2 rounded-lg flex-row items-center justify-center mb-2"
        onPress={() => handleSignInWithGoogle()}
      >
        <Image
          source={require("../assets/images/google.png")}
          className="w-8 h-8"
        />
        <Text className="text-text/60 text-center font-medium text-sm ml-7">
          Continuer avec Google
        </Text>
      </TouchableOpacity>
      {/* {error && <Text>{error.message}</Text>} */}
    </>
  );
}

export default OAuthButton;
