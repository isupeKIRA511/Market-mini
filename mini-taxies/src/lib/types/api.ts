export interface LoginRequest {
    phoneNumber: string;
    otp?: string;
}

export interface AuthResponse {
    id: string; // Your customer UUID — needed for credit card ownerId
    phoneNumber: string;
    token: string;        // JWT bearer token
}

export interface ApiGetOneResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface ApiGetManyResponse<T> {
    success: boolean;
    pageNum: number;
    pageSize: number;
    totalCount: number;
    data: T[];
    message: string;
}

export interface ApiStatusResponse {
    success: boolean;
    code: number;
    message: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | string;

export interface CreateBookingRequest {
    pickup: string;
    dropoff: string;
    latitude: number;
    longitude: number;
    maxPassengers: number;
    homeToAirport: boolean;
    companyId: string;
}

export interface BookingResponse {
    id: string;
    pickup: string;
    dropoff: string;
    latitude: number;
    longitude: number;
    maxPassengers: number;
    homeToAirport: boolean;
    status: BookingStatus;
    customerId: string;
    customerName: string;
    companyId: string;
    companyName: string;
    createdAt: string;
    updatedAt: string;
}

export interface CompanyModel {
    id?: string;
    name: string;
    reputationScore?: number;
    status?: boolean;
    basePrice?: number;
    pricePerKm?: number;
    pricePerKmInRushHour?: number;
}

export interface CustomerModel {
    id: string;           // Guid
    fullName: string;
    phoneNumber: string;
    createdAt: string;    // ISO 8601
    updatedAt: string;
    deletedAt: string | null;
}

export interface CreditCardModel {
    id: string;
    owner_Id: string;
    cardNumber: string;
    cardHolderName: string;
    cve: number;
    expiration: number;   // MMYY integer, e.g. 1229 = Dec 2029
    createdAt: string;
    deletedAt: string | null;
}

/** يطابق حقول شائعة في GET /RideOffer/Search (انظر swagger: RideOfferSearchRow) */
export interface RideOffersSearchFields {
    /** معرّف العرض — مطلوب لـ POST /Ride (RideRequest) إن أرجعه الخادم */
    id?: string;
    rideOfferId?: string;
    price: number;
    pickupProvince: string;
    dropoffProvince: string;
    destinationLatitude: number;
    destinationLongitude: number;
    maxPassengers: number;
    companyName: string;
    driverName: string;
    carBrand: string;
    carModel: string;
    oneTripOnly?: boolean;
}

export interface RideModel {
    id: string;
    status: string;
    price: number;
    passengerName: string;
    driverName: string;
    driverPhoneNumber: string;
    passenger?: unknown | null;
    rideOfferId: string;
    companyId: string;
    passengerId: string;
    driverId: string;
    pickupProvince: string;
    dropoffProvince: string;
    destinationLatitude: number;
    destinationLongitude: number;
    /** حقول إضافية قد تعيدها الـ API (Swagger: carLicensePlate) */
    carBrand?: string | null;
    carModel?: string | null;
    carLicensePlate?: string | null;
    carPlateNumber?: string | null;
    driverLat?: number | null;
    driverLng?: number | null;
    driverLatitude?: number | null;
    driverLongitude?: number | null;
}

/** GET /Ride/MyRides — شكل الرد الفعلي (بدون pageNum / totalCount) */
export interface ApiMyRidesResponse {
    success: boolean;
    data: RideModel[];
    message: string;
}

/** POST /RideOffer - Create Offer (Driver) according to frontend_contract.md (price removed) */
export interface CreateRideOfferRequest {
    pickupProvince: string;
    dropoffProvince: string;
    destinationLatitude: number;
    destinationLongitude: number;
    maxPassengers: number;
    oneTripOnly?: boolean;
}

/** POST /Ride - Request a Ride (Customer) according to frontend_contract.md (with pickup coordinates) */
export interface RequestRideRequest {
    rideOfferId: string;
    pickupLatitude: number;
    pickupLongitude: number;
}

/** GET /Ride/{id}/status — للاستطلاع (رسالة عربية + رمز الحالة) */
export interface RideStatusPayload {
    message: string;
    status: string;
}

