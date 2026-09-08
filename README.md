# AI-BASED PATIENT NO-SHOW PREDICTION & SCHEDULING OPTIMIZATION

An intelligent healthcare appointment management platform built with React, TypeScript, Tailwind CSS, Lucide Icons, and integrated with an AI Agent Workbench Webhook and Supabase PostgreSQL.

## 🌟 Key Features

- **Patient Management**: Admin interface to add, view, and manage patients.
- **Smart Appointment Booking**: Schedule appointments with automatic physician lookup and specialization mapping.
- **AI No-Show Risk Analytics**: Intelligent risk prediction for appointment attendance.
- **Dynamic Waitlist Management**: Real-time waitlist slot allocation and patient notifications.
- **Dual Patient Authentication**: Login using Patient ID (e.g. `PAT-001`) or Admin-generated Email & Password.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend Workflow**: SNS Agent Workbench Webhook Integration
- **Database**: Supabase PostgreSQL

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kanishkar2005ravi/AI-BASED-PATIENT-NO-SHOW.git
   cd AI-BASED-PATIENT-NO-SHOW
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=https://api.agents.snsihub.ai/webhook/a2918487-c8b3-45ba-aed2-2b725e35b286
   VITE_BACKEND_WEBHOOK_URL=https://api.agents.snsihub.ai/webhook/a2918487-c8b3-45ba-aed2-2b725e35b286
   ```

4. Run local development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```
