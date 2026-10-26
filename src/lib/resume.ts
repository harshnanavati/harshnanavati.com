// The resume as structured text for the /resume page. It mirrors
// HarshNanavati_AppliedAIEngineer_Resume_2026.pdf, except the phone number,
// which stays off the public web pages. Update both together.

export const RESUME_PDF = '/resume/HarshNanavati_AppliedAIEngineer_Resume_2026.pdf';

export const RESUME = {
  headline: 'Applied AI Engineer: LLMs, RAG, agentic systems and evaluation',
  summary:
    'Applied AI engineer with 2+ years shipping production LLM systems end to end: enterprise RAG, agentic pipelines with automated verification, real-time self-hosted LLM services and GPU computer vision, for clients in the US and India. Systems serve 600+ users and cut manual work by up to ~70%. I own the full path: retrieval design, guardrails, evaluation, FastAPI backends and deployment.',
  skills: [
    {
      group: 'GenAI',
      items: 'LLMs, RAG, agentic workflows, LangGraph, LangChain, OpenAI API, Ollama (self-hosted LLMs), structured outputs, prompt engineering, guardrails, verification harnesses, human-in-the-loop',
    },
    {
      group: 'Retrieval and evaluation',
      items: 'FAISS, vector search, OpenAI embeddings, Docling, chunking strategies, reranking, citation grounding, RAG evaluation (RAGAS)',
    },
    {
      group: 'ML and computer vision',
      items: 'PyTorch, scikit-learn, FaceNet/MTCNN, YOLOv8, ONNX, Elo and probabilistic models, backtesting',
    },
    { group: 'Deployment and MLOps', items: 'Docker, Docker Compose, Nginx, Prometheus and Grafana, CI/CD (GitHub Actions)' },
    {
      group: 'Engineering',
      items: 'Python, FastAPI, asyncio, REST APIs, SQL Server, PostgreSQL, MongoDB, Redis, Spark/Scala, Git, Angular',
    },
  ],
  experience: [
    {
      role: 'SDE – Artificial Intelligence (Applied AI Engineer)',
      company: 'Masterly Solutions Pvt. Ltd.',
      where: 'Ahmedabad, India',
      when: 'Oct 2024 – present',
      note: 'Building in-house AI products and client systems for the US and India.',
      points: [
        {
          lead: 'DocuPilot – Enterprise RAG Platform',
          text: 'cut manual SOP queries by ~40% for 600+ staff across 14 document categories, with Docling ingestion (OCR and tables), custom structure-aware chunking with page-level provenance, and text-embedding-3-small with FAISS retrieval over 12,000+ chunks at sub-100 ms median latency.',
        },
        {
          lead: 'DocuPilot – Answer Grounding & Guardrails',
          text: 'GPT-4o-mini answers constrained by answer-grounded citation selection and a two-stage citation gate, with every claim linked to its source page region; role-based document access, JWT auth, SHA-256 dedup and per-query observability on FastAPI and SQL Server.',
        },
        {
          lead: 'CrickPal Intelligence Layer – AI Win-Prediction Platform',
          text: 'an LLM agent turns analysts’ plain-English specs into feature code, gated by an automated verification harness (golden examples, symmetry, replay-based leakage, determinism) with self-repair and human approval; Elo baseline at log-loss 0.643 and Brier 0.227 over 4.1k T20Is; ~800 automated tests.',
        },
        {
          lead: 'CrickPal AI Summary – Real-Time LLM Commentary Engine',
          text: 'live ball-by-ball data turned into narrative and headline summaries on self-hosted Ollama; incremental summarization keeps prompt size flat as a match grows; exactly-once batching on a single instance, a circuit breaker with backoff, and an admin console for per-match prompt and model tuning without redeploys.',
        },
        {
          lead: 'AI Face Matching System',
          text: 'cut manual photo tagging by ~70% with an unattended MTCNN and FaceNet pipeline: self-healing job queue, retry budgets, stale-lease recovery and an embedding cache across three SQL Server databases; extended to video with YOLOv8 detection and ONNX/DirectML export.',
        },
        {
          lead: 'QuantumCopilot – AI Loan & Financial Assistant',
          text: 'maps natural-language queries to typed parameters across 6 loan products; parallel scenario fan-out (~3x faster scenario stage), multi-turn memory, and 8 Uvicorn workers on IIS.',
        },
        {
          lead: 'RAG Support & Concierge Chatbots',
          text: 'a support bot with a human-in-the-loop correction loop (~60% fewer escalations); a concierge bot redesigned from RAG to cached long-context with single-call intent routing.',
        },
      ],
    },
    {
      role: 'Intern – Data Science & Big Data',
      company: 'Deloitte Haskins & Sells LLP',
      where: 'Remote, Ahmedabad, India',
      when: 'Jun 2023 – May 2024',
      note: '',
      points: [
        {
          lead: '',
          text: 'Used Spark, Scala and SQL for entity-resolution and anomaly-detection analyses on large-scale financial datasets.',
        },
        { lead: '', text: 'Improved audit reporting accuracy by 20% with Power BI dashboards for enterprise audit workflows.' },
      ],
    },
  ],
  research: {
    title: 'Blockchain-Driven Federated Learning for Parkinson’s Detection',
    text: 'M.Tech research: privacy-preserving diagnosis combining federated learning, blockchain-based model traceability and explainable AI.',
  },
  education: [
    { degree: 'M.Tech, Data Science', school: 'Nirma University, Ahmedabad', detail: 'CGPA 8.79/10', when: '2022 – 2024' },
    {
      degree: 'B.E., Computer Engineering',
      school: 'LDRP-ITR, Gandhinagar',
      detail: 'CGPA 8.75/10',
      when: '2017 – 2021',
    },
  ],
};
