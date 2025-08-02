# 📚 Digital Wallet System

A RESTful API built with **Express**, **TypeScript**, and **MongoDB (Mongoose)** which works as a minimalist digital wallet system like bkash or nagad. This API follows proper validation, business logics, and modern development practices.

---

## Features

- ✅ **Digital Wallet** (Automatically created upon Register)
- ✅ **Top Up** - User can add Money from external source by himself 
- ✅ **Cash In** - User can load money through an Agent who was initially approved by Admin
- ✅ **Cash Out** - To liquidate money from Agent
- ✅ **Send Money** - Users can send money to another user's account in case the receiver has an account on this platform
- ✅ **Become an Agent** - Users can send request to become an Agent. Admin then can approve or deny that request
- ✅ **Schema Validation** using Mongoose
- ✅ **Business Logic Enforcement** (e.g., blocking negative amount)

---

## Tech Stack

- **Node.js**
- **Express**
- **TypeScript**
- **MongoDB** (via Mongoose)

---

## Project Structure

```plaintext
src/
├── app/
│   ├── config/     
│   ├── errorHelpers/     
│   ├── interfaces/      
│   ├── middlewares/          
│   ├── modules/          
│   ├── ├── auth/          
│   ├── ├── transaction/         
│   ├── ├── user/          
│   ├── ├── wallet/          
│   ├── routes/          
│   ├── utils/          
│   ├── constants.ts          
├── app.ts               # Express app setup
└── server.ts            # Application entry point
```

---

## Project Setup in Local System

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Abrar9410/Backend-Digital-Wallet.git
cd backend-digital-wallet
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create a .env File
Create a .env file in the root with the following values:

```env
DB_URL=your_database_connection_uri
NODE_ENV=development or production

# bcrypt
SALT=#

# JWT
JWT_SECRET=secret-string
JWT_EXPIRESIN=example->(2d)
REFRESH_JWT_SECRET=another-secret-string
REFRESH_JWT_EXPIRESIN=example->(20d)
```

### 4️⃣ Build the Project

```bash
npm run build
```

### 5️⃣ Start the Server
In development (with hot reload):

```bash
npm run dev
```

In production:

```bash
npm start
```

---

## API Endpoints

### User Endpoints

- **POST** `/api/users/register` – Create a new user  
- **GET** `/api/users/all-users` – Get all users (with optional filtering, sorting, and limiting)  
- **GET** `/api/users/me` – Get own profile
- **GET** `/api/users/become-an-agent` – Send a request to become an Agent (User Route)
- **GET** `/api/users/agent-requests` – Get all Agent requests (Admin Route)
- **GET** `/api/users/:id` – Get a user by ID (Admin Route)
- **PATCH** `/api/users/agent-approval/:id` – Approve or Deny Agent Request (Admin Route)  
- **PATCH** `/api/users/update-user/:id` – Update a user (User himself or Admin)  

#### Example Query:

```http
GET /api/users/all-users?sortBy=createdAt&sort=desc&limit=5
```

### Auth Endpoints

- **POST** `/api/auth/login` – Login with an existing account  
- **POST** `/api/auth/logout` – Log Out from App  
- **POST** `/api/auth/change-password` – Any user can change his/her password through this route  


### Wallet Endpoints

- **GET** `/api/wallets/all-wallets` – Get all wallets (Admin Route)  
- **GET** `/api/wallets/my-wallet` – Get own wallet (Admin does not have any wallet)  
- **GET** `/api/wallets/update-wallet/:walletId` – Update wallet (Admin Route)
- **PATCH** `/api/wallets/top-up` – Add Money to own Wallet  
- **PATCH** `/api/wallets/cash-in/:userEmail` – Cash In to a user's Wallet (Agent Route)  
- **PATCH** `/api/wallets/cash-out/:userEmail` – Cash Out from a user's Wallet (Agent Route)
- **PATCH** `/api/wallets/send-money/:receiverEmail` – Send Money to another user's Wallet
- **PATCH** `/api/wallets/update-wallet/:id` – Update a Wallet (Admin Route)


### Transaction Endpoints

- **GET** `/api/transactions/all-transactions` – Get all wallets (Admin Route)  
- **GET** `/api/transactions/my-transactions` – Get own transactions (Admin does not have any transaction)  
- **GET** `/api/transactions/:id` – Get Single Transaction (Users Involved and Admin)


---

## Scripts

| Script         | Description                           |
|----------------|---------------------------------------|
| `npm run dev`  | Run development server with Nodemon   |
| `npm run build`| Compile TypeScript to JavaScript      |
| `npm start`    | Start the production server           |

---

[Live Link](https://backend-digital-wallet-henna.vercel.app/)
