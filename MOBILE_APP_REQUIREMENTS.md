# ChargeSmart – Mobile App Requirements Document

**Version:** 1.0  
**Date:** 2026-04-01  
**Platform:** iOS & Android (React Native / Base44 mobile export)

---

## 1. Overview

ChargeSmart is a mobile-first application for corporate staff to manage EV charging sessions on-site. It allows employees to locate available chargers, configure charging sessions based on their vehicle's battery state, select cost-optimised charging plans, and track their session history.

---

## 2. Target Users

| Role | Description |
|------|-------------|
| **Employee (Standard User)** | Registered staff member with a valid staff ID and an enrolled EV |
| **Administrator** | Manages charger inventory and monitors usage via back-office |

---

## 3. Functional Requirements

### 3.1 Onboarding

- [ ] User must complete onboarding before accessing the app
- [ ] Onboarding collects:
  - Staff ID (e.g. `EMP-12345`)
  - EV model (free text or selection from common models)
  - Battery size (kWh) — auto-populated for known models, editable
  - Preferred connector type (CCS / CHAdeMO / Type 2 / Tesla)
- [ ] Profile data is persisted to the user's account
- [ ] User is redirected to the map on completion

### 3.2 Charger Map

- [ ] Interactive map centred on the campus / site location
- [ ] Charger markers colour-coded by status:
  - 🟢 Green — Available
  - 🔴 Red — Occupied
  - ⚫ Grey — Offline
- [ ] Tapping a marker opens a popup with:
  - Charger name and location description
  - Power output (kW) and connector type
  - Current status badge
  - "Start Charging" button (only visible if Available)
- [ ] Search bar to filter chargers by name or location
- [ ] Map legend always visible on screen

### 3.3 Charging Session Setup

- [ ] User inputs current State of Charge (SoC) via slider (0–100%, step 5%)
- [ ] User inputs desired SoC via slider
- [ ] Desired SoC must be greater than current SoC (validated)
- [ ] System calculates energy required based on battery size and SoC delta

### 3.4 Discount / Plan Selection

The app computes and presents **three charging plans**:

| Plan | ID | Description |
|------|----|-------------|
| Fast Charge | `eager` | Charges immediately at full speed, no discount |
| Flex Charge | `discount_1` | Delayed start or off-peak timing, ~10–15% discount |
| Eco Charge | `discount_2` | Maximum grid-friendly scheduling, ~20–25% discount |

- [ ] Each plan card shows: title, description, estimated duration, final cost, and discount badge
- [ ] User selects one plan before proceeding
- [ ] Tapping "Continue" navigates to Payment

### 3.5 Payment

- [ ] Order summary displayed (charger, plan, SoC range, duration, cost)
- [ ] Credit card input fields: card number, expiry, CVC
- [ ] On successful payment:
  - `ChargingSession` record created with status `charging`
  - Confirmation screen shown with session details
- [ ] "Back to Map" CTA on confirmation

### 3.6 Session History

- [ ] Lists all sessions for the authenticated user, sorted newest first
- [ ] Each session card shows:
  - Charger name
  - Date and time
  - SoC range (e.g. 20% → 80%)
  - Plan name
  - Final cost with discount indicator
  - Status badge (pending / charging / completed / cancelled)
- [ ] Empty state with call-to-action if no sessions exist

### 3.7 Profile Management

- [ ] User can view and edit:
  - Staff ID
  - EV model
  - Battery size (kWh)
  - Preferred connector type
- [ ] Save button persists changes
- [ ] Sign Out button ends the session

---

## 4. Non-Functional Requirements

### 4.1 Performance
- App shell loads in < 2 seconds on 4G
- Map markers render within 1 second of data fetch

### 4.2 Usability
- All interactive elements minimum 44×44pt touch target
- Bottom navigation always accessible
- Safe area insets respected (notch / home bar)

### 4.3 Offline
- Graceful degradation if network unavailable (loading/error states shown)
- No critical data stored locally (all from API)

### 4.4 Security
- Authentication required for all routes except login
- Payment fields never persisted client-side

### 4.5 Accessibility
- Minimum 4.5:1 contrast ratio for all text
- Screen reader labels on all interactive elements

---

## 5. Data Entities

### User (built-in, extended)
| Field | Type | Notes |
|-------|------|-------|
| `staff_id` | string | Corporate employee ID |
| `ev_type` | string | EV make/model |
| `ev_battery_size_kwh` | number | Battery capacity |
| `connector_preference` | enum | CCS / CHAdeMO / Type2 / Tesla |

### Charger
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display label |
| `latitude` / `longitude` | number | Map position |
| `power_kw` | number | Charging power |
| `connector_type` | enum | CCS / CHAdeMO / Type2 / Tesla |
| `status` | enum | available / occupied / offline |
| `location_description` | string | Human-readable location |

### ChargingSession
| Field | Type | Notes |
|-------|------|-------|
| `charger_id` | string | Reference to Charger |
| `charger_name` | string | Denormalised for display |
| `current_soc` | number | % at session start |
| `desired_soc` | number | % target |
| `ev_type` / `battery_size_kwh` | string / number | Snapshot from user |
| `selected_plan` | enum | eager / discount_1 / discount_2 |
| `discount_percent` | number | Applied discount |
| `estimated_duration_hours` | number | Computed |
| `estimated_cost` | number | In USD |
| `status` | enum | pending / charging / completed / cancelled |
| `payment_status` | enum | unpaid / paid |

---

## 6. Navigation Structure

```
App
├── /onboarding          ← first-run only
├── / (Map)              ← default landing
├── /charge              ← session setup + plan selection
├── /payment             ← payment + confirmation
├── /sessions            ← session history
└── /profile             ← account management
```

Bottom navigation tabs: **Map**, **Sessions**, **Charge**, **Profile**

---

## 7. Design System

| Token | Value |
|-------|-------|
| Primary colour | `hsl(162, 72%, 42%)` — green |
| Accent colour | `hsl(205, 85%, 55%)` — blue |
| Font (headings) | Space Grotesk |
| Font (body) | Inter |
| Border radius | 0.75rem (cards), 1rem (interactive) |
| Corner style | Rounded 2xl for cards, full for badges |

---

## 8. Out of Scope (v1.0)

- Push notifications for session completion
- Real-time charger availability via WebSocket
- In-app receipt / invoice download
- Admin dashboard (handled via back-office)
- Multi-site / multi-campus support