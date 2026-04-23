# 👕 Indhumathi Garments - Frontend

A premium, high-performance e-commerce frontend for **Indhumathi Garments**, specializing in pure cotton women's innerwear. Built with React, TypeScript, and Tailwind CSS for a seamless, elite shopping experience.

---

## 🎨 Product Highlights
Indhumathi Garments has been a trusted name for over two decades, delivering comfort and elegance through natural fabrics.
- **100% Pure Cotton**: Breathable, soft, and skin-friendly garments tailored for all-day comfort.
- **Premium Quality**: Each piece is crafted with handcrafted care and attention to detail.
- **Skin Safe**: Naturally hypoallergenic materials, safe for sensitive skin.
- **Diverse Collection**: From slips and camisoles to high-quality bloomers and essentials.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Backend API**: Ensure the [Backend Services](../indhumathiGarments-backend) are running.

### 2. Environment Setup
Create a `.env` file in the root directory and add the backend API URL:
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Installation
```bash
# Install dependencies
npm install
```

### 4. Run Development Server
```bash
# Start the development server
npm run dev
```
The application will be available at `http://localhost:8080`.

---

## 🛠 Tech Stack
- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## ✨ Features
- **Elite UI/UX**: Premium "lite pink" theme with smooth transitions and backdrop-blur effects.
- **Amazon/Flipkart-Style Checkout**: A streamlined 4-step accordion checkout process.
- **Responsive Profile**: Multi-tab user dashboard for orders, addresses, and wishlist.
- **Real-time Synchronization**: Seamless integration with the backend for live stock and order tracking.
- **Secure Payments**: Integration with Razorpay for safe transactions.

---

## 📂 Project Structure
- `src/components`: Reusable UI elements and layout components.
- `src/pages`: Main application pages (Home, Products, Profile, Checkout, etc.).
- `src/stores`: Zustand stores for global state management (Auth, Cart, Orders).
- `src/hooks`: Custom React hooks for data fetching and site settings.
- `src/assets`: Images, logos, and global design assets.

---

## 🔒 Security
- **JWT Protection**: Secure authentication handled via cookies.
- **Google OAuth**: One-tap sign-in for user convenience.
- **Zod Validation**: Robust frontend validation for all user inputs.
