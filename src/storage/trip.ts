import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = '@planner:tripId';

async function save(tripId: string) {
  await AsyncStorage.setItem(STORAGE_KEY, tripId);
}

async function get() {
  return await AsyncStorage.getItem(STORAGE_KEY);
}

async function remove() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export const tripStorage = {
  save,
  get,
  remove,
};