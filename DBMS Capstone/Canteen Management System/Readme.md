# A Block Canteen — Canteen Management System
K.R. Mangalam University · React + Node/Express API + MySQL

## Easiest way to run (Windows)
1. Install Node.js (LTS) from https://nodejs.org  and XAMPP (for MySQL).
2. Open XAMPP and click **Start** next to **MySQL**.
3. Double-click **START.bat**
4. Wait. The website opens at http://localhost:5173

The database is created automatically the first time. (Mac/Linux: `bash START.sh`)
If your MySQL has a password (for example MySQL Workbench / MySQL Server), type it in `backend/.env` after `DB_PASSWORD=`. XAMPP needs no change.

## Logins
- Customers: Sign up with email + password on the site (saved in the `users` table, password hashed).
- Admin: open the Admin tab, password **123456**.

## Folders
```
frontend/   React website       -> http://localhost:5173
backend/    Express API         -> http://localhost:5000
backend/schema.sql              -> tables + 58 menu items (loaded automatically on first run)
backend/public/images/          -> food photos
```

## Run by hand (instead of START.bat)
Terminal 1:  `cd backend`  `npm install`  `npm start`
Terminal 2:  `cd frontend` `npm install`  `npm run dev`

## API
| Method | URL | Who |
|---|---|---|
| GET | /api/categories, /api/menu | everyone |
| POST | /api/auth/register, /api/auth/login | customer |
| GET | /api/auth/me | customer (JWT) |
| POST | /api/orders | customer (JWT, transaction) |
| GET | /api/orders/mine | customer (JWT) |
| GET | /api/orders | admin (JWT) |
| PATCH | /api/orders/:id/status | admin (JWT) |
| POST | /api/admin/login | admin |
| GET | /api/admin/stats, /api/admin/users | admin (JWT) |
| POST / PATCH / DELETE | /api/menu, /api/menu/:id | admin (JWT) |

## Tables
categories, menu_items, users, orders, order_items, admins (+ view active_orders)

## Photos
All 58 items have a photo in `backend/public/images/` (file name = item name, e.g. `fries.jpg`).
To change a photo, replace the file with the same name and refresh the page.
To add a photo for a new item, save it as `item-name.jpg` and restart the back end: it attaches the photo automatically.
