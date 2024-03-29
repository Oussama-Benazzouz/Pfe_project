import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Avatar, List, Divider } from "react-native-paper";


function Profile({ navigation }) {
  const menuItems = [
    {
      title: "Informations Personnelles",
      icon: "account",
      navigateTo: "PersonalInfo",
    },
    {
      title: "Paramètres",
      icon: "cog",
      navigateTo: "Parametres",
    },
    {
      title: "FAQ",
      icon: "frequently-asked-questions",
      navigateTo: "FAQ",
    },
    {
      title: "Support",
      icon: "headphones",
      navigateTo: "Support",
    },
  ];

  const handleMenuItemPress = (item) => {
    navigation.navigate(item.navigateTo);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <ScrollView>
        <View className="p-3 mt-20 mb-4 items-center">
          <Avatar.Icon size={100} icon="account" />
          <Text className="text-2xl font-bold mt-4">Amine</Text>
          <Text className="text-gray-400 text-base font-semibold mt-2">
            Amine.Ouazzane@gmail.com
          </Text>
        </View>
        <Divider bold/>
        <View className="mt-4">
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} onPress={() => handleMenuItemPress(item)}>
              <List.Item
                title={item.title}
                left={(props) => (
                  <List.Icon {...props} icon={item.icon} type="font-awesome"/>
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Profile;
