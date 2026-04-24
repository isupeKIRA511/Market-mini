import { writable } from 'svelte/store';

// Persistence logic
const storedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
const storedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') || 'ar' : 'ar';

export const theme = writable<'light' | 'dark'>(storedTheme as 'light' | 'dark');
export const language = writable<'ar'>('ar');

if (typeof localStorage !== 'undefined') {
    theme.subscribe(val => {
        localStorage.setItem('theme', val);
        if (val === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });

    language.subscribe(val => {
        localStorage.setItem('lang', 'ar');
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
    });
}
