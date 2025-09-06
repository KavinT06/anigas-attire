# Anigas Attire - E-commerce Frontend

A modern e-commerce frontend built with Next.js, featuring user authentication, product catalog, shopping cart, wishlist functionality, and comprehensive order management.

## 🚀 Features

- **User Authentication**: Secure login with JWT tokens and automatic refresh
- **Product Catalog**: Browse products by categories with search and filtering
- **Quick Buy Modal**: Instant product purchase with variant selection
- **Shopping Cart**: Add items to cart, manage quantities, and proceed to checkout
- **Wishlist**: Save products for later with persistent storage
- **Order Management**: Complete order lifecycle - place orders, view history, track status
- **Checkout Process**: Comprehensive checkout with address management and multiple payment methods
- **Responsive Design**: Optimized for mobile and desktop devices
- **Real-time Updates**: Dynamic cart and wishlist counters

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand for cart, React Context for auth and wishlist
- **HTTP Client**: Axios with custom instance and interceptors
- **UI Components**: Custom components with beautiful gradients and animations
- **Authentication**: JWT with automatic token refresh
- **Notifications**: Custom toast notification system
- **Payment Integration**: Razorpay, PhonePe, PayTM, and COD support

## 📦 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/KavinT06/anigas-attire.git
cd anigas-attire
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment Setup**:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5025
```

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

## 🏗 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Authentication pages
│   ├── orders/                # Orders management
│   │   ├── page.jsx           # Orders list with pagination
│   │   └── [id]/page.jsx      # Order details
│   ├── cart/                  # Shopping cart
│   ├── categories/            # Product categories
│   ├── checkout/              # Checkout process with payments
│   ├── components/            # Shared UI components
│   │   ├── Header.jsx         # Navigation header
│   │   ├── Hero.jsx           # Homepage hero section
│   │   ├── CategoryList.jsx   # Product categories
│   │   ├── QuickBuyModal.jsx  # Quick purchase modal
│   │   └── Toast.jsx          # Notification system
│   ├── product/[id]/          # Product details
│   ├── products/              # Product listing
│   └── wishlist/              # User wishlist
├── components/                # Global components
│   └── ProtectedRoute.jsx     # Authentication wrapper
├── contexts/                  # React contexts
│   ├── AuthContext.jsx        # Authentication state
│   └── WishlistContext.jsx    # Wishlist state
├── hooks/                     # Custom React hooks
├── services/                  # API services
│   └── api/
│       └── orders.js          # Complete orders API layer
├── store/                     # State management
│   └── cartStore.js           # Cart state (Zustand)
└── utils/                     # Utility functions
    ├── apiConfig.js           # API configuration
    ├── auth.js                # Authentication helpers
    ├── axiosInstance.js       # HTTP client setup
    └── wishlistApi.js         # Wishlist API calls
```

## 🛒 Order Management Features

### Complete Order Lifecycle
- **Order Placement**: Comprehensive checkout with cart synchronization
- **Order History**: Paginated order list with status indicators
- **Order Details**: Complete order information including items, address, and payment
- **Address Management**: Add, select, and manage delivery addresses
- **Payment Integration**: Multiple payment gateways with secure processing

### Backend Integration
- **Cart Synchronization**: Frontend cart syncs with backend before order placement
- **Variant Mapping**: Efficient product variant ID resolution
- **Error Handling**: Robust error handling with user-friendly messages
- **State Management**: Consistent state across checkout flow

## 🔧 API Integration

The frontend integrates with a Django REST API backend:

### Authentication Module (`/api/auth/`)
- Login: `/api/auth/login/`
- Refresh Token: `/api/auth/refresh/`
- Send OTP: `/api/auth/send-otp/`

### E-commerce Module (`/api/ecom/`)
- Products: `/api/ecom/products/`
- Categories: `/api/ecom/categories/`
- Cart: `/api/ecom/cart/`
- Orders: `/api/ecom/orders/`
- Addresses: `/api/ecom/address/`
- Wishlist: `/api/ecom/wishlist/`
- Payment: `/api/ecom/payment/`

## 🚀 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Responsive Design

Built with mobile-first approach using Tailwind CSS:
- Responsive navigation with mobile menu
- Adaptive product grids and layouts
- Touch-friendly buttons and interactions
- Optimized images with Next.js Image component

## 🎯 Performance Features

- **Next.js App Router** for optimal performance
- **Image Optimization** with Next.js Image component
- **Code Splitting** with dynamic imports
- **Lazy Loading** for product images
- **Efficient State Management** for smooth interactions
- **Batch API Requests** for optimal network usage

## 🔒 Security

- Secure JWT authentication with automatic refresh
- Protected routes with authentication checks
- Input validation and sanitization
- Secure API communication with interceptors

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using Next.js and modern web technologies.
