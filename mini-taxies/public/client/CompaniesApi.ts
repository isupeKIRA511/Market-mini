import { baseURL } from './config';

export const getCompanys = async (PageSize?: number, PageNum?: number, Term?: string, Type?: string, StartDate?: string, EndDate?: string) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Company` + '?' + new URLSearchParams({  ...( PageSize !== undefined ? { PageSize: String(PageSize) } : {} ),  ...( PageNum !== undefined ? { PageNum: String(PageNum) } : {} ),  ...( Term !== undefined ? { Term: String(Term) } : {} ),  ...( Type !== undefined ? { Type: String(Type) } : {} ),  ...( StartDate !== undefined ? { StartDate: String(StartDate) } : {} ),  ...( EndDate !== undefined ? { EndDate: String(EndDate) } : {} ),}).toString(), {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const createCompany = async (data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getCompanyById = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Company/${id}`, {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const updateCompany = async (id: string | number, data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Company/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteCompany = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Company/${id}`, {
      method: 'DELETE'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
