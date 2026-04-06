import { baseURL } from './config';

export const getCreditCards = async (PageSize?: number, PageNum?: number, Term?: string, Type?: string, StartDate?: string, EndDate?: string) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/CreditCard` + '?' + new URLSearchParams({  ...( PageSize !== undefined ? { PageSize: String(PageSize) } : {} ),  ...( PageNum !== undefined ? { PageNum: String(PageNum) } : {} ),  ...( Term !== undefined ? { Term: String(Term) } : {} ),  ...( Type !== undefined ? { Type: String(Type) } : {} ),  ...( StartDate !== undefined ? { StartDate: String(StartDate) } : {} ),  ...( EndDate !== undefined ? { EndDate: String(EndDate) } : {} ),}).toString(), {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const createCreditCard = async (data: any, ownerId?: number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/CreditCard` + '?' + new URLSearchParams({  ...( ownerId !== undefined ? { ownerId: String(ownerId) } : {} ),}).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getCreditCardById = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/CreditCard/${id}`, {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteCreditCard = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/CreditCard/${id}`, {
      method: 'DELETE'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
