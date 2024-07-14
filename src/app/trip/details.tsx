import { View, Text } from "react-native";
import { Button } from "../button";

export function TripDetails({tripId}: {tripId: string}) {
  return (
    <View className="flex-1 bg-lime-100">
      <Text>{tripId}</Text>
    </View>
  );
}