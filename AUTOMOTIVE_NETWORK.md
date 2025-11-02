# Automotive Manufacturing Network

## Overview

The Automotive Manufacturing network demonstrates a comprehensive multi-agent system for automotive operations, designed for companies like Volkswagen, Ford, or BMW. It covers manufacturing operations, supply chain management, dealership support, customer service, and engineering support.

## Network Structure (16 Agents)

### Front Office - Customer-facing (7 agents)
- **Operations Coordinator** (frontman) - Main orchestrator routing requests
- **Customer Service Agent** - Direct customer support
- **Dealership Support Agent** - Supports dealer network
- **Service Scheduling Specialist** - Books service appointments
- **Recall Information Agent** - Handles recall information
- **Technical Service Advisor** - Technical repair guidance
- **Warranty Claims Processor** - Processes warranty claims

### Middle Office - Manufacturing (4 agents)
- **Manufacturing Operations Agent** - Oversees production operations
- **Production Planning Specialist** - Creates production schedules
- **Quality Control Agent** - Monitors quality metrics
- **Factory Efficiency Optimizer** - Analyzes OEE and efficiency

### Back Office - Supply Chain & Engineering (5 agents)
- **Supply Chain Management Agent** - Manages supplier network
- **Parts Inventory Specialist** - Tracks JIT inventory
- **Supplier Relations Agent** - Manages supplier performance
- **Logistics Coordinator** - Optimizes logistics
- **Engineering Support Agent** - Deep technical expertise

## Key Features

### Manufacturing Operations
- Production planning and scheduling
- Quality control and defect tracking
- Factory efficiency optimization (OEE, JPH metrics)
- Global facility coordination

### Supply Chain Management
- Just-in-time (JIT) inventory management
- Supplier performance tracking
- Logistics and distribution coordination
- Critical parts shortage management

### Dealership & Customer Support
- Technical service guidance for dealers
- Warranty claim processing
- Service appointment scheduling
- Recall management and coordination

### Engineering Support
- Vehicle diagnostics and troubleshooting
- Technical documentation access
- Recall engineering coordination
- Root cause analysis

## Use Cases

1. **Production Inquiries**: "What's the current production status at our Wolfsburg plant?"
2. **Quality Issues**: "We're experiencing a quality issue with transmission assemblies"
3. **Supply Chain**: "Do we have sufficient semiconductor inventory for next month?"
4. **Customer Service**: "Is my 2020 Golf GTI affected by any recalls?"
5. **Technical Support**: "Customer has check engine light - code P0171"
6. **Warranty Claims**: "Is the infotainment system replacement covered under warranty?"

## Integration with Studio

Access the automotive network via the Industry Vertical dropdown:
1. Select "Automotive Manufacturing" from dropdown
2. Explore the 16-agent network organized into three zones
3. Chat with specialized agents about manufacturing, supply chain, or customer service

All agents use AWS Bedrock Claude Sonnet 4 for intelligent, context-aware responses.
