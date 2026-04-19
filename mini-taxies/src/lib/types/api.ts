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
