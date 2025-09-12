import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '../components/Header';
import { AuthProvider } from '../contexts/AuthContext';
import { WishlistProvider } from '../contexts/WishlistContext';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Aniga's Attire",
    description: "Your Fashion Destination",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Razorpay SDK for payment integration */}
                <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <WishlistProvider>
                        <Header />
                        {children}
                    </WishlistProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
