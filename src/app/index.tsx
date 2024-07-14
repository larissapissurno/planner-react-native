import { Input } from "@/components/input";
import {
  Alert,
  Image,
  Keyboard,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";
import dayjs from "dayjs";
import { colors } from "@/styles/colors";

import {
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Settings2 as SettingsIcon,
  UserRoundPlus as UserRoundPlusIcon,
  ArrowRight as ArrowRightIcon,
  AtSign as AtSignIcon,
} from "lucide-react-native";
import { Button } from "./button";
import { Fragment, useRef, useState } from "react";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { DateData } from "react-native-calendars";
import { GuestEmail } from "@/components/email";
import { validateInput } from "@/utils/validateInput";
import { tripStorage } from "@/storage/trip";
import { router } from "expo-router";
import { tripServer } from "@/server/trip-server";

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function Index() {
  // LOADING
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);

  // DATA
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
  const [datesSelected, setDatesSelected] = useState<DatesSelected>(
    {} as DatesSelected
  );
  const [destination, setDestination] = useState("");
  const [emailToInvite, setEmailToInvite] = useState("");
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([]);

  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE);

  const calendarInputRef = useRef<TextInput>(null);
  const guestsInputRef = useRef<TextInput>(null);

  function handleNextStepForm() {
    const isTripDetailsInvalid =
      !datesSelected.startsAt || !datesSelected.endsAt || !destination;

    if (isTripDetailsInvalid) {
      return Alert.alert(
        "Detalhes da Viagem",
        "Preencha todos os campos para continuar"
      );
    }

    if (destination.trim().length < 4) {
      return Alert.alert(
        "Destino",
        "O destino deve conter no mínimo 4 caracteres"
      );
    }

    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL);
    }

    Alert.alert("Nova Viagem", "Deseja confirmar a viagem?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        onPress: createTrip,
      },
    ]);
  }

  function handleCloseModal() {
    calendarInputRef.current?.blur();
    guestsInputRef.current?.blur();

    setShowModal(MODAL.NONE);
  }

  function handleSelectedDates(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: datesSelected.startsAt,
      endsAt: datesSelected.endsAt,
      selectedDay,
    });

    setDatesSelected(dates);
  }

  function handleAddGuestEmail() {
    if (!emailToInvite) {
      return Alert.alert("Convidado", "Preencha o e-mail para convidar alguém");
    }

    if (!validateInput.email(emailToInvite)) {
      return Alert.alert("Convidado", "E-mail inválido");
    }

    const isEmailAlreadyAdded = emailsToInvite.includes(emailToInvite);
    if (isEmailAlreadyAdded) {
      return Alert.alert("Convidado", "E-mail já adicionado");
    }

    setEmailsToInvite((prev) => [...prev, emailToInvite]);
    setEmailToInvite("");
  }

  function handleRemoveGuestEmail(email: string) {
    setEmailsToInvite((prev) =>
      prev.filter((emailItem) => emailItem !== email)
    );
  }

  async function createTrip() {
    try {
      setIsCreatingTrip(true);
      
      const newTrip = await tripServer.create({
        destination,
        starts_at: dayjs(datesSelected.startsAt?.dateString).toISOString(),
        ends_at: dayjs(datesSelected.endsAt?.dateString).toISOString(),
        emails_to_invite: emailsToInvite,
      });

      setIsCreatingTrip(false);

      Alert.alert("Nova Viagem", "Viagem criada com sucesso!", [
        {
          text: "Ok, vamos lá!",
          onPress: () => saveTripOnLocalStorage(newTrip.tripId),
        }
      ]);

    } catch (error) {
      setIsCreatingTrip(false);
      console.error("Erro ao criar viagem", error);
      Alert.alert("Erro ao criar viagem", "Tente novamente mais tarde");
      throw error;
      
    }
  }

  function saveTripOnLocalStorage(tripId: string) {
    try {
      tripStorage.save(tripId);
      router.navigate("/trip/" + tripId);
    } catch (error) {
      console.error("Erro ao salvar tripId da viagem", error);
      Alert.alert("Erro ao salvar viagem", "Tente novamente mais tarde");
      throw error;
    }
  }

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image
        source={require("@/assets/logo.png")}
        className="h-8"
        resizeMode="contain"
      />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e planeje sua{"\n"}próxima viagem
      </Text>

      <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
        <Image source={require("@/assets/bg.png")} className="absolute" />

        <Input>
          <MapPinIcon color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Para onde?"
            editable={stepForm === StepForm.TRIP_DETAILS}
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input>
          <CalendarIcon
            color={colors.zinc[400]}
            size={20}
            onPress={() => setShowModal(MODAL.CALENDAR)}
          />
          <Input.Field
            ref={calendarInputRef}
            placeholder="Quando?"
            editable={stepForm === StepForm.TRIP_DETAILS}
            onFocus={() => Keyboard.dismiss()}
            onPressIn={() =>
              stepForm === StepForm.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)
            }
            showSoftInputOnFocus={false}
            value={datesSelected.formatDatesInText}
          />
        </Input>

        {stepForm === StepForm.ADD_EMAIL && (
          <Fragment>
            <View className="border-b py-3 border-zinc-800">
              <Button
                variant="secondary"
                onPress={() => setStepForm(StepForm.TRIP_DETAILS)}
              >
                <Button.Title>Alterar local/data</Button.Title>
                <SettingsIcon color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundPlusIcon
                color={colors.zinc[400]}
                size={20}
                onPress={() => setShowModal(MODAL.GUESTS)}
              />
              <Input.Field
                ref={guestsInputRef}
                placeholder="Quem estará na viagem?"
                autoCorrect={false}
                showSoftInputOnFocus={false}
                value={
                  emailsToInvite.length
                    ? `${emailsToInvite.length} convidado${
                        emailsToInvite.length > 1 ? "s" : ""
                      }`
                    : ""
                }
                onFocus={() => Keyboard.dismiss()}
                onPressIn={() =>
                  stepForm === StepForm.ADD_EMAIL && setShowModal(MODAL.GUESTS)
                }
              />
            </Input>
          </Fragment>
        )}
        <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS
              ? "Continuar"
              : "Confirmar Viagem"}
          </Button.Title>
          <ArrowRightIcon color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao continuar, você concorda com nossos{"\n"}
        <Text className="text-lime-300">Termos de Serviço</Text> e{" "}
        <Text className="text-lime-300">Política de Privacidade</Text>
      </Text>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione as datas que deseja viajar"
        visible={showModal === MODAL.CALENDAR}
        onClose={handleCloseModal}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectedDates}
            markedDates={datesSelected.dates}
          />

          <Button onPress={handleCloseModal}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar Convidados"
        subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem."
        visible={showModal === MODAL.GUESTS}
        onClose={handleCloseModal}
      >
        <View className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start">
          {emailsToInvite.map((email) => (
            <GuestEmail
              key={email}
              email={email}
              onRemove={() => handleRemoveGuestEmail(email)}
            />
          ))}

          {!emailsToInvite.length && (
            <Text className="text-zinc-600 text-base font-regular">
              Nenhum e-mail adicionado
            </Text>
          )}
        </View>

        <View className="gap-4 mt-4">
          <Input variant="secondary">
            <AtSignIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Adicionar e-mail"
              keyboardType="email-address"
              inputMode="email"
              autoCapitalize="none"
              onChangeText={setEmailToInvite}
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddGuestEmail}
            />
          </Input>

          <Button onPress={handleAddGuestEmail}>
            <Button.Title>Convidar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
