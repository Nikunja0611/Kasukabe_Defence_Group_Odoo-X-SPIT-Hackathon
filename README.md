📦 StockOps - Intelligent Inventory Management System

Welcome to the StockOps repository! This guide will help you set up the development environment, configure the database, and run the application locally.

🛠️ Tech Stack

Frontend: React.js (Vite/CRA)

Backend: FastAPI (Python)

Database: MySQL (Local)

Authentication: JWT (Argon2 hashing)

✅ Prerequisites

Before starting, ensure you have the following installed:

Python 3.10+

Node.js & npm

MySQL Server (Running locally)

Git

🚀 Setup Instructions

1. Clone the Repository

Open your terminal and run:

git clone [https://github.com/Nikunja0611/Kasukabe_Defence_Group_Odoo-X-SPIT-Hackathon](https://github.com/Nikunja0611/Kasukabe_Defence_Group_Odoo-X-SPIT-Hackathon)
cd StockOps


2. Database Setup (MySQL)

You need to create the database before running the backend.

Open your MySQL Command Line or Workbench.

Run the following SQL commands to create the database and user:

-- 1. Create the Database
DROP DATABASE IF EXISTS stockmaster;
CREATE DATABASE stockmaster;

-- 2. Create User (If not using root)
-- NOTE: If you use 'root', update database.py accordingly.
CREATE USER IF NOT EXISTS 'stockuser'@'localhost' IDENTIFIED BY 'stockpass';
GRANT ALL PRIVILEGES ON stockmaster.* TO 'stockuser'@'localhost';
FLUSH PRIVILEGES;


Note: If you already have a user/password you prefer, ensure you update backend/database.py with your credentials.

3. Backend Setup (FastAPI)

Navigate to the backend folder and set up the Python environment.

# 1. Go to backend folder
cd backend

# 2. Create Virtual Environment
# Windows:
python -m venv venv
# Mac/Linux:
python3 -m venv venv

# 3. Activate Virtual Environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install Dependencies
pip install -r requirements.txt
# Note: If requirements.txt is missing, run:
# pip install fastapi uvicorn sqlalchemy pymysql pydantic python-multipart passlib[bcrypt] python-jose argon2-cffi cryptography


📧 Email Setup (Optional but Recommended)

To make the "Forgot Password" OTP feature work:

Open backend/main.py.

Find SENDER_EMAIL and SENDER_PASSWORD.

Enter your Gmail and App Password (Not your login password).

Run the Backend

uvicorn main:app --reload


The server should start at http://127.0.0.1:8000

4. Seed Initial Data (Crucial Step!)

Once the backend is running, you need to populate the database with initial locations (Warehouse, Vendors, Customers).

Open your browser and go to: http://localhost:8000/docs

Scroll down to the POST /seed endpoint.

Click Try it out -> Execute.

You should see: {"message": "Locations Seeded..."}.

5. Frontend Setup (React)

Open a new terminal (keep the backend running) and navigate to the frontend.

# 1. Go to frontend folder
cd frontend

# 2. Install Node Modules
npm install

# 3. Start the React App
npm start


The app should open at http://localhost:3000

🧪 How to Test the App

1. Registration & Role Testing

Sign Up as Manager:

Role: Inventory Manager

Login ID: Manager01

Password: Admin@12345 (Must follow strict rules: >8 chars, Upper, Lower, Special char)

Check: Can you see the "Add Product" form in the Products tab?

Sign Up as Staff:

Role: Warehouse Staff

Login ID: Staff01

Password: Staff@12345

Check: The "Add Product" form should be hidden.

2. Operations Flow

Create Product: (As Manager) Create "Drill", SKU: DR001, Price: 500.

Receipt: Go to Operations -> Select Receipt -> Add 100 Qty.

Check Stock: Dashboard should show 100.

Delivery: Go to Operations -> Select Delivery -> Try delivering 150 (Should fail) -> Deliver 50 (Should succeed).

History: Check the "History" tab to see the logs.

⚠️ Troubleshooting

Error: Module not found

Make sure you activated the virtual environment (venv) for backend or ran npm install for frontend.

Error: Access denied for user 'stockuser'@'localhost'

Your database password in MySQL doesn't match the one in backend/database.py. Update the file or reset the SQL user password.

Error: Unknown column 'login_id'

Your database is outdated. Stop backend, run DROP DATABASE stockmaster; CREATE DATABASE stockmaster; in MySQL, then restart backend.

