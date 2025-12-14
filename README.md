# Demo RSA JWT Authentication

Dự án demo xây dựng hệ thống xác thực JWT sử dụng mã hóa RSA với Express.js, TypeScript và MongoDB.

## 🌟 Tính năng

-  ✅ Xác thực JWT với mã hóa RSA (RS256)
-  ✅ Tự động tạo cặp key RSA cho mỗi user
-  ✅ Quản lý user với phân quyền (Admin/User)
-  ✅ Middleware xác thực và phân quyền
-  ✅ Decorator pattern (Controller, Middleware, Exception Filter)
-  ✅ Validation với Zod
-  ✅ Dependency Injection với TypeDI
-  ✅ MongoDB với Mongoose
-  ✅ Exception handling tập trung

## 🛠️ Tech Stack

-  **Runtime**: Node.js
-  **Language**: TypeScript
-  **Framework**: Express.js 5
-  **Database**: MongoDB (Mongoose)
-  **Authentication**: JSON Web Token (jsonwebtoken)
-  **Encryption**: RSA (RS256)
-  **Validation**: Zod
-  **DI Container**: TypeDI
-  **Password Hashing**: bcrypt
-  **Dev Tools**: Nodemon, SWC

## 📋 Yêu cầu

-  Node.js >= 16
-  MongoDB
-  pnpm (hoặc npm/yarn)

## 🚀 Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd demo-rsa-jwt
```

2. Cài đặt dependencies:

```bash
pnpm install
```

3. Tạo file `.env` trong thư mục root:

```env
# Server
HOST=127.0.0.1
PORT=3198

# Database
MONGODB_URI=mongodb://localhost:27017/demo-rsa-jwt

# JWT
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

4. Khởi động server:

```bash
pnpm dev
```

Server sẽ chạy tại `http://127.0.0.1:3198`

## 📁 Cấu trúc dự án

```
src/
├── core/                      # Core functionalities
│   ├── constants/            # Constants và enums
│   ├── decorators/           # Custom decorators
│   ├── filters/              # Exception filters
│   ├── interfaces/           # Core interfaces
│   └── pipes/                # Validation pipes
├── database/                  # Database configuration
├── modules/                   # Business modules
│   ├── auth/                 # Authentication module
│   │   ├── middlewares/      # JWT & Role middlewares
│   │   └── dto/              # Data transfer objects
│   └── user/                 # User management module
│       └── dto/              # User DTOs
└── main.ts                    # Application entry point
```

## 🔐 API Endpoints

### Authentication

#### Login

```http
POST /v1/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
	"statusCode": 200,
	"message": "Login successful",
	"data": {
		"accessToken": "eyJhbGc...",
		"user": {
			"id": "...",
			"email": "user@example.com",
			"role": "user"
		}
	}
}
```

#### Logout

```http
POST /v1/api/auth/logout
Authorization: Bearer <token>
```

#### Get Profile

```http
GET /v1/api/auth/profile
Authorization: Bearer <token>
```

### User Management

#### Create User

```http
POST /v1/api/user
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "user"
}
```

#### Get All Users (Admin only)

```http
GET /v1/api/user
Authorization: Bearer <admin-token>
```

#### Get User by ID

```http
GET /v1/api/user/:id
Authorization: Bearer <token>
```

#### Update User

```http
PATCH /v1/api/user/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Doe"
}
```

#### Delete User (Admin only)

```http
DELETE /v1/api/user/:id
Authorization: Bearer <admin-token>
```

## 🔑 RSA JWT Flow

1. **User Login**:

   -  Kiểm tra credentials
   -  Tạo cặp RSA key pair (public/private) cho user
   -  Lưu private key vào thư mục `keys/`
   -  Tạo JWT token được ký bằng RSA private key
   -  Trả về access token cho client

2. **Token Verification**:

   -  Client gửi token trong header `Authorization: Bearer <token>`
   -  Server verify token bằng RSA public key
   -  Trích xuất thông tin user từ payload

3. **Logout**:
   -  Revoke token bằng cách lưu vào blacklist
   -  Token sẽ không còn valid sau khi logout

## 🎯 Features Chi tiết

### Decorators

-  `@Controller(path)`: Định nghĩa controller với base path
-  `@Get(path)`, `@Post(path)`, `@Patch(path)`, `@Delete(path)`: HTTP method decorators
-  `@UseMiddleware(middleware)`: Áp dụng middleware cho route
-  `@UseExceptionFilter()`: Xử lý exceptions tự động
-  `@UseZodValidationPipe(schema)`: Validate request body với Zod

### Middleware

-  **JwtMiddleware**: Xác thực JWT token
-  **RoleBaseMiddleware**: Kiểm tra quyền truy cập dựa trên role

### Validation

Sử dụng Zod để validate input data:

```typescript
const loginDTO = z.object({
	email: z.string().email(),
	password: z.string().min(6)
})
```

## 🧪 Development

### Format code

```bash
pnpm format
```

### Watch mode

```bash
pnpm dev
```

## 📝 Notes

-  Private keys được lưu trong thư mục `keys/` (không commit lên git)
-  Mỗi user có một cặp RSA key riêng
-  Token được revoke khi logout và lưu vào collection `revoke-jwt`
-  Sử dụng bcrypt để hash password trước khi lưu vào database

## 🔒 Security

-  Passwords được hash với bcrypt
-  JWT được ký bằng RSA private key (RS256)
-  Token revocation khi logout
-  Role-based access control
-  Input validation với Zod

## 📚 Tài liệu tham khảo

-  [Express.js](https://expressjs.com/)
-  [JSON Web Tokens](https://jwt.io/)
-  [RSA Cryptography](<https://en.wikipedia.org/wiki/RSA_(cryptosystem)>)
-  [Zod Validation](https://zod.dev/)
-  [TypeDI](https://github.com/typestack/typedi)

## 📄 License

ISC

## 👤 Author

[quanghiep03198](https://github.com/quanghiep03198)
