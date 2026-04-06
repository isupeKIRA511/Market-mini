import { baseURL } from './config';

export const getCars = async (PageSize?: number, PageNum?: number, Term?: string, Type?: string, StartDate?: string, EndDate?: string) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Car` + '?' + new URLSearchParams({  ...( PageSize !== undefined ? { PageSize: String(PageSize) } : {} ),  ...( PageNum !== undefined ? { PageNum: String(PageNum) } : {} ),  ...( Term !== undefined ? { Term: String(Term) } : {} ),  ...( Type !== undefined ? { Type: String(Type) } : {} ),  ...( StartDate !== undefined ? { StartDate: String(StartDate) } : {} ),  ...( EndDate !== undefined ? { EndDate: String(EndDate) } : {} ),}).toString(), {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const createCar = async (data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Car`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getCarById = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Car/${id}`, {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const updateCar = async (id: string | number, data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Car/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteCar = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Car/${id}`, {
      method: 'DELETE'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const patchCarComfortScore = async (id: string | number, data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Car/${id}/comfort-score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const patchCarOwner = async (id: string | number, data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Car/${id}/owner`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
