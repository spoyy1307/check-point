# Guard Safety — Expo / React Native

โปรเจกต์นี้เป็น Mobile App จริงด้วย Expo + React Native + Expo Router โดยออกแบบตาม User Flow สำหรับ รปภ.

## สำคัญ
ใช้ SDK 54 เพื่อให้สามารถทดสอบกับ Expo Go บนอุปกรณ์จริงได้ในช่วงที่เอกสาร Expo ระบุว่า SDK 54 เป็นตัวเลือกสำหรับ Expo Go ในช่วงเปลี่ยนผ่าน SDK 57

## เริ่มจากโปรเจกต์ใหม่
ถ้าต้องการสร้างโครงจาก Expo แบบ official ก่อน:
```bash
npx create-expo-app@latest guard-safety --template default@sdk-54
cd guard-safety
npx expo install expo-location expo-camera expo-image-picker
```

หรือใช้ไฟล์ใน zip นี้แทนไฟล์ในโปรเจกต์ แล้วรัน:
```bash
npm install
npx expo start
```

## เปิดบนมือถือ
1. ติดตั้ง Expo Go บน Android/iPhone
2. เปิด terminal:
```bash
npx expo start
```
3. สแกน QR code จาก Expo Go
4. มือถือและคอมควรอยู่ Wi-Fi เดียวกัน
5. ถ้าเชื่อมต่อไม่ได้ ลอง:
```bash
npx expo start --tunnel
```

## ฟังก์ชันที่มีใน Prototype
- Dashboard
- ลงเวลาเข้ากะ / ออกกะ
- เลือกรอบตรวจ 4 รอบ
- ตรวจ GPS จริงเมื่ออยู่หน้าจุดตรวจ
- ถ่ายรูปหลักฐานจริงด้วยกล้อง
- ตรวจล่าช้าและบันทึกเหตุผล
- แจ้งเหตุฉุกเฉินแบบรายการแนวตั้ง
- รายละเอียดเหตุ + GPS + เวลา + รูปหลักฐาน
- สรุปคะแนน 0–100
- รายละเอียดคะแนน
- เมนู

## จุดที่ต้องเปลี่ยนก่อนใช้จริง
- เปลี่ยนพิกัด `CHECKPOINT` ใน `types/patrol.ts` ให้เป็นพิกัดจริงของจุดตรวจ
- เปลี่ยนเบอร์ศูนย์ควบคุมใน `components/EmergencyCallButton.tsx`
- เชื่อม Backend/API สำหรับผู้ใช้, ตารางกะ, จุดตรวจ, เหตุฉุกเฉิน และคะแนน
- เพิ่ม authentication
- เพิ่มการบันทึกข้อมูล offline/online
- เพิ่มระบบส่งรูปไป server
- กำหนดนโยบายและช่วงเวลาสำหรับ background location ถ้าต้องการตรวจการเดินในขณะที่แอปอยู่เบื้องหลัง

## หมายเหตุ GPS
โค้ดนี้ตรวจ GPS ขณะเปิดหน้าตรวจจุด (foreground) และคำนวณระยะห่างจากพิกัดจุดตรวจเพื่อเปิดปุ่มบันทึกเมื่ออยู่ในรัศมีที่กำหนด

ถ้าต้องการ background location / geofencing จริง ควรทำ development build และตั้งค่า native permissions เพิ่มตามข้อกำหนดของ Expo
