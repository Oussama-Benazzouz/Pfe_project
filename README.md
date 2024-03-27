After Getting in my-app 
run this command : npx install-expo-modules@latest

For Firebase : Change the Firestore DB rules to : 
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

Don't also forget to activate the authentification in firebase for both email and password and google 

Alsooo , in the firebase file in the project : 

Modify the firebaseConfig function with your credentials , i created firebase for a web app 
