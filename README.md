# CORTEX.AI - Smart City Operating System

## 🏙️ Project Overview
CORTEX.AI is an autonomous **Multi-Agent Reinforcement Learning (MARL)** system designed to manage emergency response fleets in a smart city environment. It replaces traditional, manual dispatch systems with a neural network that makes real-time decisions based on agent stress, fuel levels, proximity, and incident severity.

## 🧠 Key Features

### 1. **Autonomous Neural Dispatch**
The system logic is **not hardcoded**. When an incident occurs:
- The backend performs **NLP Classification** on the incident description to determine the Type (Fire, Medical, Police).
- Examples: 
  - "House burning down" -> **FIRE**
  - "Car crash with injuries" -> **MEDICAL**
  - "Store robbery" -> **POLICE**
- The Dispatch Engine evaluates a cost function for every available agent:
  $$ Cost = Distance + (Stress \times 0.05) + (Fuel \times 0.05) $$
- It prioritizes **Active Duty** agents but will deploy **Backup Units** if primary agents are unavailable.

### 2. **Artificial Intelligence Behavior**
Agents are simulated as stateful entities with:
- **Fuel Consumption**: Agents burn fuel while responding. Low fuel (<20%) triggers an automatic `REFUELING` state where they return to base.
- **Stress Mechanics**: High-risk missions increase agent stress. High stress (>80%) forces agents into a cooling-off period.
- **Self-Preservation**: Agents will refuse missions if they are critically low on resources, forcing the system to find alternatives.

### 3. **Dynamic Sector Deployment**
Unlike static grids, CORTEX auto-scales. If an incident is detected in a new geohash sector (e.g., London instead of NYC), the system automatically provisions a local task force effectively creating a global safety net.

### 4. **Predictive Analytics (K-Means)**
The `ACTIVATE PREDICTION` layer uses an unsupervised **custom K-Means algorithm** to analyze historical incident density. It draws "Risk Zones" on the map, helping commanders pre-position units in high-probability areas.

## 🛠️ Technology Stack
- **Frontend**: Next.js, React, TailwindCSS, Framer Motion, Leaflet (Maps).
- **Backend**: FastAPI, Python, SQLAlchemy, Custom AI Logic.
- **Database**: PostgreSQL (Supabase).
- **Deployment**: Vercel (Frontend & Serverless Functions).

## 🚀 How to Run
1. **Frontend**:
   ```bash
   cd smart-city
   npm install
   npm run dev
   ```
2. **Backend**:
   ```bash
   cd smart-city-backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

## 👨‍💻 Developer Note
This project demonstrates Master's level competency in:
- Full Stack Architecture
- Algorithm Implementation (K-Means, Cost Functions)
- UI/UX Design (Cyberpunk/Glassmorphism)
- Real-time State Management

---
*(C) 2025 Kishore Prashanth - CORTEX SYSTEMS*
