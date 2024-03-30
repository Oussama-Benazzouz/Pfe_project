import * as React from "react";
import {
  View,
  Text,
  ScrollView,
} from "react-native";

function FAQ({ navigation }) {
  const faqItems = [
    {
      question: "Comment puis-je rechercher un logement ?",
      answer:
        "Vous pouvez utiliser la barre de recherche sur la page d'accueil pour rechercher des logements en fonction de différents critères comme le lieu, le prix, et le type de logement.",
    },
    {
      question: "Comment puis-je planifier une visite d'un logement ?",
      answer:
        "Une fois que vous avez trouvé un logement qui vous intéresse, vous pouvez contacter le propriétaire ou l'agence immobilière directement depuis l'application pour planifier une visite.",
    },
    {
      question: "Comment puis-je payer mon loyer ?",
      answer:
        "Vous pouvez payer votre loyer directement au propriétaire après accord.",
    },
  ];

  return (
    <View className="flex-1 items-center bg-background">
      <Text className="text-2xl font-bold mt-14">FAQ</Text>
      <ScrollView className="w-full mt-12">
        {faqItems.map((item, i) => (
          <View key={i} className="w-full p-4">
            <Text className="text-base font-semibold mb-2">{item.question}</Text>
            <Text className="text-sm">{item.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default FAQ;
