# Steam Center Management System

Steam Center uchun mijozlar, mahsulotlar va moliyaviy hisobotlarni boshqarish tizimi.

## 🚀 Xususiyatlar

- **👥 Mijozlar boshqaruvi** - Mijozlarni qo'shish, tahrirlash va qarzlarni kuzatish
- **💰 Qarz va to'lovlar** - Qarzlarni qo'shish va to'lovlarni qayd qilish
- **📦 Mahsulotlar** - Mahsulotlar va ombor boshqaruvi
- **💸 Xarajatlar** - Oylik xarajatlarni kuzatish
- **📊 Foyda hisoboti** - Oylik va yillik foyda tahlili
- **🔐 Xavfsizlik** - Telegram username bilan autentifikatsiya

## 🛠️ Texnologiyalar

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Database va authentication
- **PostgreSQL** - Database

## 📋 Talablar

- Node.js 22.17.1+
- npm 10.0.0+
- Supabase account

## ⚡ O'rnatish

1. **Repository clone qiling:**
```bash
git clone <repository-url>
cd steam-center
```

2. **Dependencies o'rnating:**
```bash
npm install
cd server && npm install
```

3. **Environment variables sozlang:**
```bash
# Root directory
cp .env.example .env

# Server directory
cp server/.env.example server/.env
```

4. **Supabase sozlash:**
- Supabase account yarating
- Yangi project yarating
- Database URL va API keys ni `.env` fayllariga qo'shing

5. **Database migration:**
- Supabase dashboard orqali migration fayllarini ishga tushiring

## 🚀 Ishga tushirish

### Development mode
```bash
# Frontend va backend birga ishga tushirish
npm run dev:full

# Yoki alohida:
npm run dev        # Frontend (port 5173)
npm run server     # Backend (port 3001)
```

### Production build
```bash
npm run build
```

## 📁 Loyiha strukturasi

```
steam-center/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server/                # Backend server
│   ├── routes/            # API routes
│   └── middleware/        # Express middleware
├── supabase/              # Database
│   └── migrations/        # SQL migrations
└── public/                # Static assets
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Tizimga kirish
- `POST /api/auth/logout` - Tizimdan chiqish
- `GET /api/auth/me` - Foydalanuvchi ma'lumotlari

### Mijozlar
- `GET /api/clients` - Barcha mijozlar
- `POST /api/clients` - Yangi mijoz qo'shish
- `PUT /api/clients/:id` - Mijozni yangilash
- `DELETE /api/clients/:id` - Mijozni o'chirish

### To'lovlar
- `GET /api/payments` - Barcha to'lovlar
- `POST /api/payments` - Yangi to'lov qo'shish
- `DELETE /api/payments/:id` - To'lovni o'chirish

### Qarzlar
- `GET /api/debts` - Barcha qarz yozuvlari
- `POST /api/debts` - Yangi qarz qo'shish
- `DELETE /api/debts/:id` - Qarz yozuvini o'chirish

### Mahsulotlar
- `GET /api/products` - Barcha mahsulotlar
- `POST /api/products` - Yangi mahsulot qo'shish
- `PUT /api/products/:id` - Mahsulotni yangilash
- `DELETE /api/products/:id` - Mahsulotni o'chirish
- `POST /api/products/:id/stock` - Ombor qo'shish
- `POST /api/products/:id/sale` - Sotuvni qayd qilish

## 🔒 Xavfsizlik

- JWT token bilan authentication
- Row Level Security (RLS) Supabase'da
- Telegram username bilan login
- Parol hash qilish

## 📱 Responsive Design

- Mobile-first approach
- Tablet va desktop uchun optimallashtirilgan
- Touch-friendly interface

## 🎨 UI/UX

- Modern va intuitiv dizayn
- Smooth animations va transitions
- Loading states
- Error handling
- Success notifications

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi.

## 📞 Aloqa

Savollar yoki takliflar uchun issue oching yoki pull request yuboring.

---

**Steam Center Management System** - Biznesingizni samarali boshqaring! 🎮💼