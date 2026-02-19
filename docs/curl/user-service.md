# User Service curl Examples

Base URL: `http://localhost:8082`

Notes:
- `POST /users` creates profile for the authenticated token user (`userId` is read from JWT).
- For user endpoints, use the same email in payload as token claim email.
- `GET /users` requires ADMIN token.

## 1. Create User Profile
```bash
curl -X POST http://localhost:8082/users \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  -d '{
    "name": "User One",
    "email": "user1@example.com",
    "phone": "+1-555-111-2222"
  }'
```

## 2. Get User Profile by userId
```bash
curl -X GET http://localhost:8082/users/<USER_ID> \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>'
```

## 3. Update User Profile
```bash
curl -X PUT http://localhost:8082/users/<USER_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  -d '{
    "name": "User One Updated",
    "email": "user1@example.com",
    "phone": "+1-555-333-4444"
  }'
```

## 4. List Users (ADMIN only, paginated)
```bash
curl -X GET 'http://localhost:8082/users?page=0&size=10&sortBy=createdAt&sortDir=desc' \
  -H 'Authorization: Bearer <ADMIN_ACCESS_TOKEN>'
```

## 5. Create Address
```bash
curl -X POST http://localhost:8082/users/<USER_ID>/addresses \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  -d '{
    "street": "123 Main St",
    "city": "Austin",
    "state": "Texas",
    "pincode": "73301",
    "country": "USA",
    "isDefault": true
  }'
```

## 6. Get Addresses
```bash
curl -X GET http://localhost:8082/users/<USER_ID>/addresses \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>'
```

## 7. Update Address
```bash
curl -X PUT http://localhost:8082/users/<USER_ID>/addresses/<ADDRESS_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  -d '{
    "street": "456 Elm St",
    "city": "Austin",
    "state": "Texas",
    "pincode": "73301",
    "country": "USA",
    "isDefault": true
  }'
```

## 8. Delete Address
```bash
curl -X DELETE http://localhost:8082/users/<USER_ID>/addresses/<ADDRESS_ID> \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>'
```

## 9. Delete User Profile
```bash
curl -X DELETE http://localhost:8082/users/<USER_ID> \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>'
```
