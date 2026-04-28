# PinkyLab-cosmetics

## Cấu trúc thư mục

Repo hiện gồm 3 phần chính: `Backend`, `Frontend`, và `AI`.

```txt
Backend/
├── Dockerfile
├── docker-compose.yml
├── pom.xml
├── mvnw / mvnw.cmd
├── .env.example
├── src/
│   ├── main/
│   │   ├── java/com/example/pinkylab/
│   │   │   ├── PinkylabApplication.java
│   │   │   ├── auth/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   ├── order/
│   │   │   ├── payment/
│   │   │   ├── news/
│   │   │   ├── user/
│   │   │   └── shared/
│   │   │       ├── aop/
│   │   │       ├── base/
│   │   │       ├── config/
│   │   │       ├── constant/
│   │   │       ├── dto/
│   │   │       ├── exception/
│   │   │       ├── helper/
│   │   │       ├── security/
│   │   │       ├── utils/
│   │   │       └── web/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/example/pinkylab/
│           └── PinkylabApplicationTests.java
```

```txt
Frontend/
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── index.html
├── .env.example
├── public/
│   ├── banner-30-4.png
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── assets/
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    ├── components/
    │   ├── AiRecommendations.jsx
    │   ├── ChatWidget.jsx
    │   ├── Footer.jsx
    │   ├── Navbar.jsx
    │   └── ProductCard.jsx
    ├── context/
    │   └── store.jsx
    ├── data/
    │   └── products.js
    ├── pages/
    │   ├── AccountPage.jsx
    │   ├── AiAnalyticsPage.jsx
    │   ├── CartPage.jsx
    │   ├── CheckoutPage.jsx
    │   ├── HomePage.jsx
    │   ├── LoginPage.jsx
    │   ├── ProductDetailPage.jsx
    │   ├── ProductsPage.jsx
    │   └── WishlistPage.jsx
    └── services/
        └── aiClient.js
```

```txt
AI/
├── README.md
├── requirements.txt
├── run.py
├── .env.example
├── .gitignore
└── app/
    ├── __init__.py
    ├── main.py
    ├── config.py
    ├── database.py
    ├── schemas.py
    ├── data/
    │   └── seed_products.json
    ├── routers/
    │   ├── __init__.py
    │   ├── analytics.py
    │   ├── catalog.py
    │   ├── events.py
    │   └── recommendations.py
    └── services/
        ├── __init__.py
        ├── analytics_service.py
        ├── backend_client.py
        ├── catalog_service.py
        ├── event_service.py
        ├── recommendation_service.py
        └── text_processing.py
```

Các thư mục/file runtime như `node_modules`, `dist`, `target`, `__pycache__`, `.env`, và database local `AI/app/data/ai.db` không được liệt kê trong cấu trúc trên.
