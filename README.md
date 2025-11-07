# 🌆 Smart City AI - Emergency Response System

<div align="center">
  
![Smart City Banner](https://img.shields.io/badge/Smart_City-AI_Powered-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Real-time AI-powered emergency response platform with intelligent agent assignment and live incident tracking**

[Live Demo](https://smart-city-rho.vercel.app) • [Backend Repo](https://github.com/kishorep26/smart-city-backend) • [API Docs](https://smart-city-backend-production-a1f3.up.railway.app/docs)

</div>

---

## 🎯 Overview

Smart City AI is a full-stack emergency response management system that leverages artificial intelligence to automatically assign emergency responders (fire, police, ambulance) to incidents based on type, proximity, and availability. The system features real-time tracking, decision logging, and an interactive dashboard with map visualization.

### ✨ Key Features

- **🤖 AI-Powered Agent Assignment** - Intelligent routing based on incident type and agent proximity
- **🗺️ Interactive Map Visualization** - Live incident tracking with Mapbox integration
- **📊 Real-Time Analytics Dashboard** - Monitor active incidents, agent status, and performance metrics
- **📝 Decision Log System** - Complete audit trail of all agent assignments and actions
- **🎨 Modern Responsive UI** - Beautiful gradient design with smooth animations
- **⚡ Live Updates** - Real-time data synchronization with backend API
- **🌍 Geocoding Integration** - Address search with OpenStreetMap Nominatim

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14 (App Router), React 18 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Mapping** | Mapbox GL JS |
| **State Management** | React Hooks (useState, useEffect) |
| **API Client** | Fetch API |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Mapbox API token (free tier available)

### Installation

1. **Clone the repository**
git clone https://github.com/kishorep26/smart-city.git
cd smart-city


2. **Install dependencies**
npm install


3. **Set up environment variables**

Create a `.env.local` file in the root directory:

NEXT_PUBLIC_API_URL=http://localhost:8000

NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here



4. **Run the development server**
npm run dev


5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

npm run build
npm start


---

## 🔌 API Integration

This frontend connects to the [Smart City Backend API](https://github.com/kishorep26/smart-city-backend). 

### Key Endpoints Used:

- `GET /incidents` - Fetch all incidents
- `POST /incidents` - Create new incident
- `GET /agents` - Get agent status and metrics
- `GET /stats` - Retrieve system statistics
- `GET /incident-history` - Fetch decision log
- `POST /assign-agent` - Manually assign agent
- `PUT /incidents/{id}/resolve` - Resolve incident

---

## 🎨 Features in Detail

### 1. **Intelligent Agent Assignment**
The system automatically assigns the most appropriate emergency responder based on:
- Incident type (fire → fire agent, crime → police, medical → ambulance)
- Geographic proximity using Haversine distance calculation
- Agent availability status

### 2. **Real-Time Dashboard**
- Live incident counter and status tracking
- Agent performance metrics (response time, success rate)
- Visual indicators for agent status (Available/Responding)
- Historical decision log with timestamps

### 3. **Interactive Map**
- Mapbox-powered visualization
- Clickable map to create incidents at any location
- Address search with geocoding
- Marker clustering for dense areas

### 4. **Scenario Testing**
- Pre-configured incident scenarios
- Custom incident creation
- One-click scenario triggering for demos

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend URL
   - `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox token
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kishorep26/smart-city)

---

## 👨‍💻 Author

**Kishore Prashanth**

- Portfolio: [kishore-prashanth-portfolio.vercel.app](https://kishore-prashanth-portfolio.vercel.app)
- GitHub: [@kishorep26](https://github.com/kishorep26)
- LinkedIn: [@kishorep26](https://www.linkedin.com/in/kishorep26/)

---

