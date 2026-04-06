export interface RegisterRequest {
    phoneNumber: string;
    fullName: string;
    password: string;
}

export interface LoginRequest {
    phoneNumber: string;
    password: string;
}

export interface AuthResponse {
    id: string; // Guid
    phoneNumber: string;
    token: string;
}

export interface UserRecord {
    id: string; // Guid
    role: string;
}

export interface Car {
    model: string;
    brand: string;
    licensePlate: string;
}

export interface CarModel extends Car {
    ownerId: string; // Guid
    id: string; // Guid
    comfortScore: number;
    createdAt: string; // DateTime
    deletedAt?: string; // DateTime?
}

export interface UpdateCarOwnerRequest {
    newOwnerId: string; // Guid
}

export interface UpdateComfortScoreRequest {
    comfortScore: number;
}

export interface CompanyModel {
    id: string; // Guid
    name: string;
    status: boolean;
    reputationScore: number;
    createdAt: string; // DateTime
    deletedAt: string; // DateTime
}

export interface NewRideRequest {
    id: string; // Guid
    driverName: string; // Guid (from spec)
    driverId: string; // Guid
    carLicensePlate: string; // Guid (from spec)
    price: number;
    distance: number;
    latitude: number;
    longitude: number;
    status: string;
}

export interface CustomerModel {
    id: string; // Guid
    fullName: string;
    phoneNumber: string;
    passwordHash: string;
}

export interface StandardApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}
