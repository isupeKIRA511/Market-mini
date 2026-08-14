import { apiClient } from './client';
import { extractRecord, extractRecordArray } from './marketplaceResponse';
import type {
  ApiGetManyResponse,
  ApiGetOneResponse,
  ApiStatusResponse,
  BookingResponse,
  CompanyModel,
  CreateBookingRequest,
} from '../types/api';

export type BookingCompanyOption = CompanyModel & {
  id: string;
  name: string;
};

function str(v: unknown, fallback = ''): string {
  if (v == null) return fallback;
  const s = String(v).trim();
  return s || fallback;
}

function num(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeCompany(row: Record<string, unknown>): BookingCompanyOption | null {
  const id = str(row.id ?? row.Id ?? row.companyId ?? row.CompanyId);
  if (!id) return null;

  return {
    id,
    name: str(row.name ?? row.Name ?? row.companyName ?? row.CompanyName, 'شركة تاكسي'),
    reputationScore: num(row.reputationScore ?? row.ReputationScore),
    status: typeof row.status === 'boolean'
      ? row.status
      : typeof row.Status === 'boolean'
        ? row.Status
        : undefined,
    basePrice: num(row.basePrice ?? row.BasePrice),
    pricePerKm: num(row.pricePerKm ?? row.PricePerKm),
    pricePerKmInRushHour: num(row.pricePerKmInRushHour ?? row.PricePerKmInRushHour),
  };
}

export async function getBookingCompanies(): Promise<BookingCompanyOption[]> {
  const res = await apiClient.get<ApiGetManyResponse<CompanyModel> | unknown>('/Company?PageNum=1&PageSize=100');
  return extractRecordArray(res.data)
    .map(normalizeCompany)
    .filter((company): company is BookingCompanyOption => Boolean(company));
}

export async function createAirportBooking(payload: CreateBookingRequest): Promise<BookingResponse> {
  const res = await apiClient.post<ApiGetOneResponse<BookingResponse>>('/Booking', payload);
  const record = extractRecord(res.data);
  return ((record?.data && typeof record.data === 'object') ? record.data : record) as unknown as BookingResponse;
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const res = await apiClient.get<ApiGetOneResponse<BookingResponse[]> | unknown>('/Booking/my');
  return extractRecordArray(res.data) as unknown as BookingResponse[];
}

export async function cancelBooking(bookingId: string): Promise<ApiStatusResponse> {
  const res = await apiClient.delete<ApiStatusResponse>(`/Booking/${encodeURIComponent(bookingId)}`);
  return res.data;
}
