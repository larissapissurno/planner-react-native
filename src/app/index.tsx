import { Input } from '@/components/input'
import { Image, Text, View } from 'react-native'

import { colors } from '@/styles/colors'

import {
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Settings2 as SettingsIcon,
  UserRoundPlus as UserRoundPlusIcon,
  ArrowRight as ArrowRightIcon
} from 'lucide-react-native'
import { Button } from './button'
import { Fragment, useState } from 'react'

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

export default function Index() {
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)

  function handleNextStepForm() {
    if(stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }
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
        <Input>
          <MapPinIcon color={colors.zinc[400]} size={20} />
          <Input.Field placeholder='Para onde?' editable={stepForm === StepForm.TRIP_DETAILS} />
        </Input>

        <Input>
          <CalendarIcon color={colors.zinc[400]} size={20} />
          <Input.Field placeholder='Quando?' editable={stepForm === StepForm.TRIP_DETAILS}/>
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
              <UserRoundPlusIcon color={colors.zinc[400]} size={20} />
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
    </View>
  )
}