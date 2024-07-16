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
  Calendar as CalendarIcon,
  User,
  Mail,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Touchable,
  TouchableOpacity,
  Keyboard,
  Alert,
} from "react-native";
import { Button } from "../button";
import { TripActivities } from "./activities";
import { TripDetails } from "./details";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { DateData } from "react-native-calendars";
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";
import { set } from "zod";
import { validateInput } from "@/utils/validateInput";
import { participantsServer } from "@/server/participants-server";
import { tripStorage } from "@/storage/trip";

type TripSearchParams = {
  id: string;
  participant?: string;
};

export type TripData = TripDetailsType & {
  when: string;
};

type Options = "activity" | "details";

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
  CONFIRM_PRESENCE = 3,
}

// exporting as default means that expo will recognize this component as a route
export default function Trip() {
  // LOADING
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
  const [isConfirmingPresence, setIsConfirmingPresence] = useState(false);

  // MODAL
  const [showModal, setShowModal] = useState<MODAL>(MODAL.CONFIRM_PRESENCE);

  // DATA
  const [tripDetails, setTripDetails] = useState<TripData>({} as TripData);
  const [options, setOptions] = useState<Options>("activity");
  const [destination, setDestination] = useState<string>("");
  const [datesSelected, setDatesSelected] = useState<DatesSelected>(
    {} as DatesSelected
  );
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");

  const { id: tripId, participant: participantId } =
    useLocalSearchParams<TripSearchParams>();

  function handleSelectedDates(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: datesSelected.startsAt,
      endsAt: datesSelected.endsAt,
      selectedDay,
    });

    setDatesSelected(dates);
  }

  async function handleUpdateTrip() {
    try {
      if (!tripId) {
        return;
      }

      if (!destination || !datesSelected.startsAt || !datesSelected.endsAt) {
        return Alert.alert("Atualizar viagem", "Preencha todos os campos");
      }

      setIsUpdatingTrip(true);

      await tripServer.update({
        id: tripId,
        destination,
        starts_at: dayjs(datesSelected.startsAt?.dateString).toISOString(),
        ends_at: dayjs(datesSelected.endsAt?.dateString).toISOString(),
      });

      Alert.alert(
        "Viagem atualizada",
        "Sua viagem foi atualizada com sucesso",
        [
          {
            text: "Ok",
            onPress: () => {
              setShowModal(MODAL.NONE);
              getTripDetails();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to update trip", error);
    } finally {
      setIsUpdatingTrip(false);
    }
  }

  async function handleConfirmPresence() {
    try {
      if (!tripId || !participantId) {
        return;
      }

      if (!guestName?.trim() || !guestEmail?.trim()) {
        return Alert.alert("Confirmar presença", "Preencha todos os campos");
      }

      if (!validateInput.email(guestEmail.trim())) {
        return Alert.alert("Confirmar presença", "E-mail inválido");
      }

      setIsConfirmingPresence(true);

      await participantsServer.confirmTripByParticipantId({
        participantId,
        name: guestName,
        email: guestEmail,
      });

      Alert.alert("Confirmação de presença", "Presença confirmada com sucesso");

      await tripStorage.save(tripId);

      setShowModal(MODAL.NONE);
    } catch (error) {
      console.error("Failed to confirm presence", error);
      Alert.alert("Erro ao confirmar presença", "Tente novamente mais tarde");
    } finally {
      setIsConfirmingPresence(false);
    }
  }

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
      setDestination(destination);
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

        <TouchableOpacity
          className="w-9 h-9 bg-zinc-800 items-center justify-center rounded"
          onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
        >
          <SettingsIcon color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {options === "activity" ? (
        <TripActivities tripDetails={tripDetails} />
      ) : (
        <TripDetails tripId={tripDetails.id} />
      )}

      <View className="w-full absolute -bottom-1 self-center self-center justify-end pb-5 z-10 bg-zinc-800 gap-2">
        <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
          <Button
            className="flex-1"
            onPress={() => setOptions("activity")}
            variant={options === "activity" ? "primary" : "secondary"}
          >
            <CalendarRange
              color={
                options === "activity" ? colors.lime[950] : colors.zinc[200]
              }
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
              color={
                options === "details" ? colors.lime[950] : colors.zinc[200]
              }
              size={20}
            />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualizar Viagem"
        subtitle="Somente quem criou a viagem pode atualizá-la"
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapPinIcon color={colors.zinc[400]} size={20} />

            <Input.Field
              placeholder="Para onde?"
              value={destination}
              onChangeText={setDestination}
            />
          </Input>

          <Input variant="secondary">
            <CalendarIcon color={colors.zinc[400]} size={20} />

            <Input.Field
              placeholder="Quando?"
              value={datesSelected.formatDatesInText}
              onChangeText={setDestination}
              onFocus={() => Keyboard.dismiss()}
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
            />
          </Input>

          <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione as datas que deseja viajar"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectedDates}
            markedDates={datesSelected.dates}
          />

          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Confirmar presença"
        visible={showModal === MODAL.CONFIRM_PRESENCE}
      >
        <View className="gap-4 mt-4">
          <Text className="text-zinc-400 font-regular leading-6 my-2">
            Você foi convidado para participar de uma viagem para{" "}
            <Text className="font-semibold text-zinc-100">
              {tripDetails.destination}
            </Text>{" "}
            de{" "}
            <Text className="font-semibold text-zinc-100">
              {dayjs(tripDetails.starts_at).format("DD/MM")}
            </Text>{" "}
            a{" "}
            <Text className="font-semibold text-zinc-100">
              {dayjs(tripDetails.ends_at).format("DD/MM")}.
            </Text>
            {"\n\n"}
            Para confirmar sua presença, preencha os dados abaixo:
          </Text>

          <Input variant="secondary">
            <User color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Seu nome completo"
              value={guestName}
              onChangeText={setGuestName}
            />
          </Input>

          <Input variant="secondary">
            <Mail color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="E-mail de confirmação"
              value={guestEmail}
              onChangeText={setGuestEmail}
            />
          </Input>

          <Button
            onPress={handleConfirmPresence}
            isLoading={isConfirmingPresence}
          >
            <Button.Title>Confirmar minha presença</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
