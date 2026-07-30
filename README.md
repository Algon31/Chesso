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

### Frontend

* React.js
* Vite
* CSS

### Backend

* Node.js
* Express.js
* Socket.IO

### Database

* MongoDB

### Authentication

* Google OAuth

### Libraries

* Chess.js

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
