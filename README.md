# Handoff


<img width="1883" height="908" alt="image" src="https://github.com/user-attachments/assets/1fd03b34-b2ba-42e8-97b4-69f14f165b9f" />


An AI-powered documentation tool for Quality Engineering (QE) handoff processes. Handoff analyzes codebases and generates comprehensive reports to facilitate better understanding of code relationships, dependencies, and overall system architecture.

## Overview

Handoff streamlines the process of creating documentation for QE handoff by automatically analyzing TypeScript/JavaScript codebases and generating intelligent reports. The application uses advanced AI workflows to understand code structure, analyze dependencies, and synthesize comprehensive documentation.

## Features

- 🔍 **Intelligent Code Analysis**: Automatically annotates and analyzes TypeScript/JavaScript files
- 🌐 **GitHub Integration**: Connect directly to GitHub repositories with personal access tokens
- 📊 **Interactive Visualization**: Visual dependency graphs and code relationship mapping
- 🤖 **AI-Powered Reports**: Uses LangChain with OpenAI/Anthropic models for comprehensive analysis
- 📝 **Multi-Step Workflow**: Guided process from file upload to final report generation
- 🔄 **Dependency Analysis**: Deep understanding of how files relate to each other

## Architecture

This is a full-stack TypeScript application with:

- **Frontend**: React 19 with Vite, TanStack Router, and Mantine UI
- **Backend**: Fastify server with LangChain integration
- **AI Engine**: LangGraph workflows for sophisticated code analysis
- **Visualization**: D3.js for interactive dependency graphs

## Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key (for GPT-4o)
- GitHub [personal access token](https://github.com/settings/tokens/new) (for repository integration)

## Quick Start

### 1. Clone and Install

```bash
git@github.com:piotrnajda3000/handoff.git
cd handoff
yarn # install deps
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```bash
# server/.env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
yarn dev:ui      # Frontend (http://localhost:5173)
yarn dev:server  # Backend (http://localhost:8080)
```

Or start them individually:

```bash
# Frontend only
cd ui && yarn dev

# Backend only
cd server && yarn dev
```

## How It Works

### Step 1: Connect Repository

- Enter GitHub repository URL and personal access token
- Browse and select TypeScript/JavaScript files for analysis
- Files are fetched directly from GitHub API

### Step 2: Generate Report

- AI workflows analyze selected files in parallel
- **Code Annotation**: Each file is annotated with purpose and functionality
- **Dependency Analysis**: Relationships between files are analyzed
- **Report Synthesis**: Comprehensive report is generated using all analysis data

### Step 3: Review Results

- Interactive visualization of code dependencies
- Comprehensive markdown report with insights
- Exportable documentation for QE handoff

## AI Workflow Details

The application uses sophisticated LangGraph workflows:

1. **Annotation Workflow**: Analyzes individual files and generates annotations
2. **Dependency Analysis**: Examines relationships between files
3. **Final Report Agent**: Synthesizes all data into comprehensive documentation

The AI agent can:

- Read annotated files with context
- Analyze dependency relationships
- Access file annotations and summaries
- Generate structured, comprehensive reports

## Tech Stack

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **Mantine** - UI component library
- **TailwindCSS** - Styling
- **D3.js** - Data visualization
- **React Query** - Server state management
- **Zustand** - Client state management

### Backend

- **Fastify** - Web framework
- **TypeScript** - Type safety
- **LangChain** - AI/LLM integration
- **LangGraph** - AI workflow orchestration
- **Zod** - Schema validation
- **TypeBox** - Additional type validation

### AI & LLM

- **OpenAI GPT-4o** - Primary language model
- **Anthropic Claude** - Alternative language model
- **LangGraph** - Workflow orchestration
- **Custom agents** - Specialized analysis tools

## Project Structure

```
handoff/
├── ui/                          # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── routes/             # Page components and routing
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
│   └── test/                   # Frontend tests
├── server/                     # Fastify backend
│   └── src/
│       ├── routes/            # API endpoints
│       │   └── generate-tests/ # Main analysis endpoints
│       └── shared/            # Shared schemas and types
└── docs/                      # Documentation
```

## Prompt History

<img width="470" height="406" alt="image" src="https://github.com/user-attachments/assets/d9f220e6-95e1-4d77-abbb-e176baf9f9ca" />

<img width="475" height="419" alt="image" src="https://github.com/user-attachments/assets/04af8d55-d8a5-4a22-b12b-290a364481fc" />

<img width="511" height="457" alt="image" src="https://github.com/user-attachments/assets/3c96e7eb-3a48-42b0-b66c-ff4bb2cdbfcb" />

<img width="506" height="372" alt="image" src="https://github.com/user-attachments/assets/48cd9db7-fa7e-477a-89e3-c9daa597e9c4" />


### Testing

- **Frontend**: Vitest + React Testing Library + Cypress E2E
- **Components**: Dedicated component testing
