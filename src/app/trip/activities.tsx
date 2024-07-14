import { View, Text } from "react-native";
import { Button } from "../button";
import { TripData } from "./[id]";

type TripActivitiesProps = {
  tripDetails: TripData
}

export function TripActivities({ tripDetails }: TripActivitiesProps) {
  return (
    <View className="flex-1">
      <Text className="text-white">{tripDetails.when}</Text>
    </View>
  );
}