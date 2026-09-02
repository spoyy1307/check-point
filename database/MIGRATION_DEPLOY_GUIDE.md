# 🚀 Auto-Deploy & Database Migration Guide for Check Point Mobile

เอกสารแนะนำการรัน Database Migration อัตโนมัติสำหรับระบบ **Check Point Patrol & Security Management** ผ่าน GitHub Actions / CI/CD Auto-Deploy

---

## 📁 ไฟล์ Migration ที่เตรียมไว้ให้ในระบบ

| เส้นทางไฟล์ (File Path) | หน้าที่ / วัตถุประสงค์ | ระบบที่รองรับ |
|---|---|---|
| `prisma/schema.prisma` | โมเดล ORM ครบทั้ง 10 ตาราง `cp_*` | Prisma ORM |
| `prisma/migrations/20260902000000_create_checkpoint_patrol_tables/migration.sql` | ไฟล์ SQL Migration สำหรับ Auto-Deploy | `npx prisma migrate deploy` |
| `database/checkpoint_schema.sql` | สคริปต์ DDL เต็มรูปแบบ พร้อม Indexes และ Foreign Keys | PostgreSQL / MySQL |
| `database/seed_checkpoint_initial_data.sql` | ข้อมูลเริ่มต้น (โรงงาน, รปภ., 8 จุดตรวจ, 6 รอบตรวจ) | Seed / Initial Master Data |

---

## ⚙️ การทำงานเมื่อ GitHub Auto-Deploy (Merge to Main) ทำงาน

### 1. กรณีใช้ Prisma ในระบบ Backend (Node.js / Next.js / NestJS / Express)
เมื่อมีคำสั่ง Merge เข้า Main หรือ Release branch ตัว CI/CD ใน GitHub Actions มักจะรันคำสั่ง:

```bash
# รัน Migration ทั้งหมดที่ยังไม่เคยรัน
npx prisma migrate deploy

# (ทางเลือก) สร้าง Prisma Client ใหม่
npx prisma generate
```

✅ **ระบบจะพบโฟลเดอร์ `prisma/migrations/20260902000000_create_checkpoint_patrol_tables` และทำการ Migrate ตาราง `cp_*` ทั้ง 10 ตารางลงฐานข้อมูลจริงโดยอัตโนมัติทันที 100%!**

---

### 2. กรณีใช้ระบบ Migration แบบ SQL (Flyway / TypeORM / Knex / Sequelize / Go-migrate)
ให้ทีม Backend นำไฟล์:
* `database/checkpoint_schema.sql` หรือไฟล์ใน `prisma/migrations/.../migration.sql`

ไปวางในโฟลเดอร์ `migrations/` ของโปรเจกต์ Backend เมื่อ Git Merge ทำงาน ตัว Runner จะรันไฟล์ SQL นี้และสร้างตารางให้ทันทีครับ

---

## 🛡️ คุณสมบัติความปลอดภัยของ Migration นี้ (Idempotent & Safe)
* ✅ ทุกคำสั่งใช้ `CREATE TABLE IF NOT EXISTS` และ `CREATE INDEX IF NOT EXISTS`
* ✅ ไม่ลบหรือทับตารางเดิมของระบบอื่น
* ✅ ข้อมูลเก่าไม่สูญหาย (Zero Downtime / Safe Schema Upgrade)
* ✅ มี Foreign Key ป้องกันข้อมูลกำพร้า (Cascade Delete เมื่อลบโรงงาน)
