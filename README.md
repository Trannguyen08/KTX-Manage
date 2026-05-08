# KTX Manage

Project quản lý KTX với tech stack:

- Frontend: ReactJS + Vite
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

Các endpoint quản trị đều hỗ trợ CRUD theo chuẩn Django REST Framework. Database được tạo theo hướng code-first từ model trong từng app nghiệp vụ:

- `backend/apps/buildings/models.py`
- `backend/apps/rooms/models.py`
- `backend/apps/students/models.py`
- `backend/apps/announcements/models.py`
- `backend/apps/services/models.py`

Mỗi app có migration ban đầu riêng trong thư mục `migrations/`. `backend/apps/core` chỉ giữ phần dùng chung như `TimestampedModel`, `health_check` và router API tổng.
# KTX-Manage
