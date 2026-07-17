# 🔍 Báo Cáo Phân Tích Hook — Phụ Thuộc Logic & Vi Phạm Thiết Kế

> **Mục tiêu:** Kiểm tra các hook trong `src/hooks/` về phần logic bị phụ thuộc cứng (tight coupling), vi phạm nguyên tắc dễ mở rộng (Open/Closed), dễ thay thế (Dependency Inversion), và Single Responsibility.

---

## 📋 Tổng Quan Các Vấn Đề

| # | Hook | Vấn đề | Mức độ |
|---|------|--------|--------|
| 1 | `useApp.ts` | Import trực tiếp `db` từ `../db/db` — tight coupling với Dexie | 🔴 Cao |
| 2 | `useApp.ts` | Import trực tiếp `createSocket()` — không thể mock/thay thế transport | 🔴 Cao |
| 3 | `useApp.ts` | Hook quá lớn, ôm nhiều trách nhiệm (God Hook) | 🔴 Cao |
| 4 | `useApp.ts` | Ghi trực tiếp field DB schema cứng trong socket event handler | 🟡 Trung bình |
| 5 | `useApp.ts` | Tight coupling với `subscribeToWebPush`, logic permission bị duplicate | 🟡 Trung bình |
| 6 | `useDetailCard.ts` | Type `DetailOrder` import từ `../api/orderApi` — phụ thuộc vào tầng API | 🟡 Trung bình |
| 7 | `usePWAInstall.ts` | Leak event listener `appinstalled` (không cleanup) | 🟠 Thấp-Trung |

---

## 🔴 Vấn Đề 1 — `useApp.ts`: Tight coupling với Dexie DB

### Mô tả

```ts
// useApp.ts - Line 4
import { db, Order as DbOrder } from "../db/db";

// Dùng trực tiếp ở 8+ chỗ trong hook:
const detailLive = useLiveQuery(() => db.orders.where('status').equals('detail')...);
await db.orders.update(order.id, { status: 'queue', ... });
await db.orders.delete(id);
await db.orders.bulkDelete(ids);
await db.orders.clear();
```

### Vấn đề

- `useApp` biết chi tiết triển khai của Dexie: tên table (`orders`), API Dexie (`.where()`, `.put()`, `.update()`, `.delete()`)
- Nếu thay Dexie bằng IndexedDB thuần, LocalForage, hay SQLite WASM → phải sửa **toàn bộ hook**
- Không thể unit test hook mà không có Dexie thật

### Plan Fix

**Tạo `src/db/orderRepository.ts`** — Repository Pattern:

```ts
// src/db/orderRepository.ts
import { db, Order } from "./db";

export interface IOrderRepository {
    getByStatus(status: Order['status']): Promise<Order[]>;
    put(order: Order): Promise<void>;
    update(id: string, changes: Partial<Order>): Promise<void>;
    delete(id: string): Promise<void>;
    bulkDelete(ids: string[]): Promise<void>;
    clear(): Promise<void>;
}

export const orderRepository: IOrderRepository = {
    getByStatus: (status) => db.orders.where('status').equals(status).toArray(),
    put: (order) => db.orders.put(order).then(() => {}),
    update: (id, changes) => db.orders.update(id, changes).then(() => {}),
    delete: (id) => db.orders.delete(id),
    bulkDelete: (ids) => db.orders.bulkDelete(ids),
    clear: () => db.orders.clear(),
};
```

**Cập nhật `useApp.ts`:**

```ts
// Trước:
import { db } from "../db/db";
await db.orders.update(id, { status: 'queue' });

// Sau:
import { orderRepository } from "../db/orderRepository";
await orderRepository.update(id, { status: 'queue' });
```

---

## 🔴 Vấn Đề 2 — `useApp.ts`: Tight coupling với Socket.IO

### Mô tả

```ts
// useApp.ts - Line 6, 54
import { createSocket } from "../api/socketClient";
const socket = createSocket(); // hardcode bên trong useEffect
```

### Vấn đề

- Hook tự khởi tạo socket bên trong `useEffect` — không thể inject socket từ ngoài vào
- Không thể swap sang WebSocket thuần, hoặc mock socket trong test
- Quản lý lifecycle socket bị pha lẫn với logic data & UI

### Plan Fix

**Tách ra `useSocketEvents` hook riêng biệt:**

```ts
// src/hooks/useSocketEvents.ts
import { useEffect } from "react";
import { createSocket } from "../api/socketClient";
import { orderRepository, mapSocketPayloadToOrder } from "../db/orderRepository";
import toast from "react-hot-toast";

export function useSocketEvents(onQr: (base64: string) => void) {
    useEffect(() => {
        const socket = createSocket();

        socket.on("connect", () => console.log("Socket.IO connected!"));

        socket.on("login_qr", (payload: { qrcode_base64: string }) => {
            toast.success("Đăng nhập zalo để nhận đơn");
            if (payload?.qrcode_base64) onQr(payload.qrcode_base64);
        });

        socket.on("new_order", async (payload) => {
            await orderRepository.put(mapSocketPayloadToOrder(payload));
            toast.success(`Đơn mới: ${payload.address}`);
        });

        socket.on("go_ship", async (payload: { msg_id: string }) => {
            await orderRepository.update(payload.msg_id, { status: 'queue', orderIndex: Date.now() });
            toast.success("Đã chuyển 1 đơn vào hàng chờ");
        });

        socket.on("deleted_oder", async (payload: { msg_id: string }) => {
            await orderRepository.delete(payload.msg_id);
            toast.error("Một đơn hàng đã bị xóa");
        });

        socket.on("server_message", (payload: { msg: string }) => {
            toast(payload.msg, { icon: "🔔" });
        });

        return () => { socket.disconnect(); };
    }, []);
}
```

---

## 🔴 Vấn Đề 3 — `useApp.ts`: God Hook (vi phạm SRP)

### Mô tả

`useApp` hiện tại ôm **6 trách nhiệm** khác nhau:

| Trách nhiệm | Dòng code |
|-------------|-----------|
| Query dữ liệu real-time (Dexie live query) | L11–22 |
| Quản lý UI state (screen, loading, qrBase64) | L34–36 |
| Xử lý Socket.IO (connect, events) | L54–106 |
| Xử lý Notification / Web Push | L44–51, L162–180 |
| Xử lý scroll / navigation | L108–129 |
| CRUD order operations | L131–158 |

### Plan Fix

Tách `useApp` thành các hook nhỏ chuyên biệt:

```
src/hooks/
├── useOrderData.ts        # Chỉ Dexie live queries
├── useSocketEvents.ts     # Chỉ kết nối & xử lý socket events
├── useNotification.ts     # Chỉ permission & Web Push
├── useScreenNav.ts        # Chỉ screen state + scroll logic
├── useOrderActions.ts     # Chỉ CRUD operations
└── useApp.ts              # Composer hook — kết hợp tất cả hook trên
```

**`useApp.ts` sau khi refactor:**

```ts
export function useApp() {
    const [qrBase64, setQrBase64] = useState<string | null>(null);
    const clearQr = () => setQrBase64(null);

    const orderData = useOrderData();
    const nav = useScreenNav();
    const actions = useOrderActions();
    const { requestNotificationPermission } = useNotification();
    useSocketEvents((base64) => setQrBase64(base64));

    return {
        ...orderData,
        ...nav,
        ...actions,
        qrBase64,
        clearQr,
        requestNotificationPermission,
    };
}
```

---

## 🟡 Vấn Đề 4 — `useApp.ts`: DB Schema hard-coded trong socket event handler

### Mô tả

```ts
// useApp.ts - Line 68-79
socket.on("new_order", async (payload) => {
    await db.orders.put({
        id: payload.id,
        address: payload.address,
        phone: payload.phone,
        img_url: payload.img_url,
        createdAt: new Date(payload.createdAt).toISOString(),
        status: 'detail',          // ← hard-coded
        time: timeFormatted,
        orderIndex: Date.now()     // ← hard-coded strategy
    });
});
```

### Vấn đề

- Logic **transform payload → DB entity** bị nhúng thẳng vào event handler
- Nếu schema DB thay đổi (thêm field, đổi tên) → sửa nhiều chỗ rải rác
- Logic tương tự lặp lại ở event `go_ship` (L85-91)

### Plan Fix

**Tạo mapper function trong `orderRepository.ts`:**

```ts
// src/db/orderRepository.ts
export interface NewOrderPayload {
    id: string;
    address: string;
    phone: string;
    img_url: string;
    createdAt: string | Date;
}

export function mapSocketPayloadToOrder(payload: NewOrderPayload): Order {
    const timeFormatted = new Date(payload.createdAt)
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
        id: payload.id,
        address: payload.address,
        phone: payload.phone,
        img_url: payload.img_url,
        createdAt: new Date(payload.createdAt).toISOString(),
        status: 'detail',
        time: timeFormatted,
        orderIndex: Date.now(),
    };
}
```

**Trong event handler:**

```ts
socket.on("new_order", async (payload) => {
    await orderRepository.put(mapSocketPayloadToOrder(payload));
    toast.success(`Đơn mới: ${payload.address}`);
});
```

---

## 🟡 Vấn Đề 5 — `useApp.ts`: Logic Notification bị phân tán & duplicate

### Mô tả

```ts
// useApp.ts - Line 44-51 (trong useEffect)
if (Notification.permission === "granted") subscribeToWebPush();

// useApp.ts - Line 162-180 (trong requestNotificationPermission)
if (Notification.permission === "granted") {
    subscribeToWebPush(); // ← duplicate check
    return;
}
const permission = await Notification.requestPermission();
if (permission === 'granted') subscribeToWebPush(); // ← lại gọi thêm lần nữa
```

### Vấn đề

- Logic kiểm tra `Notification.permission` bị lặp lại ít nhất 3 lần
- Không có trạng thái `isNotificationGranted` để component UI biết hiển thị gì
- `useApp` biết quá nhiều về Web Push internals

### Plan Fix

**Tách ra `useNotification` hook:**

```ts
// src/hooks/useNotification.ts
import { useState, useEffect } from "react";
import { subscribeToWebPush } from "../utils/pushHelper";
import toast from "react-hot-toast";

export function useNotification() {
    const [notifPermission, setNotifPermission] = useState(
        "Notification" in window ? Notification.permission : "denied"
    );

    const trySubscribe = async () => {
        await subscribeToWebPush();
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("Trình duyệt không hỗ trợ thông báo");
            return;
        }
        if (Notification.permission === "granted") {
            toast.success("Đã cấp quyền thông báo trước đó");
            await trySubscribe();
            return;
        }
        const permission = await Notification.requestPermission();
        setNotifPermission(permission);
        if (permission === "granted") {
            toast.success("Đã cấp quyền thông báo thành công!");
            await trySubscribe();
        } else {
            toast.error("Bạn đã từ chối cấp quyền thông báo");
        }
    };

    useEffect(() => {
        if (Notification.permission !== "denied") {
            requestNotificationPermission();
        }
    }, []);

    return { notifPermission, requestNotificationPermission };
}
```

---

## 🟡 Vấn Đề 6 — `useDetailCard.ts`: Import type từ tầng API

### Mô tả

```ts
// useDetailCard.ts - Line 2
import { DetailOrder } from "../api/orderApi";
```

### Vấn đề

- `useDetailCard` là hook UI-level nhưng phụ thuộc vào `api/orderApi.ts`
- `orderApi.ts` hiện tại còn chứa **mock data** (`mockQueue`, `mockDetail`) — không phải nơi đặt shared types
- Vi phạm nguyên tắc: type domain (entity) không nên sống trong tầng API

### Plan Fix

**Tạo `src/types/order.ts`** — shared domain types:

```ts
// src/types/order.ts
export interface Order {
    id: string;
    address: string;
    phone: string;
    createdAt: string;
    called?: boolean;
}

export interface DetailOrder extends Order {
    time?: string;
    img_url?: string;
}
```

**Cập nhật imports khắp project:**

```ts
// useDetailCard.ts
import { DetailOrder } from "../types/order";  // ← từ types, không phải api

// orderApi.ts
import { Order, DetailOrder } from "../types/order";  // ← tái sử dụng

// db/db.ts
// Order ở đây có thêm status & orderIndex — có thể extend hoặc giữ riêng
import { Order as DomainOrder } from "../types/order";
export interface Order extends DomainOrder {
    status: 'detail' | 'queue' | 'called';
    orderIndex?: number;
}
```

---

## 🟠 Vấn Đề 7 — `usePWAInstall.ts`: Leak event listener `appinstalled`

### Mô tả

```ts
// usePWAInstall.ts - Line 16-19
window.addEventListener("appinstalled", () => {
    setIsInstallable(false);
    setDeferredPrompt(null);
});
// ← KHÔNG có cleanup trong return () => { ... }
```

### Vấn đề

- Event `appinstalled` được add nhưng **không bao giờ được remove**
- Nếu component unmount và mount lại → listener bị nhân đôi
- Callback closure giữ reference đến setter functions cũ (stale closure)

### Plan Fix

```ts
// src/hooks/usePWAInstall.ts
useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
    };

    const handleAppInstalled = () => {   // ← đặt thành named function
        setIsInstallable(false);
        setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);  // ← cleanup đủ cặp
    };
}, []);
```

---

## 🗺️ Roadmap Fix Theo Thứ Tự Ưu Tiên

```
Phase 1 — Nền tảng (không breaking change, an toàn làm trước)
├── [P1-1] Tạo src/types/order.ts            → shared domain types
├── [P1-2] Tạo src/db/orderRepository.ts     → Repository Pattern + mapper
└── [P1-3] Fix usePWAInstall.ts              → cleanup event listener

Phase 2 — Tách Hook (breaking change có kiểm soát)
├── [P2-1] Tạo useNotification.ts            → tách từ useApp
├── [P2-2] Tạo useScreenNav.ts               → tách từ useApp
├── [P2-3] Tạo useOrderActions.ts            → tách từ useApp
└── [P2-4] Tạo useSocketEvents.ts            → tách từ useApp

Phase 3 — Tích hợp & Dọn dẹp
├── [P3-1] Refactor useApp.ts thành Composer Hook
├── [P3-2] Cập nhật useDetailCard.ts dùng types/order.ts
└── [P3-3] Dọn mock data ra khỏi orderApi.ts
```

---

## 📁 Cấu Trúc Thư Mục Đề Xuất Sau Fix

```
src/
├── types/
│   └── order.ts               # [MỚI] Domain types tập trung
├── db/
│   ├── db.ts                  # Giữ nguyên (Dexie schema)
│   └── orderRepository.ts     # [MỚI] Repository Pattern + mapper
├── api/
│   ├── orderApi.ts            # [SỬA] Dọn mock data, import types từ types/order
│   └── socketClient.ts        # Giữ nguyên
├── hooks/
│   ├── useApp.ts              # [SỬA] Chỉ là Composer Hook
│   ├── useOrderActions.ts     # [MỚI] CRUD operations
│   ├── useSocketEvents.ts     # [MỚI] Socket.IO events
│   ├── useNotification.ts     # [MỚI] Permission + Web Push
│   ├── useScreenNav.ts        # [MỚI] Screen + scroll navigation
│   ├── useDetailCard.ts       # [SỬA] Import từ types/order
│   └── usePWAInstall.ts       # [SỬA] Fix listener leak
└── utils/
    └── pushHelper.ts          # Giữ nguyên
```

---

*Báo cáo được tạo: 2026-07-17 | Phân tích bởi: Antigravity*
