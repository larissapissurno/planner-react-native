import { api } from './api';

export type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

export const getTrips = async (): Promise<TripDetails[]> => {
  const response = await api.get('/trips');
  return response.data;
};

export const getTrip = async (id: string): Promise<TripDetails> => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

export const createTrip = async (trip: TripDetails): Promise<TripDetails> => {
  const response = await api.post('/trips', trip);
  return response.data;
};

export const updateTrip = async (trip: TripDetails): Promise<TripDetails> => {
  const response = await api.put(`/trips/${trip.id}`, trip);
  return response.data;
};