import { writable } from 'svelte/store';
import type { BookingDetails } from '../types/Booking';

const initialBookingState: BookingDetails = {
    serviceType: 'To Airport',
    pickupLocation: '',
    flightNumber: '',
    dateTime: '',
    carModel: '',
    passengersCount: 1,
    luggageCount: 0
};

export const bookingStore = writable<BookingDetails>(initialBookingState);
