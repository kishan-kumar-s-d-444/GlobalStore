# 🛒 GlobalStore

GlobalStore is a full-stack e-content management and interactive web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It supports seamless online shopping with features like user authentication, product management,Communication and global connectivity among the users.  

🌐 **Live Demo**: [global-store-frontend.vercel.app](https://global-store-frontend.vercel.app)

---

## 📌 Features

- 🔐 User Authentication (Login/Register)
- 🛍️ E-Product Listing & Filtering
- 📦 Order Management (optional future scope)
- 💳 Payment integration (Stripe)
- 📱 Fully Responsive UI
- 💬 Real Time Communication
- 🌍 Global connectivity among the users
- 📺 Broadcasting of Products

---

## 🛠 Tech Stack

### Frontend
- React.js
- Redux
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for Authentication
- Bcrypt for Password Hashing

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/kishan-kumar-s-d-444/GlobalStore.git
```
### 2. Backend Setup
```bash
cd GlobalStore
cd backend
npm install
nodemon index.js
```
### 3. Create a .env file inside the backend/ folder and add:
```bash
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=..
CLOUDINARY_API_KEY=..
CLOUDINARY_API_SECRET=..
STRIPE_SECRET_KEY=..
STRIPE_PUBLISHABLE_KEY=..
FRONTEND_URL=http://localhost:3000
```
### 4. Frontend Setup
3. Setup Frontend
```bash
cd GlobalStore
cd frontend
npm install
npm start
```
### 5.Create a .env file inside the frontend/ folder and add:
```bash
REACT_APP_BACKEND_URL=http://localhost:5000
```
