# Task Management System 📝

A comprehensive web-based task management system built with modern technologies. This system allows users (students and admins) to sign up, manage tasks and projects, visualize data, and interact in a responsive and intuitive interface with role-based access control. The application implements advanced caching mechanisms for GraphQL queries to optimize performance and reduce server load.

## ✨ Features

- 🔐 User Authentication with Cookie-based Sessions
- 👤 Role-based Access Control (Student / Admin)
- ✅ Task & Project Management Dashboard
- 📊 Interactive Data Visualization with Chart.js
- 🌙 Dark/Light Mode Support
- 🚀 Performance Optimization with Advanced GraphQL Caching System
- 🧭 Single Page Application (SPA) Architecture
- 📱 Fully Responsive UI with Enhanced UX
- 🔄 Real-time Status Updates with Interactive UI
- 📋 Virtualized Lists for Efficient Rendering of Large Datasets

## 🚀 Tech Stack

### Frontend

- **Framework:** React with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **State Management:** React Context API
- **Data Visualization:** Chart.js with react-chartjs-2
- **Performance:** React Window for virtualized lists
- **API Communication:** GraphQL with fetch API
- **Documentation:** JSDoc-style documentation

### Backend

- **Server:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **API:** GraphQL with graphql-http
- **Authentication:** Cookie-based sessions with JSON-stringified user data
- **Security:** Argon2 for password hashing, CORS
- **GraphQL IDE:** Ruru for API exploration

## 📂 Project Structure

```
Task-Management-System/
├── frontend/                 # Frontend code
│   ├── src/                  # Frontend source code
│   │   ├── components/       # Reusable UI components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── student/      # Student-specific components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── shared/       # Shared components
│   │   │   └── ui/           # UI elements
│   │   ├── Context/          # React Context providers
│   │   │   └── GraphQLContext.jsx  # GraphQL caching implementation
│   │   ├── hooks/            # Custom React hooks
│   │   ├── graphql/          # GraphQL queries and mutations
│   │   ├── utils/            # Utility functions
│   │   ├── assets/           # Static assets
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Application entry point
│
├── backend/                  # Backend source code
│   ├── graphql/              # GraphQL schema and resolvers
│   │   ├── schema/           # GraphQL type definitions
│   │   └── resolver/         # GraphQL resolvers
│   ├── middleware/           # Express middleware
│   │   └── auth.js           # Authentication middleware
│   ├── models/               # Mongoose data models
│   └── server.js             # Express server setup
```

## 💡 Key Implementation Details

- **Advanced Caching System:** Implemented a sophisticated caching mechanism in GraphQLContext for optimized performance
- **Enhanced UI/UX:** Interactive elements, consistent styling, animations, and hover effects
- **Data Visualization:** Interactive charts that respond to user interactions with Chart.js
- **Performance Optimization:** Reduced server load and improved response times with strategic caching
- **Virtualized Lists:** Efficient rendering of large datasets with react-window and react-virtualized-auto-sizer
- **Role-based Access:** Different interfaces and permissions for students and admins
- **Modular Architecture:** Clean separation of concerns with component-based design
- **Responsive Design:** Fully responsive UI that works on all device sizes

## 👨‍💻 Developers

Developed by: Amjad Mousa, Arqam Mousa
