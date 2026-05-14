# KTX Manage

Project quản lý KTX với tech stack:

- Frontend: ReactJS + Vite + Bootstrap
- Backend: Django + Django REST Framework
- Database: PostgreSQL
- Database UI: pgAdmin tại `http://localhost:5050`

## Chạy bằng Docker

```powershell
docker compose up --build
```

Sau khi chạy:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Admin Django: `http://localhost:8000/admin`
- pgAdmin: `http://localhost:5050`

Tài khoản mặc định của pgAdmin:

- Email: `admin@ktx.local`
- Password: `admin123`

Thông tin database mặc định:

- Host trong Docker network: `db`
- Port: `5432`
- Database: `ktx_manage`
- User: `ktx_user`
- Password: `ktx_password`

## Biến môi trường

File mẫu nằm tại `backend/.env.example`. Hiện tại, dự án đã được cấu hình để sử dụng `backend/.env` và `.env` ở thư mục gốc.

Nhóm SMTP:

- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USE_TLS`
- `EMAIL_USE_SSL`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`

Nhóm Cloudinary:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER`

Nhóm PayOS:

- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`
- `PAYOS_RETURN_URL`
- `PAYOS_CANCEL_URL`
- `PAYOS_WEBHOOK_URL`

## Lệnh hữu ích

Tạo migration:

```powershell
docker compose exec backend python manage.py makemigrations
```

Chạy migration:

```powershell
docker compose exec backend python manage.py migrate
```

Tạo admin user:

```powershell
docker compose exec backend python manage.py createsuperuser
```

## API chính

- `POST /api/auth/login/`
- `GET /api/buildings/`
- `GET /api/floors/`
- `GET /api/rooms/`
- `GET /api/students/`
- `GET /api/announcements/`
- `GET /api/services/`
- `GET /api/registrations/`
- `GET /api/registrations/room-options/`
- `POST /api/registrations/upload-portrait/`
- `POST /api/registrations/create-payment/`
- `POST /api/registrations/confirm-payment/`
- `POST /api/registrations/payos-webhook/`
- `POST /api/registrations/{id}/approve/`

Các endpoint quản trị đều hỗ trợ CRUD theo chuẩn Django REST Framework. Database được tạo theo hướng code-first từ model trong từng app nghiệp vụ:

- `backend/apps/buildings/models.py`
- `backend/apps/rooms/models.py`
- `backend/apps/students/models.py`
- `backend/apps/announcements/models.py`
- `backend/apps/services/models.py`
- `backend/apps/registrations/models.py`

Mỗi app có migration ban đầu riêng trong thư mục `migrations/`. `backend/apps/core` chỉ giữ phần dùng chung như `TimestampedModel`, `health_check` và router API tổng.
