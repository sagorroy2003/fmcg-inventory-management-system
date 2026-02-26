# 📦 FMCG Inventory Management System

A lightweight, full-stack inventory management system built for Fast-Moving Consumer Goods (FMCG) businesses. Manage products, suppliers, customers, and sales — all from a clean web interface.

---

## ✨ Features

- 🛒 **Product Management** — Add, update, and track inventory
- 🏭 **Supplier Management** — Maintain supplier records
- 👥 **Customer Management** — Keep customer data organised
- 📊 **Sales Tracking** — Log and monitor sales transactions
- ❤️ **Health Check API** — Monitor server status at a glance

---

## 🛠️ Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Backend  | Node.js · Express 5 |
| Database | MySQL (mysql2)       |
| Frontend | Vanilla JS · HTML · CSS |
| Tooling  | dotenv · nodemon    |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL server running locally

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sagorroy2003/fmcg-inventory-management-system.git
cd fmcg-inventory-management-system

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env   # then fill in your DB credentials

# 4. Start the development server
npm run dev
```

Open your browser at **http://localhost:3000**

---

## 📁 Project Structure

```
fmcg-inventory-management-system/
├── config/
│   └── db.js               # MySQL connection pool
├── controllers/
│   ├── productController.js
│   ├── supplierController.js
│   ├── customerController.js
│   └── salesController.js
├── routes/
│   ├── productRoutes.js
│   ├── supplierRoutes.js
│   ├── customerRoutes.js
│   └── salesRoutes.js
├── public/                 # Vanilla JS frontend
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── server.js               # Entry point
└── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| GET    | /api/products     | List all products  |
| GET    | /api/suppliers    | List all suppliers |
| GET    | /api/customers    | List all customers |
| GET    | /api/sales        | List all sales     |
| GET    | /api/health       | Server health check|

---

## 📜 License

Licensed under the [ISC License](LICENSE).

---

> Built with ❤️ by [Sagor Roy](https://github.com/sagorroy2003)
