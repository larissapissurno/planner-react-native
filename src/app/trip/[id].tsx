import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { TripDetailsType, tripServer } from "@/server/trip-server";
import { colors } from "@/styles/colors";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import {
  CalendarRange,
  Info as InfoIcon,
  MapPin as MapPinIcon,
  Settings2 as SettingsIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text, Touchable, TouchableOpacity } from "react-native";
import { Button } from "../button";
import { TripActivities } from "./activities";
import { TripDetails } from "./details";

type TripSearchParams = {
  id: string;
};

export type TripData = TripDetailsType & {
  when: string;
};

type Options = "activity" | "details";

// exporting as default means that expo will recognize this component as a route
export default function Trip() {
  // LOADING
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  // DATA
  const [tripDetails, setTripDetails] = useState<TripData>({} as TripData);
  const [options, setOptions] = useState<Options>("activity");

  const { id: tripId } = useLocalSearchParams<TripSearchParams>();

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true);

      if (!tripId) {
        throw new Error("Trip ID not found");
      }

      const storedTrip = await tripServer.getById(tripId);

      const maxLengthDestination = 14;
      const destination =
        storedTrip.destination.length > maxLengthDestination
          ? `${storedTrip.destination.slice(0, maxLengthDestination)}...`
          : storedTrip.destination;

      const starts_at = dayjs(storedTrip.starts_at).format("DD");
      const ends_at = dayjs(storedTrip.ends_at).format("DD");
      const month = dayjs(storedTrip.starts_at).format("MMMM");

      const tripData: TripData = {
        ...storedTrip,
        destination,
        when: `${destination} de ${starts_at} a ${ends_at} de ${month}`,
      };

      setTripDetails(tripData);
    } catch (error) {
      console.error("Failed to fetch trip details", error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

  useEffect(() => {
    getTripDetails();
  }, []);

  if (isLoadingTrip) {
    return <Loading />;
  }

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPinIcon color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails?.when} readOnly />

        <TouchableOpacity className="w-9 h-9 bg-zinc-800 items-center justify-center rounded">
          <SettingsIcon color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {options === "activity" ? (
        <TripActivities tripDetails={tripDetails} />
      ) : (
        <TripDetails tripId={tripDetails.id} />
      )}

      <View
        className="w-full absolute -bottom-1 self-center self-center justify-end pb-5 z-10 bg-zinc-800 gap-2"
      >
        <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
          <Button
            className="flex-1"
            onPress={() => setOptions("activity")}
            variant={options === "activity" ? "primary" : "secondary"}
          >
            <CalendarRange
              color={options === "activity" ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />
            <Button.Title>Atividades</Button.Title>
          </Button>
          
          <Button
            className="flex-1"
            onPress={() => setOptions("details")}
            variant={options === "details" ? "primary" : "secondary"}
          >
            <InfoIcon
              color={options === "details" ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>
    </View>
  );
}
