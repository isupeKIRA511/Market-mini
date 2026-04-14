# Teleport.iq — Customer App API Reference

**Base URL:** `marketplace/api/v1`

Protected endpoints require:

```
Authorization: Bearer <token>
```

The token is returned by the [Verify OTP](#verify-otp--login) endpoint.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [My Account](#2-my-account)
3. [Credit Cards](#3-credit-cards)
4. [Ride Offers — Search](#4-ride-offers--search)
5. [Rides](#5-rides)
6. [Common Types](#6-common-types)
7. [Typical Flow](#7-typical-flow)

---

## 1. Authentication

No token required for these endpoints.

### Request OTP

```
POST /auth/customer/request-otp
```

**Body**

```json
{ "phoneNumber": "+9647801234567" }
```

**Response `200`**

```json
{ "success": true, "message": "OTP sent" }
```

---

### Verify OTP & Login

```
POST /auth/customer/verify-otp
```

**Body**

```json
{
  "phoneNumber": "+9647801234567",
  "otp": "482931"
}
```

**Response `200`** → [`AuthResponse`](#authresponse)

> Store the returned `token` and attach it to every subsequent request as `Authorization: Bearer <token>`.
>
> **This is the only way to obtain a token.** A phone-only login endpoint previously existed but was removed because it allowed anyone to authenticate as any registered phone number without any verification.

---

## 2. My Account

### Get My Account

```
GET /customers/MyAccount
```

**Response `200`** → [`ApiGetOneResponse<CustomerModel>`](#apigetoneresponse)

**Example response**

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Ali Hassan",
    "phoneNumber": "+9647801234567",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z",
    "deletedAt": null
  },
  "message": "Your customer data retrieved successfully"
}
```

---

### Update My Account

```
PUT /customers/MyAccount
```

**Body**

```json
{
  "fullName": "Ali Hassan",
  "phoneNumber": "+9647801234567"
}
```

**Response `200`** → [`ApiStatusResponse`](#apistatusresponse)

---

## 3. Credit Cards

All credit card endpoints require a `customer` token.

### List My Credit Cards

```
GET /creditcards?pageNum=1&pageSize=20
```

**Query params** → [`PaginationQuery`](#paginationquery)

**Response `200`** → [`ApiGetManyResponse<CreditCardModel>`](#apigetmanyresponse)

---

### Get Credit Card by ID

```
GET /creditcards/{id}
```

**Response `200`** → [`ApiGetOneResponse<CreditCardModel>`](#apigetoneresponse)

---

### Add Credit Card

```
POST /creditcards?ownerId={yourCustomerId}
```

> `ownerId` must be the UUID from your `AuthResponse.id`.

**Body**

```json
{
  "cardNumber": "4111111111111111",
  "cardHolderName": "ALI HASSAN",
  "cve": 123,
  "expiration": 1229
}
```

| Field | Type | Notes |
|-------|------|-------|
| `cardNumber` | string | Full card number |
| `cardHolderName` | string | Name on card |
| `cve` | int | 3-digit security code |
| `expiration` | int | `MMYY` format — e.g. `1229` = Dec 2029 |

**Response `200`** → [`ApiGetOneResponse<CreditCardModel>`](#apigetoneresponse)

---

### Delete Credit Card

```
DELETE /creditcards/{id}
```

**Response `200`** → [`ApiStatusResponse`](#apistatusresponse)

---

## 4. Ride Offers — Search

Search available rides. Returns a lightweight view of each offer.

```
GET /rideoffers/Search?pickupProvince=Baghdad&dropoffProvince=Basra&seatCount=2&pageNum=1&pageSize=20
```

**Query params**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pickupProvince` | string | ✓ | Departure province |
| `dropoffProvince` | string | ✓ | Destination province |
| `seatCount` | int | ✓ | Number of seats you need |
| `pageNum` | int | ✓ | Page number (starts at 1) |
| `pageSize` | int | ✓ | Results per page (max 100) |

**Response `200`** → [`ApiGetManyResponse<RideOffersSearchFields>`](#apigetmanyresponse)

```json
{
  "success": true,
  "pageNum": 1,
  "pageSize": 20,
  "totalCount": 4,
  "data": [
    {
      "price": 15000,
      "pickupProvince": "Baghdad",
      "dropoffProvince": "Basra",
      "destinationLatitude": 30.508,
      "destinationLongitude": 47.783,
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

> Take note of the `rideOfferId` you want — you'll need it to book a ride (the `id` field is not returned in search results; call after selecting an offer, or store it from the list).

---

## 5. Rides

### Request a Ride

Book a seat on a specific offer. Your passenger ID is read from the JWT automatically.

```
POST /rides
```

**Body**

```json
{ "rideOfferId": "3fa85f64-5717-4562-b3fc-2c963f66afa6" }
```

**Response `200`** → [`ApiGetOneResponse<RideModel>`](#apigetoneresponse)

> Save the returned `data.id` — this is your `rideId` for all subsequent calls.

---

### Poll Ride Status

Call this repeatedly to track the progress of your ride.

```
GET /rides/{rideId}
```

**Response `200`** → [`ApiGetOneResponse<RideModel>`](#apigetoneresponse)

**Ride status values**

| `status` | What it means |
|----------|---------------|
| `RequestingRide` | Waiting for the driver to accept |
| `AcceptedRide` | Driver accepted — on their way |
| `PickingYouUp` | Driver is heading to your location |
| `TaxiAwaitingYou` | Driver has arrived — go to the vehicle |
| `TransportingYou` | You are in the vehicle, trip in progress |
| `Completed` | Trip finished |
| `PassengerCancelled` | You cancelled this ride |
| `DriverDeclined` | Driver declined your request |

---

### Board the Ride

Call this once you physically board the vehicle. This confirms boarding and transitions the ride to `TransportingYou`.

```
POST /rides/{rideId}/board
```

**Response `200`** → [`ApiStatusResponse`](#apistatusresponse)

---

### Cancel Ride

Cancel your pending or accepted ride request.

```
DELETE /rides/{rideId}
```

**Response `200`** → [`ApiStatusResponse`](#apistatusresponse)

---

## 6. Common Types

### AuthResponse

```ts
{
  id: string;           // Your customer UUID — needed for credit card ownerId
  phoneNumber: string;
  token: string;        // JWT bearer token
}
```

---

### PaginationQuery

| Param | Type | Constraints |
|-------|------|-------------|
| `pageNum` | int | ≥ 1 |
| `pageSize` | int | 1 – 100 |
| `term` | string? | Optional text search |
| `startDate` | ISO 8601? | Optional date filter |
| `endDate` | ISO 8601? | Optional date filter |

---

### ApiGetOneResponse

```ts
{
  success: boolean;
  data: T;
  message: string;
}
```

---

### ApiGetManyResponse

```ts
{
  success: boolean;
  pageNum: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string;
}
```

---

### ApiStatusResponse

```ts
{
  success: boolean;
  code: number;
  message: string;
}
```

---

### CustomerModel

```ts
{
  id: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;    // ISO 8601
  updatedAt: string;
  deletedAt: string | null;
}
```

---

### CreditCardModel

```ts
{
  id: string;
  owner_Id: string;
  cardNumber: string;
  cardHolderName: string;
  cve: number;
  expiration: number;   // MMYY integer, e.g. 1229 = Dec 2029
  createdAt: string;
  deletedAt: string;
}
```

---

### RideOffersSearchFields

```ts
{
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
}
```

---

### RideModel

```ts
{
  id: string;
  status: string;              // see Ride status values above
  price: number;
  passengerName: string;
  driverName: string;
  driverPhoneNumber: string;   // use this to contact your driver
  rideOfferId: string;
  companyId: string;
  passengerId: string;
  driverId: string;
  pickupProvince: string;
  dropoffProvince: string;
  destinationLatitude: number;
  destinationLongitude: number;
}
```

---

## 7. Typical Flow

```
1.  POST /auth/customer/request-otp          → OTP sent to phone
2.  POST /auth/customer/verify-otp           → receive token + your customer id
3.  GET  /rideoffers/Search?...              → browse available rides
4.  POST /rides  { rideOfferId }             → book a seat → save returned rideId
5.  GET  /rides/{rideId}                     → poll — wait for AcceptedRide
6.  GET  /rides/{rideId}                     → poll — wait for TaxiAwaitingYou
7.  POST /rides/{rideId}/board               → confirm you boarded
8.  GET  /rides/{rideId}                     → poll until Completed
```
