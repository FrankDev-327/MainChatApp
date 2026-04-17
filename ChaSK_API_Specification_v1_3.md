# ChaSK API Specification v1.2

**Version**: 1.2
**Date**: 2025-12-02
**Status**: DRAFT
**Server**: Swoole (WebSocket) + PHP (REST API)
**Database**: MariaDB (server), SQLite v16 (mobile cache)

---

## 1. Pregled Arhitekture / Architecture Overview

### 1.1 Komunikacijski Kanali / Communication Channels

```
┌─────────────────────────────────────────────────────────────────────┐
│                         **ChaSK** SUSTAV                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐     WebSocket (Swoole)      ┌──────────────────┐ │
│  │   Mobile     │◄──────────────────────────►│                  │ │
│  │  (Flutter)   │    Messages & Tasks         │                  │ │
│  │              │    Real-time sync           │    SERVER        │ │
│  │  SQLite v16  │                             │                  │ │
│  │  (cache)     │◄──────────────────────────►│    MariaDB       │ │
│  └──────────────┘     REST API                │    (main DB)     │ │
│                       Auth, Users, Groups     │                  │ │
│                       Settings, Files         │                  │ │
│  ┌──────────────┐                             │                  │ │
│  │     WEB      │◄──────────────────────────►│                  │ │
│  │  Aplikacija  │    WebSocket + REST         │                  │ │
│  │  (direktno)  │    (bez lokalne baze)       │                  │ │
│  └──────────────┘                             └──────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Tipovi Klijenata / Client Types

| Klijent               | Lokalna Baza | WebSocket | REST API | Offline Rad |
| --------------------- | ------------ | --------- | -------- | ----------- |
| Android/iOS (Flutter) | SQLite v16   | Da        | Da       | Da          |
| WEB Aplikacija        | Ne           | Da        | Da       | Ne          |

### 1.3 Pravila Sinkronizacije / Sync Rules

**Mobile aplikacija (offline-first)**:

1. Sve operacije se prvo izvršavaju lokalno (SQLite)
2. Lokalni `id` se generira automatski (AUTOINCREMENT)
3. `server_id` se dobiva od servera nakon uspješne sinkronizacije
4. `sync_status`: 'PENDING' → 'SYNCED' | 'ERROR'
5. Kada nema signala, podaci se akumuliraju lokalno
6. Kada se signal vrati, aplikacija šalje sve PENDING podatke i prima nove

**WEB aplikacija (direct)**:

1. Sve operacije idu direktno na server
2. Nema lokalnog cachea
3. Real-time updates preko WebSocket

---

## 2. Autentifikacija / Authentication

### 2.1 Pregled Autentifikacijskog Sustava

ChaSK koristi **QR kod baziranu autentifikaciju** s dvostrukim kanalom distribucije za povećanu sigurnost:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTENTIFIKACIJSKI FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                              ┌──────────────────┐        │
│  │ ADMINISTRATOR│                              │  SKYTRACK BAZA   │        │
│  │  (WEB App)   │──────── kreira ─────────────►│   (MariaDB)      │        │
│  └──────┬───────┘                              └────────┬─────────┘        │
│         │                                               │                   │
│         │ generira                                      │ user_id, role     │
│         ▼                                               │                   │
│  ┌──────────────┐                              ┌────────▼─────────┐        │
│  │   QR CODE    │                              │  CHASK TABLICA   │        │
│  │  (enkriptiran)│                              │   device_uuids   │        │
│  │              │                              └──────────────────┘        │
│  │ • server_url │                                       ▲                   │
│  │ • user_id    │                                       │                   │
│  │ • role       │                                       │ sprema            │
│  │ • created_at │                                       │ device_uuid       │
│  │ • pin_hash   │                                       │                   │
│  │ • app_url    │                                       │                   │
│  └──────┬───────┘                              ┌────────┴─────────┐        │
│         │                                      │     SERVER       │        │
│   email │ print                                │                  │        │
│         ▼                                      │  POST /activate  │        │
│  ┌──────────────┐      PIN (SMS)              │  POST /connect   │        │
│  │   KORISNIK   │◄────────────────────────────│                  │        │
│  │   (mobitel)  │                              └──────────────────┘        │
│  └──────┬───────┘                                       ▲                   │
│         │                                               │                   │
│         │ skenira QR                                    │                   │
│         │ instalira app                                 │                   │
│         │ unosi PIN                                     │                   │
│         │ app generira UUID                             │                   │
│         ▼                                               │                   │
│  ┌──────────────┐      user_id + PIN + UUID            │                   │
│  │  FLUTTER APP │──────────────────────────────────────┘                   │
│  │              │                                                           │
│  │  Nakon toga: │      user_id + UUID (automatski)                         │
│  │  svaki put   │──────────────────────────────────────►                   │
│  └──────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 QR Kod Struktura

Administrator generira QR kod koji sadrži enkriptirani JSON:

**Plaintext struktura** (prije enkripcije):

```json
{
  "v": 1,
  "server_url": "https://api.chask.hr",
  "ws_url": "wss://ws.chask.hr/socket",
  "user_id": 1000526,
  "role": "DRIVER",
  "created_at": "2025-12-08T10:00:00Z",
  "expires_at": "2025-12-08T10:00:00Z",
  "pin": "2598",    // generate every time QR code issued
  "app_download_url": "https://chask.hr/download/android",
  "company_id": 1
}
```

**Polja**:

| Polje              | Opis                                       | Obavezno |
| ------------------ | ------------------------------------------ | -------- |
| `v`                | Verzija QR formata                         | Da       |
| `server_url`       | REST API URL                               | Da       |
| `ws_url`           | WebSocket URL                              | Da       |
| `user_id`          | ID korisnika iz SkyTrack baze              | Da       |
| `role`             | DRIVER, SUPERVISOR, MANAGER                | Da       |
| `expires_at`       | Datum isteka (7 dana default)              | Da       |
| `pin_hash`         | SHA-256 hash PIN-a (za offline validaciju) | Da       |
| `app_download_url` | URL za download APK/IPA                    | Ne       |
| `company_id`       | ID tvrtke (za multi-tenant)                | Ne       |

**Enkripcija**:

- Algoritam: AES-256-GCM
- Ključ: Server-side secret key
- QR sadrži: Base64(IV + Ciphertext + AuthTag)

**Distribucija (dva kanala za sigurnost)**:

- **Kanal 1**: QR kod šalje se emailom ili printa
- **Kanal 2**: PIN šalje se SMS-om (4-6 znamenki)

### 2.3 Prvo Spajanje (Aktivacija Uređaja)

Korisnik prvi put pokreće aplikaciju nakon skeniranja QR koda.

**REST API Endpoint**: `POST /api/v1/auth/activate`

**Request**:

```json
{
  "driver_id": "1000157",
  "pin": "1234",
  "device_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "device_type": "android",
  "device_name": "Samsung Galaxy S21",
  "app_version": "0.87.0",
  "os_version": "Android 14"
}
```

**Kako aplikacija generira** `device_uuid`:

```dart
import 'package:flutter/services.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

Future<String> getOrCreateDeviceUuid() async {
  final storage = FlutterSecureStorage();

  // Provjeri postoji li već spremljen UUID
  String? existingUuid = await storage.read(key: 'device_uuid');
  if (existingUuid != null) {
    return existingUuid;
  }

  // Pokušaj dohvatiti Android ID ili Identifier for Vendor (iOS)
  final deviceInfo = DeviceInfoPlugin();
  String deviceId;

  if (Platform.isAndroid) {
    final androidInfo = await deviceInfo.androidInfo;
    deviceId = androidInfo.id; // Android ID
  } else if (Platform.isIOS) {
    final iosInfo = await deviceInfo.iosInfo;
    deviceId = iosInfo.identifierForVendor ?? Uuid().v4();
  } else {
    deviceId = Uuid().v4();
  }

  // Spremi u secure storage
  await storage.write(key: 'device_uuid', value: deviceId);
  return deviceId;
}
```

**Response (Success)**:

```json
{
    "activated": true,
    "user": {
      "id": 12345,
      "first_name": "Ivan",
      "last_name": "Horvat",
      "email": "ivan@example.com",
      "phone": "+385911234567",
      "role": "DRIVER",
      "profile_photo": Base64
    },
    "groups": [
      { "id": 1, "name": "Zagreb", "type": "TRUCK" },
      { "id": 5, "name": "Dostava", "type": "DRIVER" }
    ],
    "settings": {
      "language": "hr",
      "theme": "light"
    }
}
```

**Response (Error - PIN pogrešan)**:

```json
//HERE server/backend by default can send an error status code (4XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

Original:
{
  "error": {
    "code": "INVALID_PIN",
    "message": "PIN je neispravan",
    "attempts_remaining": 2
  }
}

How can be done:
{
    "code": "INVALID_PIN",
    "message": "PIN je neispravan",
    "attempts_remaining": 2
  }
}
```

**Response (Error - QR istekao)**:

```json
//HERE server/backend by default can send an error status code (4XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

Original:
{
  "error": {
    "code": "QR_EXPIRED",
    "message": "QR kod je istekao. Zatražite novi od administratora."
  }
}

How can be done:
{
  "code": "QR_EXPIRED",
  "message": "QR kod je istekao. Zatražite novi od administratora."
}

```

**Server-side validacija**:

1. Provjeri `expires_at` - QR ne smije biti istekao - is_valid
2. Provjeri PIN (hash usporedi s `pin`)
3. Provjeri da `user_id` postoji u SkyTrack bazi
4. Spremi `device_uuid` u `chask_device_registrations` tablicu
5. Vrati korisničke podatke

**PIN pokušaji**:

- Maksimalno 5 pokušaja
- Nakon 5 neuspjelih, QR kod se invalidira
- Administrator mora generirati novi QR

### 2.4 Redovno Spajanje (Automatska Autentifikacija)

Nakon uspješne aktivacije, svako sljedeće pokretanje aplikacije koristi automatsku autentifikaciju.

**REST API Endpoint**: `POST /api/v1/auth/connect`

**Request**:

```json
{
  "user_id": 1000568,
  "device_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "app_version": "0.87.0"
}
```

**Response (Success)**:

```json
{
  "connected": true,
  "user": {
    "id": 12345,
    "first_name": "Ivan",
    "last_name": "Horvat",
    "role": "DRIVER",
    "profile_photo": "https://api.chask.hr/photos/12345.jpg"
  },
  "session_token": "<token>", //Backend sends this info generated by driver info/details
  "websocket_url": "wss://ws.chask.hr/socket"
}
```

**Response (Error - Uređaj nije registriran)**:

```json
//HERE server/backend by default can send an error status code (4XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

{
  "code": "DEVICE_NOT_REGISTERED",
  "message": "Ovaj uređaj nije registriran. Skenirajte QR kod za aktivaciju."
}
```

**Response (Error - Uređaj deaktiviran)**:

```json
//HERE server/backend by default can send an error status code (4XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

{
  "code": "DEVICE_REVOKED",
  "message": "Pristup s ovog uređaja je onemogućen. Kontaktirajte administratora."
}
```

**Server-side validacija**:

1. Provjeri postoji li `(user_id, device_uuid)` par u bazi
2. Provjeri da uređaj nije revokiran (`is_active = 1`)
3. Ažuriraj `last_connected_at` timestamp
4. Vrati korisničke podatke

### 2.5 WebSocket Autentifikacija

Nakon uspješnog REST `/connect`, aplikacija se spaja na WebSocket.

**session token** :

```
wss://ws.chask.hr/socket?session_token=<token>
```

**Server validira** iste parametre kao i `/connect` endpoint.

### 2.6 Odjava / Logout

Odjava briše lokalne podatke ali NE deaktivira uređaj.

**REST API Endpoint**: `POST /api/v1/auth/logout`

**Request**:

```json
{
  "user_id": 12345,
  "device_uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:

```json
//HERE it's not need a response for logout
{
    "logged_out": true
}
```

**Mobile app nakon logout-a**:

1. Postavlja flag za re-sync
2. NE briše `device_uuid` iz secure storage

### 2.7 Revokacija Uređaja (Admin)

Ako korisnik izgubi uređaj, administrator može revokirati pristup.

**REST API Endpoint**: `POST /api/v1/admin/devices/{device_uuid}/revoke`

**Request**:

```json
{
  "user_id": 12345,
  "reason": "Uređaj izgubljen"
}
```

**Response**:

```json
//HERE server/backend by default can send an error status code (2XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

{
  "revoked": true,
  "device_uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Učinak**:

- Uređaj više ne može koristiti `/connect`
- Postojeća WebSocket konekcija se prekida
- Korisnik mora dobiti novi QR kod za aktivaciju novog uređaja

### 2.8 Server-side Baza Podataka

**Tablica:** `chask_device_registrations`

```sql
CREATE TABLE chask_device_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_uuid VARCHAR(64) NOT NULL,
    device_type ENUM('android', 'ios', 'web') NOT NULL,
    device_name VARCHAR(255),
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    activated_at DATETIME NOT NULL,
    last_connected_at DATETIME,
    is_active TINYINT(1) DEFAULT 1,
    revoked_at DATETIME DEFAULT NULL,
    revoked_reason VARCHAR(255) DEFAULT NULL,

    UNIQUE KEY unique_user_device (user_id, device_uuid),
    INDEX idx_user_id (user_id),
    INDEX idx_device_uuid (device_uuid),

    // I think we do not need reference to a another table
    //FOREIGN KEY (user_id) REFERENCES skytrack_users(id) ON DELETE CASCADE
);
```

**Tablica:** `chask_qr_codes`

```sql
CREATE TABLE chask_qr_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('DRIVER', 'SUPERVISOR', 'MANAGER') NOT NULL,
    pin VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME DEFAULT NULL,
    used_device_uuid VARCHAR(64) DEFAULT NULL,
    is_valid TINYINT(1) DEFAULT 1,
    failed_attempts INT DEFAULT 0,

    INDEX idx_user_id (user_id),

    // I think we do not need reference to a another table
    //FOREIGN KEY (user_id) REFERENCES skytrack_users(id) ON DELETE CASCADE
);
```

### 2.9 Sigurnosne Napomene

**Zašto je** `user_id + device_uuid` **dovoljno sigurno:**

1. **Device UUID je jedinstven** - Android ID ili iOS Identifier for Vendor
2. **UUID se sprema u Secure Storage** - enkriptirano na uređaju
3. **Dvostruki kanal aktivacije** - QR (email/print) + PIN (SMS)
4. **Server kontrolira pristup** - može revokirati bilo kada
5. **Nema korisničkih kredencijala** - korisnik ne zna lozinku koju bi mogao odati

**Dodatne mjere (opcionalno za budućnost)**:

- Session tokeni s kratkim vijekom trajanja
- Certificate pinning za TLS
- Geo-fencing (dozvoli samo iz određenih lokacija)
- Vremenska ograničenja (dozvoli samo u radne sate)

### 2.10 WEB Aplikacija Autentifikacija

WEB aplikacija koristi klasičnu autentifikaciju jer nema QR skeniranje.

**REST API Endpoint**: `POST /api/v1/auth/web/login`

**Request**:

```json
{
  "email": "voditelj@firma.hr",
  "password": "hashed_password"
}
```

**Response**:

```json
//HERE server/backend by default can send an error status code (2XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

Original:
{
  "success": true,
  "data": {
    "session_token": "web_session_token",
    "expires_in": 28800,
    "user": { ... },
    "websocket_url": "wss://ws.chask.hr/socket"
  }
}

How can be done:
{
  "session_token": "web_session_token",
  "user": { ... },
  "websocket_url": "wss://ws.chask.hr/socket"
}
```

**WebSocket spajanje za WEB**:

```
wss://ws.chask.hr/socket?session_token=<web_session_token>
```

---

## 3. WebSocket Protokol / WebSocket Protocol

### 3.1 Povezivanje / Connection

**URL**: `wss://ws.chask.hr/socket`

**Connection Parameters (WEB)**:

```
wss://ws.chask.hr/socket?session_token=<web_session_token>
```

**Server validacija pri spajanju**:

1. Provjeri `(user_id, device_uuid)` par u `chask_device_registrations`
2. Provjeri `is_active = 1` (uređaj nije revokiran)
3. Ažuriraj `last_connected_at`
4. Dodaj konekciju u aktivne WebSocket sesije

**Prekid konekcije pri revokaciji**:
Ako administrator revokira uređaj, server šalje:

```json
//HERE server/backend by default can send an error status code (2XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

Original:
{
  "type": "system",
  "action": "force_disconnect",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "data": {
    "reason": "DEVICE_REVOKED",
    "message": "Pristup s ovog uređaja je onemogućen."
  }
}

How can be done:
{
  "type": "system",
  "action": "force_disconnect",
  "timestamp": "2025-12-01T10:30:00.000Z",
   "reason": "DEVICE_REVOKED",
  "message": "Pristup s ovog uređaja je onemogućen."
}
```

Zatim prekida WebSocket konekciju.

### 3.2 Format Poruka / Message Format

Sve WebSocket poruke koriste JSON format:

```json
{
  "type": "message_type",
  "action": "action_name",
  "request_id": "uuid-for-tracking",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "data": { ... }
}
```

**Polja**:

- `type`: Kategorija poruke (message, task, sync, system)
- `action`: Specifična akcija (create, update, delete, ack, etc.)
- `request_id`: UUID za praćenje request/response parova (opciono)
- `timestamp`: ISO 8601 format (UTC)
- `data`: Payload specifičan za akciju

### 3.3 Heartbeat / Keep-Alive

**Client → Server** (svake 30 sekundi):

```json
{
  "type": "system",
  "action": "ping",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

**Server → Client**:

```json
{
  "type": "system",
  "action": "pong",
  "timestamp": "2025-12-01T10:30:00.123Z"
}
```

### 3.4 Online Presence / Praćenje Online Statusa

Sustav prati tko je online u realnom vremenu. Podaci o online statusu se NE spremaju u lokalnu bazu jer su transijentni - vrijede samo dok je korisnik spojen.

**Tko vidi koga:**

| Rola       | Vidi online status od                                      |
| ---------- | ---------------------------------------------------------- |
| Driver     | Svi supervisori koje driver vidi (iz grupa)                |
| Supervisor | Svi driveri iz grupa koje vidi + Svi supervisori koje vidi |
| Manager    | Svi korisnici (driveri, supervisori)                       |
| Admin      |                                                            |

#### 3.4.1 Inicijalna lista online korisnika

Kada se klijent spoji, server automatski šalje listu trenutno online korisnika:

**Server → Client** (nakon uspješnog spajanja):

```json
Original:
{
  "type": "presence",
  "action": "initial",
  "timestamp": "2025-12-01T10:00:00.000Z",
  "data": {
    "online_users": [
      {
        "user_id": 101,
        "role": "SUPERVISOR",
        "name": "Marko Marković",
        "connected_since": "2025-12-01T08:30:00.000Z"
      },
      {
        "user_id": 205,
        "role": "DRIVER",
        "name": "Ivan Ivić",
        "vehicle_id": 15,
        "vehicle_registration": "ZG-1234-AB",
        "connected_since": "2025-12-01T09:15:00.000Z"
      }
    ]
  }
}

How can be done:
{
  "type": "presence",
  "action": "initial",
  "timestamp": "2025-12-01T10:00:00.000Z",
  "online_users": [
    {
      "user_id": 101,
      "role": "SUPERVISOR",
      "name": "Marko Marković",
      "connected_since": "2025-12-01T08:30:00.000Z"
    },
    {
      "user_id": 205,
      "role": "DRIVER",
      "name": "Ivan Ivić",
      "vehicle_id": 15,
      "vehicle_registration": "ZG-1234-AB",
      "connected_since": "2025-12-01T09:15:00.000Z"
    }
  ]
}
```

**NAPOMENA**: `vehicle_id` i `vehicle_registration` se šalju samo za drivere i samo ako su prijavljeni na vozilo.

#### 3.4.2 Korisnik dolazi online

Kada se novi korisnik spoji, server obavještava sve relevantne klijente:

**Server → Clients**:

```json
Original:
{
  "type": "presence",
  "action": "user_online",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "data": {
    "user_id": 789,
    "role": "DRIVER",
    "name": "Petar Petrović",
    "vehicle_id": 22,
    "vehicle_registration": "ST-5678-CD",
    "connected_since": "2025-12-01T10:30:00.000Z"
  }
}

How can be done:
{
  "type": "presence",
  "action": "user_online",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "user_id": 789,
  "role": "DRIVER",
  "name": "Petar Petrović",
  "vehicle_id": 22,
  "vehicle_registration": "ST-5678-CD",
  "connected_since": "2025-12-01T10:30:00.000Z"
}
```

#### 3.4.3 Korisnik odlazi offline

Kada korisnik prekine vezu ili timeout:

**Server → Clients**:

```json
{
  "type": "presence",
  "action": "user_offline",
  "timestamp": "2025-12-01T11:00:00.000Z",
  "user_id": 789,
  "reason": "disconnected"
}
```

**Razlozi (**`reason`**)**:

| Vrijednost     | Opis                                             |
| -------------- | ------------------------------------------------ |
| `disconnected` | Korisnik je zatvorio aplikaciju ili izgubio vezu |
| `timeout`      | Nema ping/pong više od 90 sekundi                |
| `logout`       | Korisnik se eksplicitno odjavio                  |
| `revoked`      | Uređaj je revokiran od admina                    |

#### 3.4.4 Promjena vozila

Kada driver promijeni vozilo (prijavi se na drugo):

**Server → Clients** (supervisorima i managerima):

```json
{
  "type": "presence",
  "action": "vehicle_change",
  "timestamp": "2025-12-01T11:30:00.000Z",
  "user_id": 789,
  "old_vehicle_id": 22,
  "old_vehicle_registration": "ST-5678-CD",
  "new_vehicle_id": 25,
  "new_vehicle_registration": "ZG-9876-EF"
}
```

#### 3.4.5 Driver prijava na vozilo

Driver se prijavljuje na vozilo pri pokretanju radnog dana:

**Client → Server** (Driver prijava):

```json
{
  "type": "presence",
  "action": "vehicle_login",
  "timestamp": "2025-12-01T07:00:00.000Z",
  "vehicle_id": 22
}
```

**Server → Client** (Potvrda):

```json
{
  "type": "presence",
  "action": "vehicle_login_ack",
  "timestamp": "2025-12-01T07:00:00.100Z",
  "vehicle_id": 22,
  "vehicle_registration": "ST-5678-CD",
  "vehicle_type": "Hladnjača",
  "vehicle_model": "Mercedes Actros"
}
```

**Client → Server** (Driver odjava s vozila):

```json
{
  "type": "presence",
  "action": "vehicle_logout",
  "timestamp": "2025-12-01T17:00:00.000Z"
}
```

#### 3.4.6 Filtriranje po grupama

Server automatski filtrira online korisnike prema grupama kojima klijent pripada:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    ONLINE PRESENCE VISIBILITY                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Driver A (Grupe: "Zagreb", "Dostava")                                        │
│   └─ Vidi: Supervisore koji nadziru grupe "Zagreb" ili "Dostava"               │
│                                                                                 │
│   Supervisor B (Grupe: "Zagreb", "Split")                                       │
│   └─ Vidi: - Drivere iz grupa "Zagreb" ili "Split"                             │
│            - Ostale supervisore koji dijele iste grupe                          │
│                                                                                 │
│   Manager C                                                                      │
│   └─ Vidi: Sve drivere i supervisore u sustavu                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Poruke / Messages (WebSocket)

### 4.1 Kreiranje Poruke / Create Message

**VAŽNO - ID Management**:

- Mobile app kreira poruku lokalno s `local_id` (AUTOINCREMENT)
- Šalje poruku serveru s `local_id` u `client_id` polju
- Server vraća `server_id` koji je valjan u cijelom sustavu
- Mobile app ažurira lokalni zapis s `server_id`

> **VAŽNO - Redoslijed za poruke s attachment-ima:**
>
> 1. **Prvo** upload datoteke putem REST API `POST /api/v1/files/upload` (Section 7.3)
> 2. Dobij `file_key` iz response-a
> 3. **Zatim** pošalji poruku putem WebSocket s `file_key` u `attachments` polju
> 4. Server povezuje datoteku s porukom i vraća trajni `file_url`
>
> Ako se poruka pošalje s nepostojećim `file_key`, server vraća error `INVALID_FILE_KEY`.

**Client → Server**:

```json
Original:
{
  "type": "message",
  "action": "create",
  "request_id": "req-uuid-123",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "data": {
    "client_id": 456,
    "receiver_id": 789,
    "group_id": 0,
    "task_id": 0,
    "content": "Stigao sam na lokaciju",
    "is_urgent": false,
    "is_warning": false,
    "is_notification": false,
    "attachments": [
      {
        "client_id": 1,
        "type": "PHOTO",
        "file_key": "temp_upload_key_123"
      }
    ]
  }
}

How can be done:
{
  "request_id": "req-uuid-123",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "client_id": 456,
  "receiver_id": 789,
  "group_id": 0,
  "task_id": 0,
  "content": "Stigao sam na lokaciju",
  "is_urgent": false,
  "is_warning": false,
  "is_notification": false,
  "attachments": [
    {
      "client_id": 1,
      "type": "PHOTO",
      "file_key": "temp_upload_key_123"
    }
  ]
}
```

**Server → Client (Acknowledgment)**:

```json
Original:
{
  "type": "message",
  "action": "create_ack",
  "request_id": "req-uuid-123",
  "timestamp": "2025-12-01T10:30:00.500Z",
  "data": {
    "client_id": 456,
    "server_id": 98765,
    "saved": "2025-12-01T10:30:00.456Z",
    "attachments": [
      {
        "client_id": 1,
        "server_id": 54321,
        "file_url": "https://api.chask.hr/files/54321.jpg"
      }
    ]
  }
}

How can be done:
{,
  "request_id": "req-uuid-123",
  "timestamp": "2025-12-01T10:30:00.500Z",
  "attachments": [
    {
      "client_id": 1,
      "server_id": 54321,
      "file_url": "https://api.chask.hr/files/54321.jpg"
    }
  ]
}
```

### 4.2 Primanje Poruke / Receive Message

**Server → Client** (nova poruka od drugog korisnika):

```json
Original:
{
  "type": "message",
  "action": "new",
  "timestamp": "2025-12-01T10:31:00.000Z",
  "data": {
    "server_id": 98766,
    "creator_id": 789,
    "receiver_id": 456,
    "group_id": 0,
    "task_id": 0,
    "content": "Razumijem, hvala na informaciji",
    "created": "2025-12-01T10:30:55.000Z",
    "saved": "2025-12-01T10:30:55.123Z",
    "is_urgent": false,
    "is_warning": false,
    "is_notification": false,
    "attachments": []
  }
}

How can be done:
{
  "timestamp": "2025-12-01T10:31:00.000Z",
  "server_id": 98766,
  "creator_id": 789,
  "receiver_id": 456,
  "group_id": 0,
  "task_id": 0,
  "content": "Razumijem, hvala na informaciji",
  "created": "2025-12-01T10:30:55.000Z",
  "is_urgent": false,
  "is_warning": false,
  "is_notification": false,
  "attachments": []
}
```

**NAPOMENA**: Mobile app prima ovu poruku i:

1. Kreira lokalni `id` (AUTOINCREMENT)
2. Sprema `server_id` iz poruke
3. Postavlja `sync_status = 'SYNCED'`
4. Postavlja `received = DateTime.now().millisecondsSinceEpoch`

### 4.3 Potvrda Čitanja / Read Confirmation

**Client → Server**:

```json
{
  "type": "message",
  "action": "read",
  "timestamp": "2025-12-01T10:32:00.000Z",
  "data": {
    "message_ids": [98765, 98766],
    "read_at": "2025-12-01T10:32:00.000Z"
  }
}
```

**Server → Other Client** (obavijest pošiljatelju):

```json
{
  "type": "message",
  "action": "read_notification",
  "timestamp": "2025-12-01T10:32:00.100Z",
  "data": {
    "message_ids": [98765, 98766],
    "read_by": 456,
    "read_at": "2025-12-01T10:32:00.000Z"
  }
}
```

### 4.4 Tipovi Poruka / Message Types

| group_id | task_id | receiver_id | Tip                      |
| -------- | ------- | ----------- | ------------------------ |
| 0        | 0       | \>0         | Privatna poruka          |
| \>0      | 0       | 0           | Grupna poruka            |
| 0        | \>0     | 0           | Poruka vezana za zadatak |

### 4.5 Timestamp Handling - Detalji

**Kreiranje Poruke (sender flow)**:

```
Mobile App                        Server                          Database
────────────                      ──────                          ────────
1. Korisnik šalje
   created = now() (lokalno)
   saved = NULL
   received = NULL
   read = NULL
   sync_status = PENDING
   ↓
2. WebSocket send ──────────────► 3. Prima poruku
                                     saved = now() (server)
                                     INSERT u MariaDB
                                     ↓
4. Prima ACK ◄─────────────────── Šalje create_ack
   saved = from ACK                  s saved timestamp
   sync_status = SYNCED
```

**Primanje Poruke (receiver flow)**:

```
Server                            Mobile App                       Database
──────                            ──────────                       ────────
1. Šalje novu poruku ────────────► 2. Prima poruku
   (sadrži created, saved)           received = now() (lokalno)
                                     INSERT u SQLite:
                                     - created = from server
                                     - saved = from server
                                     - received = now()
                                     - read = NULL
                                     - sync_status = SYNCED
                                     ↓
                                  3. Korisnik otvori chat
                                     read = now() (lokalno)
                                     ↓
4. Prima read notif ◄──────────── WebSocket send read
   (za UI update)
```

**Grupne Poruke - Read Tracking**:

Za grupne poruke, `read` se NE koristi u `messages` tablici. Umjesto toga:

```json
// Client → Server: Korisnik otvara grupni chat
{
  "type": "message",
  "action": "read_group",
  "data": {
    "group_id": 5,
    "message_ids": [98765, 98766, 98767],
    "read_at": "2025-12-01T10:32:00.000Z"
  }
}

// Server sprema u message_reads tablicu:
// INSERT INTO message_reads (message_id, user_id, read_at) VALUES (?, ?, ?)
```

**Task Poruke - Read Pravila**:

Za task poruke (`task_id > 0`), `read` se postavlja kada **druga strana** otvori task:

```json
// Client → Server: Driver otvara task (čita supervisor poruke)
{
  "type": "message",
  "action": "read_task",
  "data": {
    "task_id": 5001,
    "reader_id": 789,
    "reader_role": "DRIVER",
    "read_at": "2025-12-01T14:00:00.000Z"
  }
}

// Server ažurira poruke gdje creator_id != reader_id
// UPDATE messages SET read = ? WHERE task_id = ? AND creator_id != ? AND read IS NULL
```

**WEB Aplikacija - Posebna Pravila**:

Za WEB, `saved` i `received` su uvijek jednaki jer nema lokalne baze:

```json
// WEB prima poruku - saved i received su isti
{
  "type": "message",
  "action": "new",
  "data": {
    "server_id": 98766,
    "created": "2025-12-01T10:30:55.000Z",
    "saved": "2025-12-01T10:30:55.123Z",
    "received": "2025-12-01T10:30:55.123Z"
  }
}
// NAPOMENA: Za WEB, received = saved jer se poruka prikazuje čim stigne
```

---

## 5. Zadaci / Tasks (WebSocket)

### 5.1 Kreiranje Zadatka / Create Task

> **NAPOMENA - Multitask:**
> Root task i subtask koriste **isti API**. Za multitask:
>
> 1. Prvo pošalji root task (`is_root=true`, `parent_task_id=null`)
> 2. Sačekaj `create_ack` da dobiješ `server_id` root taska
> 3. Zatim pošalji svaki subtask s `parent_task_id` = server_id root taska
> 4. Redoslijed subtaskova određen je poljem `order_index`
> 5. **Jednom poslan redoslijed se ne može mijenjati**
>
> Validacija završetka subtaskova (da li se moraju završiti po redu) obavlja **mobilna aplikacija**, ne server. Supervisor može override-ati i dozvoliti završetak bilo kojeg subtaska.

#### Jednostavni zadatak (Simple Task)

**Client → Server** (Supervisor kreira jednostavni zadatak):

```json
Original:
{
  "type": "task",
  "action": "create",
  "request_id": "req-uuid-456",
  "timestamp": "2025-12-01T11:00:00.000Z",
  "data": {
    "client_id": 100,
    "receiver_id": 789,
    "is_root": false,
    "parent_task_id": null,
    "order_index": 0,
    "title": "Dostava Zagreb",
    "description": "Dostavi paket na adresu",
    "location_address": "Ilica 100, Zagreb",
    "location_lat": 45.8150,
    "location_lng": 15.9819,
    "priority": "HIGH",
    "deadline_type": "TIME_WINDOW",
    "deadline_start": "2025-12-01T14:00:00.000Z",
    "deadline_end": "2025-12-01T16:00:00.000Z",
    "require_photo": 1,
    "require_signature": 1,
    "require_location": 1,
    "require_barcode": 0,
    "require_start": 1
  }
}

How can be done:
{
  "request_id": "req-uuid-456",
  "client_id": 100,
  "receiver_id": 789,
  "is_root": false,
  "parent_task_id": null,
  "order_index": 0,
  "title": "Dostava Zagreb",
  "description": "Dostavi paket na adresu",
  "location_address": "Ilica 100, Zagreb",
  "location_lat": 45.8150,
  "location_lng": 15.9819,
  "priority": "HIGH",
  "deadline_type": "TIME_WINDOW",
  "deadline_start": "2025-12-01T14:00:00.000Z",
  "deadline_end": "2025-12-01T16:00:00.000Z",
  "require_photo": 1,
  "require_signature": 1,
  "require_location": 1,
  "require_barcode": 0,
  "require_start": 1
}
```

**Server → Client (Acknowledgment)**:

```json
Original:
{
  "type": "task",
  "action": "create_ack",
  "request_id": "req-uuid-456",
  "timestamp": "2025-12-01T11:00:00.500Z",
  "data": {
    "client_id": 100,
    "server_id": 5001,
    "saved": "2025-12-01T11:00:00.456Z"
  }
}

How can be done: // has to be returned details of the task created
{
  "request_id": "req-uuid-456",
  "client_id": 100,
  "receiver_id": 789,
  "is_root": false,
  "parent_task_id": null,
  "order_index": 0,
  "title": "Dostava Zagreb",
  "description": "Dostavi paket na adresu",
  "location_address": "Ilica 100, Zagreb",
  "location_lat": 45.8150,
  "location_lng": 15.9819,
  "priority": "HIGH",
  "deadline_type": "TIME_WINDOW",
  "deadline_start": "2025-12-01T14:00:00.000Z",
  "deadline_end": "2025-12-01T16:00:00.000Z",
  "require_photo": 1,
  "require_signature": 1,
  "require_location": 1,
  "require_barcode": 0,
  "require_start": 1
}}
}
```

#### Multitask - Root Task

**Client → Server** (Supervisor kreira root task):

```json
Original:
{
  "type": "task",
  "action": "create",
  "request_id": "req-uuid-456",
  "timestamp": "2025-12-01T11:00:00.000Z",
  "data": {
    "client_id": 100,
    "receiver_id": 789,
    "is_root": true,
    "parent_task_id": null,
    "order_index": 0,
    "title": "Dostava Zagreb - Glavni",
    "description": "Kompletna dostava s utovarom i istovarom",
    "location_address": "Ilica 100, Zagreb",
    "location_lat": 45.8150,
    "location_lng": 15.9819,
    "priority": "HIGH",
    "deadline_type": "TIME_WINDOW",
    "deadline_start": "2025-12-01T14:00:00.000Z",
    "deadline_end": "2025-12-01T16:00:00.000Z",
    "require_photo": 0,
    "require_signature": 0,
    "require_location": 0,
    "require_barcode": 0,
    "require_start": 0
  }
}

How can be done:
{
  "timestamp": "2025-12-01T11:00:00.000Z",
  "client_id": 100,
  "receiver_id": 789,
  "is_root": true,
  "parent_task_id": null,
  "order_index": 0,
  "title": "Dostava Zagreb - Glavni",
  "description": "Kompletna dostava s utovarom i istovarom",
  "location_address": "Ilica 100, Zagreb",
  "location_lat": 45.8150,
  "location_lng": 15.9819,
  "priority": "HIGH",
  "deadline_type": "TIME_WINDOW",
  "deadline_start": "2025-12-01T14:00:00.000Z",
  "deadline_end": "2025-12-01T16:00:00.000Z",
  "require_photo": 0,
  "require_signature": 0,
  "require_location": 0,
  "require_barcode": 0,
  "require_start": 0
}
```

**Server → Client (Acknowledgment za root)**:

```json
Original:
{
  "type": "task",
  "action": "create_ack",
  "request_id": "req-uuid-456",
  "timestamp": "2025-12-01T11:00:00.500Z",
  "data": {
    "client_id": 100,
    "server_id": 5001,
    "saved": "2025-12-01T11:00:00.456Z"
  }
}

How can be done: // has to be returned details of the task created
{
  "timestamp": "2025-12-01T11:00:00.000Z",
  "client_id": 100,
  "receiver_id": 789,
  "is_root": true,
  "parent_task_id": null,
  "order_index": 0,
  "title": "Dostava Zagreb - Glavni",
  "description": "Kompletna dostava s utovarom i istovarom",
  "location_address": "Ilica 100, Zagreb",
  "location_lat": 45.8150,
  "location_lng": 15.9819,
  "priority": "HIGH",
  "deadline_type": "TIME_WINDOW",
  "deadline_start": "2025-12-01T14:00:00.000Z",
  "deadline_end": "2025-12-01T16:00:00.000Z",
  "require_photo": 0,
  "require_signature": 0,
  "require_location": 0,
  "require_barcode": 0,
  "require_start": 0
}
```

#### Multitask - Subtask (nakon što root dobije server_id)

**Client → Server** (Supervisor kreira subtask):

```json
Original:
{
  "type": "task",
  "action": "create",
  "request_id": "req-uuid-457",
  "timestamp": "2025-12-01T11:00:01.000Z",
  "data": {
    "client_id": 101,
    "receiver_id": 789,
    "is_root": false,
    "parent_task_id": 5001,
    "order_index": 1,
    "title": "Utovar",
    "description": "Preuzmi paket iz skladišta",
    "location_address": "Skladište A",
    "location_lat": 45.8000,
    "location_lng": 15.9700,
    "priority": "HIGH",
    "deadline_type": "NONE",
    "require_photo": 1,
    "require_signature": 0,
    "require_location": 1,
    "require_barcode": 1,
    "require_start": 0
  }
}

How can be done:
{
  "timestamp": "2025-12-01T11:00:01.000Z",
  "client_id": 101,
  "receiver_id": 789,
  "is_root": false,
  "parent_task_id": 5001,
  "order_index": 1,
  "title": "Utovar",
  "description": "Preuzmi paket iz skladišta",
  "location_address": "Skladište A",
  "location_lat": 45.8000,
  "location_lng": 15.9700,
  "priority": "HIGH",
  "deadline_type": "NONE",
  "require_photo": 1,
  "require_signature": 0,
  "require_location": 1,
  "require_barcode": 1,
  "require_start": 0
}
```

**Server → Client (Acknowledgment za subtask)**:

```json
Original:
{
  "type": "task",
  "action": "create_ack",
  "request_id": "req-uuid-457",
  "timestamp": "2025-12-01T11:00:01.500Z",
  "data": {
    "client_id": 101,
    "server_id": 5002,
    "saved": "2025-12-01T11:00:01.456Z"
  }
}

How can be done: // has to be returned details of the task created
{
  "timestamp": "2025-12-01T11:00:01.000Z",
  "client_id": 101,
  "receiver_id": 789,
  "is_root": false,
  "parent_task_id": 5001,
  "order_index": 1,
  "title": "Utovar",
  "description": "Preuzmi paket iz skladišta",
  "location_address": "Skladište A",
  "location_lat": 45.8000,
  "location_lng": 15.9700,
  "priority": "HIGH",
  "deadline_type": "NONE",
  "require_photo": 1,
  "require_signature": 0,
  "require_location": 1,
  "require_barcode": 1,
  "require_start": 0
}
```

#### Error Response - Nepostojeći parent_task_id

Ako subtask ima `parent_task_id` koji ne postoji na serveru:

```json
Original:
{
  "type": "task",
  "action": "create_error",
  "request_id": "req-uuid-458",
  "timestamp": "2025-12-01T11:00:02.000Z",
  "error": {
    "code": "PARENT_NOT_FOUND",
    "message": "Parent task with ID 9999 does not exist",
    "client_id": 102
  }
}

How can be done:
//HERE server/backend by default can send an error status code (4XX)
// instead of this
[reference here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
{
  "message": "Parent task with ID 9999 does not exist",
}

```

#### Server → Driver (obavijest vozaču o novom zadatku)

```json
{
  "type": "task",
  "action": "new",
  "timestamp": "2025-12-01T11:00:00.600Z",
  "data": {
    "server_id": 5001,
    "creator_id": 456,
    "receiver_id": 789,
    "is_root": true,
    "parent_task_id": null,
    "order_index": 0,
    "title": "Dostava Zagreb - Glavni",
    "description": "Kompletna dostava s utovarom i istovarom",
    "location_address": "Ilica 100, Zagreb",
    "location_lat": 45.8150,
    "location_lng": 15.9819,
    "status": "OPEN",
    "priority": "HIGH",
    "deadline_type": "TIME_WINDOW",
    "deadline_start": "2025-12-01T14:00:00.000Z",
    "deadline_end": "2025-12-01T16:00:00.000Z",
    "require_photo": 0,
    "require_signature": 0,
    "require_location": 0,
    "require_barcode": 0,
    "require_start": 0,
    "created": "2025-12-01T11:00:00.456Z"
  }
}
```

> **NAPOMENA:** Svaki task (root i subtask) šalje se vozaču zasebno putem `action: "new"`. Aplikacija na vozačevom mobitelu grupira taskove prema `parent_task_id` za prikaz multitaska.

### 5.2 Ažuriranje Statusa Zadatka / Update Task Status

**Client → Server** (Driver započinje zadatak):

```json
{
  "type": "task",
  "action": "update_status",
  "request_id": "req-uuid-789",
  "timestamp": "2025-12-01T14:00:00.000Z",
  "data": {
    "server_id": 5001,
    "status": "IN PROGRESS",
    "start": "2025-12-01T14:00:00.000Z"
  }
}
```

**Client → Server** (Driver završava zadatak):

```json
{
  "type": "task",
  "action": "update_status",
  "request_id": "req-uuid-790",
  "timestamp": "2025-12-01T15:30:00.000Z",
  "data": {
    "server_id": 5001,
    "status": "COMPLETED",
    "completed": "2025-12-01T15:30:00.000Z"
  }
}
```

**Client → Server** (Driver odbija zadatak):

```json
{
  "type": "task",
  "action": "update_status",
  "request_id": "req-uuid-791",
  "timestamp": "2025-12-01T14:30:00.000Z",
  "data": {
    "server_id": 5001,
    "status": "REJECTED",
    "rejection_reason": "Adresa ne postoji"
  }
}
```

**Server → Client** (Notifikacija o promjeni statusa za Supervisora/Managera):

Kada driver promijeni status zadatka, server šalje notifikaciju svim relevantnim korisnicima (creator zadatka, supervisori grupe, manageri). Ovo omogućuje zvučne notifikacije za završene zadatke.

```json
{
  "type": "task",
  "action": "status_changed",
  "timestamp": "2025-12-01T15:30:00.100Z",
  "data": {
    "server_id": 5001,
    "old_status": "IN PROGRESS",
    "new_status": "COMPLETED",
    "changed_by": {
      "user_id": 789,
      "name": "Ivan Horvat",
      "role": "DRIVER"
    },
    "task_info": {
      "title": "Dostava Zagreb",
      "is_root": false,
      "parent_task_id": null
    },
    "completed": "2025-12-01T15:30:00.000Z"
  }
}
```

**Polja u notifikaciji**:

| Polje                      | Tip           | Opis                                          |
| -------------------------- | ------------- | --------------------------------------------- |
| `old_status`               | String        | Prethodni status                              |
| `new_status`               | String        | Novi status                                   |
| `changed_by`               | Object        | Tko je promijenio status                      |
| `task_info.is_root`        | Boolean       | Je li root multitask (za različit zvuk)       |
| `task_info.parent_task_id` | Integer\|null | ID parent taska (null = root ili simple task) |

**Zvučne notifikacije (Frontend logika)**:

| Situacija           | Zvuk                               |
| ------------------- | ---------------------------------- |
| Root task COMPLETED | `chask_notification_urgent.wav`    |
| Subtask COMPLETED   | `chask_notification_chime.wav`     |
| Task REJECTED       | Bez zvuka (ili opciono upozorenje) |

**Tko prima notifikaciju**:

- Creator zadatka (supervisor koji je kreirao task)
- Svi supervisori iz iste grupe kao receiver (driver)
- Svi manageri

### 5.3 Dodavanje Potvrde / Add Confirmation

> **NAPOMENA - Vrste potvrda i datoteke:**
>
> - **PHOTO** i **SIGNATURE** - zahtijevaju upload datoteke (PNG ili JPG format)
> - **LOCATION (GPS)** - samo koordinate, **bez file uploada**
> - **BARCODE** - samo tekstualna vrijednost barkoda, **bez file uploada**

> **VAŽNO - Redoslijed za PHOTO i SIGNATURE potvrde:**
>
> 1. **Prvo** upload datoteke putem REST API `POST /api/v1/files/upload` (Section 7.3)
> 2. Dobij `file_key` iz response-a (privremeni ključ, vrijedi ograničeno vrijeme)
> 3. **Zatim** pošalji potvrdu putem WebSocket s `file_key` u `attachment` polju
> 4. Server povezuje datoteku sa zadatkom i vraća trajni `attachment_server_id`
>
> Ako se potvrda pošalje s nepostojećim ili isteklim `file_key`, server vraća error `INVALID_FILE_KEY`.
>
> Za LOCATION i BARCODE, podaci se šalju direktno - nema prethodnog uploada.

**Client → Server** (Driver šalje potvrdu):

```json
{
  "type": "task",
  "action": "add_confirmation",
  "request_id": "req-uuid-800",
  "timestamp": "2025-12-01T15:25:00.000Z",
  "data": {
    "task_server_id": 5001,
    "confirmation_type": "PHOTO",
    "attachment": {
      "client_id": 50,
      "type": "PHOTO",
      "file_key": "temp_upload_key_789"
    }
  }
}
```

**Za SIGNATURE**:

```json
{
  "type": "task",
  "action": "add_confirmation",
  "data": {
    "task_server_id": 5001,
    "confirmation_type": "SIGNATURE",
    "attachment": {
      "client_id": 51,
      "type": "SIGNATURE",
      "file_key": "temp_upload_key_790"
    }
  }
}
```

**Za LOCATION (GPS)**:

```json
{
  "type": "task",
  "action": "add_confirmation",
  "data": {
    "task_server_id": 5001,
    "confirmation_type": "LOCATION",
    "attachment": {
      "client_id": 52,
      "type": "COORDINATES",
      "lat": 45.8150,
      "lng": 15.9819
    }
  }
}
```

**Za BARCODE**:

```json
{
  "type": "task",
  "action": "add_confirmation",
  "data": {
    "task_server_id": 5001,
    "confirmation_type": "BARCODE",
    "attachment": {
      "client_id": 53,
      "type": "BARCODE",
      "barcode_value": "1234567890123"
    }
  }
}
```

### 5.4 Statusi Zadataka / Task Statuses

| Status      | Opis                           | Kada se aktivira                                    |
| ----------- | ------------------------------ | --------------------------------------------------- |
| OPEN        | Zadatak kreiran, čeka isporuku | Supervisor kreira task                              |
| RECEIVED    | Zadatak isporučen na mobitel   | Kada driver mobitel primi task (received timestamp) |
| IN PROGRESS | Vozač je započeo zadatak       | Kada driver klikne "Započni" (start timestamp)      |
| COMPLETED   | Zadatak uspješno završen       | Kada driver završi task (completed timestamp)       |
| ON HOLD     | Zadatak na čekanju             | Kada driver stavi task na čekanje                   |
| REJECTED    | Zadatak odbijen                | Kada driver odbije task                             |

**Status Flow Dijagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TASK STATUS FLOW                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────┐     received      ┌──────────┐     start      ┌─────────────┐ │
│   │  OPEN  │─────timestamp────►│ RECEIVED │───timestamp───►│ IN PROGRESS │ │
│   └────────┘                   └──────────┘                └──────┬──────┘ │
│       │                             │                             │        │
│       │                             │                             │        │
│       │                             ▼                             ▼        │
│       │                        ┌──────────┐               ┌───────────────┐│
│       │                        │ REJECTED │               │   COMPLETED   ││
│       │                        └──────────┘               └───────────────┘│
│       │                                                          ▲         │
│       │                                                          │         │
│       │                        ┌──────────┐                      │         │
│       └───────────────────────►│ ON HOLD  │◄─────────────────────┘         │
│         (supervisor action)    └──────────┘    (može se vratiti)           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Automatska promjena statusa**:

Server automatski mijenja status iz OPEN u RECEIVED kada primi potvrdu da je driver-ov uređaj primio task:

```json
// Server prima od driver uređaja (automatski, ne od korisnika)
{
  "type": "task",
  "action": "received",
  "data": {
    "server_id": 5001,
    "received": "2025-12-01T11:00:05.000Z"
  }
}

// Server ažurira status i obavještava supervisora
{
  "type": "task",
  "action": "status_update",
  "data": {
    "server_id": 5001,
    "old_status": "OPEN",
    "new_status": "RECEIVED",
    "received": "2025-12-01T11:00:05.000Z"
  }
}
```

### 5.5 Prioriteti / Priorities

| Priority | Opis              |
| -------- | ----------------- |
| NONE     | Bez prioriteta    |
| LOW      | Niski prioritet   |
| MEDIUM   | Srednji prioritet |
| HIGH     | Visoki prioritet  |
| URGENT   | Hitno             |

### 5.6 Task Timestamp Handling

**Task Kreiranje i Primanje Flow**:

```
Supervisor (Mobile)               Server                          Driver (Mobile)
───────────────────              ──────                          ───────────────
1. Kreira task
   created = now() (lokalno)
   sync_status = PENDING
   ↓
2. WebSocket send ──────────────► 3. Prima task
                                     saved = now() (server)
                                     INSERT u MariaDB
                                     ↓
4. Prima ACK ◄─────────────────── 5. Šalje task driveru ────────► 6. Prima task
   saved = from ACK                                                   received = now()
   sync_status = SYNCED                                               sync_status = SYNCED
                                                                      ↓
                                  8. Prima read ◄────────────────── 7. Driver otvori task
                                     UPDATE MariaDB                     read = now()
                                     ↓
9. Prima read notif ◄───────────── Šalje read notif
   (za UI update - driver pročitao)
```

**Task Read Timestamp**:

Za razliku od poruka, `tasks.read` se postavlja samo jednom - kada driver prvi put otvori detalje zadatka:

```json
// Client → Server: Driver otvara task
{
  "type": "task",
  "action": "read",
  "data": {
    "server_id": 5001,
    "read_at": "2025-12-01T14:00:00.000Z"
  }
}

// Server → Supervisor: Notifikacija da je driver pročitao
{
  "type": "task",
  "action": "read_notification",
  "data": {
    "server_id": 5001,
    "read_by": 789,
    "read_at": "2025-12-01T14:00:00.000Z"
  }
}
```

**Task Start Timestamp**:

Kada driver započne rad na zadatku (ako je `require_start = 1`):

```json
// Client → Server: Driver započinje task
{
  "type": "task",
  "action": "start",
  "data": {
    "server_id": 5001,
    "start": "2025-12-01T14:05:00.000Z"
  }
}
```

**WEB vs Mobile - Task Timestamps**:

| Timestamp | Mobile                    | WEB             |
| --------- | ------------------------- | --------------- |
| created   | Lokalno vrijeme kreiranja | Lokalno vrijeme |
| saved     | Od servera (ACK)          | = received      |
| received  | Lokalno vrijeme primitka  | = saved         |
| read      | Lokalno vrijeme otvaranja | Lokalno vrijeme |
| start     | Lokalno vrijeme (driver)  | Lokalno vrijeme |
| completed | Lokalno vrijeme (driver)  | Lokalno vrijeme |

---

## 6. Sinkronizacija / Synchronization (WebSocket)

### 6.1 Initial Sync (nakon login-a ili reconnect-a)

**Client → Server**:

```json
{
  "type": "sync",
  "action": "request_initial",
  "request_id": "sync-uuid-001",
  "timestamp": "2025-12-01T10:00:00.000Z",
  "data": {
    "last_sync": "2025-11-30T23:59:59.000Z",
    "pending_messages": [
      {
        "client_id": 100,
        "receiver_id": 789,
        "content": "Poruka kreirana offline",
        "created": "2025-12-01T08:00:00.000Z",
        "is_urgent": false,
        "is_warning": false,
        "is_notification": false
      }
    ],
    "pending_task_updates": [
      {
        "server_id": 5001,
        "status": "COMPLETED",
        "completed": "2025-12-01T09:30:00.000Z"
      }
    ],
    "pending_confirmations": [
      {
        "task_server_id": 5001,
        "confirmation_type": "PHOTO",
        "file_key": "pending_upload_123"
      }
    ]
  }
}
```

**Server → Client** (sync response):

```json
{
  "type": "sync",
  "action": "initial_response",
  "request_id": "sync-uuid-001",
  "timestamp": "2025-12-01T10:00:01.000Z",
  "data": {
    "pending_results": {
      "messages": [
        { "client_id": 100, "server_id": 98800, "status": "synced" }
      ],
      "task_updates": [
        { "server_id": 5001, "status": "synced" }
      ],
      "confirmations": [
        { "task_server_id": 5001, "type": "PHOTO", "status": "synced", "attachment_server_id": 54400 }
      ]
    },
    "new_messages": [ ... ],
    "new_tasks": [ ... ],
    "updated_tasks": [ ... ],
    "users_updates": [ ... ],
    "groups_updates": [ ... ]
  }
}
```

### 6.2 Delta Sync (periodički ili na zahtjev)

**Client → Server**:

```json
{
  "type": "sync",
  "action": "request_delta",
  "timestamp": "2025-12-01T10:05:00.000Z",
  "data": {
    "last_sync": "2025-12-01T10:00:01.000Z"
  }
}
```

---

## 7. REST API Endpoints

### 7.1 Korisnici / Users

**GET /api/v1/users**

- Dohvati listu korisnika (za Supervisor)
- Query params: `role`, `group_id`, `is_online`

**GET /api/v1/users/{id}**

- Dohvati detalje korisnika

**PUT /api/v1/users/{id}**

- Ažuriraj profil korisnika

### 7.2 Grupe / Groups

**GET /api/v1/groups**

- Dohvati listu grupa
- Query params: `type` (DRIVER|TRUCK)

**GET /api/v1/groups/{id}**

- Dohvati detalje grupe

**GET /api/v1/groups/{id}/members**

- Dohvati članove grupe

### 7.3 Upload Datoteka / File Upload

Upload datoteka je **prvi korak** prije slanja poruke ili potvrde zadatka s attachment-om.

> **VAŽNO - Workflow za attachment:**
>
> ```
> ┌─────────────────────────────────────────────────────────────────┐
> │                  ATTACHMENT UPLOAD WORKFLOW                      │
> ├─────────────────────────────────────────────────────────────────┤
> │                                                                 │
> │  1. POST /api/v1/files/upload                                   │
> │     └─ Upload datoteke (REST API)                               │
> │     └─ Dobij file_key (privremeni, expires in 1h)               │
> │                                                                 │
> │  2. WebSocket: message/create ILI task/add_confirmation         │
> │     └─ Pošalji poruku/potvrdu s file_key                        │
> │     └─ Server povezuje datoteku                                 │
> │                                                                 │
> │  3. Response: server_id + file_url                              │
> │     └─ Trajni URL za pristup datoteci                           │
> │                                                                 │
> └─────────────────────────────────────────────────────────────────┘
> ```
>
> **Ako se file_key ne iskoristi unutar** `expires_at` **vremena, datoteka se automatski briše!**

**POST /api/v1/files/upload**

**Request** (multipart/form-data):

```
file: <binary>
type: PHOTO|SIGNATURE|DOCUMENT
```

**Podržani formati**:

| Tip       | MIME tipovi                            | Ekstenzije        | Max Size | Napomena                        |
| --------- | -------------------------------------- | ----------------- | -------- | ------------------------------- |
| PHOTO     | image/jpeg, image/png                  | .jpg, .jpeg, .png | 10 MB    | Slike za potvrdu zadatka        |
| SIGNATURE | image/png                              | .png              | 1 MB     | Potpis (transparentna pozadina) |
| DOCUMENT  | image/jpeg, image/png, application/pdf | .jpg, .png, .pdf  | 25 MB    | Dokumenti u chatu               |

> **NAPOMENA**: GPS koordinate i barkod vrijednosti se šalju direktno kroz WebSocket bez file uploada (vidi Section 5.3).

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "file_key": "temp_upload_key_123",
    "expires_at": "2025-12-01T12:00:00.000Z"
  }
}
```

| Polje        | Tip      | Opis                                                        |
| ------------ | -------- | ----------------------------------------------------------- |
| `file_key`   | String   | Privremeni ključ za povezivanje datoteke s porukom/zadatkom |
| `expires_at` | DateTime | Vrijeme isteka (default: 1 sat od uploada)                  |

**Error Responses**:

**400 Bad Request - Invalid File Type**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File type not supported. Accepted: image/jpeg, image/png"
  }
}
```

**413 Payload Too Large**:

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum allowed (10 MB for PHOTO)"
  }
}
```

**WebSocket Error - Invalid File Key** (pri slanju poruke/potvrde):

```json
{
  "type": "message",
  "action": "create_error",
  "request_id": "req-uuid-123",
  "error": {
    "code": "INVALID_FILE_KEY",
    "message": "File key is invalid or expired",
    "client_id": 456
  }
}
```

**NAPOMENA**: `file_key` se koristi u WebSocket porukama za attachmente. Server povezuje file s porukom/zadatkom i vraća trajni URL. Neiskorištene datoteke se automatski brišu nakon isteka `expires_at`.

### 7.4 Download Datoteka / File Download

**GET /api/v1/files/{server_id}**

- Vraća datoteku za download

**GET /api/v1/files/{server_id}/thumbnail**

- Vraća thumbnail za slike

### 7.5 Postavke / Settings

**GET /api/v1/settings**

- Dohvati korisničke postavke

**PUT /api/v1/settings**

- Ažuriraj postavke

### 7.6 Statistike / Statistics (Manager & Supervisor Dashboard)

Dohvat statistika za dashboard. Dostupno za Supervisora i Managera.

**GET /api/v1/statistics/dashboard**

**Query Parameters**:

| Param    | Tip    | Opis                                                  |
| -------- | ------ | ----------------------------------------------------- |
| `period` | String | Razdoblje: `day`, `week`, `month` (obavezno)          |
| `date`   | String | Referentni datum YYYY-MM-DD (opciono, default: danas) |

**Primjer zahtjeva**:

```
GET /api/v1/statistics/dashboard?period=week&date=2025-12-02
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "period": "week",
    "period_start": "2025-11-25",
    "period_end": "2025-12-01",
    "last_updated": "2025-12-02T11:30:00.000Z",

    "kpi": {
      "active_trucks": 3,
      "active_drivers": 15,
      "total_tasks": 43,
      "completed_tasks": 25,
      "in_progress_tasks": 12,
      "rejected_tasks": 6
    },

    "task_distribution": {
      "completed_percent": 58.1,
      "in_progress_percent": 27.9,
      "rejected_percent": 14.0
    },

    "tasks_by_group": [
      {
        "group_id": 1,
        "group_name": "Zagreb",
        "total": 17,
        "completed": 10,
        "in_progress": 5,
        "rejected": 2
      },
      {
        "group_id": 2,
        "group_name": "Split",
        "total": 14,
        "completed": 8,
        "in_progress": 4,
        "rejected": 2
      },
      {
        "group_id": 3,
        "group_name": "Rijeka",
        "total": 12,
        "completed": 7,
        "in_progress": 3,
        "rejected": 2
      }
    ]
  }
}
```

**Polja u odgovoru**:

| Polje                         | Tip     | Opis                                      |
| ----------------------------- | ------- | ----------------------------------------- |
| `kpi.active_trucks`           | Integer | Broj aktivnih kamiona (online)            |
| `kpi.active_drivers`          | Integer | Broj aktivnih vozača (online)             |
| `kpi.total_tasks`             | Integer | Ukupno zadataka u razdoblju               |
| `kpi.completed_tasks`         | Integer | Završenih zadataka                        |
| `kpi.in_progress_tasks`       | Integer | Zadataka u tijeku                         |
| `kpi.rejected_tasks`          | Integer | Odbijenih zadataka                        |
| `task_distribution.*_percent` | Float   | Postotak za pie chart                     |
| `tasks_by_group[].total`      | Integer | Ukupno zadataka za grupu (za Gantt chart) |

**Period izračun**:

- `day`: Od 00:00 do 23:59 referentnog datuma
- `week`: Od ponedjeljka do nedjelje tjedna koji sadrži referentni datum
- `month`: Od prvog do zadnjeg dana mjeseca referentnog datuma

**Pristup**:

- **Supervisor**: Vidi statistike samo za grupe kojima pripada
- **Manager**: Vidi statistike za sve grupe

### 7.7 Info o Vozaču / Driver Info

Dohvat detaljnih informacija o vozaču. Dostupno za Supervisora i Managera.

**GET /api/v1/drivers/{id}**

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 789,
    "first_name": "Ivan",
    "last_name": "Horvat",
    "phone": "+385911234567",
    "tachograph_card_number": "HR0000000123456789",
    "license_categories": ["B", "C", "CE"],
    "profile_photo": "https://api.chask.hr/photos/789.jpg",
    "is_online": true,
    "current_vehicle": {
      "id": 22,
      "registration": "ST-5678-CD",
      "type": "Hladnjača",
      "model": "Mercedes Actros"
    },
    "groups": [
      { "id": 1, "name": "Zagreb", "type": "DRIVER" },
      { "id": 5, "name": "Dostava", "type": "DRIVER" }
    ]
  }
}
```

**Polja u odgovoru**:

| Polje                    | Tip           | Opis                                          |
| ------------------------ | ------------- | --------------------------------------------- |
| `id`                     | Integer       | ID vozača iz SkyTrack baze                    |
| `first_name`             | String        | Ime vozača                                    |
| `last_name`              | String        | Prezime vozača                                |
| `phone`                  | String        | Broj telefona (međunarodni format)            |
| `tachograph_card_number` | String        | Broj tahograf kartice                         |
| `license_categories`     | Array[String] | Kategorije vozačke dozvole (B, C, CE, etc.)   |
| `profile_photo`          | String        | URL profilne fotografije                      |
| `is_online`              | Boolean       | Da li je vozač trenutno spojen                |
| `current_vehicle`        | Object\|null  | Vozilo na koje je vozač prijavljen (ili null) |
| `groups`                 | Array         | Grupe kojima vozač pripada                    |

**Error Responses**:

```json
// 404 - Driver ne postoji
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Vozač s ID 789 nije pronađen"
  }
}

// 403 - Nema pristupa
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Nemate pristup podacima ovog vozača"
  }
}
```

**Pristup**: Supervisor može vidjeti samo vozače iz svojih grupa. Manager vidi sve vozače.

### 7.8 Info o Vozilu / Vehicle Info

Dohvat detaljnih informacija o vozilu. Dostupno za Supervisora i Managera.

**GET /api/v1/vehicles/{id}**

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 22,
    "registration": "ST-5678-CD",
    "type": "Hladnjača",
    "model": "Mercedes Actros",
    "description": "18t hladnjača s dvostrukom kabinom",
    "capacity": {
      "palettes": 18,
      "weight_kg": 10000,
      "volume_m3": 45.5
    },
    "features": {
      "has_tracking": true,
      "has_livetacho": true
    },
    "current_driver": {
      "id": 789,
      "first_name": "Ivan",
      "last_name": "Horvat",
      "phone": "+385911234567"
    },
    "groups": [
      { "id": 10, "name": "Hladnjače", "type": "TRUCK" }
    ]
  }
}
```

**Polja u odgovoru**:

| Polje                    | Tip          | Opis                                         |
| ------------------------ | ------------ | -------------------------------------------- |
| `id`                     | Integer      | ID vozila iz SkyTrack baze                   |
| `registration`           | String       | Registracijska oznaka                        |
| `type`                   | String       | Tip vozila (Hladnjača, Kamion, Kombi, etc.)  |
| `model`                  | String       | Marka i model vozila                         |
| `description`            | String       | Dodatni opis vozila                          |
| `capacity.palettes`      | Integer      | Kapacitet u paletama                         |
| `capacity.weight_kg`     | Integer      | Kapacitet u kilogramima                      |
| `capacity.volume_m3`     | Float        | Kapacitet u kubnim metrima                   |
| `features.has_tracking`  | Boolean      | Ima li GPS praćenje                          |
| `features.has_livetacho` | Boolean      | Ima li LiveTacho sustav                      |
| `current_driver`         | Object\|null | Vozač koji je trenutno prijavljen (ili null) |
| `groups`                 | Array        | Grupe kojima vozilo pripada (TRUCK grupe)    |

**Error Responses**:

```json
// 404 - Vehicle ne postoji
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Vozilo s ID 22 nije pronađeno"
  }
}
```

**Pristup**: Supervisor može vidjeti samo vozila iz svojih TRUCK grupa. Manager vidi sva vozila.

### 7.9 Lista Vozila / Vehicle List

Dohvat liste vozila s filterima. Dostupno za Supervisora i Managera.

**GET /api/v1/vehicles**

**Query Parameters**:

| Param        | Tip     | Opis                                       |
| ------------ | ------- | ------------------------------------------ |
| `group_id`   | Integer | Filter po grupi                            |
| `has_driver` | Boolean | Filter: samo vozila s vozačem / bez vozača |
| `type`       | String  | Filter po tipu vozila                      |

**Response**:

```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": 22,
        "registration": "ST-5678-CD",
        "type": "Hladnjača",
        "model": "Mercedes Actros",
        "current_driver_id": 789,
        "current_driver_name": "Ivan Horvat",
        "has_tracking": true,
        "has_livetacho": true
      },
      {
        "id": 25,
        "registration": "ZG-9876-EF",
        "type": "Kombi",
        "model": "VW Crafter",
        "current_driver_id": null,
        "current_driver_name": null,
        "has_tracking": true,
        "has_livetacho": false
      }
    ],
    "total": 2
  }
}
```

### 7.10 ECODrive - Današnji Podaci / Today's Data (SkyTrack ECO API)

Dohvat ECO driving podataka za današnji dan. Koristi se postojeći **SkyTrack ECO API** (ECO Driver sustav).

**NAPOMENA**: ChaSK koristi isti API kao i SkyTrack ECO WEB aplikacija. Specifikacija je usklađena s `ECO Driver App Spec 0.4`.

**GET /api/controllers/drivers/ecodriver_today**

**Query Parameters**:

| Param       | Tip     | Opis                 |
| ----------- | ------- | -------------------- |
| `driver_id` | Integer | ID vozača (obavezno) |

**Ograničenja**:

- Ako je `driver.DriverActive = "N"`, vraća se "Access denied" greška

**Primjer zahtjeva**:

```
GET /api/controllers/drivers/ecodriver_today?driver_id=42
```

**Response (200 OK)**:

```json
{
  "api_version": "0.4",
  "status": "success",
  "data": {
    "date": "2025-09-30",
    "eco_score": {
      "current": 68,
      "stars": 4
    },
    "parameters": [
      { "name": "Traffic Perception", "value": 75 },
      { "name": "Engine Management", "value": 82 },
      { "name": "Smoothness", "value": 58 },
      { "name": "Idling", "value": 90 }
    ],
    "co2": {
      "saved": 3.5,
      "emitted": 26.82
    },
    "driving_activity": [
      { "type": "driving", "duration": "02:45:32", "distance": 142.33 },
      { "type": "coasting", "duration": "00:32:15", "distance": 18.73 },
      { "type": "braking", "duration": "00:12:08", "distance": 5.23 }
    ],
    "fuel_consumption": {
      "total": 11.4,
      "per_100km": 8.0
    },
    "monthly": {
      "eco_score": 75,
      "stars": 4,
      "co2_saved": 15.2
    }
  }
}
```

**Polja u odgovoru**:

| Polje                              | Tip     | Opis                                       |
| ---------------------------------- | ------- | ------------------------------------------ |
| `api_version`                      | String  | Verzija API-ja ("0.4")                     |
| `status`                           | String  | "success" ili greška                       |
| `data.date`                        | String  | Datum podataka (ISO 8601: YYYY-MM-DD)      |
| `data.eco_score.current`           | Integer | Današnja ECO ocjena (0-100)                |
| `data.eco_score.stars`             | Integer | Ocjena u zvjezdicama (1-5)                 |
| `data.parameters[].name`           | String  | Naziv parametra                            |
| `data.parameters[].value`          | Integer | Vrijednost parametra (0-100 %)             |
| `data.co2.saved`                   | Float   | Ušteđeni CO₂ u kg                          |
| `data.co2.emitted`                 | Float   | Emitirani CO₂ u kg                         |
| `data.driving_activity[].type`     | String  | Tip aktivnosti: driving, coasting, braking |
| `data.driving_activity[].duration` | String  | Trajanje (HH:MM:SS format)                 |
| `data.driving_activity[].distance` | Float   | Udaljenost u km (2 decimale)               |
| `data.fuel_consumption.total`      | Float   | Ukupna potrošnja goriva u litrama          |
| `data.fuel_consumption.per_100km`  | Float   | Prosječna potrošnja na 100km               |
| `data.monthly.eco_score`           | Integer | Mjesečni prosjek ECO ocjene                |
| `data.monthly.stars`               | Integer | Mjesečna ocjena u zvjezdicama              |
| `data.monthly.co2_saved`           | Float   | Ukupno ušteđeni CO₂ ovaj mjesec u kg       |

**Error Response (400 Bad Request)**:

```json
{
  "error": true,
  "message": "Missing required parameter: driver_id"
}
```

**Error Response (403 Forbidden)** - vozač neaktivan:

```json
{
  "error": true,
  "message": "Access denied!"
}
```

**Error Response (404 Not Found)**:

```json
{
  "error": true,
  "message": "No data found for driver 42 on 2025-09-30"
}
```

**Error Response (429 Too Many Requests)**:

```json
{
  "error": true,
  "message": "Rate limit exceeded. Please try again in 60 seconds."
}
```

**Pristup u ChaSK aplikaciji**:

- **Driver**: može dohvatiti samo svoje podatke (driver_id = vlastiti ID)
- **Supervisor**: može dohvatiti podatke za vozače iz svojih grupa
- **Manager**: može dohvatiti podatke za sve vozače

### 7.11 ECODrive - Povijesni Podaci / History Data (SkyTrack ECO API)

Dohvat povijesnih ECO driving podataka za određeno razdoblje s agregiranim statistikama, trendom i podacima za graf.

**GET /api/controllers/drivers/ecodriver_history**

**Query Parameters**:

| Param       | Tip     | Opis                                                               |
| ----------- | ------- | ------------------------------------------------------------------ |
| `driver_id` | Integer | ID vozača (obavezno)                                               |
| `period`    | String  | Razdoblje: `day`, `week`, `month`, `year` (obavezno)               |
| `date`      | String  | Referentni datum YYYY-MM-DD (obavezno, ne smije biti u budućnosti) |

**Ograničenja**:

- Ako je `driver.DriverActive = "N"`, vraća se "Access denied" greška
- Backend izračunava `start_date` i `end_date` prema `period` i `date`: 
  - period: "week", date: "2025-10-08" → start_date: "2025-10-06", end_date: "2025-10-12"
  - period: "month", date: "2025-10-08" → start_date: "2025-10-01", end_date: "2025-10-31"

**Primjer zahtjeva**:

```
GET /api/controllers/drivers/ecodriver_history?driver_id=42&period=week&date=2025-09-30
```

**Response (200 OK)**:

```json
{
  "api_version": "0.4",
  "status": "success",
  "data": {
    "period": "week",
    "period_label": "This Week",
    "start_date": "2025-09-24",
    "end_date": "2025-09-30",
    "summary": {
      "eco_score": 65,
      "trend": -2,
      "co2_saved": 24.5,
      "total_fuel": 79.8,
      "total_distance": 998
    },
    "chart_data": [
      { "label": "M", "date": "2025-09-24", "score": 55 },
      { "label": "T", "date": "2025-09-25", "score": 65 },
      { "label": "W", "date": "2025-09-26", "score": 48 },
      { "label": "T", "date": "2025-09-27", "score": 67 },
      { "label": "F", "date": "2025-09-28", "score": 64 },
      { "label": "S", "date": "2025-09-29", "score": null },
      { "label": "S", "date": "2025-09-30", "score": null }
    ],
    "parameters": [
      { "name": "Traffic Perception", "value": 75, "change": 5 },
      { "name": "Engine Management", "value": 82, "change": -2 },
      { "name": "Smoothness", "value": 58, "change": 8 },
      { "name": "Idling", "value": 90, "change": 3 }
    ]
  }
}
```

**Polja u odgovoru**:

| Polje                         | Tip           | Opis                                                           |
| ----------------------------- | ------------- | -------------------------------------------------------------- |
| `data.period`                 | String        | Traženo razdoblje (day/week/month/year)                        |
| `data.period_label`           | String        | Čitljiv naziv ("This Week", "Previous week", "2-52 weeks ago") |
| `data.start_date`             | String        | Početak razdoblja (ISO 8601)                                   |
| `data.end_date`               | String        | Kraj razdoblja (ISO 8601)                                      |
| `data.summary.eco_score`      | Integer       | Prosječna ECO ocjena za razdoblje (0-100)                      |
| `data.summary.trend`          | Integer       | Promjena u odnosu na prethodno razdoblje (+/-)                 |
| `data.summary.co2_saved`      | Float         | Ukupno ušteđeni CO₂ u kg                                       |
| `data.summary.total_fuel`     | Float         | Ukupna potrošnja goriva u litrama                              |
| `data.summary.total_distance` | Integer       | Ukupna prijeđena udaljenost u km                               |
| `data.chart_data[].label`     | String        | Oznaka za graf (ovisi o periodu)                               |
| `data.chart_data[].date`      | String        | Datum podatkovne točke (ISO 8601)                              |
| `data.chart_data[].score`     | Integer\|null | ECO ocjena (null ako nema podataka)                            |
| `data.parameters[].name`      | String        | Naziv parametra                                                |
| `data.parameters[].value`     | Integer       | Prosječna vrijednost za razdoblje (0-100)                      |
| `data.parameters[].change`    | Integer       | Promjena u odnosu na prethodno razdoblje (+/-)                 |

**Chart Data Points prema periodu**:

| Period  | Broj točaka | Oznake                                                          |
| ------- | ----------- | --------------------------------------------------------------- |
| `day`   | 7           | 4-satni intervali: 0h, 4h, 8h, 12h, 16h, 20h, 24h               |
| `week`  | 7           | Dani: M, T, W, T, F, S, S                                       |
| `month` | 7           | Tjedni: W1, W2, W3, W4, W5, W6, W7                              |
| `year`  | 7-12        | Mjeseci: J, F, M, A, M, J, J, A, S, O, N, D (zadnjih 7 mjeseci) |

**Null vrijednosti u chart_data**:

- Datum je u budućnosti
- Nije bilo aktivnosti vožnje taj dan
- Prikupljanje podataka je bilo prekinuto
- Frontend treba prikazati prazne stupce ili placeholder

**Error Responses**:

```json
// 400 - Nedostaje parametar
{ "error": true, "message": "Missing required parameter: driver_id" }

// 400 - Nevažeći period
{ "error": true, "message": "Invalid period value. Must be one of: day, week, month, year" }

// 400 - Nevažeći format datuma
{ "error": true, "message": "Invalid date format. Expected ISO 8601 (YYYY-MM-DD)" }

// 400 - Datum u budućnosti
{ "error": true, "message": "Invalid date value. Date can not be in the future!" }

// 403 - Pristup odbijen
{ "error": true, "message": "Access denied!" }

// 404 - Nema podataka
{ "error": true, "message": "No data found for driver 42 in the specified period" }
```

### 7.12 ECODrive - Integracija s ChaSK UI

ChaSK mobilna aplikacija prikazuje ECO podatke iz API-ja:

**ECO Score boje (Frontend smjernice)**:

| Raspon          | Boja       | Hex     | Ocjena    |
| --------------- | ---------- | ------- | --------- |
| score ≥ 60      | Zelena     | #00A859 | Izvrsno   |
| 50 ≤ score < 60 | Žuta       | #FFB300 | Dobro     |
| 40 ≤ score < 50 | Narančasta | #F97316 | Prosječno |
| score < 40      | Crvena     | #EF5350 | Loše      |

**Stars mapping**:

| ECO Score | Zvjezdice |
| --------- | --------- |
| 0-20      | 1 ★       |
| 21-40     | 2 ★★      |
| 41-60     | 3 ★★★     |
| 61-80     | 4 ★★★★    |
| 81-100    | 5 ★★★★★   |

**Driving Parameters**:

| Parametar          | Opis                                                 |
| ------------------ | ---------------------------------------------------- |
| Traffic Perception | Predviđanje prometnog toka i prilagodba brzine       |
| Engine Management  | Optimalno korištenje okretaja motora i odabir brzine |
| Smoothness         | Glatko ubrzavanje i usporavanje                      |
| Idling             | Vrijeme s upaljenim motorom dok vozilo stoji         |

**Dart helper za parsiranje trajanja**:

```dart
/// Parsira "HH:MM:SS" format u Duration
Duration parseDuration(String hms) {
  final parts = hms.split(':');
  return Duration(
    hours: int.parse(parts[0]),
    minutes: int.parse(parts[1]),
    seconds: int.parse(parts[2]),
  );
}

/// Formatira Duration kao "HH:MM:SS"
String formatDuration(Duration d) {
  final hours = d.inHours.toString().padLeft(2, '0');
  final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
  final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
  return '$hours:$minutes:$seconds';
}

/// Određuje boju prema ECO score
Color getEcoScoreColor(int score) {
  if (score >= 60) return Color(0xFF00A859); // Zelena
  if (score >= 50) return Color(0xFFFFB300); // Žuta
  if (score >= 40) return Color(0xFFF97316); // Narančasta
  return Color(0xFFEF5350); // Crvena
}

/// Određuje broj zvjezdica prema ECO score
int getStars(int score) {
  if (score >= 81) return 5;
  if (score >= 61) return 4;
  if (score >= 41) return 3;
  if (score >= 21) return 2;
  return 1;
}
```

### 7.14 Tahograf - Podaci Vozača / Tachograph Driver Data (Telematika API)

Dohvat trenutnih tahograf podataka za vozača. Koristi se postojeći **Telematika WEB API** (TahoPro sustav) koji prikazuje stanje prema EU regulativi (EC) No 561/2006.

**NAPOMENA**: ChaSK koristi isti API kao i TahoPro WEB aplikacija. Specifikacija je usklađena s `telematika API spec v05`.

**GET /api/driver/telematika**

**Query Parameters**:

| Param       | Tip    | Opis                                    |
| ----------- | ------ | --------------------------------------- |
| `driver_id` | String | ID vozača, alfanumerički kod (obavezno) |

**Primjer zahtjeva**:

```
GET /api/driver/telematika?driver_id=DRV123
```

**Response (200 OK)**:

```json
{
  "status": "success",
  "api_version": "0.5",
  "max_driving_today": "10:00",
  "driving_today": "03:34",
  "10h_drives_this_week": 0,
  "max_driving_this_week": "56:00",
  "driving_this_week": "27:47",
  "biweekly_driving": "59:58",
  "continous_driving": "03:34",
  "shift_rest": "00:45",
  "rested_in_shift": "00:00",
  "min_daily_rest": "09:00",
  "daily_rest": "00:00",
  "short_rests_this_week": 1,
  "shift_start": "2025-06-18T05:58",
  "latest_shift_end": "2025-06-18T20:58",
  "from_last_weekly_rest": "51:06",
  "last_weekly_rest": "38:20",
  "work_week_start": "2025-05-12T07:37",
  "work_week_latest_end": "2025-05-18T07:37",
  "short_weekly_rest_recoup": "06:40",
  "recoup_deadline": "2025-06-01T07:37",
  "work_days_number": 3
}
```

**Polja u odgovoru**:

| Polje                      | Format     | Opis                                                                   |
| -------------------------- | ---------- | ---------------------------------------------------------------------- |
| `status`                   | String     | "success" ili "error"                                                  |
| `api_version`              | String     | Verzija API-ja (trenutno "0.5")                                        |
| `max_driving_today`        | H:mm       | Max dnevna vožnja (9h ili 10h ovisno o iskorištenim 10h vožnjama)      |
| `driving_today`            | H:mm       | Ukupno odvoženo danas                                                  |
| `10h_drives_this_week`     | Integer    | Broj iskorištenih 10h vožnji ovaj tjedan (0-2, max 2)                  |
| `max_driving_this_week`    | H:mm       | Max tjedna vožnja (do 56h, može biti manje ovisno o prethodnom tjednu) |
| `driving_this_week`        | H:mm       | Ukupno odvoženo ovaj tjedan                                            |
| `biweekly_driving`         | H:mm       | Ukupno vožnje u dva tjedna (max 90:00)                                 |
| `continous_driving`        | H:mm       | Kontinuirana vožnja (max 4:30, zatim obavezna pauza)                   |
| `shift_rest`               | H:mm       | Potrebna pauza u smjeni (30min ili 45min*)                             |
| `rested_in_shift`          | H:mm       | Trajanje trenutnog odmora nakon 4.5h vožnje                            |
| `min_daily_rest`           | H:mm       | Minimalni dnevni odmor (9h ili 11h\*\*)                                |
| `daily_rest`               | H:mm       | Trajanje trenutnog dnevnog odmora                                      |
| `short_rests_this_week`    | Integer    | Broj iskorištenih skraćenih odmora ovaj tjedan (0-3, max 3)            |
| `shift_start`              | Y-m-dTH:mm | Početak smjene                                                         |
| `latest_shift_end`         | Y-m-dTH:mm | Najkasniji kraj smjene (= deadline za početak dnevnog odmora)          |
| `from_last_weekly_rest`    | H:mm       | Vrijeme proteklo od zadnjeg tjednog odmora                             |
| `last_weekly_rest`         | H:mm       | Trajanje zadnjeg tjednog odmora                                        |
| `work_week_start`          | Y-m-dTH:mm | Početak radnog tjedna                                                  |
| `work_week_latest_end`     | Y-m-dTH:mm | Najkasniji kraj radnog tjedna                                          |
| `short_weekly_rest_recoup` | H:mm       | Trajanje nadoknade zadnjeg skraćenog tjednog odmora                    |
| `recoup_deadline`          | Y-m-dTH:mm | Krajnji rok nadoknade skraćenog tjednog odmora                         |
| `work_days_number`         | Integer    | Broj radnih dana od početka radnog tjedna                              |

**Napomene**:

- (*) `shift_rest` je 45 minuta ako je vozač imao više od 6 sati rada u smjeni, inače 30 minuta
- (\*\*) `min_daily_rest` je 11h standardno, ili 9h ako koristi skraćeni odmor (max 3x između dva tjedna odmora)
- "Od početka radnog tjedna" = "Od kraja zadnjeg tjednog odmora"
- `latest_shift_end` = vrijeme kada najkasnije mora započeti dnevni odmor

**Format vremena**:

- **H:mm** - trajanje u satima i minutama (npr. "10:00", "03:34")
- **Y-m-dTH:mm** - datum i vrijeme u lokalnom vremenu bez sekundi (npr. "2025-06-18T05:58")

**EU Regulativa (EC) No 561/2006 - Limiti**:

| Pravilo             | Limit                  | API polje               |
| ------------------- | ---------------------- | ----------------------- |
| Dnevna vožnja       | 9h (max 10h 2x/tjedan) | `max_driving_today`     |
| Tjedna vožnja       | 56h                    | `max_driving_this_week` |
| Dvotjedna vožnja    | 90h                    | `biweekly_driving`      |
| Kontinuirana vožnja | 4:30 → pauza           | `continous_driving`     |
| Pauza u smjeni      | 45min (ili 30min)      | `shift_rest`            |
| Dnevni odmor        | 11h (ili 9h skraćeno)  | `min_daily_rest`        |
| Skraćeni odmori     | max 3x/tjedan          | `short_rests_this_week` |
| Tjedni odmor        | 45h (ili 24h skraćeno) | `last_weekly_rest`      |

**Error Response (401 Unauthorized)**:

```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**Error Response (404 Not Found - vozač nije pronađen)**:

```json
{
  "status": "error",
  "message": "Driver not found"
}
```

**Error Response (404 Not Found - nema podataka)**:

```json
{
  "status": "error",
  "code": "NO_DATA",
  "message": "No data available for the requested driver",
  "details": {
    "driver_id": "DRV123"
  }
}
```

**Error Response (500 Internal Server Error)**:

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

**Pristup u ChaSK aplikaciji**:

- **Driver**: može dohvatiti samo svoje podatke (driver_id = vlastiti ID)
- **Supervisor**: može dohvatiti podatke za vozače iz svojih grupa
- **Manager**: može dohvatiti podatke za sve vozače

### 7.15 Tahograf - Integracija s ChaSK UI

ChaSK mobilna aplikacija prikazuje tahograf podatke iz API-ja u korisničkom sučelju:

**Prikaz za vozača (Driver Dashboard)**:

```
┌─────────────────────────────────────────┐
│  🚗 Kartica tahografa                   │
│  ─────────────────────────────────────  │
│  Slisković Zlatko                       │
│                                         │
│  🚗  03:34 | 06:26      ████████░░ 10h  │
│      Dnevna vožnja      preostalo 6h26m │
│                                         │
│  🛏️  00:00 | 09:00      ░░░░░░░░░░      │
│      Dnevni odmor       potrebno 9h     │
│                                         │
│  📊 27:47 | 28:13       ████████░░ 56h  │
│      Tjedna vožnja      preostalo 28h13m│
│                                         │
│  📈 59:58 | 30:02       ███████░░░ 90h  │
│      Dvotjedna          preostalo 30h02m│
│                                         │
│  ⏱️  03:34 | 00:56      ████████░░ 4:30 │
│      Kontinuirana       do pauze 56min  │
│                                         │
│  Početak smjene: 05:58                  │
│  Najkasniji kraj: 20:58                 │
└─────────────────────────────────────────┘
```

**Mapiranje API polja na UI**:

| UI Element                | API Polje           | Izračun                                       |
| ------------------------- | ------------------- | --------------------------------------------- |
| Dnevna vožnja - odvoženo  | `driving_today`     | direktno                                      |
| Dnevna vožnja - preostalo | \-                  | `max_driving_today` - `driving_today`         |
| Dnevni odmor - trajanje   | `daily_rest`        | direktno                                      |
| Dnevni odmor - potrebno   | `min_daily_rest`    | direktno                                      |
| Tjedna vožnja - odvoženo  | `driving_this_week` | direktno                                      |
| Tjedna vožnja - preostalo | \-                  | `max_driving_this_week` - `driving_this_week` |
| Dvotjedna - odvoženo      | `biweekly_driving`  | direktno                                      |
| Dvotjedna - preostalo     | \-                  | 90:00 - `biweekly_driving`                    |
| Kontinuirana - odvoženo   | `continous_driving` | direktno                                      |
| Kontinuirana - do pauze   | \-                  | 04:30 - `continous_driving`                   |
| Početak smjene            | `shift_start`       | format HH:mm                                  |
| Najkasniji kraj           | `latest_shift_end`  | format HH:mm                                  |

**Dart helper za parsiranje vremena**:

```dart
/// Parsira "H:mm" format u Duration
Duration parseHourMinute(String hm) {
  final parts = hm.split(':');
  return Duration(
    hours: int.parse(parts[0]),
    minutes: int.parse(parts[1]),
  );
}

/// Parsira "Y-m-dTH:mm" format u DateTime
DateTime parseLocalDateTime(String dt) {
  // Format: "2025-06-18T05:58"
  return DateTime.parse('$dt:00'); // Dodaj sekunde za valid ISO format
}

/// Formatira Duration kao "H:mm"
String formatDuration(Duration d) {
  final hours = d.inHours;
  final minutes = d.inMinutes.remainder(60);
  return '$hours:${minutes.toString().padLeft(2, '0')}';
}

/// Izračunaj preostalo vrijeme
Duration calculateRemaining(String max, String current) {
  final maxDuration = parseHourMinute(max);
  final currentDuration = parseHourMinute(current);
  return maxDuration - currentDuration;
}
```

### 7.16 Push Notifikacije / Push Notifications (Vlastiti Sustav)

ChaSK koristi **vlastiti push notification sustav** s FCM/APNs kao transport layer.

> **ARHITEKTURA:**
>
> ```
> ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
> │   ChaSK     │     │   ChaSK     │     │  FCM/APNs   │     │  Mobile  │
> │   Server    │────►│   Push      │────►│ (transport) │────►│  Device  │
> │  (Swoole)   │     │   Gateway   │     │             │     │          │
> └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘
> ```
>
> **Što je vlastito (ChaSK kontrolira):**
>
> - Device token management
> - Logika slanja (kada, kome, što)
> - Payload format i sadržaj
> - Notification settings per user
> - Quiet hours, channels
>
> **Transport layer (platformski servisi):**
>
> - **Android**: Firebase Cloud Messaging (FCM)
> - **iOS**: Apple Push Notification Service (APNs)
> - **Huawei**: HMS Push Kit (za uređaje bez Google Play Services)
>
> **Zašto FCM/APNs?**
>
> - Jedini način za buđenje aplikacije iz sleep moda (OS ograničenje)
> - Minimalna potrošnja baterije
> - 99.9% pouzdanost isporuke
> - Besplatno
>
> Detaljna dokumentacija: `push_notification.md`

#### 7.16.1 Registracija Uređaja / Device Registration

**POST /api/v1/notifications/register**

**Request**:

```json
{
  "device_token": "fcm_or_apns_token_from_sdk",
  "platform": "android|ios|huawei",
  "push_service": "fcm|apns|hms",
  "app_version": "0.88.0",
  "device_info": {
    "model": "Samsung Galaxy S24",
    "os_version": "Android 14"
  }
}
```

| Polje          | Tip    | Opis                                  |
| -------------- | ------ | ------------------------------------- |
| `device_token` | String | Token dobiven od FCM/APNs/HMS SDK     |
| `platform`     | String | `android`, `ios`, ili `huawei`        |
| `push_service` | String | `fcm`, `apns`, ili `hms`              |
| `app_version`  | String | Verzija ChaSK aplikacije              |
| `device_info`  | Object | Opciono - info o uređaju za debugging |

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "registration_id": "reg_12345",
    "registered_at": "2025-12-01T11:00:00.000Z"
  }
}
```

#### 7.16.2 Deregistracija Uređaja / Device Unregistration

**DELETE /api/v1/notifications/register**

**Request**:

```json
{
  "device_token": "unique_device_token_from_os"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Device unregistered successfully"
}
```

#### 7.16.3 Format Push Notifikacije (Server → Device)

Server šalje push notifikacije za:

- Nova poruka u chatu
- Novi zadatak
- Promjena statusa zadatka
- Hitne poruke (urgent/warning)

**Payload struktura**:

```json
{
  "notification": {
    "title": "Nova poruka",
    "body": "Marko: Jeste li stigli?",
    "sound": "default"
  },
  "data": {
    "type": "message|task|status_change",
    "action": "new|update|completed|rejected",
    "entity_id": "5001",
    "conversation_id": "123",
    "is_urgent": false,
    "is_warning": false,
    "click_action": "OPEN_CHAT"
  }
}
```

**Tipovi notifikacija**:

| type          | action    | Opis             | click_action |
| ------------- | --------- | ---------------- | ------------ |
| message       | new       | Nova poruka      | OPEN_CHAT    |
| message       | urgent    | Hitna poruka     | OPEN_CHAT    |
| task          | new       | Novi zadatak     | OPEN_TASK    |
| task          | update    | Ažuriran zadatak | OPEN_TASK    |
| status_change | completed | Zadatak završen  | OPEN_TASK    |
| status_change | rejected  | Zadatak odbijen  | OPEN_TASK    |

#### 7.16.4 Postavke Notifikacija / Notification Settings

**GET /api/v1/notifications/settings**

**Response**:

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "sound_enabled": true,
    "vibration_enabled": true,
    "quiet_hours": {
      "enabled": false,
      "start": "22:00",
      "end": "07:00"
    },
    "channels": {
      "messages": true,
      "tasks": true,
      "urgent": true
    }
  }
}
```

**PUT /api/v1/notifications/settings**

**Request**:

```json
{
  "sound_enabled": true,
  "vibration_enabled": true,
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  },
  "channels": {
    "messages": true,
    "tasks": true,
    "urgent": true
  }
}
```

> **NAPOMENA**: Zvučne notifikacije unutar aplikacije (kada je app aktivan) koriste WebSocket i lokalne audio datoteke. Push notifikacije se koriste kada je aplikacija u pozadini ili zatvorena.

---

## 8. Konverzija Datuma i Vremena / DateTime Conversion

### 8.1 Format na Serveru (MariaDB)

- **Format**: `DATETIME` ili `TIMESTAMP`
- **Primjer**: `2025-12-01 10:30:00`
- **Timezone**: UTC

### 8.2 Format u API-ju

- **Format**: ISO 8601
- **Primjer**: `2025-12-01T10:30:00.000Z`
- **Timezone**: UTC (označeno sa 'Z')

### 8.3 Format u Lokalnoj Bazi (SQLite)

- **Format**: INTEGER (milliseconds since epoch)
- **Primjer**: `1733049000000`

### 8.4 Konverzija u Mobile Aplikaciji (Dart)

```dart
// API (ISO 8601) → SQLite (INTEGER)
int apiToLocal(String isoString) {
  return DateTime.parse(isoString).millisecondsSinceEpoch;
}

// SQLite (INTEGER) → API (ISO 8601)
String localToApi(int milliseconds) {
  return DateTime.fromMillisecondsSinceEpoch(milliseconds, isUtc: true)
      .toIso8601String();
}

// Primjer korištenja
// Primanje od servera
final serverCreated = "2025-12-01T10:30:00.000Z";
final localCreated = apiToLocal(serverCreated); // 1733049000000

// Slanje na server
final localTimestamp = DateTime.now().millisecondsSinceEpoch;
final apiTimestamp = localToApi(localTimestamp); // "2025-12-01T10:30:00.000Z"
```

### 8.5 VAŽNE NAPOMENE

1. **Uvijek koristi UTC** za komunikaciju s API-jem
2. **Lokalni prikaz**: Konvertiraj u lokalnu timezone samo za UI
3. **Sinkronizacija**: Server je izvor istine za vremenske oznake
4. **Offline kreiranje**: Koristi `DateTime.now().toUtc()` za konzistentnost

### 8.6 Timestamp Lifecycle - Poruke

Svaka poruka ima 4 ključna timestampa koji označavaju njezin životni ciklus:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     MESSAGE TIMESTAMP LIFECYCLE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   TIMESTAMP        │ TKO POSTAVLJA      │ KADA                                 │
│   ─────────────────┼────────────────────┼──────────────────────────────────────│
│   created          │ Sender (lokalno)   │ Kada korisnik klikne "Pošalji"       │
│   saved            │ Server             │ Kada server INSERT-a u MariaDB       │
│   received         │ Receiver (lokalno) │ Kada primateljev uređaj primi poruku │
│   read             │ Receiver (lokalno) │ Kada primatelj otvori chat/task      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Pravila po Tipu Klijenta i Poruke**:

| Klijent/Tip         | created         | saved            | received              | read                          |
| ------------------- | --------------- | ---------------- | --------------------- | ----------------------------- |
| **Mobile sender**   | Lokalno vrijeme | Od servera (ack) | N/A                   | Od servera (read_ack)         |
| **Mobile receiver** | Od servera      | Od servera       | Lokalno vrijeme       | Lokalno vrijeme               |
| **WEB sender**      | Lokalno vrijeme | = received       | = saved               | Od servera                    |
| **WEB receiver**    | Od servera      | Od servera       | = saved               | Lokalno vrijeme               |
| **Group message**   | Lokalno vrijeme | Od servera       | Lokalno po primatelju | U `message_reads` tablici     |
| **Task message**    | Lokalno vrijeme | Od servera       | Lokalno               | Kada druga strana otvori task |

**Task Message Read Pravila**:

Za poruke vezane uz task (`task_id > 0`), `read` se postavlja prema posebnoj logici:

| Kreator Poruke | Tko Postavlja Read | Kada                               |
| -------------- | ------------------ | ---------------------------------- |
| Driver         | Supervisor         | Kada supervisor otvori task detail |
| Supervisor     | Driver             | Kada driver otvori task detail     |

```dart
// Primjer: Driver otvara task - postavlja read za supervisor poruke
await db.rawUpdate('''
  UPDATE messages SET read = ?
  WHERE task_id = ? AND creator_id != ? AND read IS NULL
''', [DateTime.now().millisecondsSinceEpoch, taskId, currentUserId]);
```

### 8.7 Timestamp Lifecycle - Zadaci (Tasks)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      TASK TIMESTAMP LIFECYCLE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   TIMESTAMP        │ TKO POSTAVLJA      │ KADA                                 │
│   ─────────────────┼────────────────────┼──────────────────────────────────────│
│   created          │ Supervisor         │ Kada kreira task                     │
│   saved            │ Server             │ Kada server INSERT-a u MariaDB       │
│   received         │ Driver (lokalno)   │ Kada driver-ov uređaj primi task     │
│   read             │ Driver (lokalno)   │ Kada driver otvori task detail       │
│   start            │ Driver (lokalno)   │ Kada driver klikne "Započni"         │
│   completed        │ Driver (lokalno)   │ Kada driver završi task              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**WEB vs Mobile - Posebna Pravila**:

| Scenarij                 | saved            | received          |
| ------------------------ | ---------------- | ----------------- |
| Mobile (offline capable) | Server timestamp | Lokalni timestamp |
| WEB (no local cache)     | Server timestamp | = saved (jednaki) |

### 8.8 Timestamp Lifecycle - Attachments

Attachmenti prate istu logiku kao poruke/taskovi kojima pripadaju:

| Tip                   | created                    | saved                     | received             |
| --------------------- | -------------------------- | ------------------------- | -------------------- |
| **Sender upload**     | Kada korisnik odabere file | Kada server završi upload | N/A                  |
| **Receiver download** | Od servera (metadata)      | Od servera                | Kada metadata stigne |

**NAPOMENA**: `received` za attachment označava kada je metapodatak primljen, NE kada je datoteka preuzeta. Za praćenje download-a koristi `is_downloaded` flag.

---

## 9. ID Management - Detaljna Specifikacija

### 9.1 Lokalni ID vs Server ID

| Polje       | Opis                  | Generator               |
| ----------- | --------------------- | ----------------------- |
| `id`        | Lokalni ID u SQLite   | AUTOINCREMENT (mobile)  |
| `server_id` | Globalni ID u MariaDB | AUTO_INCREMENT (server) |

### 9.2 Workflow: Kreiranje Poruke (Mobile)

```
1. Korisnik kreira poruku
   ↓
2. Mobile app:
   - INSERT u SQLite (id = AUTOINCREMENT)
   - sync_status = 'PENDING'
   - server_id = NULL
   ↓
3. Mobile → Server (WebSocket):
   - Šalje poruku s client_id = lokalni id
   ↓
4. Server:
   - INSERT u MariaDB (dobiva server_id)
   - Vraća acknowledgment
   ↓
5. Mobile prima acknowledgment:
   - UPDATE SQLite SET server_id = <server_id>
   - sync_status = 'SYNCED'
```

### 9.3 Workflow: Primanje Poruke (Mobile)

```
1. Server šalje novu poruku
   - Sadrži server_id
   ↓
2. Mobile app:
   - INSERT u SQLite (id = AUTOINCREMENT)
   - server_id = <server_id iz poruke>
   - sync_status = 'SYNCED'
   - received = DateTime.now().millisecondsSinceEpoch
```

### 9.4 Conflict Resolution

Ako postoji konflikt (ista poruka primljena više puta):

- Koristi `server_id` kao unique identifier
- Prije INSERT-a provjeri: `SELECT * FROM messages WHERE server_id = ?`
- Ako postoji, ignoriraj ili ažuriraj

---

## 10. Error Handling

### 10.1 WebSocket Errors

```json
{
  "type": "error",
  "request_id": "req-uuid-123",
  "timestamp": "2025-12-01T10:30:00.000Z",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "receiver_id is required",
    "field": "receiver_id"
  }
}
```

### 10.2 Error Codes

**Autentifikacija**:

| Code                  | Opis                              | Akcija korisnika              |
| --------------------- | --------------------------------- | ----------------------------- |
| INVALID_PIN           | PIN je neispravan                 | Pokušaj ponovno (max 5x)      |
| QR_EXPIRED            | QR kod je istekao                 | Zatraži novi QR od admina     |
| QR_INVALID            | QR kod je neispravan ili korišten | Zatraži novi QR od admina     |
| QR_MAX_ATTEMPTS       | Previše neuspjelih pokušaja       | Zatraži novi QR od admina     |
| DEVICE_NOT_REGISTERED | Uređaj nije registriran           | Skeniraj QR kod za aktivaciju |
| DEVICE_REVOKED        | Pristup s uređaja je onemogućen   | Kontaktiraj admina            |
| USER_NOT_FOUND        | Korisnik ne postoji               | Kontaktiraj admina            |
| USER_INACTIVE         | Korisnički račun je neaktivan     | Kontaktiraj admina            |

**Opće greške**:

| Code                  | Opis                                                      |
| --------------------- | --------------------------------------------------------- |
| VALIDATION_ERROR      | Validacijska greška (pogledaj `field` i `message`)        |
| NOT_FOUND             | Resurs nije pronađen                                      |
| PERMISSION_DENIED     | Nema dozvole za ovu akciju                                |
| SERVER_ERROR          | Interna greška servera                                    |
| SYNC_CONFLICT         | Konflikt pri sinkronizaciji                               |
| FILE_TOO_LARGE        | Datoteka prevelika (max 10MB za slike, 25MB za dokumente) |
| UNSUPPORTED_FILE_TYPE | Nepodržani tip datoteke                                   |
| RATE_LIMITED          | Previše zahtjeva, pokušaj kasnije                         |
| CONNECTION_ERROR      | Greška pri spajanju na server                             |

### 10.3 Retry Strategy (Mobile)

```dart
// Exponential backoff za retry
int retryDelay(int attempt) {
  return min(1000 * pow(2, attempt).toInt(), 30000); // Max 30s
}

// sync_status management
// 'PENDING' - čeka sinkronizaciju
// 'SYNCED' - uspješno sinhronizirano
// 'ERROR' - greška, error_message sadrži detalje
```

---

## 11. Sigurnost / Security

### 11.1 Transport

- Sav promet koristi TLS 1.3
- WebSocket: `wss://` (encrypted)
- REST API: `https://` (encrypted)
- Certificate pinning (opciono, preporučeno za produkciju)

### 11.2 Autentifikacija - Sigurnosni Model

**Mobile aplikacija (QR + PIN + UUID)**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIGURNOSNI SLOJEVI                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. QR KOD (enkriptiran AES-256-GCM)                           │
│     └─ Sadrži: server_url, user_id, role, pin_hash             │
│     └─ Istječe nakon 7 dana                                    │
│     └─ Jednokratan (nakon korištenja se invalidira)            │
│                                                                 │
│  2. PIN (4-6 znamenki)                                         │
│     └─ Šalje se odvojenim kanalom (SMS)                        │
│     └─ Max 5 pokušaja, zatim QR invalidiran                    │
│     └─ Koristi se samo pri aktivaciji                          │
│                                                                 │
│  3. DEVICE UUID                                                 │
│     └─ Android ID / iOS Identifier for Vendor                  │
│     └─ Sprema se u Secure Storage (enkriptirano)               │
│     └─ Jedinstven po uređaju                                   │
│                                                                 │
│  4. USER_ID + DEVICE_UUID par                                  │
│     └─ Registrira se pri aktivaciji                            │
│     └─ Koristi se za sve sljedeće autentifikacije              │
│     └─ Server može revokirati bilo kada                        │
│                                                                 │
│  5. TLS 1.3 TRANSPORT                                          │
│     └─ End-to-end enkripcija                                   │
│     └─ Perfect Forward Secrecy                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Zašto je ovo sigurno:**

| Aspekt            | Zaštita                           |
| ----------------- | --------------------------------- |
| Krađa QR koda     | Napadač nema PIN (drugi kanal)    |
| Krađa PIN-a       | Napadač nema QR kod               |
| Krađa uređaja     | Admin može revokirati UUID        |
| Man-in-the-middle | TLS 1.3 enkripcija                |
| Replay attack     | UUID je vezan za fizički uređaj   |
| Brute force PIN   | Max 5 pokušaja, zatim QR nevažeći |

**WEB aplikacija**:

- Klasična email/password autentifikacija
- Session tokeni s istekom (8 sati default)
- CSRF zaštita

### 11.3 Rate Limiting

| Endpoint             | Limit        | Napomena       |
| -------------------- | ------------ | -------------- |
| POST /auth/activate  | 5 req/min    | Per IP address |
| POST /auth/connect   | 30 req/min   | Per user_id    |
| WebSocket messages   | 100 msg/min  | Per connection |
| File upload          | 10 files/min | Per user_id    |
| REST API (general)   | 60 req/min   | Per user_id    |
| POST /auth/web/login | 5 req/min    | Per IP address |

### 11.4 Validacija

- Svi inputi se validiraju na serveru
- SQL injection zaštita (prepared statements)
- XSS zaštita (escaping)
- File type validation (magic bytes, ne samo extension)
- Content-Type validation za uploadane datoteke
- Max file size ograničenja

### 11.5 Revokacija i Upravljanje Uređajima

**Administrator može**:

- Vidjeti sve registrirane uređaje za korisnika
- Revokirati pojedinačni uređaj
- Revokirati sve uređaje korisnika
- Generirati novi QR kod (stari automatski nevažeći)

**Automatska revokacija**:

- Ako korisnik dobije novi QR, stari uređaji ostaju aktivni
- Eksplicitna revokacija potrebna za deaktivaciju

### 11.6 Lokalno Spremanje Podataka (Mobile)

```dart
// Sigurno spremanje u Flutter
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage(
  aOptions: AndroidOptions(
    encryptedSharedPreferences: true,  // Android EncryptedSharedPreferences
  ),
  iOptions: IOSOptions(
    accessibility: KeychainAccessibility.first_unlock,  // iOS Keychain
  ),
);

// Spremanje device_uuid
await storage.write(key: 'device_uuid', value: deviceUuid);
await storage.write(key: 'user_id', value: userId.toString());
await storage.write(key: 'server_url', value: serverUrl);

// Čitanje pri pokretanju
final savedUuid = await storage.read(key: 'device_uuid');
final savedUserId = await storage.read(key: 'user_id');
```

### 11.7 Preporuke za Produkciju

1. **Certificate Pinning**: Dodaj SHA-256 hash serverskog certifikata
2. **Root Detection**: Odbij rad na rootanim/jailbroken uređajima (opciono)
3. **App Integrity**: Google Play Integrity API / Apple App Attest
4. **Audit Log**: Logiraj sve autentifikacijske pokušaje
5. **Alerting**: Obavijesti admina o sumnjivim aktivnostima

---

## 12. Verzioniranje API-ja

### 12.1 URL Verzioniranje

- REST: `/api/v1/...`
- WebSocket: Query param `?api_version=1`

### 12.2 Backward Compatibility

- Nove verzije dodaju polja, ne brišu
- Deprecated polja označena u dokumentaciji
- Minimum 6 mjeseci podrška za stare verzije

---

## 13. Data Retention / Politika Zadržavanja Podataka

### 13.1 Pregled / Overview

ChaSK implementira automatsko čišćenje starih podataka na dva nivoa:

1. **Mobilna aplikacija** - lokalno brisanje starih podataka
2. **Server** - cron job za čišćenje baze podataka

**Default politika**: 3 mjeseca (90 dana)

### 13.2 Mobilna Aplikacija - Lokalno Čišćenje

Mobilna aplikacija automatski briše lokalne podatke starije od konfigurirane vrijednosti (1-3 mjeseca).

**Podaci koji se brišu:**

- Poruke starije od retention perioda
- Zadaci stariji od retention perioda (samo COMPLETED/REJECTED)
- Datoteke (slike, potpisi) vezani za obrisane poruke/zadatke
- Cache podaci

**Podaci koji se NE brišu:**

- Korisnički podaci (profil, postavke)
- Aktivni zadaci (bilo koji status osim COMPLETED/REJECTED)
- Nedavna povijest (unutar retention perioda)

**Konfiguracija** (lokalna, ne sinkronizira se):

```dart
// lib/util/notification_settings.dart
class DataRetentionSettings {
  static const int DEFAULT_RETENTION_DAYS = 90;  // 3 mjeseca
  static const int MIN_RETENTION_DAYS = 30;      // 1 mjesec
  static const int MAX_RETENTION_DAYS = 90;      // 3 mjeseca
}
```

**Automatsko čišćenje** pokreće se pri:

- Pokretanju aplikacije
- Nakon uspješne sinkronizacije
- Jednom dnevno (ako je app aktivan)

### 13.3 Server - Cron Job Čišćenje

Server koristi cron script za periodičko čišćenje starih podataka.

**Raspored**: Dnevno u 03:00 UTC

**SQL Primjer** (MariaDB):

```sql
-- Brisanje poruka starijih od 90 dana
DELETE FROM messages
WHERE created < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Brisanje završenih zadataka starijih od 90 dana
DELETE FROM tasks
WHERE status IN ('COMPLETED', 'REJECTED')
AND completed < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Brisanje attachmenta bez parent poruke/zadatka
DELETE FROM attachments
WHERE message_id NOT IN (SELECT id FROM messages)
AND task_id NOT IN (SELECT id FROM tasks);

-- Čišćenje file storage
-- Cron script također briše fizičke datoteke s diska
```

**Logiranje**: Svi cleanup operacije se logiraju u `cleanup_log` tablicu.

### 13.4 Konfiguracija Retention Perioda

**Server konfiguracija** (config file):

```json
{
  "data_retention": {
    "messages_days": 90,
    "completed_tasks_days": 90,
    "files_days": 90,
    "cleanup_schedule": "0 3 * * *"
  }
}
```

**API za admin** (opciono):

**GET /api/v1/admin/retention**

```json
{
  "success": true,
  "data": {
    "messages_days": 90,
    "tasks_days": 90,
    "files_days": 90,
    "last_cleanup": "2025-12-01T03:00:00.000Z",
    "next_cleanup": "2025-12-02T03:00:00.000Z"
  }
}
```

### 13.5 Sinkronizacija i Retention

Kada mobilna aplikacija zatraži sinkronizaciju, server vraća samo podatke unutar retention perioda:

```
GET /api/v1/sync?last_sync=2025-09-01T00:00:00.000Z
```

Ako je `last_sync` stariji od retention perioda, server vraća:

```json
{
  "success": true,
  "data": {
    "full_resync_required": true,
    "reason": "Last sync older than retention period",
    "retention_start": "2025-09-01T00:00:00.000Z"
  }
}
```

U tom slučaju, aplikacija mora izvršiti punu resinkronizaciju i obrisati lokalne podatke starije od `retention_start`.

### 13.6 Best Practices

1. **Ne čuvaj osjetljive podatke** dulje nego potrebno
2. **Korisnik može zatražiti** raniji export podataka
3. **Compliance**: Prilagodi retention period GDPR zahtjevima
4. **Backup**: Server backup se čuva 7 dana nakon cleanup-a
5. **Audit trail**: Čuvaj log cleanup operacija 1 godinu

---

## Appendix A: Status Codes (REST API)

| Code | Značenje          |
| ---- | ----------------- |
| 200  | OK                |
| 201  | Created           |
| 400  | Bad Request       |
| 401  | Unauthorized      |
| 403  | Forbidden         |
| 404  | Not Found         |
| 409  | Conflict          |
| 422  | Validation Error  |
| 429  | Too Many Requests |
| 500  | Server Error      |

---

## Appendix B: Attachment Types

| Type        | Opis                    | Max Size |
| ----------- | ----------------------- | -------- |
| PHOTO       | Fotografija (JPEG, PNG) | 10 MB    |
| SIGNATURE   | Potpis (PNG)            | 1 MB     |
| COORDINATES | GPS koordinate          | \-       |
| BARCODE     | Skenirana vrijednost    | \-       |
| FILE        | Dokument (PDF, etc.)    | 25 MB    |
| ADDRESS     | Tekstualna adresa       | \-       |

---

## Appendix C: Database Schema Mapping

### Messages

| API Field | MariaDB                 | SQLite                 |
| --------- | ----------------------- | ---------------------- |
| server_id | id (PK, AUTO_INCREMENT) | server_id              |
| \-        | \-                      | id (PK, AUTOINCREMENT) |
| created   | created_at (DATETIME)   | created (INTEGER ms)   |
| saved     | saved_at (DATETIME)     | saved (INTEGER ms)     |
| received  | \-                      | received (INTEGER ms)  |
| read      | read_at (DATETIME)      | read (INTEGER ms)      |

### Tasks

| API Field      | MariaDB                   | SQLite                      |
| -------------- | ------------------------- | --------------------------- |
| server_id      | id (PK, AUTO_INCREMENT)   | server_id                   |
| \-             | \-                        | id (PK, AUTOINCREMENT)      |
| created        | created_at (DATETIME)     | created (INTEGER ms)        |
| deadline_start | deadline_start (DATETIME) | deadline_start (INTEGER ms) |
| deadline_end   | deadline_end (DATETIME)   | deadline_end (INTEGER ms)   |
| start          | started_at (DATETIME)     | start (INTEGER ms)          |
| completed      | completed_at (DATETIME)   | completed (INTEGER ms)      |

---

**Document Version**: 1.2
**Last Updated**: 2025-12-02
**Author**: ChaSK Development Team
**Status**: DRAFT - Pending Review

---

## Changelog

### v1.3 (2025-12-16)

- Vlado, Franjo, Davor smalltalk

### v1.2 (2025-12-02)

- Dodano praćenje online statusa korisnika (Section 3.4) 
  - Inicijalna lista online korisnika pri spajanju
  - Real-time notifikacije za online/offline status
  - Filtriranje po grupama (driver vidi supervisore, supervisor vidi drivere i supervisore)
- Dodana prijava/odjava vozača na vozilo (vehicle_login/logout)
- Dodana notifikacija za promjenu vozila
- Dodani REST API endpointi za info o vozaču (Section 7.7) 
  - GET /api/v1/drivers/{id} - detalji vozača
  - Podaci: ime, prezime, telefon, tahograf kartica, kategorije vozačke dozvole
- Dodani REST API endpointi za info o vozilu (Section 7.8, 7.9) 
  - GET /api/v1/vehicles/{id} - detalji vozila
  - GET /api/v1/vehicles - lista vozila s filterima
  - Podaci: registracija, tip, model, opis, kapacitet (palete, kg, m3), tracking, livetacho
- Dodan novi task status RECEIVED (Section 5.4) 
  - Automatski se aktivira kada driver mobitel primi task (received timestamp)
  - Status flow dijagram: OPEN → RECEIVED → IN PROGRESS → COMPLETED
  - WebSocket poruke za automatsku promjenu statusa
- Integriran SkyTrack ECO API (Section 7.10-7.12) 
  - GET /api/controllers/drivers/ecodriver_today - postojeći ECO Driver API (spec v0.4)
  - GET /api/controllers/drivers/ecodriver_history - povijesni podaci s trendom
  - Podaci: ECO score, driving parameters (Traffic Perception, Engine Management, Smoothness, Idling)
  - CO₂ (saved/emitted), fuel consumption, driving activity (driving/coasting/braking)
  - Format trajanja: HH:MM:SS, datumi: ISO 8601 (YYYY-MM-DD)
  - Dokumentirane ECO Score boje i stars mapping za UI
- Integriran Telematika API za tahograf podatke (Section 7.14-7.15) 
  - GET /api/driver/telematika - postojeći TahoPro API (spec v05)
  - Podaci prema EU regulativi (EC) No 561/2006: 
    - Dnevna vožnja (driving_today, max_driving_today)
    - Tjedna/dvotjedna vožnja (driving_this_week, biweekly_driving)
    - Kontinuirana vožnja i pauze (continous_driving, shift_rest, rested_in_shift)
    - Dnevni/tjedni odmor (daily_rest, min_daily_rest, last_weekly_rest)
    - Radni tjedan (work_week_start, work_week_latest_end, work_days_number)
    - Skraćeni odmori i nadoknade (short_rests_this_week, short_weekly_rest_recoup)
  - Format vremena: H:mm (trajanje), Y-m-dTH:mm (datum/vrijeme)
  - Dokumentiran UI prikaz i Dart helper funkcije za parsiranje
- Dodana Statistics API za Manager/Supervisor dashboard (Section 7.6) 
  - GET /api/v1/statistics/dashboard - KPI, task distribution, tasks by group
  - Podržani periodi: day, week, month
  - Podaci: active_trucks, active_drivers, total/completed/in_progress/rejected tasks
- Dodana WebSocket notifikacija za promjenu statusa zadatka (Section 5.2) 
  - action: "status_changed" - notifikacija za supervisore/managere
  - Podaci: old_status, new_status, changed_by, task_info (is_root za različit zvuk)
- Prerađena Multitask dokumentacija (Section 5.1) 
  - Isti API za root i subtask
  - Redoslijed slanja: root prvi, pa subtaskovi s parent_task_id
  - Dodan error PARENT_NOT_FOUND za nepostojeći parent_task_id
  - Validacija završetka na klijentu (supervisor može override)
- Ažurirana Attachments dokumentacija (Section 5.3, 7.3) 
  - PHOTO/SIGNATURE: PNG/JPG format, zahtijevaju file upload
  - LOCATION/BARCODE: bez file uploada, samo podaci
  - Dodana tablica podržanih MIME tipova
  - Dodan error INVALID_FILE_TYPE
- Dodan Push Notifications API (Section 7.16) 
  - Vlastiti sustav (ne Firebase/FCM)
  - POST/DELETE /api/v1/notifications/register - registracija uređaja
  - GET/PUT /api/v1/notifications/settings - postavke notifikacija
  - Dokumentirana payload struktura i tipovi notifikacija
- Dodana Data Retention politika (Section 13) 
  - Default: 3 mjeseca (90 dana)
  - Mobilna aplikacija: automatsko lokalno čišćenje
  - Server: cron job za čišćenje baze
  - Dokumentirana sinkronizacija i full resync logika
- Dokumentiran workflow za attachment upload (Section 4.1, 5.3, 7.3) 
  - VAŽNO: Prvo upload datoteke (REST), zatim poruka/potvrda (WebSocket)
  - file_key je privremen (expires in 1h)
  - Dodan error INVALID_FILE_KEY za nepostojeći/istekli ključ
  - Dijagram workflow-a u Section 7.3
- Proširena Push Notifications dokumentacija (Section 7.16) 
  - Objašnjena arhitektura: vlastiti sustav + FCM/APNs transport layer
  - Dodano polje `push_service` (fcm/apns/hms) u registraciju
  - Kreirana detaljna dokumentacija `push_notification.md`: 
    - Server implementacija (PHP/Swoole Push Gateway)
    - Android implementacija (FCM, notification channels, battery optimization)
    - iOS implementacija (APNs, background modes, critical alerts)
    - Flutter integracija
    - Battery consumption analiza

### v1.1 (2025-12-02)

- Potpuno prerađena autentifikacija na QR kod + PIN sustav
- Dodan dvostruki kanal distribucije (QR email/print + PIN SMS)
- Dodan device UUID sustav za automatsko spajanje
- Dodana revokacija uređaja za administratore
- Ažurirani WebSocket connection parametri
- Proširena Security sekcija s detaljnom analizom sigurnosti
- Dodane MariaDB tablice za device registracije i QR kodove
- Dodani novi error kodovi za autentifikaciju

### v1.0 (2025-12-01)

- Inicijalna verzija API specifikacije
- WebSocket protokol za poruke i zadatke
- REST API za ostale operacije
- Sync mehanizam za offline-first arhitekturu
- DateTime konverzija (MariaDB ↔ API ↔ SQLite)