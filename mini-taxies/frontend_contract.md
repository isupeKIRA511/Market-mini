# Frontend Contract — Dynamic Pricing

> Version: 1.0 — 2026-07-02

---

## 1. `POST /rideoffers` — Create Offer (Driver)

**REMOVED** `price` from request body.

### Request
```json
{
  "pickupProvince": "Baghdad",
  "dropoffProvince": "Basra",
  "destinationLatitude": 30.508,
  "destinationLongitude": 47.783,
  "maxPassengers": 4,
  "oneTripOnly": false
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "pickupProvince": "Baghdad",
    "dropoffProvince": "Basra",
    "destinationLatitude": 30.508,
    "destinationLongitude": 47.783,
    "maxPassengers": 4,
    "passengersCount": 0,
    "oneTripOnly": false,
    "driverName": "Mohammed Ali",
    "driverPhoneNumber": "+9647801234567",
    "carBrand": "Toyota",
    "carModel": "Camry",
    "carLicensePlate": "12 A 34567",
    "companyName": "Baghdad Express",
    "companyReputation": 80,
    "carComfortScore": 7,
    "status": "AwaitingPassengers",
    "driverId": "d1e2f3a4-...",
    "companyId": "c1b2a3d4-..."
  },
  "message": "Offer created successfully"
}
```

> `price` no longer appears in the response. Drivers do not set or see prices.

---

## 2. `GET /rideoffers/Search` — Search Offers

**NEW** query params: `pickupLatitude`, `pickupLongitude`.

### Request
```
GET /rideoffers/Search
  ?pickupProvince=Baghdad
  &dropoffProvince=Basra
  &seatCount=2
  &pickupLatitude=33.3152
  &pickupLongitude=44.3661
  &pageNum=1
  &pageSize=20
```

### Response 200
```json
{
  "success": true,
  "pageNum": 1,
  "pageSize": 20,
  "totalCount": 4,
  "data": [
    {
      "id": "a1b2c3d4-...",
      "price": 18500,
      "pickupProvince": "Baghdad",
      "dropoffProvince": "Basra",
      "destinationLatitude": 30.5,
      "destinationLongitude": 47.8,
      "maxPassengers": 4,
      "companyName": "Baghdad Express",
      "driverName": "Mohammed Ali",
      "carBrand": "Toyota",
      "carModel": "Camry"
    }
  ],
  "message": "Offers retrieved successfully"
}
```

> `price` is **computed in realtime** — it changes based on GPS distance, rush hour status, and company pricing. It is not stored in the database. Results are **no longer sorted by price**.

---

## 3. `POST /rides` — Request a Ride (Customer)

**NEW** body fields: `pickupLatitude`, `pickupLongitude`.

### Request
```json
{
  "rideOfferId": "a1b2c3d4-...",
  "pickupLatitude": 33.3152,
  "pickupLongitude": 44.3661
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "id": "r1b2c3d4-...",
    "status": "RequestingRide",
    "price": 18500,
    "passengerName": "Ali Hassan",
    "driverName": "Mohammed Ali",
    "driverPhoneNumber": "+9647801234567",
    "rideOfferId": "a1b2c3d4-...",
    "companyId": "c1b2a3d4-...",
    "passengerId": "p1e2f3a4-...",
    "driverId": "d1e2f3a4-...",
    "pickupProvince": "Baghdad",
    "dropoffProvince": "Basra",
    "destinationLatitude": 30.5,
    "destinationLongitude": 47.8
  },
  "message": "Ride requested successfully"
}
```

> `price` is locked in at booking time. It will not change after this response.

---

## 4. `POST /companies` — Create Company (Admin)

**NEW** body fields: `basePrice`, `pricePerKm`, `pricePerKmInRushHour`.

### Request
```json
{
  "name": "Baghdad Express",
  "reputationScore": 80,
  "basePrice": 3000,
  "pricePerKm": 1200,
  "pricePerKmInRushHour": 1500
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "id": "c1b2a3d4-...",
    "name": "Baghdad Express",
    "status": true,
    "reputationScore": 80,
    "basePrice": 3000,
    "pricePerKm": 1200.0,
    "pricePerKmInRushHour": 1500.0,
    "createdAt": "2026-07-02T10:00:00Z",
    "deletedAt": "0001-01-01T00:00:00Z"
  },
  "message": "Company created successfully"
}
```

---

## 5. `PUT /companies/{id}` — Update Company (Admin)

**NEW** body fields: `basePrice`, `pricePerKm`, `pricePerKmInRushHour`.

### Request
```json
{
  "name": "Baghdad Express",
  "reputationScore": 90,
  "status": true,
  "basePrice": 3500,
  "pricePerKm": 1300,
  "pricePerKmInRushHour": 1800
}
```

### Response 200
```json
{
  "success": true,
  "code": 200,
  "message": "Company updated successfully"
}
```

---

## 6. `GET /companies/{id}` — Get Company

### Response 200
```json
{
  "success": true,
  "data": {
    "id": "c1b2a3d4-...",
    "name": "Baghdad Express",
    "status": true,
    "reputationScore": 80,
    "basePrice": 3000,
    "pricePerKm": 1200.0,
    "pricePerKmInRushHour": 1500.0,
    "createdAt": "2026-07-02T10:00:00Z",
    "deletedAt": "0001-01-01T00:00:00Z"
  },
  "message": "Company retrieved successfully"
}
```

---

## 7. `GET /companies` — List Companies

### Response 200
```json
{
  "success": true,
  "pageNum": 1,
  "pageSize": 20,
  "totalCount": 2,
  "data": [
    {
      "id": "c1b2a3d4-...",
      "name": "Baghdad Express",
      "status": true,
      "reputationScore": 80,
      "basePrice": 3000,
      "pricePerKm": 1200.0,
      "pricePerKmInRushHour": 1500.0,
      "createdAt": "2026-07-02T10:00:00Z",
      "deletedAt": "0001-01-01T00:00:00Z"
    }
  ],
  "message": "Companies retrieved successfully"
}
```

---

## Pricing Rule (for reference)

The price returned by the server is always:

```
price = round(basePrice + Haversine(pickupGPS, destGPS) * rate)
```

| Condition | `rate` value |
|-----------|-------------|
| Outside rush hours | `pricePerKm` |
| 08:00-10:00 UTC or 13:00-16:00 UTC | `pricePerKmInRushHour` |

Rush hours are hardcoded server-side. The FE must **never** calculate prices.
