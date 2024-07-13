import { api } from './api';

export type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

type TripCreate = Omit<TripDetails, 'id' | 'is_confirmed'> & {
  email_to_invite: string[];
};

const getAll = async (): Promise<TripDetails[]> => {
  try {
    const { data } = await api.get<TripDetails[]>('/trips');

    return data;
  }
  catch (error) {
    console.error('Failed to fetch trips', error);
    throw error;
  }
};

const getById = async (id: string): Promise<TripDetails> => {
  try {
    const { data } = await api.get<{trip: TripDetails}>(`/trips/${id}`);

    return data.trip;
  }
  catch (error) {
    console.error(`Failed to fetch trip ${id}`, error);
    throw error;
  }
};

const create = async (trip: TripCreate): Promise<{ tripId: string}> => {
  try {
    const { data } = await api.post<{ tripId: string}>('/trips', { 
      ...trip,
      owner_name: 'John Doe',
      owner_email: 'johndoe@mail.com',
     });

    return data;
  }
  catch (error) {
    console.error('Failed to create trip', error);
    throw error;
  }
};

const update = async (trip: TripDetails): Promise<TripDetails> => {
  try {
    const { data } = await api.put<{trip: TripDetails}>(`/trips/${trip.id}`, { trip });

    return data.trip;
  }
  catch (error) {
    console.error(`Failed to update trip ${trip.id}`, error);
    throw error;
  }
};

const remove = async (id: string): Promise<void> => {
  try {
    await api.delete(`/trips/${id}`);
  }
  catch (error) {
    console.error(`Failed to delete trip ${id}`, error);
    throw error;
  }
};

export const tripServer = {
  getAll,
  getById,
  create,
  update,
  remove,
};