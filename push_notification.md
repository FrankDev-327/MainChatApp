# ChaSK Push Notification System - Tehnička Dokumentacija

**Verzija:** 1.0
**Datum:** 2025-12-02
**Status:** Specifikacija

---

## 1. Pregled / Overview

### 1.1 Problem

Push notifikacije na mobilnim uređajima moraju raditi:
- Kada je aplikacija zatvorena
- Kada je telefon u sleep modu
- S minimalnom potrošnjom baterije
- Pouzdano i brzo (< 5 sekundi latency)

### 1.2 Ograničenja Operativnih Sustava

**Kritična činjenica:** Android i iOS **NE DOZVOLJAVAJU** aplikacijama da održavaju trajne mrežne konekcije u pozadini zbog uštede baterije.

| OS | Ograničenje | Posljedica |
|----|-------------|------------|
| Android | Doze mode, App Standby | WebSocket se prekida nakon ~15 min neaktivnosti |
| iOS | Background App Refresh | Aplikacija se suspendira, nema mrežnog pristupa |

**Jedini način** za pouzdano buđenje aplikacije iz sleep moda:
- **Android**: Firebase Cloud Messaging (FCM) ili Huawei Push Kit
- **iOS**: Apple Push Notification Service (APNs)

### 1.3 ChaSK Pristup - "Vlastiti Sustav"

ChaSK koristi **hibridni pristup**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ChaSK PUSH NOTIFICATION ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐   │
│  │   ChaSK     │     │   ChaSK     │     │    Transport Layer      │   │
│  │   Server    │────►│   Push      │────►│  (FCM/APNs/Pushy)       │   │
│  │  (Swoole)   │     │   Gateway   │     │                         │   │
│  └─────────────┘     └─────────────┘     └───────────┬─────────────┘   │
│                                                      │                 │
│                                                      ▼                 │
│                                          ┌─────────────────────────┐   │
│                                          │    Mobile Device        │   │
│                                          │  ┌───────────────────┐  │   │
│                                          │  │ ChaSK App         │  │   │
│                                          │  │ (woken by OS)     │  │   │
│                                          │  └───────────────────┘  │   │
│                                          └─────────────────────────┘   │
│                                                                         │
│  KONTROLA: ChaSK server odlučuje KADA i KOME poslati notifikaciju       │
│  TRANSPORT: FCM/APNs samo DOSTAVLJAJU poruku (ne znaju sadržaj)         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Što je "vlastito":**
- ChaSK server kontrolira logiku slanja
- ChaSK server čuva device tokene
- ChaSK definira payload format
- ChaSK upravlja postavkama notifikacija

**Što koristi platformske servise:**
- Samo transport (dostava poruke do uređaja)
- OS budi aplikaciju

---

## 2. Opcije Transporta

### 2.1 Opcija A: FCM + APNs (Preporučeno)

**Firebase Cloud Messaging (Android) + Apple Push Notification Service (iOS)**

| Aspekt | FCM | APNs |
|--------|-----|------|
| Cijena | Besplatno | Besplatno |
| Pouzdanost | 99.9% | 99.9% |
| Latency | < 1s | < 1s |
| Baterija | Optimalno | Optimalno |
| Dependency | Google Play Services | iOS native |

**Prednosti:**
- Industrijski standard
- Maksimalna pouzdanost
- Nula troška za infrastrukturu
- Odlična dokumentacija

**Nedostaci:**
- Ovisnost o Google/Apple
- Potrebna Firebase/Apple Developer registracija
- Kina: FCM ne radi (potreban Huawei Push Kit)

### 2.2 Opcija B: Pushy.me (Alternativa bez Google Play Services)

**Za uređaje bez Google Play Services (Huawei, custom ROM)**

| Aspekt | Pushy.me |
|--------|----------|
| Cijena | $0.0025/notifikacija nakon 1000/mjesec besplatno |
| Pouzdanost | 99%+ |
| Latency | < 2s |
| Baterija | Dobro (vlastiti persistent socket) |
| Dependency | Pushy SDK |

**Prednosti:**
- Radi bez Google Play Services
- Jednostavna integracija
- Podržava iOS i Android

**Nedostaci:**
- Trošak za veliki volumen
- Treća strana

### 2.3 Opcija C: WebSocket + Foreground Service (Samo dok je app aktivan)

**Za real-time dok je aplikacija otvorena, push za background**

```
App Active:     WebSocket (real-time, <100ms)
App Background: FCM/APNs (reliable, <1s)
```

**ChaSK već koristi ovaj pristup:**
- WebSocket za chat kada je app otvoren
- Push za notifikacije kada je app zatvoren

---

## 3. Server Implementacija

### 3.1 Arhitektura

```
┌─────────────────────────────────────────────────────────────────┐
│                      ChaSK SERVER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Event Source   │    │  Push Gateway   │                    │
│  │  (Swoole)       │───►│  Service        │                    │
│  └─────────────────┘    └────────┬────────┘                    │
│                                  │                              │
│                     ┌────────────┼────────────┐                │
│                     ▼            ▼            ▼                │
│              ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│              │   FCM    │ │  APNs    │ │  Pushy   │           │
│              │ Adapter  │ │ Adapter  │ │ Adapter  │           │
│              └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  Database:                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ device_tokens                                            │   │
│  │ - user_id, device_token, platform, app_version, etc.    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Database Schema

```sql
-- Tablica za device tokene
CREATE TABLE device_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    device_token VARCHAR(512) NOT NULL UNIQUE,
    platform ENUM('android', 'ios', 'huawei') NOT NULL,
    push_service ENUM('fcm', 'apns', 'pushy', 'hms') NOT NULL,
    app_version VARCHAR(20),
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,

    INDEX idx_user_id (user_id),
    INDEX idx_platform (platform),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tablica za notification log (za debugging i analytics)
CREATE TABLE notification_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    device_token_id INT,
    notification_type ENUM('message', 'task', 'status_change', 'urgent') NOT NULL,
    payload JSON,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME,
    opened_at DATETIME,
    error_message TEXT,
    push_service ENUM('fcm', 'apns', 'pushy', 'hms'),
    message_id VARCHAR(255),

    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at),
    INDEX idx_notification_type (notification_type)
);

-- Tablica za notification settings per user
CREATE TABLE notification_settings (
    user_id INT PRIMARY KEY,
    enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    channel_messages BOOLEAN DEFAULT TRUE,
    channel_tasks BOOLEAN DEFAULT TRUE,
    channel_urgent BOOLEAN DEFAULT TRUE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3.3 Push Gateway Service (PHP/Swoole)

```php
<?php
// lib/Services/PushGateway.php

namespace ChaSK\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;

class PushGateway
{
    private $fcmClient;
    private $apnsClient;
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
        $this->initFCM();
        $this->initAPNs();
    }

    /**
     * Pošalji notifikaciju korisniku
     */
    public function sendToUser(int $userId, array $notification): array
    {
        $results = [];

        // Dohvati sve aktivne tokene korisnika
        $tokens = $this->db->query(
            "SELECT * FROM device_tokens
             WHERE user_id = ? AND is_active = TRUE",
            [$userId]
        );

        // Provjeri notification settings
        $settings = $this->getUserSettings($userId);
        if (!$this->shouldSendNotification($settings, $notification)) {
            return ['skipped' => 'User settings'];
        }

        foreach ($tokens as $token) {
            $result = $this->sendToDevice($token, $notification);
            $results[] = $result;

            // Log notifikaciju
            $this->logNotification($userId, $token['id'], $notification, $result);
        }

        return $results;
    }

    /**
     * Pošalji na specifični uređaj
     */
    private function sendToDevice(array $token, array $notification): array
    {
        switch ($token['push_service']) {
            case 'fcm':
                return $this->sendViaFCM($token['device_token'], $notification);
            case 'apns':
                return $this->sendViaAPNs($token['device_token'], $notification);
            case 'pushy':
                return $this->sendViaPushy($token['device_token'], $notification);
            case 'hms':
                return $this->sendViaHMS($token['device_token'], $notification);
            default:
                return ['error' => 'Unknown push service'];
        }
    }

    /**
     * Firebase Cloud Messaging (Android)
     */
    private function sendViaFCM(string $deviceToken, array $notification): array
    {
        $message = [
            'message' => [
                'token' => $deviceToken,
                'notification' => [
                    'title' => $notification['title'],
                    'body' => $notification['body'],
                ],
                'data' => $notification['data'] ?? [],
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                        'channel_id' => $this->getChannelId($notification),
                        'sound' => 'default',
                        'click_action' => $notification['click_action'] ?? 'FLUTTER_NOTIFICATION_CLICK',
                    ],
                ],
            ],
        ];

        // FCM HTTP v1 API
        $response = $this->fcmClient->post(
            'https://fcm.googleapis.com/v1/projects/' . FCM_PROJECT_ID . '/messages:send',
            ['json' => $message]
        );

        return json_decode($response->getBody(), true);
    }

    /**
     * Apple Push Notification Service (iOS)
     */
    private function sendViaAPNs(string $deviceToken, array $notification): array
    {
        $payload = [
            'aps' => [
                'alert' => [
                    'title' => $notification['title'],
                    'body' => $notification['body'],
                ],
                'sound' => 'default',
                'badge' => $notification['badge'] ?? 1,
                'mutable-content' => 1,
                'content-available' => 1, // Za background processing
            ],
            'data' => $notification['data'] ?? [],
        ];

        // APNs HTTP/2 API
        $response = $this->apnsClient->post(
            'https://api.push.apple.com/3/device/' . $deviceToken,
            [
                'json' => $payload,
                'headers' => [
                    'apns-topic' => APNS_BUNDLE_ID,
                    'apns-push-type' => 'alert',
                    'apns-priority' => '10', // High priority
                    'apns-expiration' => '0', // Immediate
                ],
            ]
        );

        return ['success' => $response->getStatusCode() === 200];
    }

    /**
     * Provjeri da li treba poslati notifikaciju
     */
    private function shouldSendNotification(array $settings, array $notification): bool
    {
        // Globalno isključeno
        if (!$settings['enabled']) {
            return false;
        }

        // Kanal isključen
        $type = $notification['type'] ?? 'message';
        if ($type === 'message' && !$settings['channel_messages']) {
            return false;
        }
        if ($type === 'task' && !$settings['channel_tasks']) {
            return false;
        }

        // Quiet hours (osim za urgent)
        if ($settings['quiet_hours_enabled'] && $type !== 'urgent') {
            if ($this->isQuietHours($settings['quiet_hours_start'], $settings['quiet_hours_end'])) {
                return false;
            }
        }

        // Urgent uvijek prolazi
        if ($type === 'urgent' || $notification['is_urgent'] ?? false) {
            return true;
        }

        return true;
    }

    /**
     * Notification channel za Android
     */
    private function getChannelId(array $notification): string
    {
        $type = $notification['type'] ?? 'message';

        switch ($type) {
            case 'urgent':
                return 'chask_urgent';
            case 'task':
                return 'chask_tasks';
            case 'message':
            default:
                return 'chask_messages';
        }
    }
}
```

### 3.4 Event Triggers

```php
<?php
// Primjer: Kada se kreira nova poruka

class MessageHandler
{
    public function onMessageCreated(Message $message)
    {
        // 1. Spremi u bazu
        $this->db->insert('messages', $message->toArray());

        // 2. Pošalji preko WebSocket (ako je primatelj online)
        $isOnline = $this->websocket->isUserOnline($message->receiver_id);

        if ($isOnline) {
            // Real-time preko WebSocket
            $this->websocket->sendToUser($message->receiver_id, [
                'type' => 'message',
                'action' => 'new',
                'data' => $message->toArray(),
            ]);
        } else {
            // Push notifikacija (offline)
            $this->pushGateway->sendToUser($message->receiver_id, [
                'title' => $message->sender->name,
                'body' => $this->truncate($message->content, 100),
                'type' => $message->is_urgent ? 'urgent' : 'message',
                'data' => [
                    'type' => 'message',
                    'action' => 'new',
                    'message_id' => $message->id,
                    'conversation_id' => $message->conversation_id,
                    'click_action' => 'OPEN_CHAT',
                ],
            ]);
        }
    }
}
```

---

## 4. Android Implementacija

### 4.1 Setup

**android/app/build.gradle:**
```gradle
dependencies {
    // Firebase Cloud Messaging
    implementation 'com.google.firebase:firebase-messaging:23.4.0'

    // Za Huawei uređaje (opciono)
    implementation 'com.huawei.hms:push:6.11.0.300'
}

apply plugin: 'com.google.gms.google-services'
```

**android/build.gradle:**
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
}
```

### 4.2 Firebase Messaging Service

```kotlin
// android/app/src/main/kotlin/.../FirebaseMessagingService.kt

package hr.chask.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class ChaskFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        const val CHANNEL_MESSAGES = "chask_messages"
        const val CHANNEL_TASKS = "chask_tasks"
        const val CHANNEL_URGENT = "chask_urgent"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    /**
     * Poziva se kada stigne nova FCM poruka
     * RADI I KADA JE APP ZATVOREN!
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Data payload (custom podaci)
        val data = remoteMessage.data
        val type = data["type"] ?: "message"
        val action = data["action"] ?: "new"

        // Notification payload (za prikaz)
        val notification = remoteMessage.notification

        // Prikaži notifikaciju
        showNotification(
            title = notification?.title ?: getDefaultTitle(type),
            body = notification?.body ?: "",
            data = data,
            channelId = getChannelId(type)
        )

        // Ako je app aktivan, proslijedi Flutteru
        if (isAppInForeground()) {
            sendToFlutter(data)
        }
    }

    /**
     * Poziva se kada se token promijeni
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Pošalji novi token serveru
        sendTokenToServer(token)
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)

            // Messages channel
            manager.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_MESSAGES,
                    "Poruke",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Notifikacije za nove poruke"
                    enableVibration(true)
                }
            )

            // Tasks channel
            manager.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_TASKS,
                    "Zadaci",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Notifikacije za zadatke"
                    enableVibration(true)
                }
            )

            // Urgent channel - HIGH IMPORTANCE
            manager.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_URGENT,
                    "Hitno",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Hitne notifikacije"
                    enableVibration(true)
                    enableLights(true)
                    // Bypass Do Not Disturb
                    setBypassDnd(true)
                }
            )
        }
    }

    private fun showNotification(
        title: String,
        body: String,
        data: Map<String, String>,
        channelId: String
    ) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            // Proslijedi data Flutteru
            data.forEach { (key, value) -> putExtra(key, value) }
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(
                if (channelId == CHANNEL_URGENT)
                    NotificationCompat.PRIORITY_HIGH
                else
                    NotificationCompat.PRIORITY_DEFAULT
            )
            .build()

        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun getChannelId(type: String): String {
        return when (type) {
            "urgent" -> CHANNEL_URGENT
            "task", "status_change" -> CHANNEL_TASKS
            else -> CHANNEL_MESSAGES
        }
    }
}
```

### 4.3 AndroidManifest.xml

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

    <application>

        <!-- Firebase Messaging Service -->
        <service
            android:name=".ChaskFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT"/>
            </intent-filter>
        </service>

        <!-- Default notification channel -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="chask_messages"/>

        <!-- Auto-init FCM -->
        <meta-data
            android:name="firebase_messaging_auto_init_enabled"
            android:value="true"/>

        <!-- High priority za FCM -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_priority"
            android:value="high"/>

    </application>
</manifest>
```

### 4.4 Battery Optimization - Važne Napomene

```kotlin
// Provjera i zahtjev za isključenje battery optimization

class BatteryOptimizationHelper(private val context: Context) {

    fun isIgnoringBatteryOptimizations(): Boolean {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    fun requestIgnoreBatteryOptimizations() {
        if (!isIgnoringBatteryOptimizations()) {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${context.packageName}")
            }
            context.startActivity(intent)
        }
    }
}
```

**VAŽNO za Android:**
- FCM poruke s `priority: "high"` budu isporučene odmah
- Standardne poruke mogu biti odgođene do 15 minuta u Doze modu
- Preporučeno: Zamoliti korisnika da isključi battery optimization za ChaSK

---

## 5. iOS Implementacija

### 5.1 Setup

**ios/Runner/Info.plist:**
```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>

<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
```

### 5.2 AppDelegate.swift

```swift
import UIKit
import Flutter
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Firebase init
        FirebaseApp.configure()

        // Push notification setup
        UNUserNotificationCenter.current().delegate = self

        // Request permission
        requestNotificationPermission(application)

        // Register for remote notifications
        application.registerForRemoteNotifications()

        // Firebase Messaging delegate
        Messaging.messaging().delegate = self

        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    private func requestNotificationPermission(_ application: UIApplication) {
        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound, .criticalAlert]

        UNUserNotificationCenter.current().requestAuthorization(options: authOptions) { granted, error in
            if granted {
                print("Notification permission granted")
            }
        }
    }

    // MARK: - APNs Token

    override func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        // Proslijedi token Firebase-u
        Messaging.messaging().apnsToken = deviceToken
    }

    // MARK: - Receive notification (app in foreground)

    override func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo

        // Prikaži notifikaciju čak i kad je app aktivan
        completionHandler([.banner, .sound, .badge])

        // Proslijedi Flutteru
        sendToFlutter(userInfo)
    }

    // MARK: - Notification tap (open app)

    override func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        // Handle notification tap
        handleNotificationTap(userInfo)

        completionHandler()
    }

    // MARK: - Background notification (silent)

    override func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        // Background processing
        // content-available: 1 omogućuje ovaj callback

        processBackgroundNotification(userInfo)
        completionHandler(.newData)
    }

    private func handleNotificationTap(_ userInfo: [AnyHashable: Any]) {
        guard let type = userInfo["type"] as? String,
              let action = userInfo["click_action"] as? String else {
            return
        }

        // Proslijedi Flutteru za navigaciju
        if let flutterViewController = window?.rootViewController as? FlutterViewController {
            let channel = FlutterMethodChannel(
                name: "hr.chask.app/notifications",
                binaryMessenger: flutterViewController.binaryMessenger
            )

            channel.invokeMethod("onNotificationTap", arguments: userInfo)
        }
    }
}

// MARK: - MessagingDelegate

extension AppDelegate: MessagingDelegate {

    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let token = fcmToken else { return }

        print("FCM Token: \(token)")

        // Pošalji token serveru
        sendTokenToServer(token)
    }
}
```

### 5.3 Critical Alerts (za hitne notifikacije)

Za hitne notifikacije koje moraju proći Do Not Disturb:

1. **Zatraži Apple entitlement** (potrebna posebna dozvola od Applea)
2. **Dodaj u Info.plist:**
```xml
<key>NSCriticalAlertEntitlement</key>
<true/>
```

3. **Server payload:**
```json
{
    "aps": {
        "sound": {
            "critical": 1,
            "name": "urgent.caf",
            "volume": 1.0
        }
    }
}
```

---

## 6. Flutter Integracija

### 6.1 Dependencies

**pubspec.yaml:**
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0
```

### 6.2 Push Notification Service

```dart
// lib/services/push_notification_service.dart

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._();
  factory PushNotificationService() => _instance;
  PushNotificationService._();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  String? _fcmToken;

  /// Inicijalizacija push notifikacija
  Future<void> initialize() async {
    // Request permission
    await _requestPermission();

    // Get FCM token
    _fcmToken = await _fcm.getToken();
    debugPrint('FCM Token: $_fcmToken');

    // Send token to server
    if (_fcmToken != null) {
      await _registerTokenWithServer(_fcmToken!);
    }

    // Listen for token refresh
    _fcm.onTokenRefresh.listen(_registerTokenWithServer);

    // Setup message handlers
    _setupMessageHandlers();

    // Initialize local notifications
    await _initLocalNotifications();
  }

  Future<void> _requestPermission() async {
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
      criticalAlert: true, // Za urgent notifikacije
    );

    debugPrint('Permission status: ${settings.authorizationStatus}');
  }

  void _setupMessageHandlers() {
    // App in foreground
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // App opened from notification
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // App opened from terminated state
    _fcm.getInitialMessage().then((message) {
      if (message != null) {
        _handleNotificationTap(message);
      }
    });
  }

  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message: ${message.data}');

    // Show local notification
    _showLocalNotification(
      title: message.notification?.title ?? 'Nova poruka',
      body: message.notification?.body ?? '',
      payload: message.data,
    );

    // Update app state if needed
    _notifyApp(message.data);
  }

  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('Notification tap: ${message.data}');

    final type = message.data['type'];
    final action = message.data['click_action'];

    switch (action) {
      case 'OPEN_CHAT':
        final conversationId = message.data['conversation_id'];
        // Navigate to chat screen
        _navigateToChat(int.parse(conversationId ?? '0'));
        break;

      case 'OPEN_TASK':
        final taskId = message.data['entity_id'];
        // Navigate to task detail
        _navigateToTask(int.parse(taskId ?? '0'));
        break;
    }
  }

  Future<void> _initLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    await _localNotifications.initialize(
      const InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      ),
      onDidReceiveNotificationResponse: (response) {
        // Handle tap on local notification
        final payload = response.payload;
        if (payload != null) {
          _handleLocalNotificationTap(payload);
        }
      },
    );

    // Create notification channels (Android)
    await _createNotificationChannels();
  }

  Future<void> _createNotificationChannels() async {
    final androidPlugin = _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin != null) {
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          'chask_messages',
          'Poruke',
          description: 'Notifikacije za nove poruke',
          importance: Importance.defaultImportance,
        ),
      );

      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          'chask_tasks',
          'Zadaci',
          description: 'Notifikacije za zadatke',
          importance: Importance.defaultImportance,
        ),
      );

      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          'chask_urgent',
          'Hitno',
          description: 'Hitne notifikacije',
          importance: Importance.high,
          playSound: true,
          enableVibration: true,
        ),
      );
    }
  }

  Future<void> _showLocalNotification({
    required String title,
    required String body,
    required Map<String, dynamic> payload,
  }) async {
    final type = payload['type'] ?? 'message';
    final channelId = _getChannelId(type);

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          _getChannelName(channelId),
          importance: type == 'urgent' ? Importance.high : Importance.defaultImportance,
          priority: type == 'urgent' ? Priority.high : Priority.defaultPriority,
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: jsonEncode(payload),
    );
  }

  String _getChannelId(String type) {
    switch (type) {
      case 'urgent':
        return 'chask_urgent';
      case 'task':
      case 'status_change':
        return 'chask_tasks';
      default:
        return 'chask_messages';
    }
  }

  String _getChannelName(String channelId) {
    switch (channelId) {
      case 'chask_urgent':
        return 'Hitno';
      case 'chask_tasks':
        return 'Zadaci';
      default:
        return 'Poruke';
    }
  }

  /// Registriraj token na serveru
  Future<void> _registerTokenWithServer(String token) async {
    try {
      final response = await ApiService().post(
        '/api/v1/notifications/register',
        body: {
          'device_token': token,
          'platform': Platform.isIOS ? 'ios' : 'android',
          'app_version': await PackageInfo.fromPlatform().then((p) => p.version),
          'device_info': {
            'model': await DeviceInfoPlugin().androidInfo.then((i) => i.model),
            'os_version': Platform.operatingSystemVersion,
          },
        },
      );

      debugPrint('Token registered: ${response.success}');
    } catch (e) {
      debugPrint('Failed to register token: $e');
    }
  }

  /// Deregistriraj uređaj (npr. pri logout)
  Future<void> unregister() async {
    if (_fcmToken != null) {
      try {
        await ApiService().delete(
          '/api/v1/notifications/register',
          body: {'device_token': _fcmToken},
        );
        await _fcm.deleteToken();
      } catch (e) {
        debugPrint('Failed to unregister: $e');
      }
    }
  }
}
```

### 6.3 Background Message Handler

```dart
// lib/main.dart

import 'package:firebase_messaging/firebase_messaging.dart';

/// Handler za background poruke (MORA biti top-level funkcija!)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Initialize Firebase if needed
  await Firebase.initializeApp();

  debugPrint('Background message: ${message.data}');

  // Handle background message
  // NAPOMENA: Ovdje NE možete pristupiti UI ili navigaciji
  // Samo procesiranje podataka (npr. update badge count)
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();

  // Register background handler
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(MyApp());
}
```

---

## 7. Dijagram Toka / Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PUSH NOTIFICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────────┐   │
│  │  Event   │     │  ChaSK   │     │   Push   │     │    FCM/APNs      │   │
│  │ (Message)│────►│  Server  │────►│  Gateway │────►│   (Transport)    │   │
│  └──────────┘     └──────────┘     └──────────┘     └────────┬─────────┘   │
│                                                               │             │
│                                                               ▼             │
│                                                    ┌──────────────────┐     │
│                                                    │      OS          │     │
│                                                    │  (Android/iOS)   │     │
│                                                    └────────┬─────────┘     │
│                                                             │               │
│                        ┌────────────────────────────────────┼───────────┐   │
│                        │                                    │           │   │
│                        ▼                                    ▼           │   │
│                 ┌─────────────┐                     ┌─────────────┐     │   │
│                 │ App Running │                     │ App Closed  │     │   │
│                 │ (Foreground)│                     │ (Background)│     │   │
│                 └──────┬──────┘                     └──────┬──────┘     │   │
│                        │                                   │           │   │
│                        ▼                                   ▼           │   │
│                 ┌─────────────┐                     ┌─────────────┐     │   │
│                 │ Update UI   │                     │ Show System │     │   │
│                 │ Directly    │                     │ Notification│     │   │
│                 └─────────────┘                     └──────┬──────┘     │   │
│                                                            │           │   │
│                                                            ▼           │   │
│                                                     ┌─────────────┐     │   │
│                                                     │  User Tap   │     │   │
│                                                     └──────┬──────┘     │   │
│                                                            │           │   │
│                                                            ▼           │   │
│                                                     ┌─────────────┐     │   │
│                                                     │  Open App   │     │   │
│                                                     │  Navigate   │     │   │
│                                                     └─────────────┘     │   │
│                                                                         │   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Battery Consumption Analiza

### 8.1 FCM/APNs Pristup (Preporučeno)

| Aspekt | Potrošnja |
|--------|-----------|
| Idle (no notifications) | ~0% dodatno |
| Per notification received | < 0.01% |
| Daily average (50 notifications) | < 0.5% |

**Zašto je efikasno:**
- Koristi postojeću sistemsku konekciju (Google/Apple)
- Nema stalnog polling-a
- Uređaj se budi samo kad stigne poruka
- OS optimizira batch delivery

### 8.2 Persistent WebSocket (NE preporučeno za background)

| Aspekt | Potrošnja |
|--------|-----------|
| Idle connection | 2-5% na sat |
| With keep-alive | 5-10% na sat |
| Daily | 50-100%+ |

**Zašto je neefikasno:**
- Mora održavati aktivnu mrežnu konekciju
- CPU se budi za heartbeat
- Radio se pali periodički
- OS ga ubija u Doze modu

### 8.3 Preporučena Strategija za ChaSK

```
┌─────────────────────────────────────────────────────────────┐
│                    BATTERY OPTIMIZATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  App State          │ Communication        │ Battery       │
│  ─────────────────────────────────────────────────────     │
│  Foreground         │ WebSocket (real-time)│ Normal        │
│  Background (<15min)│ WebSocket (active)   │ Normal        │
│  Background (>15min)│ FCM/APNs (push)      │ Minimal       │
│  Terminated         │ FCM/APNs (push)      │ Minimal       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Testiranje

### 9.1 FCM Test via cURL

```bash
# Dobij access token
ACCESS_TOKEN=$(gcloud auth print-access-token)

# Pošalji test notifikaciju
curl -X POST \
  "https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "DEVICE_FCM_TOKEN",
      "notification": {
        "title": "Test",
        "body": "Test notification from ChaSK"
      },
      "data": {
        "type": "message",
        "action": "new",
        "click_action": "OPEN_CHAT",
        "conversation_id": "123"
      }
    }
  }'
```

### 9.2 APNs Test via cURL

```bash
curl -v \
  --http2 \
  -H "apns-topic: hr.chask.app" \
  -H "apns-push-type: alert" \
  -H "authorization: bearer $JWT_TOKEN" \
  -d '{"aps":{"alert":{"title":"Test","body":"Test notification"}}}' \
  "https://api.push.apple.com/3/device/DEVICE_TOKEN"
```

---

## 10. Troubleshooting

### 10.1 Android

| Problem | Rješenje |
|---------|----------|
| Notifikacije ne stižu | Provjeri battery optimization |
| Kasne notifikacije | Koristi `priority: "high"` |
| App se ne budi | Provjeri FCM service registration |
| Token se ne generira | Provjeri google-services.json |

### 10.2 iOS

| Problem | Rješenje |
|---------|----------|
| Permission denied | Provjeri Info.plist capabilities |
| APNs token null | Provjeri provisioning profile |
| Background ne radi | Dodaj `remote-notification` capability |
| Sandbox vs Production | Provjeri APNs environment |

---

## 11. Zaključak

### Preporučeni Pristup za ChaSK:

1. **Transport**: FCM (Android) + APNs (iOS)
2. **Backend**: Vlastiti Push Gateway service
3. **Token management**: ChaSK server
4. **Payload format**: ChaSK definiran
5. **Real-time u app**: WebSocket
6. **Background**: Push notifikacije

### Ne treba:
- Foreground service (ubija bateriju)
- Polling (neefikasno)
- Vlastiti push server (kompleksno, nepouzdano)

### Alternativa bez Google Play Services:
- Pushy.me za Huawei i custom ROM uređaje
- Huawei HMS Push Kit za Huawei uređaje

---

**Kreirao:** Claude Code
**Datum:** 2025-12-02
**Verzija:** 1.0
