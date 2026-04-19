import { writable } from 'svelte/store';

export type Route = 'home' | 'marketplace' | 'booking-details' | 'select-car' | 'history' | 'profile' | 'login' | 'register' | 'payment' | 'history';

export const currentRoute = writable<Route>('home');
export const isUIVisible = writable<boolean>(true);
