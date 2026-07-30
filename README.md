# ♟️ Chesso - Real-Time Multiplayer Chess

A full-stack real-time multiplayer chess application where players can compete online with live move synchronization, secure authentication, and timed matches.

---

## 🚀 Features

* ♟️ Real-time multiplayer gameplay using Socket.IO
* 🔐 Google OAuth authentication
* ⏱️ Chess clock with countdown timers
* 🏆 Automatic winner declaration on timeout
* 🏳️ Resign match functionality
* ✅ Complete chess rule validation using Chess.js
* 🌐 Responsive user interface
* ⚡ Fast real-time move synchronization

---

## 🛠️ Tech Stack

### 💻 Language

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### 🎨 Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

### 🗄️ Database

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

### 🔐 Authentication

![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)

### 📚 Libraries

![Chess.js](https://img.shields.io/badge/Chess.js-2C3E50?style=for-the-badge)

---

## 📂 Project Structure

```
Chesso/
│
├── client/          # React Frontend
├── server/          # Express Backend
├── socket/          # Socket.IO Events
├── models/          # MongoDB Models
├── routes/          # API Routes
└── README.md
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/Algon31/<repository-name>.git
```

### Install dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd server
npm install
```

---

### Configure Environment Variables

Create a `.env` file inside the server directory.

```env
MONGODB_URI=your_mongodb_connection
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_secret
```

---

### Start the application

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---


## 🎯 Future Improvements

* 💬 In-game chat
* 👥 Friend system
* 📈 Player ratings (ELO)
* 🏅 Match history
* ♟️ Spectator mode
* 🤖 Play against AI
* 🎨 Multiple board themes

---

## 📖 What I Learned

Building Chesso helped me gain practical experience with:

* WebSocket communication using Socket.IO
* Real-time synchronization
* Authentication with Google OAuth
* REST API development
* MongoDB integration
* State management in React
* Backend architecture for multiplayer applications

---

## 👨‍💻 Author

**Ravi Bhuvan**

GitHub: https://github.com/Algon31

LinkedIn: https://www.linkedin.com/in/ravi-bhuvan-985399286/
