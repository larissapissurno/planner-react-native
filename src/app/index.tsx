import { Input } from '@/components/input'
import { Alert, Image, Keyboard, Text, TextInput, TextInputProps, View } from 'react-native'
import {DatesSelected, calendarUtils} from '@/utils/calendarUtils'
import dayjs from 'dayjs'
import { colors } from '@/styles/colors'

import {
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Settings2 as SettingsIcon,
  UserRoundPlus as UserRoundPlusIcon,
  ArrowRight as ArrowRightIcon
} from 'lucide-react-native'
import { Button } from './button'
import { Fragment, useRef, useState } from 'react'
import { Modal } from '@/components/modal'
import { Calendar } from '@/components/calendar'
import { DateData } from 'react-native-calendars'

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
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)
  const [showModal, setShowModal] = useState(MODAL.NONE)
  const [destination, setDestination] = useState('')
  const [datesSelected, setDatesSelected] = useState<DatesSelected>({} as DatesSelected)

  const calendarInputRef = useRef<TextInput>(null)
  
  function handleNextStepForm() {
    const isTripDetailsInvalid = !datesSelected.startsAt || !datesSelected.endsAt || !destination;
    
    if(isTripDetailsInvalid) {
      return Alert.alert('Detalhes da Viagem', 'Preencha todos os campos para continuar');
    }

    if (destination.trim().length < 4) {
      return Alert.alert('Destino', 'O destino deve conter no mínimo 4 caracteres');
    }

    if(stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }
  }

  function handleCloseModal() {
    calendarInputRef.current?.blur()

    setShowModal(MODAL.NONE)
  }

  function handleSeletedDates(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: datesSelected.startsAt,
      endsAt: datesSelected.endsAt,
      selectedDay,
    });

    setDatesSelected(dates)
  }

  return (
    <View className='flex-1 items-center justify-center px-5'>
      <Image
        source={require("@/assets/logo.png")}
        className='h-8'
        resizeMode='contain'
      />

      <Text className='text-zinc-400 font-regular text-center text-lg mt-3'>
        Convide seus amigos e planeje sua{"\n"}próxima viagem
      </Text>

      <View className='w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800'>
        <Image
          source={require("@/assets/bg.png")}
          className='absolute'
        />
        
        <Input>
          <MapPinIcon color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder='Para onde?'
            editable={stepForm === StepForm.TRIP_DETAILS}
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input>
          <CalendarIcon color={colors.zinc[400]} size={20} onPress={() => setShowModal(MODAL.CALENDAR)} />
          <Input.Field
            ref={calendarInputRef}
            placeholder='Quando?'
            editable={stepForm === StepForm.TRIP_DETAILS}
            onFocus={() => Keyboard.dismiss()}
            onPressIn={() => stepForm === StepForm.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)}
            showSoftInputOnFocus={false}
            value={datesSelected.formatDatesInText}
          />
        </Input>

        {stepForm === StepForm.ADD_EMAIL && (
          <Fragment>
            <View className='border-b py-3 border-zinc-800'>
              <Button variant='secondary' onPress={() => setStepForm(StepForm.TRIP_DETAILS)}>
                <Button.Title>Alterar local/data</Button.Title>
                <SettingsIcon color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundPlusIcon color={colors.zinc[400]} size={20} onPress={() => setShowModal(MODAL.GUESTS)} />
              <Input.Field placeholder='Quem estará na viagem?' />
            </Input>
          </Fragment>
        )}
        <Button onPress={handleNextStepForm}>
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS ? 'Continuar' : 'Confirmar Viagem'}
          </Button.Title>
          <ArrowRightIcon color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className='text-zinc-500 font-regular text-center text-base'>
        Ao continuar, você concorda com nossos{"\n"}
        <Text className='text-lime-300'>Termos de Serviço</Text> e{" "}
        <Text className='text-lime-300'>Política de Privacidade</Text>
      </Text>

      <Modal
        title='Selecionar datas'
        subtitle='Selecione as datas que deseja viajar'
        visible={showModal === MODAL.CALENDAR}
        onClose={handleCloseModal}
      >
        <View className='gap-4 mt-4'>
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSeletedDates}
            markedDates={datesSelected.dates}
          />

          <Button onPress={handleCloseModal}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
      
    </View>
  )
}