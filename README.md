<div align="center">
  <h1>✨ Lakshmishree AI Chatbot - Frontend</h1>
  <p>The modern, conversational UI for interacting with Stansoft SharePro financial data.</p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black.svg?logo=next.js)](#)
  [![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC.svg?logo=tailwind-css)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg?logo=typescript)](#)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](#)
</div>

---

## 📖 Overview

This repository contains the sleek, highly-responsive frontend interface for the **Lakshmishree Investment and Securities Limited AI Chatbot**. Built with **Next.js** and **React 19**, it provides a seamless chat experience allowing users to converse with their financial data in natural language.

The interface parses markdown, displays beautiful data tables, visualizes portfolios using charts, and supports a native dark/light mode experience.

---

## ✨ Key Features

- 💬 **Intelligent Chat Interface:** Fluid chat experience with typing indicators, streaming text, and markdown rendering.
- 📈 **Data Visualization:** Built-in charts (via Recharts) to visualize portfolio holdings and trades dynamically based on AI responses.
- 🎨 **Beautiful UI/UX:** Styled using **Tailwind CSS v4** and **shadcn/ui** for accessible, premium components.
- 🌓 **Theming:** Full dark and light mode support out of the box (`next-themes`).
- ⚡ **Performance:** Highly optimized with Next.js App Router, React Server Components (where applicable), and Zustand for lightweight client state management.

---

## 🛠️ Technology Stack

| Category            | Technologies Used                               |
|---------------------|-------------------------------------------------|
| **Framework**       | Next.js (App Router)                            |
| **Core Library**    | React 19                                        |
| **Styling**         | Tailwind CSS v4, shadcn/ui, Radix UI            |
| **State Management**| Zustand                                         |
| **Visualizations**  | Recharts, Mermaid.js                            |
| **Forms/Validation**| React Hook Form, Zod                            |
| **Markdown Parsing**| React Markdown, Remark GFM, Syntax Highlighter  |

---

## 📂 Project Structure

```text
src/
├── app/           # Next.js App Router (pages, layouts, routing)
├── components/    # Reusable UI components (buttons, modals, charts)
├── store/         # Zustand state management stores (e.g., useChat.ts)
├── styles/        # Global CSS and Tailwind directives
├── utils/         # Helper functions and utilities
└── public/        # Static assets (images, fonts, icons)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v20 or higher)
- Backend API running locally or accessible remotely.

### 1️⃣ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/design-xpert/LISL-AI-Chatbot-FE.git
cd LISL-AI-Chatbot-FE
npm install
```

### 2️⃣ Environment Configuration

Create a `.env.local` file in the root directory. Link it to your backend API:

```env
# API URL of the Backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3️⃣ Running the Application

Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 🐳 Docker Deployment

This project uses a multi-stage Docker build optimized for Next.js (`output: 'standalone'`). This ensures a minimal footprint for production.

**Build and start the container:**
```bash
docker-compose up -d --build
```

**View Logs:**
```bash
docker-compose logs -f
```

**Stop the container:**
```bash
docker-compose down
```

---

## 👥 Contributing

1. Create your feature branch: `git checkout -b feature/CoolUIFeature`
2. Commit your changes: `git commit -m 'Add some CoolUIFeature'`
3. Push to the branch: `git push origin feature/CoolUIFeature`
4. Open a Pull Request.

---

<div align="center">
  <i>Developed with ❤️ for Lakshmishree Investment and Securities Limited.</i>
</div>
