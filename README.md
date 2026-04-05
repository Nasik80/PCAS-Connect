# PCAS-Connect

PCAS-Connect is a comprehensive College Attendance and Management System designed to streamline academic processes. It consists of a Django-based backend, a React Native mobile application for users (Students, Teachers, HODs), and a React-based Admin Web Portal.

## Project Architecture

- **Backend**: Django REST Framework (DRF)
- **Mobile**: React Native (Expo)
- **Admin Web**: React (Vite)

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
Ensure you have the following installed:
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) (LTS Recommended)
- [Git](https://git-scm.com/)

---

### 2. Backend Setup
The backend serves as the core API for both the mobile app and the admin panel.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate (Linux/Mac)
   source venv/bin/activate

   # Activate (Windows)
   venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply Database Migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create a Superuser (Admin):**
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to set a username, email, and password.

6. **Run the Development Server:**
   ```bash
   # Run on all interfaces to allow access from specific IP
   python manage.py runserver 0.0.0.0:8000
   ```
   The API will be accessible at \`http://<YOUR_LOCAL_IP>:8000/`.

---

### 3. IP Configuration
Since the apps run on different devices (e.g., your phone), you must configure the backend access IP.

1. Find your machine's local IP address:
   - **Linux/Mac**: `hostname -I` (or `ifconfig`)
   - **Windows**: `ipconfig`

2. **Update Mobile App Config**:
    - Open `mobile/PCASConnect/src/config.js`
    - Update `IP_ADDRESS` variable:
      ```javascript
      export const IP_ADDRESS = "YOUR_LOCAL_IP"; // e.g., "192.168.1.5"
      export const PORT = "8000";
      ```

3. **Update Admin Web Config**:
    - Open `admin-web/src/config.js`
    - Update `API_BASE_URL` variable:
        ```javascript
        export const API_BASE_URL = "http://YOUR_LOCAL_IP:8000";
        ```

---

### 4. Admin Web Portal Setup
This portal handles administrative tasks like managing batches, students, teachers, and subjects.

1. **Navigate to the admin-web directory:**
   ```bash
   cd admin-web
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The web portal will open at `http://localhost:5173/` (or similar).

---

### 5. Mobile App Setup (Student/Teacher/HOD)
The mobile app provides role-specific features.

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile/PCASConnect
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   *(Note: If you face issues, try `npm install --legacy-peer-deps`)*

3. **Start the Expo Server:**
   ```bash
   npx expo start
   ```

4. **Run on Device:**
   - Install **Expo Go** app on your Android/iOS device.
   - Scan the QR code shown in the terminal.
   - Ensure your phone and PC are on the **same Wi-Fi network**.

---

## 📂 Project Structure

```
PCAS-Connect/
├── backend/            # Django API
│   ├── core/           # Main logic (Models, Views)
│   ├── users/          # Authentication
│   ├── manage.py       # Django CLI
│   └── requirements.txt
│
├── mobile/PCASConnect/ # React Native App
│   ├── src/
│   │   ├── screens/    # UI Screens
│   │   ├── components/ # Reusable UI
│   │   └── config.js   # API Configuration
│   └── App.js          # Entry Point
│
├── admin-web/          # Admin Dashboard (React)
│   ├── src/
│   │   ├── pages/      # Admin Pages
│   │   └── config.js   # API Configuration
│
└── docs/               # Project Documentation
```

## ✨ Features
- **Attendance Tracking**: Period-wise tracking with real-time percentage calculation.
- **Role-Based Access**: Specialized views for Student, Teacher, HOD, and Admin.
- **Academic Management**: Manage Departments, Batches, Subjects, and Semesters.
- **Internal Marks**: Digital entry and approval workflow for assessments.

## ⚠️ Common Issues & Fixes
- **Connection Refused**: Ensure the backend is running on `0.0.0.0:8000` and `config.js` files point to your correct local IP.
- **Expo Error**: Try clearing cache with `npx expo start -c`.
