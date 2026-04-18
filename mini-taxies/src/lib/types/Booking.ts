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
    carType?: string;
    bookingId?: string;
    airport?: string;
    dropoffLocation?: string;
    price?: number;
}
