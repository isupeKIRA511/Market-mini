import { writable } from 'svelte/store';
import type { AuthResponse } from '../types/api';

/** ملخّص المستخدم في الواجهة (يُخزَّن في localStorage تحت `userData`) */
export type AuthUserSnapshot = { id: string; name: string };

// Get initial state from localStorage
const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : '';
const storedUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : '';
const storedUserData = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;

export const isAuthenticated = writable<boolean>(!!storedToken);
export const serverToken = writable<string>(storedToken || '');
export const userId = writable<string>(storedUserId || '');
export const authCode = writable<string>('');
export const userData = writable<AuthUserSnapshot | null>(
    storedUserData ? JSON.parse(storedUserData) as AuthUserSnapshot : null
);

// Persistence logic
if (typeof localStorage !== 'undefined') {
    serverToken.subscribe(value => {
        if (value) {
            localStorage.setItem('token', value);
            isAuthenticated.set(true);
        } else {
            localStorage.removeItem('token');
            isAuthenticated.set(false);
        }
    });

    userId.subscribe(value => {
        if (value) {
            localStorage.setItem('userId', value);
        } else {
            localStorage.removeItem('userId');
        }
    });

    userData.subscribe(value => {
        if (value) {
            localStorage.setItem('userData', JSON.stringify(value));
        } else {
            localStorage.removeItem('userData');
        }
    });
}

export const setAuthData = (data: AuthResponse, name?: string) => {
    serverToken.set(data.token);
    userId.set(data.id);
    isAuthenticated.set(true);
    userData.set({ id: data.id, name: name || data.phoneNumber } satisfies AuthUserSnapshot);
};

export const updateName = (name: string) => {
    userData.update(data => {
        if (!data) return null;
        return { ...data, name };
    });
};

export const logout = () => {
    serverToken.set('');
    userId.set('');
    userData.set(null);
    isAuthenticated.set(false);
    if (typeof localStorage !== 'undefined') {
        localStorage.clear();
    }
};
