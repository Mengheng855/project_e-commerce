# API Routes

This document is for frontend developers who need to call the backend API. It explains the base URL, authentication header, available endpoints, request bodies, validation rules, response shapes, permissions, and common errors.

All examples use JSON. Protected routes require a Sanctum Bearer token from login or register.

Base URL:

```text
https://api.yourdomain.com/api/v1
```

For protected routes, send the Sanctum token:

```http
Authorization: Bearer YOUR_TOKEN
Accept: application/json
Content-Type: application/json
```

`{product}`, `{category}`, and `{brand}` use slug because those models use slug route binding. `{user}` uses user id.

PUT and PATCH currently behave identically in this API: both update only the fields sent in the request body. PATCH is recommended for frontend updates.

`GET /auth/me` and `GET /me` both return the logged-in user. Prefer `GET /auth/me` for authentication flows, and keep `GET /me` as a profile shortcut.

## Auth

| Method | URL | Auth | Returns | Meaning |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | 201 | Create account and return token |
| POST | `/auth/login` | No | 200 | Login by email or username and return token |
| POST | `/auth/forgot-password` | No | 200 | Send password reset OTP to email |
| POST | `/auth/reset-password` | No | 200 | Reset password using OTP |
| GET | `/auth/me` | Yes | 200 | Get logged-in user |
| POST | `/auth/logout` | Yes | 200 | Delete current token |
| POST | `/auth/logout-all` | Yes | 200 | Delete all user tokens |

Register body:

```json
{
  "username": "heng",
  "email": "heng@example.com",
  "password": "password",
  "password_confirmation": "password",
  "first_name": "Heng",
  "last_name": "Dev",
  "device_name": "web"
}
```

Register validation:

| Field | Rule |
| --- | --- |
| `username` | Required, string, max 255, alpha dash only, unique in users |
| `email` | Required, valid email, max 255, unique in users |
| `password` | Required, must be confirmed, Laravel default password rules |
| `password_confirmation` | Required when password is sent, must match `password` |
| `first_name` | Optional, string, max 255 |
| `last_name` | Optional, string, max 255 |
| `device_name` | Optional, string, max 100 |

Register response:

```json
{
  "data": {
    "token": "1|eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.sample-token",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "username": "heng",
      "email": "heng@example.com",
      "first_name": "Heng",
      "last_name": "Dev",
      "email_verified_at": null,
      "created_at": "2026-05-09T09:00:00.000000Z",
      "updated_at": "2026-05-09T09:00:00.000000Z"
    }
  }
}
```

Login body:

```json
{
  "login": "heng@example.com",
  "password": "password",
  "device_name": "web"
}
```

Login validation:

| Field | Rule |
| --- | --- |
| `login` | Required, string, max 255, accepts email or username |
| `password` | Required, string |
| `device_name` | Optional, string, max 100 |

Login response:

```json
{
  "data": {
    "token": "2|plain-text-sanctum-token-example",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "username": "heng",
      "email": "heng@example.com",
      "first_name": "Heng",
      "last_name": "Dev",
      "email_verified_at": null,
      "created_at": "2026-05-09T09:00:00.000000Z",
      "updated_at": "2026-05-09T09:05:00.000000Z"
    }
  }
}
```

Forgot password body:

```json
{
  "email": "heng@example.com"
}
```

Forgot password response:

```json
{
  "message": "Password reset OTP sent."
}
```

Reset password body:

```json
{
  "email": "heng@example.com",
  "otp": "123456",
  "password": "new-password",
  "password_confirmation": "new-password"
}
```

Reset password response:

```json
{
  "message": "Password reset successfully."
}
```

Auth me response:

```json
{
  "data": {
    "id": 1,
    "username": "heng",
    "email": "heng@example.com",
    "first_name": "Heng",
    "last_name": "Dev",
    "email_verified_at": null,
    "created_at": "2026-05-09T09:00:00.000000Z",
    "updated_at": "2026-05-09T09:05:00.000000Z"
  }
}
```

Logout response:

```json
{
  "message": "Logged out successfully."
}
```

Logout all response:

```json
{
  "message": "Logged out from all devices successfully."
}
```

## Current User

| Method | URL | Auth | Returns | Meaning |
| --- | --- | --- | --- | --- |
| GET | `/me` | Yes | 200 | Get logged-in user profile |
| PATCH | `/me` | Yes | 200 | Update logged-in user profile |

Update me body:

```json
{
  "first_name": "Heng",
  "last_name": "Dev"
}
```

Update me validation:

| Field | Rule |
| --- | --- |
| `username` | Optional, required if present, string, max 255, alpha dash only, unique in users except current user |
| `email` | Optional, required if present, valid email, max 255, unique in users except current user |
| `password` | Optional, required if present, must be confirmed, Laravel default password rules |
| `password_confirmation` | Required when password is sent, must match `password` |
| `first_name` | Optional, nullable, string, max 255 |
| `last_name` | Optional, nullable, string, max 255 |
| `is_admin` | Ignored for non-admin users |
| `is_active` | Ignored for non-admin users |

Current user response:

```json
{
  "data": {
    "id": 1,
    "username": "heng",
    "email": "heng@example.com",
    "first_name": "Heng",
    "last_name": "Dev",
    "email_verified_at": null,
    "created_at": "2026-05-09T09:00:00.000000Z",
    "updated_at": "2026-05-09T09:10:00.000000Z"
  }
}
```

## Users

| Method | URL | Auth | Returns | Meaning |
| --- | --- | --- | --- | --- |
| POST | `/users` | No | 201 | Create user |
| GET | `/users` | Yes, admin | 200 | List users |
| GET | `/users/{user}` | Yes | 200 | Show user by id |
| PUT/PATCH | `/users/{user}` | Yes | 200 | Update user by id |
| DELETE | `/users/{user}` | Yes, admin | 204 | Delete user by id |

List query:

```text
GET /users?search=heng&per_page=10
```

Sorting and ordering are not currently supported for this list endpoint.

Query validation:

| Field | Rule |
| --- | --- |
| `search` | Optional, string used to search username, email, first name, last name |
| `per_page` | Optional, integer, max 50 |

Create user body:

```json
{
  "username": "heng",
  "email": "heng@example.com",
  "password": "password",
  "password_confirmation": "password",
  "first_name": "Heng",
  "last_name": "Dev"
}
```

Create/update user validation:

| Field | Rule |
| --- | --- |
| `username` | Required on create, optional on update, string, max 255, alpha dash only, unique in users |
| `email` | Required on create, optional on update, valid email, max 255, unique in users |
| `password` | Required on create, optional on update, must be confirmed, Laravel default password rules |
| `password_confirmation` | Required when password is sent, must match `password` |
| `first_name` | Optional, nullable, string, max 255 |
| `last_name` | Optional, nullable, string, max 255 |
| `is_admin` | Optional boolean, admin can update only |
| `is_active` | Optional boolean, admin can update only |

Users list response:

```json
{
  "data": [
    {
      "id": 1,
      "username": "heng",
      "email": "heng@example.com",
      "first_name": "Heng",
      "last_name": "Dev",
      "is_admin": true,
      "is_active": true,
      "email_verified_at": null,
      "created_at": "2026-05-09T09:00:00.000000Z",
      "updated_at": "2026-05-09T09:00:00.000000Z"
    }
  ],
  "links": {
    "first": "https://api.yourdomain.com/api/v1/users?page=1",
    "last": "https://api.yourdomain.com/api/v1/users?page=3",
    "prev": null,
    "next": "https://api.yourdomain.com/api/v1/users?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "path": "https://api.yourdomain.com/api/v1/users",
    "per_page": 10,
    "to": 10,
    "total": 25
  }
}
```

User detail/create/update response:

```json
{
  "data": {
    "id": 1,
    "username": "heng",
    "email": "heng@example.com",
    "first_name": "Heng",
    "last_name": "Dev",
    "email_verified_at": null,
    "created_at": "2026-05-09T09:00:00.000000Z",
    "updated_at": "2026-05-09T09:10:00.000000Z"
  }
}
```

Delete user response:

```text
204 No Content
Empty response body.
```

## Categories

| Method | URL | Auth | Returns | Meaning |
| --- | --- | --- | --- | --- |
| GET | `/categories` | No | 200 | List active categories |
| GET | `/categories/{category}` | No | 200 | Show category by slug |
| POST | `/categories` | Yes | 201 | Create category |
| PUT/PATCH | `/categories/{category}` | Yes | 200 | Update category by slug |
| DELETE | `/categories/{category}` | Yes | 204 | Delete category by slug |

List query:

```text
GET /categories?search=phone&per_page=10
```

Sorting and ordering are not currently supported for this list endpoint.

Query validation:

| Field | Rule |
| --- | --- |
| `search` | Optional, string used to search name and slug |
| `per_page` | Optional, integer, max 50 |

Create category body:

```json
{
  "name": "Phones",
  "description": "Smartphones and accessories",
  "icon": "phone",
  "color": "#e85a4f",
  "is_active": true
}
```

Create/update category validation:

| Field | Rule |
| --- | --- |
| `name` | Required on create, optional on update, string, max 50, unique in categories |
| `slug` | Optional, string, max 80, unique in categories, auto-generated from name if missing |
| `description` | Optional, nullable, string |
| `icon` | Optional, nullable, string, max 50 |
| `color` | Optional, nullable, hex color format like `#e85a4f` |
| `is_active` | Optional boolean |

Categories list response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Phones",
      "slug": "phones",
      "description": "Smartphones and accessories",
      "icon": "phone",
      "color": "#e85a4f",
      "is_active": true,
      "created_at": "2026-05-09T09:00:00.000000Z",
      "updated_at": "2026-05-09T09:00:00.000000Z"
    }
  ],
  "links": {
    "first": "https://api.yourdomain.com/api/v1/categories?page=1",
    "last": "https://api.yourdomain.com/api/v1/categories?page=2",
    "prev": null,
    "next": "https://api.yourdomain.com/api/v1/categories?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 2,
    "path": "https://api.yourdomain.com/api/v1/categories",
    "per_page": 10,
    "to": 10,
    "total": 12
  }
}
```

Category detail/create/update response:

```json
{
  "data": {
    "id": 1,
    "name": "Phones",
    "slug": "phones",
    "description": "Smartphones and accessories",
    "icon": "phone",
    "color": "#e85a4f",
    "is_active": true,
    "created_at": "2026-05-09T09:00:00.000000Z",
    "updated_at": "2026-05-09T09:10:00.000000Z"
  }
}
```

Delete category response:

```text
204 No Content
Empty response body.
```

## Brands

| Method | URL | Auth | Returns | Meaning |
| --- | --- | --- | --- | --- |
| GET | `/brands` | No | 200 | List active brands |
| GET | `/brands/{brand}` | No | 200 | Show brand by slug |
| POST | `/brands` | Yes | 201 | Create brand |
| PUT/PATCH | `/brands/{brand}` | Yes | 200 | Update brand by slug |
| DELETE | `/brands/{brand}` | Yes | 204 | Delete brand by slug |

List query:

```text
GET /brands?search=apple&per_page=10
```

Sorting and ordering are not currently supported for this list endpoint.

Query validation:

| Field | Rule |
| --- | --- |
| `search` | Optional, string used to search name and slug |
| `per_page` | Optional, integer, max 50 |

Create brand body:

```json
{
  "name": "Apple",
  "logo": "brands/apple.png",
  "description": "Apple products",
  "website": "https://www.apple.com",
  "is_active": true
}
```

Create/update brand validation:

| Field | Rule |
| --- | --- |
| `name` | Required on create, optional on update, string, max 100, unique in brands |
| `slug` | Optional, string, max 100, unique in brands, auto-generated from name if missing |
| `logo` | Optional, nullable, string file path, max 255 |
| `description` | Optional, nullable, string |
| `website` | Optional, nullable, valid URL, max 255 |
| `is_active` | Optional boolean |

`logo` accepts a string file path only. There is no separate upload endpoint yet, so upload the file externally first, then send the saved path here.

Brands list response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Apple",
      "slug": "apple",
      "logo": "brands/apple.png",
      "description": "Apple products",
      "website": "https://www.apple.com",
      "is_active": true,
      "created_at": "2026-05-09T09:00:00.000000Z",
      "updated_at": "2026-05-09T09:00:00.000000Z"
    }
  ],
  "links": {
    "first": "https://api.yourdomain.com/api/v1/brands?page=1",
    "last": "https://api.yourdomain.com/api/v1/brands?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "https://api.yourdomain.com/api/v1/brands",
    "per_page": 10,
    "to": 6,
    "total": 6
  }
}
```

Brand detail/create/update response:

```json
{
  "data": {
    "id": 1,
    "name": "Apple",
    "slug": "apple",
    "logo": "brands/apple.png",
    "description": "Apple products",
    "website": "https://www.apple.com",
    "is_active": true,
    "created_at": "2026-05-09T09:00:00.000000Z",
    "updated_at": "2026-05-09T09:10:00.000000Z"
  }
}
```

Delete brand response:

```text
204 No Content
Empty response body.
```

## Products

| Method | URL | Auth | Returns | Meaning |
| --- | --- | --- | --- | --- |
| GET | `/products` | No | 200 | List active products |
| GET | `/products/{product}` | No | 200 | Show product by slug |
| POST | `/products` | Yes | 201 | Create product |
| PUT/PATCH | `/products/{product}` | Yes | 200 | Update product by slug |
| DELETE | `/products/{product}` | Yes | 204 | Delete product by slug |

List query:

```text
GET /products?search=iphone&category_id=1&brand_id=1&is_featured=true&per_page=10
```

Sorting and ordering are not currently supported for this list endpoint.

Query validation:

| Field | Rule |
| --- | --- |
| `search` | Optional, string used to search name, slug, and description |
| `category_id` | Optional, integer, filters by category id |
| `brand_id` | Optional, integer, filters by brand id |
| `is_featured` | Optional, boolean-like value such as `true`, `false`, `1`, `0` |
| `per_page` | Optional, integer, max 50 |

Create product body:

```json
{
  "name": "iPhone 15 Pro",
  "description": "Apple smartphone",
  "price": 999,
  "original_price": 1099,
  "stock": 20,
  "image": "products/iphone-15-pro.png",
  "images": [
    {
      "image": "products/iphone-15-pro-front.png",
      "alt_text": "iPhone 15 Pro front view",
      "is_primary": true,
      "order": 0
    },
    {
      "image": "products/iphone-15-pro-back.png",
      "alt_text": "iPhone 15 Pro back view",
      "is_primary": false,
      "order": 1
    }
  ],
  "is_active": true,
  "is_featured": false,
  "category_id": 1,
  "brand_id": 1
}
```

Create/update product validation:

| Field | Rule |
| --- | --- |
| `name` | Required on create, optional on update, string, max 100 |
| `slug` | Optional, string, max 150, unique in products, auto-generated from name if missing |
| `description` | Optional, nullable, string |
| `price` | Required on create, optional on update, numeric, min 0 |
| `original_price` | Optional, nullable, numeric, min 0 |
| `stock` | Optional, integer, min 0 |
| `image` | Optional, nullable, string file path, max 255 |
| `images` | Optional array, max 12 images. If sent on update, it replaces the full product gallery |
| `images.*.image` | Required when `images` is sent, string file path, max 255 |
| `images.*.alt_text` | Optional, nullable, string, max 150 |
| `images.*.is_primary` | Optional boolean. If no image is primary, the first image becomes primary |
| `images.*.order` | Optional integer, min 0, controls gallery order |
| `is_active` | Optional boolean |
| `is_featured` | Optional boolean |
| `category_id` | Required on create, optional on update, integer, must exist in categories |
| `brand_id` | Optional, nullable, integer, must exist in brands |

`image` and `images.*.image` accept string file paths only. There is no separate upload endpoint yet, so upload files externally first, then send the saved paths here.

`price` and `original_price` are sent as numbers in request bodies, but returned as numeric strings like `"999.00"` in responses. Frontend code should use `parseFloat()` before doing math.

Products list response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Apple smartphone",
      "price": "999.00",
      "original_price": "1099.00",
      "stock": 20,
      "image": "products/iphone-15-pro-front.png",
      "images": [
        {
          "id": 1,
          "image": "products/iphone-15-pro-front.png",
          "alt_text": "iPhone 15 Pro front view",
          "is_primary": true,
          "order": 0,
          "created_at": "2026-05-09T09:00:00.000000Z"
        },
        {
          "id": 2,
          "image": "products/iphone-15-pro-back.png",
          "alt_text": "iPhone 15 Pro back view",
          "is_primary": false,
          "order": 1,
          "created_at": "2026-05-09T09:00:00.000000Z"
        }
      ],
      "is_active": true,
      "is_featured": false,
      "category": {
        "id": 1,
        "name": "Phones",
        "slug": "phones"
      },
      "brand": {
        "id": 1,
        "name": "Apple",
        "slug": "apple"
      },
      "created_at": "2026-05-09T09:00:00.000000Z",
      "updated_at": "2026-05-09T09:00:00.000000Z"
    }
  ],
  "links": {
    "first": "https://api.yourdomain.com/api/v1/products?page=1",
    "last": "https://api.yourdomain.com/api/v1/products?page=5",
    "prev": null,
    "next": "https://api.yourdomain.com/api/v1/products?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "https://api.yourdomain.com/api/v1/products",
    "per_page": 10,
    "to": 10,
    "total": 42
  }
}
```

Product detail/create/update response:

```json
{
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Apple smartphone",
    "price": "999.00",
    "original_price": "1099.00",
    "stock": 20,
    "image": "products/iphone-15-pro-front.png",
    "images": [
      {
        "id": 1,
        "image": "products/iphone-15-pro-front.png",
        "alt_text": "iPhone 15 Pro front view",
        "is_primary": true,
        "order": 0,
        "created_at": "2026-05-09T09:00:00.000000Z"
      },
      {
        "id": 2,
        "image": "products/iphone-15-pro-back.png",
        "alt_text": "iPhone 15 Pro back view",
        "is_primary": false,
        "order": 1,
        "created_at": "2026-05-09T09:00:00.000000Z"
      }
    ],
    "is_active": true,
    "is_featured": false,
    "category": {
      "id": 1,
      "name": "Phones",
      "slug": "phones"
    },
    "brand": {
      "id": 1,
      "name": "Apple",
      "slug": "apple"
    },
    "created_at": "2026-05-09T09:00:00.000000Z",
    "updated_at": "2026-05-09T09:10:00.000000Z"
  }
}
```

Delete product response:

```text
204 No Content
Empty response body.
```

## Orders

| Method | URL | Auth | Returns | Meaning |
| --- | --- | --- | --- | --- |
| GET | `/orders` | Yes | 200 | List logged-in user's orders, admin sees all |
| POST | `/orders` | Yes | 201 | Create order |
| GET | `/orders/{order}` | Yes | 200 | Show order by id |

Create order body:

```json
{
  "payment_method": "bakong",
  "currency": "USD",
  "items": [
    {
      "product_id": 1,
      "variant_label": "Color: Black",
      "qty": 2,
      "delivery_address": "Phnom Penh",
      "delivery_lat": 11.5564,
      "delivery_lng": 104.9282
    }
  ]
}
```

Create order validation:

| Field | Rule |
| --- | --- |
| `payment_method` | Optional, accepts `cash` or `bakong` |
| `currency` | Optional, accepts `USD` or `KHR` |
| `items` | Required, array, min 1 item |
| `items.*.product_id` | Required, integer, must exist in products |
| `items.*.variant_label` | Optional, nullable, string, max 200 |
| `items.*.qty` | Required, integer, min 1 |
| `items.*.delivery_address` | Optional, nullable, string |
| `items.*.delivery_lat` | Optional, nullable, number between -90 and 90 |
| `items.*.delivery_lng` | Optional, nullable, number between -180 and 180 |

If `payment_method` is `bakong`, the response includes a pending payment transaction with `qr_code_string`, `qr_code_md5`, bill number, reference, and expiration. There is no final paid-status verification route yet.

After an order is created, the backend tries to send a Telegram message if `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are configured. If missing, the order still succeeds and the notification is skipped.

Order response:

```json
{
  "data": {
    "id": 1,
    "order_number": "ORD-260509-123456",
    "total_amount": "1998.00",
    "status": "pending",
    "created_at": "2026-05-09T09:00:00.000000Z",
    "updated_at": "2026-05-09T09:00:00.000000Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "iPhone 15 Pro",
        "variant_label": "Color: Black",
        "qty": 2,
        "price": "999.00",
        "delivery_address": "Phnom Penh",
        "delivery_lat": "11.556400000000000",
        "delivery_lng": "104.928200000000000"
      }
    ],
    "payment_transactions": [
      {
        "id": 1,
        "amount": "1998.00",
        "payment_method": "bakong",
        "currency": "USD",
        "status": "pending",
        "qr_code_string": "bakong://pay?...",
        "qr_code_md5": "e10adc3949ba59abbe56e057f20f883e",
        "bakong_bill_number": "ORD-260509-123456",
        "bakong_reference": "550e8400-e29b-41d4-a716-446655440000",
        "paid_at": null,
        "expires_at": "2026-05-09T09:10:00.000000Z"
      }
    ]
  }
}
```

## Roles & Permissions

`admin` means the user row has `is_admin = true`. This value is stored in the `users` table. In development, you can set it with a seeder, tinker, or a direct database update.

Admin users can list all users, delete users, and update admin-only fields like `is_admin` and `is_active`. Non-admin users can update their own profile, but cannot manage other users or change their own admin status.

When a non-admin user calls an admin-only route, the API returns `403 Forbidden`.

## Error Responses

401 Unauthorized:

```json
{
  "message": "Unauthenticated."
}
```

403 Forbidden:

```json
{
  "message": "Admin access is required."
}
```

404 Not Found:

```json
{
  "message": "Not Found"
}
```

422 Validation Error:

```json
{
  "message": "The username field is required.",
  "errors": {
    "username": [
      "The username field is required."
    ],
    "email": [
      "The email has already been taken."
    ]
  }
}
```

Inactive account login error:

```json
{
  "message": "This account is inactive.",
  "errors": {
    "login": [
      "This account is inactive."
    ]
  }
}
```

## Notes For Frontend

- Use `POST /auth/login` or `POST /auth/register` to get `token`.
- Store token in frontend state/storage.
- Send token on protected routes with `Authorization: Bearer TOKEN`.
- Public list routes return paginated JSON with `data`, `links`, and `meta`.
- Slugs are generated automatically if `slug` is not sent.
- For product/category/brand detail URLs, use slug, not id.
- For Telegram order notification, configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
- For Bakong QR creation, configure `BAKONG_TOKEN`, `BAKONG_BANK_ACCOUNT`, merchant fields, and optionally `BAKONG_API_BASE_URL`.
