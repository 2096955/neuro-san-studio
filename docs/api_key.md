# Testing API Keys

> **This fork (categorized Multi-Agent Accelerator):**
>
> - **Local runs need NO API key.** All enabled agent networks are pinned to local **Ollama**
>   (`qwen3.6:35b-a3b`, fallback `qwen3.6:27b`). Just run `ollama serve` with the model pulled — see the
>   [Ollama](#ollama-local-no-key-needed) note below and the "🚀 This fork" section of the
>   [README](../README.md).
> - **The Cloud Run deploy uses Gemini.** Set a Google AI Studio key in `GEMINI_API_KEY`
>   (the deploy script forwards it to the backend as `GOOGLE_API_KEY`). See the
>   [Gemini API Key](#gemini-api-key) section below.
> - **The OpenAI / Azure / Anthropic sections below are optional** — they are upstream provider
>   references, not required for this fork's local or cloud paths.

Setup a virtual environment, install the dependencies, and activate the virtual environment using [Make](./dev_guide.md#using-the-makefile)

## Ollama (local, no key needed)

For this fork's **local** path you do not need any API key. Instead:

- Install [Ollama](https://ollama.com) and start it:

    ```bash
    ollama serve
    ```

- Pull the model(s) the local registries are pinned to:

    ```bash
    ollama pull qwen3.6:35b-a3b
    ollama pull qwen3.6:27b
    ```

- That's it — the neuro-san backend talks to Ollama on the default local endpoint. No key to export
  or test. See the "🚀 This fork" section of the [README](../README.md) for the full local setup.

## OpenAI API Key

> Optional / upstream reference — not required for this fork's local (Ollama) or cloud (Gemini) paths.

- Export your OpenAI API environment variables

    ```bash
    export OPENAI_API_KEY="XXX"
    ```

- Run the script testing OpenAI API key

    ```bash
    python3 ./tests/apps/openai_api_key.py
    ```

- You will recieve a message indicating success or failure.

## Azure OpenAI API Key

> Optional / upstream reference — not required for this fork's local (Ollama) or cloud (Gemini) paths.

- Export your Azure OpenAI API environment variables

    ```bash
    export AZURE_OPENAI_API_KEY="YOUR_API_KEY"
    export OPENAI_API_VERSION="2025-04-01-preview"
    export AZURE_OPENAI_ENDPOINT="https://YOUR_RESOURCE_NAME.openai.azure.com/"
    export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"

    ```

    - Azure OpenAI requires you to first deploy a model and then reference it using the deployment name in API calls.
    Deployment name is NOT the model name itself. It's a label you assign to the model when you deploy it. E.g., you
    may deploy a "gpt-4" model and label it "my-gpt-4".

- Run the script testing Azure OpenAI API key

    ```bash
    python3 ./tests/apps/azure_openai_api_key.py
    ```

<!-- pyml disable line-length-->
- You will recieve a message indicating success or failure.
- See [Azure OpenAI Quickstart](https://learn.microsoft.com/en-us/azure/ai-services/openai/chatgpt-quickstart?tabs=keyless%2Ctypescript-keyless%2Cpython-new%2Ccommand-line&pivots=programming-language-python) for more information.
<!-- pyml enable line-length-->

## Anthropic API Key

> Optional / upstream reference — not required for this fork's local (Ollama) or cloud (Gemini) paths.

- Export your Anthropic API environment variables

    ```bash
    export ANTHROPIC_API_KEY="XXX"
    export ANTHROPIC_BASE_URL="https://api.anthropic.com"
    ```

- Set the `model` variable in the script (e.g., to `claude-opus-4-20250514`) and run the script testing Anthropic API key

    ```bash
    python3 ./tests/apps/anthropic_api_key.py
    ```

- You will recieve a message indicating success or failure.

## Gemini API Key

> **This fork's cloud path uses Gemini.** The Cloud Run backend runs neuro-san's `gemini` LLM class
> (`langchain_google_genai.ChatGoogleGenerativeAI`), which authenticates with `GOOGLE_API_KEY`.

- Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

- Export your Gemini key as **`GOOGLE_API_KEY`** — this is what neuro-san's `gemini` class **and** the
  test script (`tests/apps/gemini_api_key.py`) read:

    ```bash
    export GOOGLE_API_KEY="XXX"
    ```

    > `GEMINI_API_KEY` is **only** the input variable for this fork's deploy script
    > (`deploy/cloud-maa/deploy-backend.sh`), which forwards it to the backend container as
    > `GOOGLE_API_KEY`. For local use / the test script, set `GOOGLE_API_KEY`.

    > **For the Cloud Run deploy** (`deploy/cloud-maa/deploy-backend.sh`), set `GEMINI_API_KEY` — the
    > script forwards it to the backend container as `GOOGLE_API_KEY`. The cloud model defaults to
    > `gemini-2.5-flash` and is configurable via `GEMINI_MODEL` (e.g. `export GEMINI_MODEL=gemini-2.5-flash`).
    > See [`deploy/cloud-maa/README.md`](../deploy/cloud-maa/README.md) for the full deploy flow.

- Set the `model` variable in the script (e.g., to `gemini-2.5-flash`) and run the script testing Gemini API key

    ```bash
    python3 ./tests/apps/gemini_api_key.py
    ```

- You will recieve a message indicating success or failure.

- Alternatively, test the key directly against the Google Generative Language API with `curl`
  (no virtual environment required):

    ```bash
    curl "https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY:-$GEMINI_API_KEY}"
    ```

    A valid key returns a JSON list of available models; an invalid key returns an HTTP `400`/`403`
    error payload.
