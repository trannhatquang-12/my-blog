-- ==============================================================================
-- HƯỚNG DẪN THIẾT LẬP CƠ SỞ DỮ LIỆU SUPABASE CHO BLOG
-- ==============================================================================
-- Bạn chỉ cần copy toàn bộ nội dung file này và dán vào Supabase:
-- 1. Truy cập vào Dashboard Supabase của bạn: https://supabase.com/dashboard
-- 2. Chọn dự án của bạn -> Chọn mục "SQL Editor" ở thanh menu bên trái.
-- 3. Bấm "New query", dán toàn bộ đoạn mã SQL dưới đây và bấm "Run".
-- ==============================================================================

-- 1. Bật extension UUID (mặc định Supabase đã bật)
create extension if not exists "uuid-ossp";

-- 2. Tạo bảng bài viết (posts)
create table if not exists public.posts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Kích hoạt tính năng Row Level Security (RLS) để bảo mật dữ liệu
alter table public.posts enable row level security;

-- 4. Xóa các policy cũ nếu đã tồn tại để tránh xung đột khi chạy lại
drop policy if exists "Cho phép mọi người xem bài viết" on public.posts;
drop policy if exists "Cho phép người dùng đã đăng nhập tạo bài viết" on public.posts;
drop policy if exists "Cho phép tác giả chỉnh sửa bài viết của mình" on public.posts;
drop policy if exists "Cho phép tác giả xóa bài viết của mình" on public.posts;

-- 5. Thiết lập các chính sách bảo mật (RLS Policies):

-- Policy 1: Bất kỳ ai (kể cả khách vãng lai chưa đăng nhập) đều có thể đọc bài viết
create policy "Cho phép mọi người xem bài viết"
on public.posts
for select
using (true);

-- Policy 2: Chỉ người dùng đã đăng nhập mới được tạo bài viết mới và gắn user_id của chính họ
create policy "Cho phép người dùng đã đăng nhập tạo bài viết"
on public.posts
for insert
with check (auth.uid() = user_id);

-- Policy 3: Chỉ tác giả của bài viết mới có quyền cập nhật bài của mình
create policy "Cho phép tác giả chỉnh sửa bài viết của mình"
on public.posts
for update
using (auth.uid() = user_id);

-- Policy 4: Chỉ tác giả của bài viết mới có quyền xóa bài của mình
create policy "Cho phép tác giả xóa bài viết của mình"
on public.posts
for delete
using (auth.uid() = user_id);

-- Hoàn tất thiết lập!

