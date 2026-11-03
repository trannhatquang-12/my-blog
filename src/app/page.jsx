"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Lắng nghe trạng thái xác thực người dùng
  useEffect(() => {
    // 1. Kiểm tra session hiện tại
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    checkUser();

    // 2. Lắng nghe thay đổi trạng thái Auth (đăng nhập / đăng xuất)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Lấy danh sách bài viết lần đầu
  useEffect(() => {
    let isMounted = true;

    async function loadInitialPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          throw error;
        }
        setPosts(data || []);
      } catch (err) {
        if (!isMounted) return;
        console.error("Lỗi khi tải bài viết:", err);
        setErrorMsg("Không thể tải danh sách bài viết. Vui lòng kiểm tra lại Supabase.");
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    }

    loadInitialPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hàm làm mới danh sách bài viết khi người dùng bấm nút "Làm mới"
  const handleRefresh = useCallback(async () => {
    setLoadingPosts(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      setPosts(data || []);
    } catch (err) {
      console.error("Lỗi khi tải bài viết:", err);
      setErrorMsg("Không thể tải danh sách bài viết. Vui lòng kiểm tra lại Supabase.");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // Xử lý đăng xuất
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Định dạng ngày giờ hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Tên web */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight hover:opacity-90 transition"
          >
            <span>✍️</span>
            <span>My Blog</span>
          </Link>

          {/* Khu vực trạng thái người dùng & Action buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              // Đã đăng nhập
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {user.email}
                </span>

                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Viết bài mới</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-2 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs sm:text-sm font-medium rounded-xl transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              // Khách (Chưa đăng nhập)
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/create"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Viết bài mới
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Banner / Tiêu đề danh mục */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Khám phá bài viết mới nhất
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-zinc-400 max-w-xl">
              Nơi giao lưu, cập nhật tin tức và chia sẻ những kiến thức bổ ích từ cộng đồng.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="self-center sm:self-auto text-xs text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 flex items-center gap-1 transition cursor-pointer"
            title="Làm mới bài viết"
          >
            <svg
              className={`w-3.5 h-3.5 ${loadingPosts ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>

        {/* Thông báo lỗi khi lấy bài viết */}
        {errorMsg && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={handleRefresh}
              className="text-amber-800 dark:text-amber-200 font-semibold underline text-xs cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Trạng thái đang tải */}
        {loadingPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm animate-pulse flex flex-col justify-between h-64"
              >
                <div>
                  <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-5/6"></div>
                    <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4 pt-4 border-t border-slate-100 dark:border-zinc-800"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Trạng thái chưa có bài viết nào */
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">
              Chưa có bài viết nào được đăng
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-6">
              Hãy là người đầu tiên chia sẻ suy nghĩ và câu chuyện của bạn đến với mọi người!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Tạo bài viết đầu tiên</span>
            </Link>
          </div>
        ) : (
          /* Danh sách thẻ bài viết dạng Card sạch sẽ */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thời gian đăng */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-zinc-500 mb-3">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <time dateTime={post.created_at}>
                      {formatDate(post.created_at)}
                    </time>
                  </div>

                  {/* Tiêu đề */}
                  <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-3 leading-snug">
                    {post.title}
                  </h2>

                  {/* Nội dung bài viết */}
                  <p className="text-slate-600 dark:text-zinc-300 text-sm whitespace-pre-line line-clamp-4 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Footer thẻ */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500">
                  <span className="flex items-center gap-1">
                    <span>👤</span>
                    <span>Tác giả blog</span>
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    Đọc tiếp →
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>© {new Date().getFullYear()} My Blog. Xây dựng với Next.js & Supabase.</p>
      </footer>
    </div>
  );
}
