export interface BookingDetails {
    serviceType: 'To Airport' | 'From Airport' | 'Inter-city';
    pickupLocation: string;
    flightNumber?: string;
    dateTime: string;
    carModel: string;
    passengersCount: number;
    luggageCount: number;
}
