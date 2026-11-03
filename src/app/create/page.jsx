"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CreatePostPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    async function getInitialUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Lỗi khi kiểm tra đăng nhập:", err);
      } finally {
        setCheckingAuth(false);
      }
    }

    getInitialUser();
  }, []);

  // Xử lý nộp form đăng bài
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.");
      return;
    }

    if (!user) {
      setErrorMsg("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("posts").insert([
        {
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
        },
      ]);

      if (error) {
        throw error;
      }

      // Lưu thành công, chuyển hướng về trang chủ
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Lỗi tạo bài viết:", error);
      setErrorMsg(
        error.message ||
          "Không thể lưu bài viết. Vui lòng kiểm tra lại cấu hình CSDL Supabase."
      );
      setSubmitting(false);
    }
  };

  // Trạng thái đang kiểm tra phiên đăng nhập
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400">
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
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
          <span className="text-base font-medium">Đang kiểm tra thông tin...</span>
        </div>
      </div>
    );
  }

  // Trường hợp chưa đăng nhập: Hiển thị cảnh báo & nút dẫn đến trang Login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">
            Yêu cầu Đăng nhập
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 text-sm mb-6">
            Bạn cần phải đăng nhập tài khoản để có quyền tạo và đăng tải bài viết mới lên trang Blog.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition text-center"
            >
              Đăng nhập ngay
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded-xl transition text-center"
            >
              Về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện Form đăng bài khi đã đăng nhập
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Thanh điều hướng quay lại */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            ← Quay lại Trang chủ
          </Link>
          <div className="text-xs bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-3 py-1 rounded-full">
            Tác giả: <span className="font-semibold">{user.email}</span>
          </div>
        </div>

        {/* Khung Form soạn thảo */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-10">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-5 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              ✍️ Viết bài mới
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Chia sẻ những suy nghĩ, kiến thức hoặc câu chuyện của bạn với mọi người.
            </p>
          </div>

          {/* Lỗi nếu có */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề ấn tượng..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium transition"
              />
            </div>

            {/* Nội dung */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Nội dung bài viết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Viết nội dung bài đăng của bạn ở đây..."
                required
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition leading-relaxed"
              ></textarea>
            </div>

            {/* Các nút bấm */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition cursor-pointer text-sm"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer text-sm"
              >
                {submitting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                <span>{submitting ? "Đang đăng bài..." : "🚀 Đăng bài"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

