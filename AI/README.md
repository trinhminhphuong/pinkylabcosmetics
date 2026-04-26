# PinkyLab AI Service

FastAPI service cho các tính năng AI độc lập với Backend Spring Boot.

## Chức năng

- Recommendation System: `POST /api/recommendations`
- Event Tracking: `POST /api/events`
- Admin Analytics: `GET /api/analytics/summary`

## Chạy local

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 run.py
```

Mặc định service dùng catalog seed giống Frontend mock để không phụ thuộc Backend. Khi Frontend đã chuyển sang dùng UUID từ Backend, cấu hình:

```bash
export AI_BACKEND_BASE_URL=http://localhost:8080/api/v1
```

## Port mặc định

- AI service: `http://localhost:8010`
- Frontend gọi AI qua: `http://localhost:8010/api`
- Frontend dev server: `http://localhost:5173`
- Backend Spring Boot: `http://localhost:8080/api/v1`

Khi Backend chưa chạy, AI service tự fallback sang catalog seed để Recommendation vẫn hoạt động.

## Ghi chú kiến trúc

Service này chỉ nằm trong thư mục `AI/` và lưu event bằng SQLite ở `AI/app/data/ai.db`. Backend không cần thay đổi.
