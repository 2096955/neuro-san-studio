# neuro-san-studio

## Overview

The Neuro SAN Studio is a comprehensive multi-agent AI development platform built on the Neuro SAN library. It serves as a playground and development environment for creating, deploying, and managing complex multi-agent networks across various industry verticals. The platform enables domain experts, researchers, and developers to rapidly prototype and build agent networks using data-driven configuration files (HOCON) without requiring code changes. The system supports both academic research and commercial applications through a dual licensing model.

## Recent Changes

### Professional Light Theme UI (November 1, 2025)
Transformed the interface to a modern, professional light theme matching enterprise design standards:
- **Light Color Palette**: Clean white backgrounds (#ffffff), light gray panels (#f5f7fa), and professional borders (#e2e8f0)
- **Vibrant Node Colors**: Original purple/orange scheme restored - Orange (#f59e0b) for frontman agents, Purple (#8b5cf6) for domain agents, Blue (#3b82f6) for specialists
- **High Contrast Links**: Dark connection lines (#1e293b) for excellent visibility against white background
- **Functional Top Navigation**: Seven working buttons providing system feedback and functionality
  - Deploy, Analytics, Explicate, Expert buttons show feature descriptions
  - Reset button restarts network visualization physics
  - Export button downloads network topology as JSON
  - Settings button shows configuration preview
- **Professional Typography**: Dark text (#1e293b) throughout with cyan accents (#0ea5e9) for interactive elements
- **Three-Zone Architecture**: Clearly visible Front Office, Middle Office, and Back Office zones with zone labels

### Enhanced Agent Persona System (November 1, 2025)
Significantly improved agent self-awareness and conversation quality:
- **Rich Agent Personas**: Each agent now has detailed persona descriptions from HOCON configuration, including specific responsibilities and delegation hierarchies
- **Independent Chat Streams**: Each agent maintains separate, siloed conversation history via `chatHistories` object - switching agents loads/saves unique histories
- **Role-Aware Responses**: Agents understand their specific role (e.g., Insurance Agent knows to delegate claims to Claims Processing)
- **Professional Communication**: Agents speak in first person with confidence about their expertise ("I manage all claims workflows...")
- **Delegation Awareness**: Frontman and domain agents know which specialists to involve for different scenarios
- **Enhanced System Prompts**: Each agent receives full persona context, role description, and delegation hierarchy in system prompt

### Professional Specialist Agent Network (September 15, 2025)
Successfully implemented complete insurance underwriting specialist network from Neuro SAN Studio architecture:
- **Real Domain Specialists**: 12 actual insurance agents including Insurance Agent (frontman), Underwriting Decision, Claims Processing, Risk Exposure Analyzer, ACORD Handler, Building Review, and other domain experts
- **Industry-Grade Architecture**: Hierarchical delegation patterns with frontman → domain agents → specialists → sub-specialists, matching real Hartford insurance operations
- **Professional Interface**: D3.js-based force-directed graph with three-panel layout (agent cards, network visualization, real-time chat)
- **Authentic Agent Relationships**: Realistic connections showing delegation, consultation, and collaboration patterns between insurance underwriting specialists
- **Production-Ready Experience**: AWS Bedrock Claude Sonnet 4 integration with specialist descriptions and proper error handling

### Multi-LLM Provider Architecture (November 1, 2025)
Successfully implemented simultaneous multi-provider LLM support with three different providers running in the same agent network:
- **AWS Bedrock (Claude Sonnet 4)**: 9 agents use Anthropic's Claude Sonnet 4 via AWS Bedrock API
  - Insurance Agent (frontman), Underwriting Decision, Insurance Broker, Third Party Data Review, Underwriter Analysis, Claims Intake, Claims Investigation, ACORD Handler, Risk Exposure, Building Review
- **Google Gemini (2.0 Flash)**: Claims Processing agent uses Google's Gemini 2.0 Flash for claims workflows
- **Azure OpenAI (GPT-4)**: Claims Adjustment agent uses Azure OpenAI's GPT-4 for settlement processing
- **Intelligent Routing**: System detects agent's model field and routes API calls to appropriate LLM provider
- **Environment**: Configured AWS_BEDROCK_API_KEY, GOOGLE_API_KEY, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT
- **API Integration**: Direct REST API calls to Anthropic, Google Generative AI, and Azure OpenAI endpoints
- **Model Detection**: "Gemini" keyword routes to Google, "Azure OpenAI" routes to Azure, default routes to Bedrock/Anthropic

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
The platform includes a Flask-based web client that provides a professional three-panel interface for agent network management and interaction:

**Three-Panel Layout:**
- **Left Panel**: Agent network browser showing all 12 insurance specialists with model information and active status indicators
- **Center Panel**: D3.js force-directed network visualization with zone-based positioning (Front/Middle/Back Office), draggable nodes, and connection arrows
- **Right Panel**: Real-time chat interface with per-agent conversation history, system status display, and AWS Bedrock Claude Sonnet 4 integration

**Visual Design:**
- Professional light theme with white panels and light gray backgrounds
- Purple/orange node color scheme: Orange (#f59e0b) frontman, Purple (#8b5cf6) domain agents, Blue (#3b82f6) specialists
- Dark connection lines (#1e293b) with directional arrows showing agent delegation patterns
- Cyan interactive elements (#0ea5e9) for buttons, borders, and status indicators

**Interactive Features:**
- Click agent cards to switch chat context and load independent conversation history
- Drag nodes to reorganize network visualization
- Export network topology as JSON file
- Reset network physics simulation
- Real-time message streaming from AWS Bedrock with typing indicators

**Technical Stack:**
- Flask backend with Socket.IO for real-time communication
- D3.js v7 for force-directed graph visualization with zone constraints
- Responsive CSS Grid layout with proper overflow handling
- RESTful API endpoints for topology (/api/topology) and chat (/api/chat)

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