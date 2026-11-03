"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Kiểm tra nếu người dùng đã đăng nhập thì tự động chuyển về trang chủ
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
      }
    }
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // Xử lý Đăng nhập
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          router.push("/");
          router.refresh();
        }
      } else {
        // Xử lý Đăng ký
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data?.session) {
          // Nếu Supabase tắt chế độ xác nhận email -> tự động đăng nhập luôn
          router.push("/");
          router.refresh();
        } else {
          setSuccessMsg(
            "Đăng ký thành công! Hãy kiểm tra hòm thư email của bạn để kích hoạt tài khoản hoặc thử đăng nhập."
          );
          setIsLogin(true);
        }
      }
    } catch (error) {
      let message = error.message;
      if (message.includes("Invalid login credentials")) {
        message = "Email hoặc mật khẩu không chính xác.";
      } else if (message.includes("User already registered")) {
        message = "Email này đã được đăng ký tài khoản.";
      } else if (message.includes("Password should be at least")) {
        message = "Mật khẩu phải có độ dài tối thiểu 6 ký tự.";
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 transition-all">
        {/* Tiêu đề & Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400 hover:opacity-80 transition mb-2"
          >
            ✍️ My Blog
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
            {isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {isLogin
              ? "Đăng nhập để chia sẻ những bài viết thú vị"
              : "Tham gia cộng đồng để đăng bài và tương tác"}
          </p>
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm flex items-start gap-2 animate-in fade-in">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Thông báo thành công */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-400 text-sm flex items-start gap-2 animate-in fade-in">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form xác thực */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            <span>
              {loading
                ? "Đang xử lý..."
                : isLogin
                ? "Đăng nhập"
                : "Đăng ký tài khoản"}
            </span>
          </button>
        </form>

        {/* Nút chuyển đổi qua lại giữa Đăng nhập và Đăng ký */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản rồi?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition cursor-pointer underline ml-1"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập tại đây"}
            </button>
          </p>

          <div className="mt-4">
            <Link
              href="/"
              className="text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 transition"
            >
              ← Trở về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

