import { baseURL } from './config';

export const getCustomers = async (PageSize?: number, PageNum?: number, Term?: string, Type?: string, StartDate?: string, EndDate?: string) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Customer` + '?' + new URLSearchParams({  ...( PageSize !== undefined ? { PageSize: String(PageSize) } : {} ),  ...( PageNum !== undefined ? { PageNum: String(PageNum) } : {} ),  ...( Term !== undefined ? { Term: String(Term) } : {} ),  ...( Type !== undefined ? { Type: String(Type) } : {} ),  ...( StartDate !== undefined ? { StartDate: String(StartDate) } : {} ),  ...( EndDate !== undefined ? { EndDate: String(EndDate) } : {} ),}).toString(), {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const createCustomer = async (data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getCustomerSingle = async (Id?: number, Type?: string) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Customer/single` + '?' + new URLSearchParams({  ...( Id !== undefined ? { Id: String(Id) } : {} ),  ...( Type !== undefined ? { Type: String(Type) } : {} ),}).toString(), {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const updateCustomer = async (id: string | number, data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Customer/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteCustomer = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Customer/${id}`, {
      method: 'DELETE'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
