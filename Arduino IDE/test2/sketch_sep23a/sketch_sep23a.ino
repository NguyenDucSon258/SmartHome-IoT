#include <ESP8266WiFi.h>
#include <DHT.h>
#include <ESP_SSLClient.h>

#define ENABLE_USER_AUTH
#define ENABLE_DATABASE
#include <FirebaseClient.h>

// ==========================
// 1. THÔNG TIN WIFI
// ==========================

#define WIFI_SSID "DSon"
#define WIFI_PASSWORD "00000009"

// ==========================
// 2. THÔNG TIN FIREBASE
// ==========================

#define API_KEY "AIzaSyBkq8WuHHUFH539hsWlKVIAM9q3kal1DGU"
#define DATABASE_AUTHEN "BT1SaoTcbJcZvHwDJXs6fZD1eokmqGL4ZdyQf66J"
#define DATABASE_URL "smarthome-baedd-default-rtdb.firebaseio.com"

// ==========================
// 3. FIREBASE AUTHENTICATION
// ==========================

#define USER_EMAIL "nguyenducson258205@gmail.com"
#define USER_PASSWORD "Nguyenducson12@"

// ==========================
// 4. DHT22
// ==========================

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// ==========================
// 5. LED
// ==========================

// D5 = GPIO14
#define LED_PIN 14

// LED bật khi HIGH (đã đổi so với bản trước)
// Nếu vẫn ngược thì đổi 2 dòng này cho nhau
#define LED_ON_LEVEL  LOW   
#define LED_OFF_LEVEL HIGH

// Node Firebase chứa lệnh LED (web ghi true/false vào đây)
#define LED_PATH "/control/room2/led"

// ==========================
// 6. FIREBASE OBJECT
// ==========================

UserAuth user_auth(
    API_KEY,
    USER_EMAIL,
    USER_PASSWORD,
    3000
);

FirebaseApp app;
RealtimeDatabase Database;

// Kết nối 1: xác thực + ghi cảm biến
WiFiClient basic_client;
ESP_SSLClient ssl_client;

// Kết nối 2: stream nhận lệnh LED
WiFiClient basic_client2;
ESP_SSLClient ssl_client2;

using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
AsyncClient aClient2(ssl_client2);

// ==========================
// 7. BIẾN THỜI GIAN / TRẠNG THÁI
// ==========================

unsigned long previousDhtMillis = 0;

// DHT22 đọc mỗi 5 giây
const unsigned long READ_INTERVAL = 5000;

bool ledState = false;
bool streamStarted = false;

// ==========================
// 8. HÀM ĐIỀU KHIỂN LED
// ==========================

void applyLed(bool on)
{
    ledState = on;
    digitalWrite(LED_PIN, on ? LED_ON_LEVEL : LED_OFF_LEVEL);
}

// ==========================
// 9. CALLBACK FIREBASE
// ==========================

// Callback chung (xác thực, lỗi, sự kiện)
void processData(AsyncResult &aResult)
{
    if (!aResult.isResult())
        return;

    if (aResult.isEvent())
    {
        Firebase.printf(
            "Event: %s, message: %s, code: %d\n",
            aResult.uid().c_str(),
            aResult.eventLog().message().c_str(),
            aResult.eventLog().code()
        );
    }

    if (aResult.isDebug())
    {
        Firebase.printf(
            "Debug: %s\n",
            aResult.debug().c_str()
        );
    }

    if (aResult.isError())
    {
        Firebase.printf(
            "Firebase Error: %s, code: %d\n",
            aResult.error().message().c_str(),
            aResult.error().code()
        );
    }

    if (aResult.available())
    {
        Firebase.printf(
            "Task: %s\nPayload: %s\n",
            aResult.uid().c_str(),
            aResult.c_str()
        );
    }
}

// Callback của stream: chạy ngay khi web đổi giá trị LED
void streamCallback(AsyncResult &aResult)
{
    if (!aResult.isResult())
        return;

    if (aResult.isError())
    {
        Firebase.printf(
            "Stream Error: %s, code: %d\n",
            aResult.error().message().c_str(),
            aResult.error().code()
        );
    }

    if (aResult.available())
    {
        RealtimeDatabaseResult &RTDB = aResult.to<RealtimeDatabaseResult>();

        if (RTDB.isStream())
        {
            String data = RTDB.to<String>();

            Serial.print("Stream: path=");
            Serial.print(RTDB.dataPath());
            Serial.print(" data=");
            Serial.println(data);

            // Lệnh LED nằm ngay tại node đang lắng nghe (path "/")
            if (data == "true" || data == "false")
            {
                bool cmd = (data == "true");
                if (cmd != ledState)
                {
                    applyLed(cmd);
                    Serial.print("LED -> ");
                    Serial.println(cmd ? "BAT" : "TAT");
                }
            }
        }
    }
}

// ==========================
// 10. SETUP
// ==========================

void setup()
{
    Serial.begin(9600);
    delay(1000);

    Serial.println();
    Serial.println("====================================");
    Serial.println(" ESP8266 + DHT22 + LED + FIREBASE");
    Serial.println("====================================");

    // LED: ban đầu tắt
    pinMode(LED_PIN, OUTPUT);
    applyLed(false);
    Serial.println("LED da khoi dong");

    // DHT22
    dht.begin();
    Serial.println("DHT22 da khoi dong");

    // WiFi
    Serial.println();
    Serial.println("Dang ket noi WiFi...");
    Serial.print("SSID: ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi da ket noi!");
    Serial.print("Dia chi IP: ");
    Serial.println(WiFi.localIP());

    // SSL kết nối 1 (xác thực + ghi cảm biến)
    ssl_client.setClient(&basic_client);
    ssl_client.setInsecure();
    ssl_client.setBufferSizes(2048, 1024);

    // SSL kết nối 2 (stream) - bộ đệm nhỏ để đỡ tốn RAM
    ssl_client2.setClient(&basic_client2);
    ssl_client2.setInsecure();
    ssl_client2.setBufferSizes(1024, 512);

    // Firebase
    Serial.println();
    Serial.println("Dang ket noi Firebase...");

    initializeApp(
        aClient,
        app,
        getAuth(user_auth),
        processData,
        "Firebase_Auth"
    );

    app.getApp<RealtimeDatabase>(Database);
    Database.url(DATABASE_URL);

    Serial.println("Firebase da duoc cau hinh!");
}

// ==========================
// 11. LOOP
// ==========================

void loop()
{
    // Duy trì xác thực + xử lý các tác vụ bất đồng bộ (stream)
    app.loop();

    if (!app.ready())
    {
        return;
    }

    // =================================================
    // BẮT ĐẦU STREAM LED (chỉ 1 lần, sau khi đăng nhập xong)
    // =================================================
    if (!streamStarted)
    {
        streamStarted = true;

        Database.get(
            aClient2,
            LED_PATH,
            streamCallback,
            true,          // true = chế độ stream (SSE)
            "ledStream"
        );

        Serial.println("Da bat stream LED");
        Serial.print("Free heap: ");
        Serial.println(ESP.getFreeHeap());
    }

    // =================================================
    // ĐỌC DHT22 + GHI FIREBASE MỖI 5 GIÂY
    // =================================================
    if (millis() - previousDhtMillis >= READ_INTERVAL)
    {
        previousDhtMillis = millis();

        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();

        if (isnan(temperature) || isnan(humidity))
        {
            Serial.println("Loi doc DHT22!");
            return;
        }

        Serial.println();
        Serial.println("====================================");
        Serial.println("          DU LIEU TU DHT22");
        Serial.println("====================================");

        Serial.print("Nhiet do: ");
        Serial.print(temperature);
        Serial.println(" °C");

        Serial.print("Do am: ");
        Serial.print(humidity);
        Serial.println(" %");

        bool temperatureOK = Database.set<number_t>(
            aClient,
            "/sensor1/temperature",
            number_t(temperature, 2)
        );

        if (temperatureOK)
        {
            Serial.println("Ghi nhiet do: THANH CONG");
        }
        else
        {
            Serial.print("Loi ghi nhiet do: ");
            Serial.println(aClient.lastError().message());
        }

        bool humidityOK = Database.set<number_t>(
            aClient,
            "/sensor1/humidity",
            number_t(humidity, 2)
        );

        if (humidityOK)
        {
            Serial.println("Ghi do am: THANH CONG");
        }
        else
        {
            Serial.print("Loi ghi do am: ");
            Serial.println(aClient.lastError().message());
        }

        Serial.println("====================================");
    }
}