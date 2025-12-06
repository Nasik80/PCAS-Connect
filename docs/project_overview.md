# PCAS Connect - Project Overview

## 1. Project Architecture
The project is a **College Attendance and Management System** consisting of two main components:
- **Backend**: A Django-based REST API that manages data, authentication, and business logic.
- **Mobile App**: A React Native (Expo) application for Students, Teachers, and Admins to interact with the system.

---

## 2. Backend (Django)
**Location**: `backend/`

### A. Core App (`backend/core`)
This app handles the primary logic and database models.

#### **Data Models**
- **Department**: Manages department names and codes.
- **Subject**: Defines courses with credits, semester, and type (Core, Elective, etc.).
- **Student**: profile linked to a User, including department, semester, and enrollment details.
- **Teacher**: Profile for faculty members.
- **Enrollment**: Links Students to Subjects.
- **TimeTable**: Schedules classes by day and period.
- **Attendance**: Tracks student attendance per subject/period (Present/Absent).
- **TeacherSubject**: Maps teachers to the subjects they teach.

#### **Key API Features**
- **Authentication**: Custom login endpoints for Students and Admins.
- **Student Dashboard**: 
    - View enrolled subjects with attendance percentage.
    - View daily and monthly attendance summaries.
    - Access timetable.
- **Teacher Tools**:
    - View assigned subjects and student lists.
    - **Mark Attendance**: API to submit attendance for a specific period/subject.
    - View daily schedule and status (pending/completed classes).
    - Monthly summary of classes taken.
- **Admin Dashboard**:
    - Statistics: Total students, teachers, departments, subjects.
    - **Class Monitor**: detailed view of attendance by semester/month.
    - **Student Search**: Search students by name or register number.
    - **Excel Export**: Download attendance reports.

### B. Configuration
- **Settings**: Standard Django settings with `rest_framework` and `corsheaders` installed.
- **Database**: SQLite (default configuration).

---

## 3. Mobile App (React Native / Expo)
**Location**: `mobile/PCASConnect/`

### A. Navigation Structure
- **Stack Navigator** (`AppNavigator.js`):
    - **Splash Screen**: Initial loading screen.
    - **Role Select**: Choose between Student, Teacher, or Admin login.
    - **Login Screens**: Dedicated screens for each role.
    - **Dashboards**: Routes to role-specific tab navigators.

### B. Role-Based Features

#### **1. Student Module** (`StudentTabs.js`)
- **Home (Dashboard)**: Displays attendance summary, total credits, and enrolled subjects.
- **Time Table**: View class schedule.
- **Notices**: (Placeholder) Future notification feature.
- **Profile**: (Placeholder) User profile settings.

#### **2. Admin Module** (`AdminTabs.js`)
- **Home (Dashboard)**: Quick stats (counts of students, teachers, etc.).
- **Class Monitor**: Tools to view semester-wise attendance and identify low-attendance students.
- **Search**: Find specific students to view their detailed attendance records.

#### **3. Teacher Module**
- **Login**: Dedicated login screen.
- **Dashboard**: (Derived from file list, likely handles marking attendance and viewing schedule).

---

## 4. Key Technologies
- **Backend**: Python, Django, Django REST Framework.
- **Frontend**: React Native, Expo, React Navigation.
- **Database**: SQLite.
- **Styling**: Likely custom styling or utility access (React Native StyleSheet).
