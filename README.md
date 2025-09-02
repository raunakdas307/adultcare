LIVE DEPLOYED LINK->  adultcareservicesplatform.netlify.app


# 🧑‍⚕️ AdultCare Services Platform

AdultCare Services is a **full-stack web application** that connects families with professional caregivers, nurses, and elder care services.  
It also features an **e-commerce shop** for eldercare products, **emergency alerts**, and **role-based dashboards** for Admin, Caregivers, and Families.

---

## 🚀 Features

### 👤 User Management
- Secure **JWT Authentication** (Djoser + DRF SimpleJWT).
- **Role-based access**: `family`, `caregiver`, `admin`.
- Separate dashboards and navigation after login:
  - **Family** → Profile & Book Caregivers.
  - **Caregiver** → Caregiver Registration + Listed on Caregiver Directory.
  - **Admin** → Admin Dashboard with caregiver/user management.

### 🩺 Caregiver Services
- Register as a caregiver with details, skills, and location.
- Families can search & book caregivers.
- Booking stored in backend with user association.

### 🛒 E-commerce Shop
- Categories like **Adult Diapers, Mobility Aids, Medical Equipment, Hygiene Products, Supplements, Comfort Accessories**.
- Add to Cart, Checkout, and Cashfree **payment gateway integration**.

### ⚡ Emergency Support
- Families can trigger **emergency alerts** (future SMS/voice support planned).

### 🌗 Modern Frontend
- Built with **React + TailwindCSS + Framer Motion**.
- Dark/Light theme toggle.
- Fully responsive design for mobile, tablet, and desktop.

### ⚙️ Backend
- **Django + Django REST Framework** for APIs.
- MySQL database for reliability.
- CORS enabled for frontend-backend communication.

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React (Vite/CRA)
- 🎨 TailwindCSS
- 🎥 Framer Motion
- 🔗 Axios for API calls

### Backend
- 🐍 Django & Django REST Framework
- 🔑 Djoser + JWT (SimpleJWT)
- 🗄️ MySQL Database
- 💳 Cashfree Payments API

---



---

## ⚡ Installation & Setup

### 1. Clone Repo
```bash
git clone https://github.com/YOUR-USERNAME/adultcare.git
cd adultcare

Backend Setup:-
cd adultcare
python -m venv venv
source venv/bin/activate  # (or venv\Scripts\activate on Windows)
pip install -r requirements.txt

DATABASES = {
  "default": {
    "ENGINE": "django.db.backends.mysql",
    "NAME": "adultcare",
    "USER": "adultuser",
    "PASSWORD": "YOUR_DB_PASSWORD",
    "HOST": "127.0.0.1",
    "PORT": "3306",
  }
}

Frontend Setup:-
cd adultcare-frontend
npm install
npm run dev

📜 License

MIT License © 2025 AdultCare Services


---

✨ This README covers:
- What your project is
- Features
- Tech stack
- Setup instructions (backend + frontend)
- Deployment notes
- Professional repo structure

---

## 📂 Project Structure

