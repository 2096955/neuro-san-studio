# neuro-san-studio

## Overview

The Neuro SAN Studio is a comprehensive multi-agent AI development platform built on the Neuro SAN library. It serves as a playground and development environment for creating, deploying, and managing complex multi-agent networks across various industry verticals. The platform enables domain experts, researchers, and developers to rapidly prototype and build agent networks using data-driven configuration files (HOCON) without requiring code changes. The system supports both academic research and commercial applications through a dual licensing model.

## Recent Changes

### Enhanced Agent Persona System (November 1, 2025)
Significantly improved agent self-awareness and conversation quality:
- **Rich Agent Personas**: Each agent now has detailed persona descriptions from HOCON configuration, including specific responsibilities and delegation hierarchies
- **Independent Chat Streams**: Each agent maintains a separate, siloed conversation history - switching agents creates fresh contexts
- **Role-Aware Responses**: Agents now understand their specific role (e.g., Insurance Agent knows to delegate claims to Claims Processing)
- **Professional Communication**: Agents speak in first person with confidence about their expertise ("I manage all claims workflows...")
- **Delegation Awareness**: Frontman and domain agents know which specialists to involve for different scenarios

### Professional Specialist Agent Network (September 15, 2025)
Successfully implemented complete insurance underwriting specialist network from Neuro SAN Studio architecture:
- **Real Domain Specialists**: 12 actual insurance agents including Insurance Agent (frontman), Underwriting Decision, Claims Processing, Risk Exposure Analyzer, ACORD Handler, Building Review, and other domain experts
- **Industry-Grade Architecture**: Hierarchical delegation patterns with frontman → domain agents → specialists → sub-specialists, matching real Hartford insurance operations
- **Professional Interface**: D3.js-based force-directed graph with three-panel layout (agent cards, network visualization, real-time chat)
- **Authentic Agent Relationships**: Realistic connections showing delegation, consultation, and collaboration patterns between insurance underwriting specialists
- **Production-Ready Experience**: AWS Bedrock Claude Sonnet 4 integration with specialist descriptions and proper error handling

### AWS Bedrock Integration (September 15, 2025)
Successfully migrated from OpenAI to AWS Bedrock for key agent networks:
- **Environment**: Configured AWS_BEDROCK_API_KEY for bearer token authentication
- **Agent Networks**: Updated music_nerd, hello_world, music_nerd_pro, and agent_network_designer to use built-in Bedrock integration
- **Model Mapping**: Uses "bedrock-us-claude-sonnet-4" which maps to "us.anthropic.claude-sonnet-4-20250514-v1:0"
- **Server Configuration**: Updated for Replit environment with proper domain and port mapping
- **Framework**: Uses Neuro SAN's native `class: "bedrock"` integration rather than custom implementation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Framework Architecture
The system is built around the Neuro SAN library, which implements the Adaptive Agent-Oriented Software Architecture (AAOSA) pattern. This architecture enables dynamic inter-agent communication and collaboration within multi-agent networks. The framework uses HOCON configuration files to define agent networks declaratively, allowing for runtime modification of agent behavior and network topology without code deployment.

### Multi-Agent Network Management
Agent networks are defined through HOCON configuration files that specify agent roles, capabilities, tools, and inter-agent communication patterns. The system supports hierarchical agent structures with parent-child relationships and enables sophisticated delegation patterns. Agents communicate through a protected "sly_data" channel for sensitive information that should never enter LLM prompts, alongside standard chat streams.

### LLM Integration Layer
The platform provides a unified interface for multiple LLM providers including OpenAI, Azure OpenAI, Anthropic, AWS Bedrock, Google Gemini, and local models via Ollama. Each provider is configured through the HOCON system with support for model-specific parameters, fallback configurations, and custom model definitions. The architecture abstracts LLM-specific implementations to provide consistent agent behavior across different language models.

### Tool System Architecture
The system implements a dual-tool architecture: CodedTools (custom Python implementations) and Toolbox tools (pre-built integrations). CodedTools inherit from a base interface and provide custom business logic, while Toolbox tools offer ready-to-use integrations with services like search engines, document processing, and external APIs. Tools can access both public arguments and private sly_data for secure information handling.

### Web Interface and Client Architecture
The platform includes a Flask-based web client (neuro-san-web-client) that provides a visual interface for agent network management and interaction. The web client communicates with the core Neuro SAN server through both gRPC and HTTP protocols, supporting real-time chat interfaces and network visualization.

### Document Processing and RAG Integration
The system provides comprehensive Retrieval-Augmented Generation (RAG) capabilities through multiple document loaders including PDF (PyMuPDF), Confluence, arXiv, Wikipedia, and generic document formats via Docling. The RAG system supports both in-memory and PostgreSQL-backed vector stores with configurable embedding models and text splitting strategies.

### Server and Runtime Architecture
The application runs as a multi-component system with the Neuro SAN server handling agent execution and the NSFlow server providing web interface functionality. The runtime uses Python's asyncio for concurrent operations and supports both direct connections and networked deployments. Logging is structured through JSON formatters with context injection for request tracing.

## External Dependencies

### Language Model Providers
- **OpenAI**: Primary LLM provider with support for GPT models and built-in tools (code interpreter, web search)
- **Azure OpenAI**: Enterprise-grade OpenAI deployment with custom endpoint configuration
- **Anthropic**: Claude models with code execution and web search capabilities
- **AWS Bedrock**: Amazon's managed AI service for enterprise deployments
- **Google Gemini**: Google's language models with API integration
- **Ollama**: Local LLM deployment for offline and privacy-sensitive applications

### Document and Data Processing
- **PyMuPDF/PyPDF**: PDF document parsing and text extraction
- **Docling**: Multi-format document processing with advanced parsing capabilities
- **Confluence API**: Integration with Atlassian Confluence for enterprise knowledge bases
- **arXiv API**: Academic paper retrieval and processing
- **Wikipedia API**: Encyclopedia content access and processing

### Search and Information Retrieval
- **Brave Search API**: Web search capabilities with privacy focus
- **Google Custom Search**: Google-powered search integration
- **Google Serper**: Alternative Google search API wrapper
- **DuckDuckGo Search**: Privacy-focused search engine integration

### Vector Stores and Embeddings
- **OpenAI Embeddings**: Text embedding generation for vector similarity
- **PostgreSQL with pgvector**: Persistent vector storage for large-scale deployments
- **LangChain InMemoryVectorStore**: Fast in-memory vector operations for prototyping

### Communication and Integration Services
- **Gmail API**: Email integration for notifications and document sharing
- **Slack API**: Team communication and channel monitoring
- **Salesforce Agentforce**: Enterprise CRM agent integration
- **Google Cloud Discovery Engine**: Enterprise search and discovery services

### Development and Infrastructure Tools
- **Flask/Flask-SocketIO**: Web framework for real-time client interface
- **Selenium WebDriver**: Browser automation for web-based agent interactions
- **PyVis**: Network visualization for agent relationship mapping
- **Schedule**: Task scheduling and periodic operations
- **python-dotenv**: Environment variable management for configuration