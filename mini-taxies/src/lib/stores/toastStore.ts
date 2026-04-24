import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);

    function show(message: string, type: ToastType = 'info', duration = 3500) {
        const id = Math.random().toString(36).slice(2);
        update(toasts => [...toasts, { id, message, type, duration }]);
        setTimeout(() => dismiss(id), duration);
    }

    function dismiss(id: string) {
        update(toasts => toasts.filter(t => t.id !== id));
    }

    return {
        subscribe,
        success: (msg: string, duration?: number) => show(msg, 'success', duration),
        error:   (msg: string, duration?: number) => show(msg, 'error',   duration ?? 5000),
        warning: (msg: string, duration?: number) => show(msg, 'warning', duration),
        info:    (msg: string, duration?: number) => show(msg, 'info',    duration),
        dismiss,
    };
}

export const toast = createToastStore();
