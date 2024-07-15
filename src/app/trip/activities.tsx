import { View, Text, Keyboard } from "react-native";
import { Button } from "../button";
import { TripData } from "./[id]";
import { PlusIcon, Tag as TagIcon, Calendar as CalendarIcon, Clock as ClockIcon } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Modal } from "@/components/modal";
import { useState } from "react";
import { Input } from "@/components/input";
import { Calendar } from "@/components/calendar";
import dayjs from "dayjs";
import { DateData } from "react-native-calendars";
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";

type TripActivitiesProps = {
  tripDetails: TripData
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

export function TripActivities({ tripDetails }: TripActivitiesProps) {
  // MODAL
  const [showModal, setShowModal] = useState<MODAL>(MODAL.NONE);

  // DATA
  const [activities, setActivities] = useState<string[]>([]);
  const [activityTitle, setActivityTitle] = useState<string>("");
  const [activityDate, setActivityDate] = useState<string>("");
  const [activityHour, setActivityHour] = useState<string>("");
  const [datesSelected, setDatesSelected] = useState<DatesSelected>(
    {} as DatesSelected
  );

  function handleSelectedDates(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: datesSelected.startsAt,
      endsAt: datesSelected.endsAt,
      selectedDay,
    });

    setDatesSelected(dates);
  }

  return (
    <View className="flex-1">
      <View className="w-full flex-row mt-5 mb-6 items-center">
        <Text className="text-zinc-50 text-2xl font-semibold flex-1">
          Atividades
        </Text>
        <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} size={20} />
          <Text className="text-lg font-bold">Nova Atividade</Text>
        </Button>
      </View>

      <Modal
        title="Cadastrar atividade"
        subtitle="Todos os convidados poderão ver as atividades"
        visible={showModal === MODAL.NEW_ACTIVITY}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="mt-4 mb-3">
          <Input variant="secondary">
            <TagIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Qual atividade?"
              value={activityTitle}
              onChangeText={setActivityTitle}
            />
          </Input>



          <View className="w-full mt-2 flex-row gap-2">
            <Input variant="secondary" className="flex-1">
              <CalendarIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Data"
                value={activityDate ? dayjs(activityDate).format("DD [de] MMMM") : ""}
                onChangeText={setActivityTitle}
                onFocus={() => Keyboard.dismiss()}
                onPressIn={() => setShowModal(MODAL.CALENDAR)}
                showSoftInputOnFocus={false}
              />
            </Input>

            <Input variant="secondary" className="flex-1">
              <ClockIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Horário"
                value={activityHour}
                onChangeText={(text) => setActivityHour(text.replace(/\D/g, ""))}
                keyboardType="numeric"
                maxLength={2}
              />
            </Input>
          </View>
        </View>
      </Modal>

      <Modal
        title="Selecionar data"
        subtitle="Selecione a data da atividade"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            onDayPress={
              (day) => {
                setActivityDate(day.dateString);
                setShowModal(MODAL.NEW_ACTIVITY);
              }
            }
            markedDates={{ [activityDate]: { selected: true } }}
            initialDate={tripDetails.starts_at.toString()}
            minDate={tripDetails.starts_at.toString()}
            maxDate={tripDetails.ends_at.toString()}
          />
        </View>
      </Modal>
    </View>
  );
}