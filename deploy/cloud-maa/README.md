# Cloud Run deploy — Multi-Agent Accelerator (Gemini)

Public deploy of the categorized MAA: the Next.js UI (in `neuro-san-ui-reference`) talking to
this neuro-san backend, both on Cloud Run in `gbg-neuro`/`us-central1`, on **Gemini**
(local Ollama can't run on Cloud Run).

## Live services
- UI:      https://neuro-san-maa-ui-kcvokjzgdq-uc.a.run.app/multiAgentAccelerator
- Backend: https://neuro-san-maa-backend-kcvokjzgdq-uc.a.run.app

## Architecture
```
Browser → neuro-san-maa-ui (Next.js)  ──CORS──>  neuro-san-maa-backend (neuro-san :8080) ──> Gemini (GOOGLE_API_KEY)
```

## Redeploy
Backend:
```bash
export GEMINI_API_KEY=<valid Google AI Studio key>   # NOT the old leaked one
bash deploy/cloud-maa/deploy-backend.sh
```
UI (in the neuro-san-ui-reference repo, after the backend URL is known):
```bash
bash deploy/cloud-maa/deploy-ui.sh
```

## Identities (gbg-neuro SA keys under ~/SubAgents/GCP-Package)
- `bfs-gen-ai@gbg-neuro` — can submit Cloud Build **and read build logs** (use for builds).
- `healthcare-poc-vertexai@gbg-neuro` — can set the public `allUsers` invoker IAM binding.

## Gotchas learned (so we don't repeat them)
- **LLM**: registries are Ollama locally; `swap_llm_for_deploy.py` flips them to `gemini-2.5-flash`
  on a temp build copy. neuro-san class `gemini` = `langchain_google_genai.ChatGoogleGenerativeAI`
  (uses `GOOGLE_API_KEY`), so the cloud image needs `langchain-google-genai` (see requirements-cloud.txt).
- **Leaked key**: the old `neuro-san-backend` service's `GOOGLE_API_KEY` was flagged "leaked" by
  Google and is dead — rotate it. Use the machine's valid `GEMINI_API_KEY`.
- **Coded tools**: `AGENT_TOOL_PATH` must be the dotted module path `coded_tools` (entrypoint puts
  `$APP_SOURCE` on PYTHONPATH), NOT an absolute path, or class-based coded tools fail to import.
- **Toolbox**: the SDK Dockerfile doesn't copy `toolbox/`; the cloud Dockerfile adds that COPY.
- **Build deps**: the full repo requirements.txt fails on slim images; use `requirements-cloud.txt`.
- **Secret Manager** is permission-blocked for the available SAs, so `GOOGLE_API_KEY` is a plain
  Cloud Run env (same posture as the existing services). Migrate to Secret Manager when IAM allows.
