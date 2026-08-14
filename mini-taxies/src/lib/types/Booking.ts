export interface BookingDetails {
    serviceType: 'To Airport' | 'From Airport' | 'Inter-city';
    pickupLocation: string;
    flightNumber?: string;
    dateTime: string;
    carModel: string;
    passengersCount: number;
    luggageCount: number;
    /** بين المحافظات: لإعادة جلب rideOfferId عند الدفع إن وُجد في Search */
    pickupProvince?: string;
    dropoffProvince?: string;
    searchSeatCount?: number;
    rideOfferId?: string;
    carType?: 'standard' | 'vip' | 'sedan' | 'suv' | 'van' | 'special' | string;
    bookingId?: string;
    airport?: string;
    dropoffLocation?: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    homeLatitude?: number;
    homeLongitude?: number;
    airportLatitude?: number;
    airportLongitude?: number;
    homeToAirport?: boolean;
    companyId?: string;
    companyName?: string;
    price?: number;
    vipPassengerCapacity?: number;
    vipLuggageCapacity?: number;
}
