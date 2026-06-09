<div align="center">
  <img src="https://img.shields.io/badge/REACT-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
</div>

<h1 align="center">ERROR404 - Admin Dashboard</h1>

<p align="center">
  The central management dashboard for the ERROR404 gamified debugging platform. Monitor users, manage rounds, and create coding challenges in real-time.
</p>

## ✨ Features

- **Real-Time Analytics**: Live user tracking and statistics via Socket.io.
- **Challenge Management**: Create, edit, and import (JSON) coding challenges.
- **User Moderation**: View user progress, streaks, and ban/remove users.
- **Modern UI**: Clean and minimal dashboard built with Tailwind CSS.

## 🚀 Quick Setup

We've provided automated setup scripts to get you running in seconds.

### Windows
Double-click the `setup.bat` file in the root directory. It will automatically install all dependencies and configure your `.env` files.

### Mac / Linux
Run the following commands in your terminal:
```bash
chmod +x setup.command
./setup.command
```

## 🛠️ Manual Setup

If you prefer to set things up manually:

### Prerequisites
- Node.js (v18+)
- MongoDB

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## ⚙️ Environment Variables

The setup scripts automatically create `.env` files for you. However, if you are setting up manually, create `.env` files in both the `server` and `client` directories with the following templates:

**`server/.env`**
```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/error404
NODE_ENV=development
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:8000
```
