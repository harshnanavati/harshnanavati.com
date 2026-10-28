export const SITE = {
  name: 'Harsh Nanavati',
  givenName: 'Harsh',
  familyName: 'Nanavati',
  url: 'https://harshnanavati.com',
  email: 'nanavatiharsh00@gmail.com',
  linkedin: 'https://www.linkedin.com/in/harshnanavati',
  // In structured data (sameAs), the footer and llms.txt.
  github: 'https://github.com/harshnanavati',
  role: 'Applied AI Engineer',
  employer: 'Masterly Solutions Pvt. Ltd.',
  employerShort: 'Masterly Solutions',
  location: { locality: 'Ahmedabad', region: 'Gujarat', country: 'India', countryCode: 'IN', timeZone: 'IST, UTC+5:30' },
  // A stable, absolute photo URL for structured data (a copy of src/assets/headshot.jpg).
  photo: '/harsh-nanavati.jpg',
  // One plain sentence that says who Harsh is; shown in the footer of every page.
  about:
    'Harsh Nanavati is an Applied AI Engineer at Masterly Solutions in Ahmedabad, India, building production LLM systems: RAG, AI agents and evaluation. Open to remote roles.',
  // Others share the name, so structured data and llms.txt say which Harsh Nanavati this site is about.
  disambiguation:
    'The Applied AI Engineer from Ahmedabad, India, who builds RAG systems and AI agents at Masterly Solutions.',
  // Topics for structured data, taken from the resume's skill groups.
  knowsAbout: [
    'Large language models (LLMs)',
    'Retrieval-augmented generation (RAG)',
    'AI agents',
    'LLM evaluation',
    'LangGraph',
    'LangChain',
    'OpenAI API',
    'Ollama',
    'FAISS',
    'Vector search',
    'RAGAS',
    'Reranking',
    'Structured outputs',
    'PyTorch',
    'FaceNet',
    'MTCNN',
    'YOLOv8',
    'ONNX',
    'Computer vision',
    'FastAPI',
    'Python',
    'Docker',
    'SQL Server',
    'PostgreSQL',
    'Redis',
  ],
  education: [
    { name: 'Nirma University', locality: 'Ahmedabad' },
    { name: 'LDRP-ITR', locality: 'Gandhinagar' },
  ],
  // GoatCounter site code; empty string turns analytics off.
  goatcounter: '',
} as const;
