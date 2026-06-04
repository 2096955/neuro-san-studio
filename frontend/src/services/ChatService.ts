/**
 * Chat Service - Frontend service for chatbox interactions
 * Uses backend /api/chat with network_name and message; parses { status, data } response.
 */

import { API_BASE_URL } from '../config/api';

// Type definitions
export interface ChatRequest {
  message: string;
  /** Backend expects network_name; system_name is mapped to it when calling sendMessage */
  network_name?: string;
  system_name?: string;
  session_id?: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  response: string;
  matched_prompt_id?: string;
  category?: string;
}

export interface PrebakedPrompt {
  id: string;
  category: string;
  label: string;
  prompt: string;
  icon: string;
  color: string;
  keywords: string[];
}

export interface PromptsResponse {
  prompts: PrebakedPrompt[];
  total_count: number;
}

export interface PromptCategory {
  value: string;
  label: string;
}

export interface CategoriesResponse {
  categories: PromptCategory[];
  total_count: number;
}

class ChatService {
  /**
   * Send a chat message and get a response.
   * Backend expects network_name and message; returns { status, data } where data.response is the text.
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const network_name = request.network_name ?? request.system_name;
    if (!network_name || !request.message) {
      throw new Error('network_name and message are required');
    }

    const body: Record<string, unknown> = {
      network_name,
      message: request.message,
    };
    if (request.session_id != null) body.session_id = request.session_id;
    if (request.context != null) body.context = request.context;

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    if (!response.ok) {
      let message = response.statusText;
      try {
        const parsed = JSON.parse(responseText) as { message?: string; error?: string; detail?: string };
        message = parsed.message ?? parsed.error ?? parsed.detail ?? message;
      } catch {
        if (responseText) message = responseText.slice(0, 200);
      }
      console.error('ChatService error:', response.status, responseText);
      throw new Error(message);
    }

    let json: { status?: string; data?: unknown; message?: string };
    try {
      json = JSON.parse(responseText) as { status?: string; data?: unknown; message?: string };
    } catch {
      throw new Error('Invalid JSON response from chat API');
    }
    if (json.status !== 'success' || json.data == null) {
      throw new Error(json.message ?? 'Invalid chat response');
    }

    const data = json.data as { response?: string; [key: string]: unknown };
    const text = typeof data.response === 'string' ? data.response : String(data.response ?? '');
    return { response: text };
  }

  /**
   * Get all available pre-baked prompts (if backend provides this endpoint)
   */
  async getPrompts(category?: string): Promise<PromptsResponse> {
    const url = new URL(`${API_BASE_URL}/api/chat/prompts`);
    if (category) url.searchParams.append('category', category);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed to fetch prompts: ${response.statusText}`);
    return response.json();
  }

  async getPromptById(promptId: string): Promise<PrebakedPrompt & { response: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat/prompts/${promptId}`);
    if (!response.ok) throw new Error(`Failed to fetch prompt: ${response.statusText}`);
    return response.json();
  }

  async getCategories(): Promise<CategoriesResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat/categories`);
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
    return response.json();
  }
}

export const chatService = new ChatService();
export default chatService;
