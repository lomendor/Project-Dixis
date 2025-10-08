# DB Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Producer {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        String
  region      String
  category    String
  description String?
  phone       String?
  email       String?
  products    Int       @default(0)
  rating      Float?    @default(0)
  imageUrl    String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  Product     Product[]

  @@index([region, category])
  @@index([name])
}

model Product {
  id          String      @id @default(cuid())
  producerId  String
  title       String
  category    String
  price       Float
  unit        String
  stock       Int         @default(0)
  description String?
  imageUrl    String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  producer    Producer    @relation(fields: [producerId], references: [id], onDelete: Cascade)
  OrderItem   OrderItem[]

  @@index([producerId, createdAt])
  @@index([category])
  @@index([isActive])
}

model Order {
  id             String      @id @default(cuid())
  trackingCode   String      @unique @default(cuid())
  buyerPhone     String
  buyerName      String
  buyerEmail     String?
  shippingLine1  String
  shippingLine2  String?
  shippingCity   String
  shippingPostal String
  total          Float
  totals         Json?
  status         String      @default("pending")
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  items          OrderItem[]

  @@index([buyerPhone, createdAt])
  @@index([status, createdAt])
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  productId  String
  producerId String
  qty        Int
  price      Float
  titleSnap  String?
  priceSnap  Float?
  status     String   @default("pending")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([producerId, status])
  @@index([productId])
}

model Event {
  id        String   @id @default(cuid())
  type      String // e.g., order.created, orderItem.status.changed
  payload   Json
  createdAt DateTime @default(now())

  @@index([type, createdAt])
}

model Notification {
  id            String    @id @default(cuid())
  channel       String // 'SMS' | 'EMAIL'
  to            String
  template      String // logical template id
  payload       Json // rendered variables
  status        String    @default("QUEUED") // QUEUED | SENT | FAILED
  sentAt        DateTime?
  error         String?
  attempts      Int       @default(0)
  nextAttemptAt DateTime?
  dedupId       String?   @db.VarChar(64)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([channel, status, createdAt])
  @@index([status, nextAttemptAt])
  @@index([dedupId])
}

model RateLimit {
  id        String   @id @default(cuid())
  name      String // e.g., 'cron-run', 'dev-deliver', 'checkout'
  key       String // e.g., IP address, cron key, user ID
  bucket    Int // time bucket = floor(now / windowSec)
  count     Int      @default(0)
  createdAt DateTime @default(now())

  @@unique([name, key, bucket])
  @@index([name, key, bucket])
}

```
