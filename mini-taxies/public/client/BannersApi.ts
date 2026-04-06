import { baseURL } from './config';

export const getBanners = async (PageSize?: number, PageNum?: number, Term?: string, Type?: string, StartDate?: string, EndDate?: string) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Banner` + '?' + new URLSearchParams({  ...( PageSize !== undefined ? { PageSize: String(PageSize) } : {} ),  ...( PageNum !== undefined ? { PageNum: String(PageNum) } : {} ),  ...( Term !== undefined ? { Term: String(Term) } : {} ),  ...( Type !== undefined ? { Type: String(Type) } : {} ),  ...( StartDate !== undefined ? { StartDate: String(StartDate) } : {} ),  ...( EndDate !== undefined ? { EndDate: String(EndDate) } : {} ),}).toString(), {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const createBanner = async (data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Banner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getBannerById = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Banner/${id}`, {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const updateBanner = async (id: string | number, data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Banner/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteBanner = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/Banner/${id}`, {
      method: 'DELETE'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getBannerCards = async (PageSize?: number, PageNum?: number, Term?: string, Type?: string, StartDate?: string, EndDate?: string) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/BannerCard` + '?' + new URLSearchParams({  ...( PageSize !== undefined ? { PageSize: String(PageSize) } : {} ),  ...( PageNum !== undefined ? { PageNum: String(PageNum) } : {} ),  ...( Term !== undefined ? { Term: String(Term) } : {} ),  ...( Type !== undefined ? { Type: String(Type) } : {} ),  ...( StartDate !== undefined ? { StartDate: String(StartDate) } : {} ),  ...( EndDate !== undefined ? { EndDate: String(EndDate) } : {} ),}).toString(), {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const createBannerCard = async (data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/BannerCard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getBannerCardById = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/BannerCard/${id}`, {
      method: 'GET'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const updateBannerCard = async (id: string | number, data: any) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/BannerCard/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteBannerCard = async (id: string | number) => {
  const response = await fetch(baseURL + `/marketplace/api/v1/BannerCard/${id}`, {
      method: 'DELETE'
    });
  if (!response.ok) throw new Error('Failed to fetch ' + response.statusText);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
