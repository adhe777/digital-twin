# Manual Run Guide: Digital Twin for Personal Productivity

Follow these steps to start all three services manually. Ensure you have **Node.js**, **Python 3**, and **MongoDB** installed.

---

### 1. Backend Server (Node.js)
The backend manages user authentication and routine data.
1. Open a terminal in `./server`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *Runs on: http://localhost:5000*

---

### 2. AI Service (FastAPI)
The AI service provides habit analysis and recommendations using Gemini.
1. Open a terminal in `./ai-service`.
2. (Optional) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the service:
   ```bash
   python main.py
   ```
   *Runs on: http://localhost:8000*

---

### 3. Frontend Client (React)
The web interface for your Digital Twin.
1. Open a terminal in `./client`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Runs on: http://localhost:5173*

---

### 📂 Port Configuration Summary
- **Frontend**: 5173
- **Backend**: 5000
- **AI Service**: 8000
- **Database**: 27017 (Standard MongoDB)
