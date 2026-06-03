# Pet Care Mobile App — Project README

## 1. Vision

Dự án là một mobile app dành cho thị trường thú cưng, tập trung hỗ trợ người nuôi, người chăm sóc và người yêu thú cưng quản lý việc chăm sóc hằng ngày một cách có hệ thống.

Định vị đề xuất:

> **Pet care assistant for modern pet owners: quản lý hồ sơ thú cưng, nhắc lịch chăm sóc, lưu hồ sơ sức khỏe, theo dõi chi phí và nhận hỗ trợ từ AI.**

Ứng dụng không nên được định vị là một mạng xã hội thú cưng đơn thuần. Core value của phase 1 nên xoay quanh:

1. Pet Profile
2. Care Reminder
3. Medical Records
4. Pet Budget
5. Pet Care AI
6. Sitter Booking như nền tảng kết nối nhẹ
7. Photos/Memories như emotional engagement

## 2. Business direction

### Phase 1 monetization

Mô hình thu nhập giai đoạn đầu: **Free / Premium subscription**.

Premium nên bán theo giá trị:

> Chăm sóc thú cưng thông minh hơn với unlimited reminders, health records, AI assistant hiểu dữ liệu pet, budget insights và export/share hồ sơ.

Không nên khóa quá nhiều basic features ở Free plan. Free plan cần đủ tốt để user tạo pet, tạo reminder, lưu một số record và cảm nhận value trước khi bị upsell.

### Phase 2 expansion

Nếu phase 1 có traction tốt, mở rộng sang:

- Ecommerce/store
- Grooming & clinic appointment
- Training documents
- Events
- SOS
- Admin portal web app
- Marketplace/payment/commission cho sitter booking nếu có đủ supply/demand

## 3. Tech stack

```txt
Monorepo: pnpm workspace
Backend: apps/api — NestJS + Prisma + Supabase PostgreSQL
Mobile: apps/mobile — React Native + Expo
Database: Supabase PostgreSQL
AI Agent for coding: Codex 5.5
Future admin portal: apps/admin or apps/portal
```

## 4. Current phase 1 feature scope

### Implemented or partially implemented

- Pet Management
- Reminder
- Budget Statistics
- Photos Social
- Medical Records
- Sitter Booking backend or partial support; FE chưa hoàn chỉnh

### Not implemented yet

- Doctor AI / Pet Care AI
- Subscriptions
- Settings
- Complete sitter booking FE
- Admin portal

## 5. Recommended execution order

Agent nên thực hiện theo thứ tự sau:

```txt
1. Read all docs in /docs
2. Audit current codebase and Prisma schema
3. Create database redesign plan and migration checklist
4. Refactor Prisma schema and migrations
5. Refactor backend modules and implement missing APIs
6. Refactor mobile app architecture/screens/components
7. Implement missing mobile features
8. Add tests, validation, logging, and release checklist
9. Prepare admin portal roadmap only; do not implement admin portal yet
```

## 6. Project structure expectation

```txt
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   └── src
│   └── mobile
│       └── src
├── packages                 # optional shared package later
├── docs                     # project docs for agent/product/backend/mobile
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 7. Product principles

1. **Pet-centric data model**: most user actions should optionally or explicitly connect to a pet.
2. **Reminder drives retention**: reminders bring users back to the app.
3. **Medical Records builds trust**: health history makes the app sticky and premium-worthy.
4. **AI should be personalized**: AI should use pet profile + medical records + reminders, not only generic chat.
5. **Social is supporting, not core**: photos should support memories and community, not compete with Instagram/TikTok.
6. **Sitter booking should start lightweight**: connection platform first, payment/dispute later.
7. **Premium must feel practical**: unlimited, recurring, export, AI with context, advanced insights.

## 8. Important non-goals for phase 1

- Do not implement ecommerce yet.
- Do not implement in-app payment for sitter booking yet.
- Do not claim AI can replace veterinarians.
- Do not build a complex admin portal yet.
- Do not overcomplicate social feed algorithms.
- Do not introduce too many subscription tiers.

## 9. Documents in this package

```txt
docs/00-agent-operating-guide.md
docs/01-product-brief.md
docs/02-phase1-feature-spec.md
docs/03-database-redesign-plan.md
docs/04-backend-api-plan.md
docs/05-mobile-fe-plan.md
docs/06-subscriptions-entitlements.md
docs/07-doctor-ai-plan.md
docs/08-sitter-booking-plan.md
docs/09-testing-release-checklist.md
docs/10-admin-portal-roadmap.md
AGENT_TASK_PROMPT.md
```

## 10. Definition of done for phase 1

Phase 1 được xem là tốt khi:

- Database được quản lý bằng Prisma migrations thay vì SQL rời rạc trên Supabase.
- Backend API có validation, authorization, ownership checks, pagination và error handling nhất quán.
- Mobile app có navigation rõ, bottom sheet ổn định, form reusable, state/data fetching nhất quán.
- Free/Premium entitlement được enforce ở BE và hiển thị đúng ở FE.
- Pet Management, Reminder, Medical Records, Budget, Photos, Settings, Sitter Booking MVP và Doctor AI MVP có flow end-to-end.
- Có checklist test thủ công + unit/integration tests cho logic quan trọng.
