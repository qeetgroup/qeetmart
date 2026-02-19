# Auth Service curl Examples

Base URL: `http://localhost:8081`

## 1. Register USER
```bash
curl -X POST http://localhost:8081/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user1@example.com",
    "password": "Password@123",
    "role": "USER"
  }'
```

## 2. Register ADMIN
```bash
curl -X POST http://localhost:8081/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin1@example.com",
    "password": "Password@123",
    "role": "ADMIN"
  }'
```

## 3. Login USER
```bash
curl -X POST http://localhost:8081/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user1@example.com",
    "password": "Password@123"
  }'
```

## 4. Login ADMIN
```bash
curl -X POST http://localhost:8081/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin1@example.com",
    "password": "Password@123"
  }'
```

## 5. Refresh Token
```bash
curl -X POST http://localhost:8081/auth/refresh-token \
  -H 'Content-Type: application/json' \
  -d '{
    "refreshToken": "<USER_REFRESH_TOKEN>"
  }'
```

## 6. Get Current User
```bash
curl -X GET http://localhost:8081/auth/me \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>'
```

## 7. Change Password
```bash
curl -X POST http://localhost:8081/auth/change-password \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  -d '{
    "oldPassword": "Password@123",
    "newPassword": "Password@124"
  }'
```

## 8. Logout
```bash
curl -X POST http://localhost:8081/auth/logout \
  -H 'Content-Type: application/json' \
  -d '{
    "refreshToken": "<USER_REFRESH_TOKEN>"
  }'
```
