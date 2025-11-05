# neuro-san-studio

## Overview

The Neuro SAN Studio is a comprehensive multi-agent AI development platform built on the Neuro SAN library. It enables domain experts, researchers, and developers to create, deploy, and manage complex multi-agent networks across various industry verticals using data-driven HOCON configuration files, eliminating the need for code changes. The platform supports both academic research and commercial applications through a dual licensing model, offering rapid prototyping and building of agent networks. It features dynamic network switching for industry verticals like Insurance Underwriting, Banking Operations, and Automotive Manufacturing, all organized into Front Office, Middle Office, and Back Office zones. The UI has a professional light theme and an enhanced agent persona system for improved communication and delegation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Framework Architecture
The system is built on the Neuro SAN library, implementing the Adaptive Agent-Oriented Software Architecture (AAOSA) pattern for dynamic inter-agent communication. Agent networks are declaratively defined via HOCON configuration files, allowing runtime modification of agent behavior and topology. Agents communicate securely through a "sly_data" channel for sensitive information, separate from standard chat streams.

### Multi-Agent Network Management
Agent networks are configured through HOCON files specifying roles, capabilities, tools, and communication patterns. The system supports hierarchical structures, sophisticated delegation, and dynamic switching between industry verticals (Insurance, Banking, Automotive) without server restarts. Each vertical organizes agents into Front Office, Middle Office, and Back Office zones.

### LLM Integration Layer
A unified interface supports multiple LLM providers, including OpenAI, Azure OpenAI, Anthropic, AWS Bedrock, Google Gemini, and local Ollama models. Configuration is done via HOCON, allowing model-specific parameters, fallback mechanisms, and custom model definitions. The architecture abstracts provider-specific implementations for consistent agent behavior. The system supports intelligent routing to different LLMs based on agent configuration and provides automatic fallback for API key failures.

### Tool System Architecture
The platform features a dual-tool architecture: CodedTools (custom Python implementations) and Toolbox tools (pre-built integrations). CodedTools provide custom business logic, while Toolbox tools offer ready-to-use integrations with services like search engines and external APIs. Tools can access both public arguments and private `sly_data` for secure information handling.

### Web Interface and Client Architecture
The Flask-based web client provides a professional three-panel interface for agent network management:
- **Left Panel**: Agent network browser with status indicators.
- **Center Panel**: D3.js force-directed graph visualization with vertical 3-tier layout (Front Office/Customer, Middle Office/Coordination, Back Office/Processing), draggable nodes, directional connection arrows, and color-coded zone backgrounds.
- **Right Panel**: Real-time chat interface with per-agent conversation history, system status, and intelligent context management.

The visual design features a professional light theme with zone-based color coding: Purple (#8B5CF6) for Front Office customer-facing agents, Blue (#3B82F6) for Middle Office coordination agents, Teal (#14B8A6) for Back Office processing agents, and Orange (#F59E0B) for the central Operations Coordinator hub. The layout emphasizes visual hierarchy with larger hub nodes and clear section labels. Interactive features include clicking agent cards for chat context switching, node dragging, JSON export of topology, and session-based conversation management. The technical stack includes Flask, Socket.IO, D3.js v7, and a responsive CSS Grid layout.

### Intelligent Context Management System
The platform implements advanced conversation context management with multi-format data extraction and brand-aware routing:
- **Structured Data Extraction**: Parses checkmark format (✓ name: "value") and natural language inputs to extract customer information including name, email, phone (UK and Australian formats), vehicle registration, and model.
- **Brand Detection**: Automatically identifies brand context (VWI/Volkswagen, Ford, BMW) from vehicle models, keywords, and conversation history.
- **Brand Isolation**: Prevents brand cross-contamination by injecting brand-specific instructions into agent prompts, ensuring agents never mention competitor brands.
- **Session Persistence**: Maintains session IDs across conversations to preserve context and prevent agents from re-requesting already-provided information.
- **Phone Number Support**: Handles UK formats (07xxx xxxxxx, +44 7xxx xxxxxx, 020 xxxx xxxx) and Australian formats (04xx xxx xxx, +61 4xx xxx xxx).
- **Selective Salesforce Routing**: Only customer-facing Front Office agents use Salesforce Agentforce; internal coordination and processing agents use cost-effective LLMs (AWS Bedrock Claude Sonnet 4, OpenAI GPT-4 Turbo).

### Document Processing and RAG Integration
The system offers Retrieval-Augmented Generation (RAG) capabilities using multiple document loaders (PDF, Confluence, arXiv, Wikipedia, Docling). It supports both in-memory and PostgreSQL-backed vector stores with configurable embedding models and text splitting strategies.

### Server and Runtime Architecture
The application runs as a multi-component system with a Neuro SAN server for agent execution and an NSFlow server for the web interface. It leverages Python's `asyncio` for concurrency and supports structured JSON logging.

## External Dependencies

### Language Model Providers
- OpenAI (GPT models)
- Azure OpenAI
- Anthropic (Claude models)
- AWS Bedrock
- Google Gemini
- Ollama (local models)

### Document and Data Processing
- PyMuPDF/PyPDF
- Docling
- Confluence API
- arXiv API
- Wikipedia API

### Search and Information Retrieval
- Brave Search API
- Google Custom Search
- Google Serper
- DuckDuckGo Search

### Vector Stores and Embeddings
- OpenAI Embeddings
- PostgreSQL with pgvector
- LangChain InMemoryVectorStore

### Communication and Integration Services
- Gmail API
- Slack API
- Salesforce Agentforce
- Google Cloud Discovery Engine

### Development and Infrastructure Tools
- Flask/Flask-SocketIO
- Selenium WebDriver
- PyVis
- Schedule
- python-dotenv