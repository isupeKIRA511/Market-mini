import { writable } from 'svelte/store';

export const searchQuery = writable('');
export const carType = writable('الكل');
export const passengersFilter = writable('');
export const luggageFilter = writable('');
export const sortBy = writable('الأعلى تقييماً');
