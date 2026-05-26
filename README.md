# TosTinh

TosTinh is a Laravel API backend plus React frontend electronics store.

## Folder Structure

```text
project_rupp_y3/
  backend/      Laravel API
  frontend/     React + Vite website
  docker-compose.yml
```

## Best Way To Run: Docker

Use this if you send the project as a zip file to a friend.

### 1. Install Required Apps

Your friend needs:

- Docker
- Docker Compose

Check Docker:

```bash
docker --version
docker compose version
```

### 2. Unzip Project

```bash
unzip project_rupp_y3.zip
cd project_rupp_y3
```

### 3. Create Backend Env File

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and change database config to MySQL Docker:
 
```env
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=tostinh
DB_USERNAME=tostinh
DB_PASSWORD=secret
```

For email, Telegram, and Bakong, fill these only if needed:

```env
MAIL_MAILER=log
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
BAKONG_TOKEN=
BAKONG_BANK_ACCOUNT=
BAKONG_MERCHANT_NAME=
BAKONG_PHONE=
```

### 4. Create Frontend Env File

```bash
cp frontend/.env.example frontend/.env
```

Open `frontend/.env` and add:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### 5. Build And Start Containers

Run this from the project root:

```bash
docker compose up -d --build
```

This starts:

- `backend` on `http://127.0.0.1:8000`
- `frontend` on `http://127.0.0.1:5173`
- `database` MySQL on port `3306`

### 6. Setup Laravel

Run these commands:

```bash
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate:fresh --seed
docker compose exec backend php artisan storage:link
```

Meaning:

- `key:generate` creates Laravel app key.
- `migrate:fresh --seed` creates tables and adds demo data.
- `storage:link` makes uploaded images public.

### 7. Open Website

Frontend:

```text
http://127.0.0.1:5173
```

Backend API:

```text
http://127.0.0.1:8000/api/v1
```

Admin login:

```text
http://127.0.0.1:5173/admin/login
```

Demo admin:

```text
email: admin@tostinh.test
password: password
```

Demo customer:

```text
email: customer@tostinh.test
password: password
```

## Common Docker Commands

Stop project:

```bash
docker compose down
```

Start again:

```bash
docker compose up -d
```

See running containers:

```bash
docker compose ps
```

See backend logs:

```bash
docker compose logs -f backend
```

See frontend logs:

```bash
docker compose logs -f frontend
```

Restart after editing `.env`:

```bash
docker compose restart backend frontend
```

Reset database:

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

## If Port Already In Use

If port `5173`, `8000`, or `3306` is already used, edit `docker-compose.yml`.

Example:

```yaml
ports:
  - "5174:5173"
```

Then open:

```text
http://127.0.0.1:5174
```

## Run Without Docker

Use this only if PHP, Composer, Node, and MySQL are installed locally.

Backend:

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Notes

- Do not send real `.env` secrets in the zip.
- Keep `backend/.env` private because it can contain Gmail, Telegram, and Bakong keys.
- If images do not show, run `php artisan storage:link`.
- If API requests fail, check `VITE_API_BASE_URL` in `frontend/.env`.
- If login/register email fails, use `MAIL_MAILER=log` for local testing.
