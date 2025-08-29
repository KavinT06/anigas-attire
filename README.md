# Anigas Attire - E-commerce Frontend

A modern e-commerce frontend built with Next.js, featuring user authentication, product catalog, shopping cart, wishlist functionality, and order management.

## 🚀 Features

- **User Authentication**: Secure login/logout with JWT tokens
- **Product Catalog**: Browse products by categories with search and filtering
- **Shopping Cart**: Add items to cart, manage quantities, and proceed to checkout
- **Wishlist**: Save products for later with persistent storage
- **Order Management**: Place orders and view order history
- **Profile Management**: Update user profile information
- **Responsive Design**: Optimized for mobile and desktop devices
- **Real-time Updates**: Dynamic cart and wishlist counters

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand for cart, React Context for auth and wishlist
- **HTTP Client**: Axios with custom instance
- **UI Components**: Custom components with Heroicons
- **Authentication**: JWT with cookies
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd anigas-attire
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment Setup**:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5025
```

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Authentication pages
│   ├── account/orders/        # Order history
│   ├── cart/                  # Shopping cart
│   ├── categories/            # Product categories
│   ├── checkout/              # Checkout process
│   ├── components/            # Reusable UI components
│   ├── product/[id]/          # Product detail pages
│   ├── products/              # Product listing
│   ├── profile/               # User profile
│   └── wishlist/              # Wishlist management
├── components/                # Global components
├── contexts/                  # React Context providers
├── hooks/                     # Custom React hooks
├── store/                     # Zustand stores
├── utils/                     # Utility functions and API calls
└── assets/                    # Static assets
```

## 🔧 Configuration

### Backend Integration
The application is designed to work with a Django REST API backend. It includes fallback to localStorage for development when the backend is not available.

### API Endpoints
Based on your Django backend structure:

**Authentication Module (`/api/auth/`):**
- Login: `/api/auth/login/`
- Refresh Token: `/api/auth/refresh/`
- Send OTP: `/api/auth/send-otp/`

**E-commerce Module (`/api/ecom/`):**
- Categories: `/api/ecom/categories/`
- Products: `/api/ecom/products/`
- Category Products: `/api/ecom/category-products/`
- Wishlist: `/api/ecom/wishlist/`
- Coupon: `/api/ecom/coupon/`
- Address: `/api/ecom/address/`
- Cart: `/api/ecom/cart/`
- Orders: `/api/ecom/orders/`
- Payment: `/api/ecom/payment/`

**Alternative Authentication (`/api/authentication/`):**
- Refresh: `/api/authentication/refresh/`

**Profile (Not Available):**
- Profile endpoints are not implemented in the backend
- App uses localStorage fallback for profile data
- User info comes from `/api/auth/me/` when available

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

## 🧪 Development

### Code Quality
- ESLint configured for Next.js best practices
- Consistent code formatting
- Clean component architecture
- Proper error handling

### Key Features Implementation

#### Authentication Flow
- JWT token management with cookies
- Protected routes with `ProtectedRoute` component
- Automatic token refresh handling

#### Cart Management
- Persistent cart with localStorage
- Real-time updates across components
- Support for product variants (sizes)

#### Wishlist System
- Backend-first with localStorage fallback
- Optimistic updates for better UX
- Type-safe ID matching across different data structures

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Responsive navigation with mobile menu
- Touch-friendly UI elements
- Optimized images and loading states

## 🔒 Security

- Secure authentication with JWT
- CSRF protection
- Input validation and sanitization
- Secure API communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using Next.js and modern web technologies.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
