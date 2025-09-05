"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";

export default function AddressesProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookie.get("accessToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return children;
}
