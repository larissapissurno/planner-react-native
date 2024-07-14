import { View, Text } from "react-native";
import { Button } from "../button";
import { TripData } from "./[id]";

type TripActivitiesProps = {
  tripDetails: TripData
}

export function TripActivities({ tripDetails }: TripActivitiesProps) {
  return (
    <View className="flex-1 bg-lime-100">
      <Text>{tripDetails.when}</Text>
    </View>
  );
}