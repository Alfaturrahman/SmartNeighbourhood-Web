"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/modules/authService";
import { tokenManager } from "@/lib/tokenManager";
import Swal from "sweetalert2";

/* ================================
   ROLE BASED REDIRECT HELPER
================================ */
const getRedirectByRole = (role?: string) => {

  console.log("Determining redirect path for role:", role);
  switch (role) {
    case "rw":
      return "/rt-management";

    case "rt":
      return "/warga-management";  

    case "warga":
      return "/announcements";

    default:
      return "/";
  }
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================================
     HANDLE LOGIN
  ================================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login...");

      const response = await authService.login(email, password);

      console.log("Login response:", response);

      // Backend expected:
      // { access, refresh, user, message }

      if (!response?.access || !response?.user) {
        throw new Error("Response tidak valid dari server");
      }

      /* ==========================
         SAVE AUTH DATA
      ========================== */
      tokenManager.setTokens(response.access, response.refresh);
      tokenManager.setUser(response.user);

      /* ==========================
         SUCCESS ALERT
      ========================== */
      await Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: response.message || "Selamat datang kembali",
        timer: 1500,
        showConfirmButton: false,
      });

      /* ==========================
         ROLE REDIRECT
      ========================== */
      const redirectPath = getRedirectByRole(response.user.role);

      console.log("Redirecting to:", redirectPath);

      // replace supaya tidak bisa back ke login
      router.replace(redirectPath);
    } catch (err: any) {
      console.error("Login error:", err);

      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err.message ||
        "Terjadi kesalahan saat login";

      setError(errorMessage);

      await Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================
     UI
  ================================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003366] via-[#004d80] to-[#003366] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#66CC66] rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-8 right-0 w-96 h-96 bg-[#FF9500] rounded-full blur-3xl opacity-20 animate-pulse delay-2000"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#003366] rounded-xl flex items-center justify-center text-white text-xl font-bold">
                🏘️
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Smart Neighborhood
            </h1>

            <p className="text-sm text-gray-600">
              Kelola komunitas dengan mudah
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold py-3 rounded-lg transition-all mt-6 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Sedang masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Belum punya akun? Hubungi administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}