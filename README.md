# Campus Lost & Found Items

Backend API for a campus lost & found platform where students can report
lost or found items, browse reports, search and filter them, upload
images, and update the status when an item is recovered.

Built as a team graduation project (ITI) with **Express + MongoDB (Mongoose)**.

---

## Features

- User registration & login with **JWT** authentication
- **Student / Admin** roles
- Lost & Found item reports (CRUD)
- Search, filtering & pagination
- Image upload & management (`multer`)
- Categories management
- Admin panel: manage users & item reports
- HTTP request logging (`morgan`)
- Consistent error format across the whole API
- Ready-to-import **Postman collection**

---

## Tech Stack

| Layer    | Technology                 |
|----------|----------------------------|
| Runtime  | Node.js (CommonJS)         |
| Framework| Express 5                  |
| Database | MongoDB Atlas (Mongoose 9) |
| Auth     | JWT (`jsonwebtoken`) + `bcryptjs` |
| Uploads  | `multer`                   |
| Logging  | `morgan`                   |
| Validation | `validator`               |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (a free MongoDB Atlas cluster works)

### 1. Install

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
PORT=6000
DB_CSTRING=mongodb://<username>:<password>@<host>:<port>/Campus
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
```

- `DB_CSTRING` — your MongoDB connection string.
- `JWT_SECRET` — a long random secret used to sign tokens (keep it secret).
- `JWT_EXPIRES_IN` — token lifetime (e.g. `7d` = 7 days).

### 3. Run

```bash
npm run dev
```

Server starts on `http://localhost:6000`.

---

## Test Users

Registered users for quick testing:

| Email                 | Password     | Role    |
|-----------------------|--------------|---------|
| `admin@uni.edu`       | `adminpass123` | admin |
| `peter.test@uni.edu`  | `secret123`    | student|

> Register your own account with `POST /api/auth/register` — new users
> get the `student` role by default.

---

## API Overview

All protected routes expect: `Authorization: Bearer <token>`

### Auth & Users

| Method | Path               | Access  | Description                    |
|--------|--------------------|---------|--------------------------------|
| POST   | `/api/auth/register` | public | Create account + get token     |
| POST   | `/api/auth/login`    | public | Log in + get token             |
| GET    | `/api/users/me`      | any user| Get your profile              |
| PATCH  | `/api/users/me`      | any user| Update your name              |
| GET    | `/api/users`         | admin   | List all users                |

### Items

| Method | Path            | Access  | Description                          |
|--------|-----------------|---------|--------------------------------------|
| POST   | `/api/items`     | any user| Create item report (`type` lost/found)|
| GET    | `/api/items`     | public  | List / search / filter / paginate    |
| GET    | `/api/items/:id` | public  | Get one item (owner's name/email)    |
| PATCH  | `/api/items/:id` | owner   | Update details and/or status         |
| DELETE | `/api/items/:id` | owner   | Delete item                          |

Query params for `GET /api/items`: `title`, `description`, `category`,
`type`, `location`, `status`, `from`, `to`, `page`, `limit` (max 100).
Results are sorted newest-first.

### Images

| Method | Path                               | Access | Description          |
|--------|------------------------------------|--------|----------------------|
| POST   | `/api/items/:id/images`            | owner  | Upload images (JPG/PNG/WebP, max 5, max 5MB each) |
| DELETE | `/api/items/:id/images/:filename`  | owner  | Remove an image      |
| GET    | `/uploads/:filename`               | public | View an image        |

### Categories

| Method | Path                   | Access | Description        |
|--------|------------------------|--------|--------------------|
| GET    | `/api/categories`      | public | List categories    |
| POST   | `/api/categories`      | admin  | Create category    |
| PATCH  | `/api/categories/:id`  | admin  | Rename category    |
| DELETE | `/api/categories/:id`  | admin  | Delete category    |

### Admin

| Method | Path                                | Access | Description            |
|--------|-------------------------------------|--------|------------------------|
| GET    | `/api/admin/users/:id`              | admin  | View any user          |
| PATCH  | `/api/admin/users/:id/role`         | admin  | Change user role       |
| DELETE | `/api/admin/users/:id`              | admin  | Delete a user          |
| DELETE | `/api/admin/items/:id`              | admin  | Delete any item report |
| PATCH  | `/api/admin/items/:id/status`       | admin  | Force item status      |

---

## Error Format

Every error follows the same shape:

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Description of what went wrong"
}
```

---

## Postman Collection

Import `postman_collection.json` into Postman:

1. Open Postman → **Import** → select the file.
2. In **Auth → Login**, click **Send** — the token is saved to the
   `token` variable automatically.
3. Set `{{baseUrl}}` if your server runs elsewhere, and fill the
   `{{itemId}}` / `{{userId}}` / `{{categoryId}}` variables to test the
   `:id` requests.

---

## Project Structure

```
src/
├── app.js                     # express app: middleware, routers, error handler
├── controllers/               # route handlers (auth, user, item, category, admin)
├── data/                      # database connection
├── middlewares/               # auth (protect/authorize), upload (multer)
├── models/                    # mongoose schemas (User, Item, Category)
├── Routers/                   # the API routes
├── services/                  # (reserved)
└── utils/                     # AppError, generateToken
uploads/                       # uploaded images (gitignored)
server.js                      # entry point (loads .env, connects DB, starts server)
postman_collection.json        # ready-to-import Postman collection
```

---

## Work Division

Built by a team of five, each responsible for one part:

1. Authentication & Users
2. Lost & Found Items
3. Search, Filtering & Pagination
4. Image & File Management
5. Administration & System Quality