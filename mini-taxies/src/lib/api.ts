import { apiClient } from './api/client';

// Low-level API wrapper: expose named helpers expected by the routes (getData/postData)
// and keep a default export for backward compatibility.

export async function getData<T = any>(url: string, options?: RequestInit): Promise<T> {
    const res = await apiClient.get<T>(url, options);
    return res.data as T;
}

export async function postData<T = any>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await apiClient.post<T>(url, body, options);
    return res.data as T;
}

export async function putData<T = any>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await apiClient.put<T>(url, body, options);
    return res.data as T;
}

export async function deleteData<T = any>(url: string, options?: RequestInit): Promise<T> {
    const res = await apiClient.delete<T>(url, options);
    return res.data as T;
}

const api = {
    get: <T>(url: string, options?: RequestInit) => apiClient.get<T>(url, options),
    post: <T>(url: string, body?: unknown, options?: RequestInit) => apiClient.post<T>(url, body, options),
    put: <T>(url: string, body?: unknown, options?: RequestInit) => apiClient.put<T>(url, body, options),
    delete: <T>(url: string, options?: RequestInit) => apiClient.delete<T>(url, options),
};

export default api;
