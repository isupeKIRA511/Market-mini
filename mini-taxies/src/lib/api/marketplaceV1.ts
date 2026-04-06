/**
 * مسارات مطابقة لملفات `public/client/*Api.ts` المستّخرجة من عميل الخدمة.
 * البادئة: `${base}/marketplace/api/v1` — مصادقة Auth من جذر الخادم: `/Auth/...` (انظر `AuthApi.ts`).
 */

import { apiClient } from './client';

const V1 = '/marketplace/api/v1';

export type MarketplaceListParams = {
  PageSize?: number;
  PageNum?: number;
  Term?: string;
  Type?: string;
  StartDate?: string;
  EndDate?: string;
};

function listQs(p?: MarketplaceListParams): string {
  if (!p) return '';
  const rec: Record<string, string> = {};
  if (p.PageSize !== undefined) rec.PageSize = String(p.PageSize);
  if (p.PageNum !== undefined) rec.PageNum = String(p.PageNum);
  if (p.Term !== undefined) rec.Term = String(p.Term);
  if (p.Type !== undefined) rec.Type = String(p.Type);
  if (p.StartDate !== undefined) rec.StartDate = String(p.StartDate);
  if (p.EndDate !== undefined) rec.EndDate = String(p.EndDate);
  const q = new URLSearchParams(rec).toString();
  return q ? `?${q}` : '';
}

async function getBare<T>(path: string): Promise<T> {
  const { data } = await apiClient.get<T>(path);
  return data;
}

async function postBare<T>(path: string, body: unknown): Promise<T> {
  const { data } = await apiClient.post<T>(path, body);
  return data;
}

async function putBare<T>(path: string, body: unknown): Promise<T> {
  const { data } = await apiClient.put<T>(path, body);
  return data;
}

async function patchBare<T>(path: string, body: unknown): Promise<T> {
  const { data } = await apiClient.patch<T>(path, body);
  return data;
}

async function deleteBare<T>(path: string): Promise<T> {
  const { data } = await apiClient.delete<T>(path);
  return data;
}

// ——— Banner ———
export const getBanners = (p?: MarketplaceListParams) => getBare(`${V1}/Banner${listQs(p)}`);
export const createBanner = (data: unknown) => postBare(`${V1}/Banner`, data);
export const getBannerById = (id: string | number) => getBare(`${V1}/Banner/${id}`);
export const updateBanner = (id: string | number, data: unknown) => putBare(`${V1}/Banner/${id}`, data);
export const deleteBanner = (id: string | number) => deleteBare(`${V1}/Banner/${id}`);
export const getBannerCards = (p?: MarketplaceListParams) => getBare(`${V1}/BannerCard${listQs(p)}`);
export const createBannerCard = (data: unknown) => postBare(`${V1}/BannerCard`, data);
export const getBannerCardById = (id: string | number) => getBare(`${V1}/BannerCard/${id}`);
export const updateBannerCard = (id: string | number, data: unknown) => putBare(`${V1}/BannerCard/${id}`, data);
export const deleteBannerCard = (id: string | number) => deleteBare(`${V1}/BannerCard/${id}`);

// ——— Car ———
export const getCars = (p?: MarketplaceListParams) => getBare(`${V1}/Car${listQs(p)}`);
export const createCar = (data: unknown) => postBare(`${V1}/Car`, data);
export const getCarById = (id: string | number) => getBare(`${V1}/Car/${id}`);
export const updateCar = (id: string | number, data: unknown) => putBare(`${V1}/Car/${id}`, data);
export const deleteCar = (id: string | number) => deleteBare(`${V1}/Car/${id}`);
export const patchCarComfortScore = (id: string | number, data: unknown) =>
  patchBare(`${V1}/Car/${id}/comfort-score`, data);
export const patchCarOwner = (id: string | number, data: unknown) => patchBare(`${V1}/Car/${id}/owner`, data);

// ——— Company (اسم الدالة كما في العميل المُولَّد: getCompanys) ———
export const getCompanys = (p?: MarketplaceListParams) => getBare(`${V1}/Company${listQs(p)}`);
export const createCompany = (data: unknown) => postBare(`${V1}/Company`, data);
export const getCompanyById = (id: string | number) => getBare(`${V1}/Company/${id}`);
export const updateCompany = (id: string | number, data: unknown) => putBare(`${V1}/Company/${id}`, data);
export const deleteCompany = (id: string | number) => deleteBare(`${V1}/Company/${id}`);

// ——— Customer ———
export const getCustomers = (p?: MarketplaceListParams) => getBare(`${V1}/Customer${listQs(p)}`);
export const createCustomer = (data: unknown) => postBare(`${V1}/Customer`, data);
export const getCustomerSingle = (Id?: string | number, Type?: string) => {
  const q = new URLSearchParams({
    ...(Id !== undefined && Id !== '' ? { Id: String(Id) } : {}),
    ...(Type !== undefined ? { Type: String(Type) } : {}),
  }).toString();
  return getBare(`${V1}/Customer/single${q ? `?${q}` : ''}`);
};
export const updateCustomer = (id: string | number, data: unknown) => putBare(`${V1}/Customer/${id}`, data);
export const deleteCustomer = (id: string | number) => deleteBare(`${V1}/Customer/${id}`);

// ——— CreditCard ———
export const getCreditCards = (p?: MarketplaceListParams) => getBare(`${V1}/CreditCard${listQs(p)}`);
export const createCreditCard = (data: unknown, ownerId?: number) => {
  const q = ownerId !== undefined ? `?${new URLSearchParams({ ownerId: String(ownerId) }).toString()}` : '';
  return postBare(`${V1}/CreditCard${q}`, data);
};
export const getCreditCardById = (id: string | number) => getBare(`${V1}/CreditCard/${id}`);
export const deleteCreditCard = (id: string | number) => deleteBare(`${V1}/CreditCard/${id}`);
