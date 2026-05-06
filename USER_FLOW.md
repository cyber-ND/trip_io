# trip_io — User Flow Guide

A simple guide explaining how the app works for everyone on the team.

---

## Who Uses trip_io?

There are 3 types of people on the app:

- **Rider** — someone who needs a ride
- **Driver** — someone with a car who earns money giving rides
- **Admin** — the team managing the platform

---

## 1. Signing Up

A new user downloads the app and signs up.

They can either:
- Enter their **name, email, and password**
- Or tap **"Continue with Google"** to sign up faster

Once signed up, they pick their role — are they a **Rider** or a **Driver?**

> The app gives them a secure token (like a digital ID card) that keeps them logged in.

---

## 2. Driver Setup

Before a driver can accept rides, they need to complete their profile:

1. Enter their **vehicle details** (car model, plate number, colour)
2. Wait for **Admin approval**
3. Once approved, they can **go online** (toggle availability on)

> A driver who is offline will not receive any ride requests.

---

## 3. Booking a Ride (Rider)

This is the main flow:

1. Rider opens the app and **enters their pickup location**
2. Rider **enters their destination**
3. The app shows the **estimated fare** and trip distance
4. Rider taps **"Book Ride"**
5. The app searches for an **available driver nearby**
6. A driver is found and **notified of the request**

---

## 4. The Driver Responds

Once a ride request comes in, the driver has **30 seconds** to respond:

- Driver taps **"Accept"** → rider is notified and can now see the driver's name, car details, and phone number
- Driver taps **"Reject"** → the request moves to the **next available driver** automatically
- Driver does not respond in time → same as reject, request moves on

> The rider sees a "Finding your driver..." screen while this is happening.

---

## 5. Rider Can Cancel

A rider can cancel their ride at any point **before the ride starts:**

- **Before a driver accepts** — free cancel, no charges
- **After a driver accepts** — rider can still cancel (e.g. driver is taking too long to arrive)

> Once the driver taps "Start Ride" and the rider is in the car, the ride cannot be cancelled.

---

## 6. The Ride Happens

1. Driver drives to the **pickup location**
2. Rider gets in the car
3. Driver taps **"Start Ride"**
4. Driver takes the rider to their **destination**
5. Driver taps **"Complete Ride"** when they arrive

---

## 7. Driver Contact — When Can You See It?

| Situation | Can rider see driver's phone number? |
|---|---|
| Searching for a driver | No |
| Driver has accepted the ride | Yes |
| Ride is ongoing | Yes |
| Ride is completed | Yes (for a short time, in case you left something) |
| Ride was cancelled | No |

> This protects driver privacy until there is actually a confirmed ride between them.

---

## 8. Payment

After the ride is completed:

1. The app **calculates the final fare** based on distance and time
2. Rider is **charged automatically** (card or wallet)
3. A **payment receipt** is generated for both rider and driver
4. The driver's earnings are **recorded in their account**

---

## 9. Rating

After payment:

1. Rider is asked to **rate the driver** (1 to 5 stars)
2. They can leave an **optional comment**
3. The driver's overall rating updates automatically

> Ratings help keep the platform safe and the service quality high.

---

## 10. Ride History

Both riders and drivers can always go back and see:

- All past rides
- Dates, routes, and fares
- Payment receipts
- Ratings given and received

---

## 11. Admin Controls

The Admin can:

- Approve or suspend drivers
- View all rides on the platform
- Monitor payments
- Manage user accounts

---

## Quick Summary

```
Rider books ride
      ↓
App finds available driver
      ↓
Driver accepts or rejects
  → Rejected? App tries next driver
  → Accepted? Rider sees driver details + phone number
      ↓
Rider can still cancel if needed
      ↓
Driver arrives, picks up rider
      ↓
Ride starts
      ↓
Ride completed
      ↓
Rider pays
      ↓
Rider rates driver
      ↓
Done ✓
```

---

## Ride Status Flow (for developers)

```
pending → accepted → ongoing → completed
pending → cancelled (by rider before acceptance)
accepted → cancelled (by rider after acceptance)
accepted → rejected (by driver) → pending (reassigned to next driver)
```

---

*trip_io — Group 13 Capstone Project*
