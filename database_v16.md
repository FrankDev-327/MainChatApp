# Database v16 Specification - ChaSK Local Database

**Version**: 16
**Database Name**: `chask.db`
**Format**: SQLite 3
**Character Encoding**: UTF-8

## Overview

This document specifies the complete structure of the local SQLite database for the ChaSK mobile application. The database stores messages, tasks, users, groups, and related data for offline-first operation with server synchronization.

### Key Design Principles:
- **Offline-first**: All operations work locally; sync happens in background
- **INTEGER timestamps**: Use `DateTime.now().millisecondsSinceEpoch` in Dart
- **Soft deletes**: Use `is_deleted` flag instead of DELETE
- **Unified messages table**: Single table for all message types (private, group, task)
- **Server sync tracking**: `server_id`, `saved`, `sync_status` fields

---

## Table Structures

### 1. messages

**Purpose**: Main table for all chat messages (private, group, and task-related).

**Schema**:
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL DEFAULT 0,
    task_id INTEGER NOT NULL DEFAULT 0,
    creator_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL DEFAULT 0,
    attachment_id INTEGER DEFAULT 0,
    server_id INTEGER DEFAULT NULL,
    content TEXT,
    created INTEGER NOT NULL,
    saved INTEGER DEFAULT NULL,
    received INTEGER DEFAULT NULL,
    read INTEGER DEFAULT NULL,
    is_urgent INTEGER NOT NULL DEFAULT 0,
    is_warning INTEGER NOT NULL DEFAULT 0,
    is_notification INTEGER NOT NULL DEFAULT 0,
    sync_status TEXT NOT NULL DEFAULT 'PENDING',
    is_deleted INTEGER DEFAULT 0,
    deleted_at INTEGER DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    CHECK (sync_status IN ('PENDING', 'SYNCED', 'ERROR'))
);
```

**Indexes**:
```sql
CREATE INDEX idx_messages_group_receiver ON messages(group_id, receiver_id);
CREATE INDEX idx_messages_created ON messages(created DESC);
```

**Field Descriptions**:
- `id`: Local auto-increment ID
- `group_id`: Group ID (0 for private messages)
- `task_id`: Task ID (0 for non-task messages)
- `creator_id`: User ID of message sender
- `receiver_id`: User ID of receiver (0 for group messages)
- `attachment_id`: Legacy field, use `attachments.message_id` instead
- `server_id`: Global ID from server (NULL if not synced)
- `content`: Message text (NULL if attachment-only)
- `created`: Timestamp when message was created locally (INTEGER milliseconds)
- `saved`: Timestamp when server saved message to database
- `received`: Timestamp when message was received on recipient's device
- `read`: Timestamp when recipient opened the chat/task (see detailed rules below)
- `is_urgent`: 1 if urgent, 0 otherwise
- `is_warning`: 1 if warning, 0 otherwise
- `is_notification`: 1 if sound notification required
- `sync_status`: 'PENDING', 'SYNCED', or 'ERROR'
- `is_deleted`: 1 if soft-deleted
- `deleted_at`: Timestamp of deletion
- `error_message`: Error details if sync failed

---

### Message Timestamp Lifecycle

Poruke prolaze kroz 4 faze s odgovarajućim timestampovima:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MESSAGE TIMESTAMP LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SENDER (Mobile)              SERVER                  RECEIVER (Mobile)         │
│  ─────────────────           ────────                 ──────────────────        │
│                                                                                 │
│  1. User creates msg         2. Server receives       3. Recipient's device     │
│     ↓                           ↓                        receives msg           │
│     created = now()             saved = now()            ↓                      │
│     sync_status = PENDING       INSERT to MariaDB        received = now()       │
│     server_id = NULL                                     sync_status = SYNCED   │
│                                 │                                               │
│     │                           │                        │                      │
│     └──────WebSocket───────────►│                        │                      │
│                                 └────────WebSocket──────►│                      │
│                                                          │                      │
│                                 4. Recipient opens chat  │                      │
│     ◄──────WebSocket read_ack─────────────────────────────                      │
│     read = timestamp from ack   read = now()            │                       │
│                                 UPDATE MariaDB          ←┘                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Timestamp Pravila po Tipu Poruke**:

| Tip | created | saved | received | read |
|-----|---------|-------|----------|------|
| **Private (sender)** | Kada pošiljatelj kreira | Kada server primi | N/A (pošiljatelj) | Kada primatelj otvori chat |
| **Private (receiver)** | Vrijeme kreiranja (od servera) | Kada server primi | Kada mobitel primi | Kada korisnik otvori chat |
| **Group** | Kada pošiljatelj kreira | Kada server primi | Kada mobitel primi | U `message_reads` tablici |
| **Task (driver→supervisor)** | Kada driver kreira | Kada server primi | Kada supervisor mobitel primi | Kada supervisor otvori task |
| **Task (supervisor→driver)** | Kada supervisor kreira | Kada server primi | Kada driver mobitel primi | Kada driver otvori task |
| **WEB (bilo koji)** | Kada korisnik kreira | = received (isto) | = saved (isto) | Kada korisnik otvori chat/task |

**Dart Kod za Timestamp Management**:

```dart
// 1. KREIRANJE PORUKE (sender)
final message = {
  'creator_id': currentUserId,
  'receiver_id': recipientId,
  'content': 'Hello',
  'created': DateTime.now().millisecondsSinceEpoch,  // ← created
  'saved': null,      // Čeka server acknowledgment
  'received': null,   // N/A za sendera
  'read': null,       // Čeka da primatelj otvori chat
  'sync_status': 'PENDING',
};
await db.insert('messages', message);

// 2. NAKON SERVER ACKNOWLEDGMENT (sender prima potvrdu)
await db.update('messages', {
  'server_id': serverResponse['server_id'],
  'saved': apiToLocal(serverResponse['saved']),  // ← saved (od servera)
  'sync_status': 'SYNCED',
}, where: 'id = ?', whereArgs: [localId]);

// 3. PRIMANJE PORUKE (receiver)
final newMessage = {
  'server_id': serverMessage['server_id'],
  'creator_id': serverMessage['creator_id'],
  'receiver_id': currentUserId,
  'content': serverMessage['content'],
  'created': apiToLocal(serverMessage['created']),   // ← created (od servera)
  'saved': apiToLocal(serverMessage['saved']),       // ← saved (od servera)
  'received': DateTime.now().millisecondsSinceEpoch, // ← received (lokalno)
  'read': null,  // Čeka da korisnik otvori chat
  'sync_status': 'SYNCED',
};
await db.insert('messages', newMessage);

// 4. OTVARANJE CHATA (receiver postavlja read)
final now = DateTime.now().millisecondsSinceEpoch;
await db.update('messages', {
  'read': now,  // ← read
}, where: 'receiver_id = ? AND creator_id = ? AND read IS NULL',
   whereArgs: [currentUserId, otherUserId]);
// Šalje WebSocket notifikaciju senderu
```

**WEB Aplikacija - Posebno Pravilo**:

Za WEB aplikaciju koja nema lokalnu bazu, `saved` i `received` su uvijek jednaki:

```dart
// WEB: Nema lokalne baze, sve ide direktno na server
// saved = received = server timestamp
{
  'created': userCreatedAt,      // Kada je korisnik kliknuo Send
  'saved': serverTimestamp,      // Kada je server spremio
  'received': serverTimestamp,   // = saved (nema lokalnog cachea)
  'read': null,                  // Čeka otvaranje chata
}
```

**Message Types**:
1. **Private**: `group_id=0`, `task_id=0`, `receiver_id=<user_id>`
2. **Group**: `group_id=<group_id>`, `task_id=0`, `receiver_id=0`
3. **Task**: `task_id=<task_id>`, `group_id=0`, `receiver_id=0`

**Task Messages - Special Logic**:
Task messages (messages with `task_id > 0`) have special read tracking:
- `receiver_id` is ALWAYS 0 (task messages can be read by multiple supervisors)
- `read` timestamp marks when the **other party** read the message:
  - Driver reads message → sets `read` for messages where `creator_id = supervisor`
  - Supervisor reads message → sets `read` for messages where `creator_id = driver`
- To count unread messages **received by current user**:
  `task_id = X AND creator_id != currentUserId AND read IS NULL`
- To count unread messages **sent by current user**:
  `task_id = X AND creator_id = currentUserId AND read IS NULL`
- For urgent/warning/notification flags, only count messages **received** by current user:
  `task_id = X AND creator_id != currentUserId AND read IS NULL AND is_urgent/warning/notification = 1`

**Common Queries**:
```sql
-- Chat history for private conversation
SELECT * FROM messages
WHERE group_id = 0 AND ((creator_id = ? AND receiver_id = ?) OR (creator_id = ? AND receiver_id = ?))
ORDER BY created DESC LIMIT 50;

-- Group chat history
SELECT * FROM messages
WHERE group_id = ?
ORDER BY created DESC LIMIT 50;

-- Task messages
SELECT * FROM messages
WHERE task_id = ?
ORDER BY created ASC;

-- Pending sync
SELECT * FROM messages WHERE sync_status = 'PENDING';
```

---

### 2. attachments

**Purpose**: Storage for files, photos, coordinates, signatures, and barcodes attached to messages.

**Schema**:
```sql
CREATE TABLE attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    server_id INTEGER DEFAULT NULL,
    type TEXT NOT NULL,
    lat REAL DEFAULT NULL,
    lng REAL DEFAULT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size INTEGER,
    created INTEGER NOT NULL,
    saved INTEGER DEFAULT NULL,
    received INTEGER DEFAULT NULL,
    is_downloaded INTEGER DEFAULT 0,
    thumbnail_path TEXT DEFAULT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    CHECK (type IN ('FILE', 'PHOTO', 'COORDINATES', 'SIGNATURE', 'BARCODE', 'ADDRESS'))
);
```

**Indexes**:
```sql
CREATE INDEX idx_attachments_message ON attachments(message_id);
```

**Field Descriptions**:
- `type`: 'FILE', 'PHOTO', 'COORDINATES', 'SIGNATURE', 'BARCODE', 'ADDRESS'
- `lat`, `lng`: Coordinates (only for type='COORDINATES')
- `file_path`: Local file path
- `file_type`: MIME type
- `is_downloaded`: 1 if file downloaded from server
- `thumbnail_path`: Thumbnail for images/video
- `created`: Timestamp when attachment was created locally
- `saved`: Timestamp when server saved attachment (file uploaded)
- `received`: Timestamp when attachment metadata received on device

**Attachment Timestamp Rules**:

Attachmenti prate istu logiku kao i poruke kojima pripadaju:

| Scenarij | created | saved | received |
|----------|---------|-------|----------|
| **Sender kreira** | Lokalno vrijeme kreiranja | Kada server primi upload | N/A |
| **Receiver prima** | Vrijeme kreiranja (od servera) | Kada server primi | Kada mobitel primi metapodatke |
| **WEB** | Vrijeme kreiranja | = received | = saved |

**NAPOMENA**: `is_downloaded` označava je li datoteka (binary) preuzeta. Attachment zapis se kreira čim stigne metapodatak, ali `file_path` se popunjava tek nakon download-a.

---

### 3. message_reads

**Purpose**: Track read status for group messages (per-user).

**Schema**:
```sql
CREATE TABLE message_reads (
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    read_at INTEGER DEFAULT NULL,
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);
```

**Usage**:
- **Private messages**: Use `messages.read` timestamp directly
- **Group messages**: Use this table to track which users have read the message
- **Task messages**: Use `messages.read` (special logic - see Task Messages section)

**Zašto Group Messages Koriste Zasebnu Tablicu**:

Za grupne poruke, server šalje istu poruku svim članovima grupe. Timestamp `saved` je jednak za sve primatelje, ali svaki korisnik ima svoj `read_at` timestamp:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    GROUP MESSAGE READ TRACKING                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Sender (Ivan)                Server                    Group Members           │
│  ─────────────               ────────                   ──────────────          │
│                                                                                 │
│  creates message             saved = T1                 Ana: received = T2      │
│  created = T0                                                read_at = T5       │
│       │                           │                                             │
│       └───────────────────────────┤                     Marko: received = T3    │
│                                   │                           read_at = T7      │
│                                   │                                             │
│                                   │                     Petra: received = T4    │
│                                   └─────────────────────      read_at = NULL    │
│                                                               (nije pročitala)  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Common Queries**:
```sql
-- Count how many users read a message
SELECT COUNT(*) FROM message_reads
WHERE message_id = ? AND read_at IS NOT NULL;

-- Get unread messages for user in group
SELECT m.* FROM messages m
LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = ?
WHERE m.group_id = ? AND m.creator_id != ? AND (mr.read_at IS NULL)
ORDER BY m.created DESC;

-- Mark message as read for user
INSERT OR REPLACE INTO message_reads (message_id, user_id, read_at)
VALUES (?, ?, ?);
```

**Sinkronizacija Read Status-a**:

Kada korisnik otvori grupni chat:
1. Mobile app postavlja `read_at` u `message_reads` za sve nepročitane poruke
2. Šalje WebSocket notifikaciju serveru: `message.read` s listom `message_ids`
3. Server ažurira `message_reads` u MariaDB
4. Server šalje `read_notification` senderu (opciono)

---

### 4. tasks

**Purpose**: Task management with support for single tasks and multi-task hierarchies.

**Schema**:
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER DEFAULT NULL,
    creator_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    is_root INTEGER DEFAULT 0,
    parent_task_id INTEGER DEFAULT NULL,
    order_index INTEGER DEFAULT 0,
    title TEXT NOT NULL,
    description TEXT,
    created INTEGER NOT NULL,
    saved INTEGER DEFAULT NULL,
    received INTEGER DEFAULT NULL,
    read INTEGER DEFAULT NULL,
    completed INTEGER DEFAULT NULL,
    location_address TEXT DEFAULT NULL,
    location_lat REAL DEFAULT NULL,
    location_lng REAL DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    priority TEXT NOT NULL DEFAULT 'NONE',
    deadline_start INTEGER DEFAULT NULL,
    deadline_end INTEGER DEFAULT NULL,
    deadline_type TEXT DEFAULT NULL,
    require_photo INTEGER NOT NULL DEFAULT 0,
    require_signature INTEGER NOT NULL DEFAULT 0,
    require_location INTEGER NOT NULL DEFAULT 0,
    require_barcode INTEGER NOT NULL DEFAULT 0,
    require_start INTEGER NOT NULL DEFAULT 0,
    start INTEGER DEFAULT NULL,
    photo_attachment_id INTEGER DEFAULT NULL,
    signature_attachment_id INTEGER DEFAULT NULL,
    location_attachment_id INTEGER DEFAULT NULL,
    barcode_attachment_id INTEGER DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    rejection_message_id INTEGER DEFAULT NULL,
    sync_status TEXT NOT NULL DEFAULT 'PENDING',
    is_deleted INTEGER DEFAULT 0,
    deleted_at INTEGER DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (photo_attachment_id) REFERENCES attachments(id),
    FOREIGN KEY (signature_attachment_id) REFERENCES attachments(id),
    FOREIGN KEY (location_attachment_id) REFERENCES attachments(id),
    FOREIGN KEY (barcode_attachment_id) REFERENCES attachments(id),
    FOREIGN KEY (rejection_message_id) REFERENCES messages(id),
    CHECK (status IN ('OPEN', 'RECEIVED', 'IN PROGRESS', 'COMPLETED', 'ON HOLD', 'REJECTED')),
    CHECK (priority IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    CHECK (deadline_type IN ('TODAY', 'THIS_WEEK', 'THIS_MONTH', 'TIME_WINDOW')),
    CHECK (require_photo IN (0, 1, 2)),
    CHECK (require_signature IN (0, 1, 2)),
    CHECK (require_location IN (0, 1, 2)),
    CHECK (require_barcode IN (0, 1, 2)),
    CHECK (require_start IN (0, 1, 2))
);
```

**Indexes**:
```sql
CREATE INDEX idx_tasks_receiver_status ON tasks(receiver_id, status);
CREATE INDEX idx_tasks_created ON tasks(created DESC);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_receiver_deadline ON tasks(receiver_id, deadline_end DESC);
```

**Field Descriptions**:
- `is_root`: 1 for root tasks, 0 for subtasks
- `parent_task_id`: NULL for root tasks, parent ID for subtasks
- `order_index`: Order in multi-task sequence (0 for single tasks)
- `status`: 'OPEN', 'RECEIVED', 'IN PROGRESS', 'COMPLETED', 'ON HOLD', 'REJECTED'
  - OPEN: Zadatak kreiran, čeka isporuku na mobitel
  - RECEIVED: Zadatak isporučen na driver-ov mobitel (automatski kada received timestamp)
  - IN PROGRESS: Vozač je započeo zadatak
  - COMPLETED: Zadatak uspješno završen
  - ON HOLD: Zadatak na čekanju
  - REJECTED: Zadatak odbijen
- `priority`: 'NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
- `require_*`: 0=no, 1=required, 2=optional (applies to photo, signature, location, barcode, start)
- `require_start`: **NEW in v16** - Driver must mark task start: 0=no, 1=required, 2=optional
- `start`: **NEW in v16** - Timestamp when driver started task (INTEGER milliseconds, NULL if not started)
- `*_attachment_id`: Reference to attachments table for confirmations

**Task Timestamp Fields**:
- `created`: Timestamp when task was created (by supervisor)
- `saved`: Timestamp when server saved task to database
- `received`: Timestamp when task was received on driver's device
- `read`: Timestamp when the **other party** viewed the task (see rules below)
- `completed`: Timestamp when task was completed
- `start`: Timestamp when driver started working on task

---

### Task Timestamp Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TASK TIMESTAMP LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SUPERVISOR (Creator)         SERVER                  DRIVER (Receiver)        │
│  ───────────────────         ────────                 ─────────────────         │
│                                                                                 │
│  1. Creates task             2. Server saves          3. Driver's device        │
│     ↓                           ↓                        receives task          │
│     created = now()             saved = now()            ↓                      │
│     sync_status = PENDING       INSERT to MariaDB        received = now()       │
│                                                          sync_status = SYNCED   │
│     │                           │                                               │
│     └───────────────────────────┤                        │                      │
│                                 └────────────────────────►                      │
│                                                          │                      │
│                                 4. Driver opens task     │                      │
│     ◄──────────────────────────────────────────────────────                     │
│     read = timestamp            read = now()            ←┘                      │
│     (supervisor's copy          UPDATE MariaDB                                  │
│      shows driver read it)                                                      │
│                                                                                 │
│                                 5. Driver starts task    │                      │
│                                    start = now()        ←┘                      │
│                                    status = IN PROGRESS                         │
│                                                                                 │
│                                 6. Driver completes      │                      │
│                                    completed = now()    ←┘                      │
│                                    status = COMPLETED                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Task Read Timestamp Pravila**:

| Tko Otvara | Što se ažurira | Objašnjenje |
|------------|----------------|-------------|
| **Driver otvara task** | `read = now()` | Supervisor vidi da je driver pročitao zadatak |
| **Supervisor otvara task** | N/A (ili `read` za poruke) | Supervisor je kreator, ne treba read |

**Task Read vs Message Read**:

- `tasks.read` - Kada je driver otvorio detalje zadatka
- `messages.read` (za task_id > 0) - Kada je druga strana pročitala poruke vezane za task

```dart
// Driver otvara task - postavlja read timestamp
if (task['receiver_id'] == currentUserId && task['read'] == null) {
  await db.update('tasks', {
    'read': DateTime.now().millisecondsSinceEpoch,
  }, where: 'id = ?', whereArgs: [taskId]);
  // Šalje WebSocket notifikaciju supervisoru
}
```

**WEB Aplikacija - Task Timestamps**:

Za WEB, `saved` i `received` su jednaki (nema lokalne baze):

```dart
// WEB: Task primljen direktno od servera
{
  'created': supervisorCreatedAt,
  'saved': serverTimestamp,
  'received': serverTimestamp,  // = saved
  'read': null,  // Čeka da driver otvori
}
```

**Common Queries**:
```sql
-- Get all root tasks for driver
SELECT * FROM tasks
WHERE receiver_id = ? AND is_root = 1
ORDER BY created DESC;

-- Get subtasks for multi-task
SELECT * FROM tasks
WHERE parent_task_id = ?
ORDER BY order_index ASC;

-- Get tasks by status
SELECT * FROM tasks
WHERE receiver_id = ? AND status = 'OPEN'
ORDER BY deadline_end ASC;
```

---

### 5. users

**Purpose**: User profiles synchronized from server.

**Schema**:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    profile_photo TEXT DEFAULT NULL,
    role TEXT NOT NULL,
    last_synced INTEGER DEFAULT NULL,
    CHECK (role IN ('DRIVER', 'SUPERVISOR', 'MANAGER', 'ADMINISTRATOR'))
);
```

**Indexes**:
```sql
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
```

**Field Descriptions**:
- `id`: Server-generated ID (NOT AUTOINCREMENT)
- `role`: 'DRIVER', 'SUPERVISOR', 'MANAGER', 'ADMINISTRATOR'

---

### 6. groups

**Purpose**: Groups for organization (driver groups and truck groups).

**Schema**:
```sql
CREATE TABLE groups (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    last_synced INTEGER DEFAULT NULL,
    CHECK (type IN ('DRIVER', 'TRUCK'))
);
```

**Indexes**:
```sql
CREATE INDEX idx_groups_type ON groups(type);
```

**Field Descriptions**:
- `type`: 'DRIVER' (group of drivers) or 'TRUCK' (group assigned to truck)

---

### 7. user_groups

**Purpose**: User membership in groups with role assignments.

**Schema**:
```sql
CREATE TABLE user_groups (
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    role_in_group TEXT NOT NULL,
    assigned_at INTEGER NOT NULL,
    last_synced INTEGER DEFAULT NULL,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    error_message TEXT DEFAULT NULL,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CHECK (role_in_group IN ('MEMBER', 'MASTER'))
);
```

**Indexes**:
```sql
CREATE INDEX idx_user_groups_user ON user_groups(user_id);
CREATE INDEX idx_user_groups_group ON user_groups(group_id);
CREATE INDEX idx_user_groups_role ON user_groups(role_in_group);
```

**Field Descriptions**:
- `role_in_group`: 'MEMBER' (regular member) or 'MASTER' (group administrator)

**Common Queries**:
```sql
-- Get all users in a group
SELECT u.* FROM users u
JOIN user_groups ug ON u.id = ug.user_id
WHERE ug.group_id = ?;

-- Get all groups for a user
SELECT g.* FROM groups g
JOIN user_groups ug ON g.id = ug.group_id
WHERE ug.user_id = ?;
```

---

### 8. app_settings

**Purpose**: Application settings and configuration (including debug mode).

**Schema**:
```sql
CREATE TABLE app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT,
    updated_at TEXT
);
```

**Common Settings**:
- `debug_mode_enabled`: '1' or '0'
- `debug_mode_role`: 'DRIVER', 'SUPERVISOR', etc.
- `current_theme`: Theme identifier
- `language`: Language code

---

## Usage Examples

### Creating a Multi-Task

```dart
// 1. Create root task
final rootId = await db.insert('tasks', {
  'creator_id': supervisorId,
  'receiver_id': driverId,
  'is_root': 1,
  'title': 'Delivery Route',
  'created': DateTime.now().millisecondsSinceEpoch,
  'status': 'OPEN',
});

// 2. Create subtasks
for (int i = 0; i < 3; i++) {
  await db.insert('tasks', {
    'creator_id': supervisorId,
    'receiver_id': driverId,
    'parent_task_id': rootId,
    'order_index': i + 1,
    'title': 'Stop ${i + 1}',
    'created': DateTime.now().millisecondsSinceEpoch,
    'status': 'OPEN',
  });
}
```

### Validating Task Completion

```dart
bool canCompleteTask(Map<String, dynamic> task) {
  if (task['require_photo'] == 1 && task['photo_attachment_id'] == null) {
    return false;
  }
  if (task['require_signature'] == 1 && task['signature_attachment_id'] == null) {
    return false;
  }
  if (task['require_location'] == 1 && task['location_attachment_id'] == null) {
    return false;
  }
  if (task['require_barcode'] == 1 && task['barcode_attachment_id'] == null) {
    return false;
  }
  return true;
}
```

### Sending a Message

```dart
// Insert message locally
final messageId = await db.insert('messages', {
  'creator_id': currentUserId,
  'receiver_id': recipientId,
  'content': 'Hello!',
  'created': DateTime.now().millisecondsSinceEpoch,
  'sync_status': 'PENDING',
});

// After successful API call
await db.update('messages', {
  'server_id': responseId,
  'saved': DateTime.now().millisecondsSinceEpoch,
  'sync_status': 'SYNCED',
}, where: 'id = ?', whereArgs: [messageId]);
```

---

## UI Color Mapping (v0.78 Update)

With the theme fixes in version 0.78, UI elements in the ChaSK app now map database fields to Flutter's `ColorScheme` for consistent theming across all 8 themes (Light, Dark, Night, Bright Sun, Monochrome, Deep Blue, Business, Eco). This ensures adaptive colors, improved contrast, and accessibility.

**Updated in v0.80**: Task creation functionality now fully utilizes these color mappings for consistent UI across all themes and languages.

### Status to ColorScheme Mapping (tasks table)
- **'OPEN'/'IN PROGRESS'**: `colorScheme.primary` (blue) - Active tasks
- **'COMPLETED'**: `colorScheme.primary` (blue/green tint) - Success state
- **'REJECTED'**: `colorScheme.error` (red) - Error/failure state
- **'ON HOLD'**: `colorScheme.outline` (gray) - Neutral/pending

### Priority to ColorScheme Mapping (tasks and messages tables)
- **'URGENT'**: `colorScheme.error` (red) - High urgency, used for badges and borders
- **'HIGH'**: `colorScheme.secondary` (orange) - Elevated priority
- **'MEDIUM'**: `colorScheme.tertiary` (yellow) - Standard priority
- **'LOW'**: `colorScheme.outline` (gray) - Low priority
- **'NONE'**: `colorScheme.outline` (gray) - Default/no priority

### Message Flags to ColorScheme Mapping (messages table)
- **is_urgent = 1**: `colorScheme.error` (red ❗ icon) - Urgent notifications
- **is_warning = 1**: `colorScheme.tertiary` (yellow ⚠️ icon) - Warning alerts
- **is_notification = 1**: `colorScheme.primary` (blue 🔔 icon) - Standard notifications

### Unread Counts Badges
- **Received unread (↓)**: `colorScheme.primary` (blue) - Messages received by user
- **Sent unread (↑)**: `colorScheme.secondary` (orange) - Messages sent by user, unread by recipient

### General UI Elements
- **Chat bubbles (received)**: `colorScheme.surfaceVariant` (light gray/blue tint)
- **Chat bubbles (sent)**: `colorScheme.primary` with `onPrimary` text
- **Shadows**: `colorScheme.shadow` for elevation
- **Error messages**: `colorScheme.error` with `onError` text
- **Success/Completed**: `colorScheme.primary` (or custom success if added)

These mappings are implemented in screens like `supervisor_task_list_screen.dart` and `driver_chat_screen.dart`, using `Theme.of(context).colorScheme` for dynamic theming. For full details, see `themes.dart` and `rezime_0_78.md`.

---

## Migration Notes

### From Previous Versions

If migrating from older database versions:

1. **Remove old tables**: `supervisors`, `user_accounts`, `task_messages`, etc.
2. **Rename if exists**: `users_new` → `users`, `messages_new` → `messages`
3. **Convert timestamps**: TEXT ISO8601 → INTEGER milliseconds
4. **Update queries**: All code should reference new table names

---

## Database Version

Current version: **16**

Version is managed in `database_helper.dart`:
```dart
static const int _databaseVersion = 16;
```

---

## Important Notes

1. **Always use INTEGER for timestamps**: `DateTime.now().millisecondsSinceEpoch`
2. **Soft delete, don't hard delete**: Set `is_deleted = 1` instead of DELETE
3. **For group messages**: Use `message_reads` table to track per-user read status
4. **For private messages**: Use `messages.read` timestamp directly
5. **Task hierarchy**: Root tasks have `is_root = 1` and `parent_task_id = NULL`
6. **User IDs**: Server-generated, do NOT use AUTOINCREMENT for users table

---

## Maintenance

### Cleanup (Currently Disabled for v15)

The `cleanupOldData()` method needs updating for v15 structure:
- Use INTEGER timestamp comparisons instead of TEXT
- Reference correct table names without `_new` suffix

### Database Auto-Fix (v0.82)

Since version 0.82, the database includes an automatic NULL value fix that runs once on app startup:
- Checks for tasks with NULL values in required fields
- Fixes NULL values in `require_*` fields (sets to 0), `is_root` (sets to 0), `order_index` (sets to 0)
- Runs only once per app installation using SharedPreferences flag: `database_fix_v1_applied`
- Implemented in `DatabaseHelperV2._fixNullTasks()` method

### Indexes

All indexes are created during `_onCreate()`. Regularly analyze query performance and add indexes as needed.

---

## Migration from v15 to v16

**Changes in v16**:
1. Added `require_start` field to tasks table (INTEGER NOT NULL DEFAULT 0)
2. Added `start` field to tasks table (INTEGER DEFAULT NULL)
3. Added CHECK constraint for `require_start IN (0, 1, 2)`

**Migration Strategy**:
- **Automatic**: Database automatically migrates from v15 to v16 on app start
- **Safe**: ALTER TABLE adds new columns with default values
- **Backward Compatible**: Existing tasks get `require_start = 0` (not required)
- **No Data Loss**: All existing data preserved

**Migration Code** (from database_helper.dart):
```dart
if (oldVersion < 16) {
  // Add require_start field (0=no, 1=required, 2=optional)
  await db.execute(
    'ALTER TABLE tasks ADD COLUMN require_start INTEGER NOT NULL DEFAULT 0',
  );

  // Add start timestamp field
  await db.execute(
    'ALTER TABLE tasks ADD COLUMN start INTEGER DEFAULT NULL',
  );

  // Update existing tasks to have require_start = 0
  await db.execute(
    'UPDATE tasks SET require_start = 0 WHERE require_start IS NULL',
  );
}
```

**Testing Migration**:
1. Existing tasks: Should have `require_start = 0` and `start = NULL`
2. New tasks: Can set `require_start` to 0/1/2 as needed
3. Start tracking: Driver can set `start` timestamp when they begin task

---

## Platform Updates (v0.821)

**Flutter & Dart Migration**: Version 0.821 updates the platform to Flutter 3.38.0 and Dart 3.10.0.

**Database Evolution**: Database upgraded from v15 to v16 with start tracking fields.

**API Updates**: Internal API changes (Color.withValues, Geolocator locationSettings) do not affect database operations.

For migration details, see: `MIGRATION_SUMMARY_v3_38.md` and `rezime_0_821.md`

---

**Document Version**: 2.0 (Updated for v16 Database with Start Tracking)
**Last Updated**: 2025-11-13
**Maintained By**: ChaSK Development Team
