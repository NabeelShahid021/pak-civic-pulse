# Pak Civic Pulse (پاک سِوک پلس) 🇵🇰 — Frontend

> **AI-Powered Civic Complaint Reporting, Triage & Municipal Analytics Platform for Pakistani Cities.**

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://pak-civic-pulse.vercel.app)
[![Live Backend API](https://img.shields.io/badge/Live%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-smart-civic-services-sd5w.onrender.com)
[![YouTube Demo](https://img.shields.io/badge/Watch%20Demo-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=_HYrqOAjG74)

---

## 🌟 Overview

**Pak Civic Pulse** transforms municipal governance in Pakistani cities by connecting citizens directly with authorities (**WASA**, **TEPA**, **LESCO / K-Electric**, **LWMC**). Citizens can report issues in **English, Urdu (اردو), or Roman Urdu** with photo evidence and GPS coordinates. 

Our AI triage engine classifies urgency, detects duplicate cluster reports across neighborhoods, and routes issues to the right department in milliseconds.

---

## ✨ Key Features

- **🌐 Multilingual AI Triage**: Native support for English, Urdu (`اردو`), and Roman Urdu (`"pani ka masla"`, `"bijli ke taar"`).
- **⚡ Smart Duplicate Detection & Escalation**: TF-IDF similarity automatically clusters repeated reports in the same area and escalates priority (`Medium` ➔ `High`).
- **🛡️ 13-Digit CNIC Citizen Portal**: Secure citizen signup and login using standard Pakistani CNIC format (`XXXXX-XXXXXXX-X`) with isolated dashboards.
- **🔍 Public Complaint Tracker**: Track progress openly using **Complaint ID** or **Mobile Number** without needing to log in.
- **📊 Municipal Admin Analytics**: Live KPIs, category breakdown charts, priority dispatch controls, and CSV export.
- **🤖 Conversational AI Assistant**: Real-time municipal assistant answering citizen questions, status inquiries, and department routing.
- **📸 Evidence & GPS Geotagging**: Attach photo evidence and pinpoint exact GPS coordinates with 1-click device geolocation.

---

## 🏗️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite, TanStack Start & Router |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Recharts, Sonner Toasts |
| **State & Session** | TanStack Query, React Context, LocalStorage |
| **Deployment** | Vercel |

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Install dependencies
npm install

# 2. Set environment variable in .env
VITE_API_URL=https://ai-smart-civic-services-sd5w.onrender.com

# 3. Start development server
npm run dev
```

---

## 👥 Authors & Acknowledgments
Developed for the **GenAI Hackathon 2026** to empower Pakistani citizens and modernize urban municipal services.
