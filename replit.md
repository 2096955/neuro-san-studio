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
- **Center Panel**: D3.js force-directed graph visualization with zone-based positioning (Front/Middle/Back Office), draggable nodes, and directional connection arrows.
- **Right Panel**: Real-time chat interface with per-agent conversation history and system status.

The visual design features a professional light theme with a purple/orange node color scheme (Orange for frontman, Purple for domain agents, Blue for specialists), dark connection lines, and cyan interactive elements. It includes interactive features like clicking agent cards for chat context switching, node dragging, and JSON export of topology. The technical stack includes Flask, Socket.IO, D3.js v7, and a responsive CSS Grid layout.

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