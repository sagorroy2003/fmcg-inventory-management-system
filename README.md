# fmcg-inventory

fmcg-database/
├── config/
│   └── db.js            # MySQL connection pool goes here
├── controllers/
│   ├── productController.js # Handles the logic for product routes
│   └── supplierController.js
├── routes/
│   ├── productRoutes.js # Defines API endpoints (e.g., GET /api/products)
│   └── supplierRoutes.js
├── public/              # Your Vanilla Frontend lives here
│   ├── index.html
│   ├── css/
│   │   └── style.css    # Remember to use BEM naming (e.g., .btn--primary)
│   └── js/
│       └── app.js       # Vanilla JS to fetch() data from your backend
├── .env                 # Store your DB credentials here
├── .gitignore
├── server.js            # The main entry point
└── package.json
