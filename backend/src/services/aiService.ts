import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { IModule } from '../models/Project';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `You are a senior software architect and project manager.
Given the following project requirement, decompose it into a structured breakdown.

Return ONLY valid JSON in this exact schema — no markdown, no explanation, no code fences:

{
  "modules": [
    {
      "id": "unique-id",
      "name": "Module Name",
      "description": "What this module covers",
      "features": [
        {
          "id": "unique-id",
          "name": "Feature Name",
          "description": "What this feature does",
          "tasks": [
            {
              "id": "unique-id",
              "title": "Task title",
              "description": "Concrete implementation detail",
              "priority": "high|medium|low",
              "type": "frontend|backend|database|devops|design|testing"
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Be thorough. Cover ALL functional areas implied by the requirement.
- Use UUIDs for all id fields.
- Priority must be exactly: high, medium, or low.
- Type must be exactly one of: frontend, backend, database, devops, design, testing.
- Return ONLY the JSON object. No markdown, no preamble, no trailing text.`;

interface AIModule {
  id: string;
  name: string;
  description: string;
  features: Array<{
    id: string;
    name: string;
    description: string;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      priority: string;
      type: string;
    }>;
  }>;
}

interface AIResponse {
  modules: AIModule[];
}

function assignOrders(modules: AIModule[]): IModule[] {
  return modules.map((mod, mIdx) => ({
    id: mod.id || uuidv4(),
    name: mod.name,
    description: mod.description || '',
    order: mIdx,
    features: (mod.features || []).map((feat, fIdx) => ({
      id: feat.id || uuidv4(),
      name: feat.name,
      description: feat.description || '',
      order: fIdx,
      tasks: (feat.tasks || []).map((task, tIdx) => ({
        id: task.id || uuidv4(),
        title: task.title,
        description: task.description || '',
        priority: (['high', 'medium', 'low'].includes(task.priority)
          ? task.priority
          : 'medium') as 'high' | 'medium' | 'low',
        type: (
          ['frontend', 'backend', 'database', 'devops', 'design', 'testing'].includes(task.type)
            ? task.type
            : 'backend'
        ) as 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'testing',
        order: tIdx,
      })),
    })),
  }));
}

async function parseAIResponse(text: string): Promise<IModule[]> {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  const parsed: AIResponse = JSON.parse(cleaned);
  if (!parsed.modules || !Array.isArray(parsed.modules)) {
    throw new Error('Invalid AI response: missing modules array');
  }
  return assignOrders(parsed.modules);
}

// ─── Free Local Decomposer ───────────────────────────────────────────────────
function callLocalDecomposer(requirementText: string): IModule[] {
  const normalized = requirementText.trim();
  const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const modules: IModule[] = [];
  let currentModule: IModule | null = null;
  let currentFeature: any = null;
  
  // Detect if user text is structured (lists/headings)
  let isStructured = false;
  let listLineCount = 0;
  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('-') || line.startsWith('*') || line.startsWith('Module:') || line.startsWith('Feature:')) {
      listLineCount++;
    }
  }
  if (listLineCount > lines.length * 0.25 || listLineCount >= 3) {
    isStructured = true;
  }
  
  if (isStructured) {
    let mOrder = 0;
    let fOrder = 0;
    let tOrder = 0;
    
    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('Module:')) {
        const name = line.replace(/^(#+\s*|Module:\s*)/i, '').trim();
        currentModule = {
          id: uuidv4(),
          name,
          description: `Module for ${name}`,
          order: mOrder++,
          features: []
        };
        modules.push(currentModule);
        currentFeature = null;
        fOrder = 0;
      } else if (line.startsWith('### ') || line.startsWith('- ') || line.startsWith('* ') || line.startsWith('Feature:')) {
        const name = line.replace(/^(###\s*|[-*]\s*|Feature:\s*)/i, '').trim();
        if (!currentModule) {
          currentModule = {
            id: uuidv4(),
            name: 'General Requirements',
            description: 'High-level requirements breakdown',
            order: mOrder++,
            features: []
          };
          modules.push(currentModule);
          fOrder = 0;
        }
        currentFeature = {
          id: uuidv4(),
          name,
          description: `Feature: ${name}`,
          order: fOrder++,
          tasks: []
        };
        currentModule.features.push(currentFeature);
        tOrder = 0;
      } else if (currentFeature) {
        const title = line.replace(/^([-*\s]+|Task:\s*)/i, '').trim();
        let type: 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'testing' = 'backend';
        const lower = title.toLowerCase();
        
        if (lower.includes('ui') || lower.includes('page') || lower.includes('screen') || lower.includes('css') || lower.includes('frontend') || lower.includes('component')) {
          type = 'frontend';
        } else if (lower.includes('db') || lower.includes('mongo') || lower.includes('schema') || lower.includes('postgres') || lower.includes('sql') || lower.includes('model')) {
          type = 'database';
        } else if (lower.includes('deploy') || lower.includes('ci') || lower.includes('cd') || lower.includes('docker') || lower.includes('aws') || lower.includes('environment')) {
          type = 'devops';
        } else if (lower.includes('design') || lower.includes('mockup') || lower.includes('wireframe') || lower.includes('figma')) {
          type = 'design';
        } else if (lower.includes('test') || lower.includes('jest') || lower.includes('cypress') || lower.includes('unit') || lower.includes('integration')) {
          type = 'testing';
        }
        
        currentFeature.tasks.push({
          id: uuidv4(),
          title,
          description: `Implement ${title}`,
          priority: 'medium',
          type,
          order: tOrder++
        });
      }
    }
  }
  
  if (modules.length === 0) {
    const textLower = normalized.toLowerCase();
    
    // Core Setup Module
    const coreModule: IModule = {
      id: uuidv4(),
      name: 'Project Setup & Architecture',
      description: 'Initial database schemas, server settings, and boilerplate.',
      order: 0,
      features: [
        {
          id: uuidv4(),
          name: 'Project Initialization',
          description: 'Establish repository and development workflows',
          order: 0,
          tasks: [
            {
              id: uuidv4(),
              title: 'Set up server configuration and environment variables',
              description: 'Configure Express server, dotenv variables, and port settings',
              priority: 'high',
              type: 'backend',
              order: 0
            },
            {
              id: uuidv4(),
              title: 'Establish database connections and model folder structure',
              description: 'Configure Mongoose connections and schema structures',
              priority: 'high',
              type: 'database',
              order: 1
            }
          ]
        }
      ]
    };
    modules.push(coreModule);
    
    let currentOrder = 1;
    
    // Auth Module
    if (textLower.includes('auth') || textLower.includes('login') || textLower.includes('user') || textLower.includes('signup') || textLower.includes('register') || textLower.includes('account')) {
      modules.push({
        id: uuidv4(),
        name: 'Authentication & User Accounts',
        description: 'User registration, login, JWT token administration, and profile views.',
        order: currentOrder++,
        features: [
          {
            id: uuidv4(),
            name: 'User Sign In & Session Management',
            description: 'Authentication routes and credentials validation',
            order: 0,
            tasks: [
              {
                id: uuidv4(),
                title: 'Create User schema and pre-save password hashing',
                description: 'Implement Mongoose model with bcryptjs hooks',
                priority: 'high',
                type: 'database',
                order: 0
              },
              {
                id: uuidv4(),
                title: 'Create Login and Verify Session API endpoints',
                description: 'Verify password hashes and issue httpOnly JWT cookies',
                priority: 'high',
                type: 'backend',
                order: 1
              },
              {
                id: uuidv4(),
                title: 'Build Login and Register UI screens',
                description: 'Validate input fields and handle authentication context states',
                priority: 'high',
                type: 'frontend',
                order: 2
              }
            ]
          }
        ]
      });
    }
    
    // Payments Module
    if (textLower.includes('payment') || textLower.includes('stripe') || textLower.includes('checkout') || textLower.includes('billing') || textLower.includes('cart')) {
      modules.push({
        id: uuidv4(),
        name: 'Payment Gateway & Billing',
        description: 'Stripe integrations, checkout workflows, and secure webhooks.',
        order: currentOrder++,
        features: [
          {
            id: uuidv4(),
            name: 'Stripe Integration',
            description: 'Connect checkout and payments to Stripe APIs',
            order: 0,
            tasks: [
              {
                id: uuidv4(),
                title: 'Install Stripe SDK and set up environment credentials',
                description: 'Configure billing parameters on the backend',
                priority: 'high',
                type: 'backend',
                order: 0
              },
              {
                id: uuidv4(),
                title: 'Create backend checkout API endpoints',
                description: 'Initialize payments and redirect clients securely',
                priority: 'high',
                type: 'backend',
                order: 1
              },
              {
                id: uuidv4(),
                title: 'Design frontend checkout and success redirect screens',
                description: 'Give users immediate transaction status reviews',
                priority: 'medium',
                type: 'frontend',
                order: 2
              },
              {
                id: uuidv4(),
                title: 'Develop secure Webhook controllers to handle payment success',
                description: 'Update user accounts database status upon successful transaction notification',
                priority: 'high',
                type: 'database',
                order: 3
              }
            ]
          }
        ]
      });
    }

    // Chat Module
    if (textLower.includes('chat') || textLower.includes('message') || textLower.includes('websocket') || textLower.includes('socket') || textLower.includes('realtime')) {
      modules.push({
        id: uuidv4(),
        name: 'Real-time Chat & Notifications',
        description: 'WebSocket engine setup, channels administration, and message streams.',
        order: currentOrder++,
        features: [
          {
            id: uuidv4(),
            name: 'WebSocket Core Server',
            description: 'Establish Socket.io engine for instantaneous message piping',
            order: 0,
            tasks: [
              {
                id: uuidv4(),
                title: 'Integrate Socket.io with Express HTTP server',
                description: 'Set up CORS configurations and initial websocket listeners',
                priority: 'high',
                type: 'backend',
                order: 0
              },
              {
                id: uuidv4(),
                title: 'Implement Room joining and dynamic channel listeners',
                description: 'Configure real-time backend state changes',
                priority: 'high',
                type: 'backend',
                order: 1
              },
              {
                id: uuidv4(),
                title: 'Build Chat UI widget and sync with Socket events',
                description: 'Render user messages immediately without manual page refreshes',
                priority: 'medium',
                type: 'frontend',
                order: 2
              }
            ]
          }
        ]
      });
    }
    
    // File Upload Module
    if (textLower.includes('upload') || textLower.includes('file') || textLower.includes('image') || textLower.includes('s3') || textLower.includes('media') || textLower.includes('pdf')) {
      modules.push({
        id: uuidv4(),
        name: 'File & Asset Management',
        description: 'Support image, doc, and PDF uploads using cloud object stores.',
        order: currentOrder++,
        features: [
          {
            id: uuidv4(),
            name: 'Cloud Storage & Upload Service',
            description: 'Multer middleware and remote storage bucket pipelines',
            order: 0,
            tasks: [
              {
                id: uuidv4(),
                title: 'Configure AWS SDK / Cloudinary configurations',
                description: 'Prepare storage buckets and access policies',
                priority: 'medium',
                type: 'devops',
                order: 0
              },
              {
                id: uuidv4(),
                title: 'Create upload controller with file validation guards',
                description: 'Configure mime-type verification and maximum payload sizing limits',
                priority: 'high',
                type: 'backend',
                order: 1
              },
              {
                id: uuidv4(),
                title: 'Build UI upload dropzones with upload progress feedback',
                description: 'Give users feedback on upload speeds and completion states',
                priority: 'medium',
                type: 'frontend',
                order: 2
              }
            ]
          }
        ]
      });
    }

    // Custom Application logic tasks
    const generalFeatureTasks: any[] = [];
    
    if (textLower.includes('search') || textLower.includes('filter')) {
      generalFeatureTasks.push({
        id: uuidv4(),
        title: 'Implement fuzzy search backend endpoints and filters',
        description: 'Filter queries dynamically by tags, search query parameters, or categories',
        priority: 'medium',
        type: 'backend',
        order: generalFeatureTasks.length
      });
      generalFeatureTasks.push({
        id: uuidv4(),
        title: 'Create search and filtering UI bars',
        description: 'Debounce user input and request backend pages with React Query',
        priority: 'medium',
        type: 'frontend',
        order: generalFeatureTasks.length
      });
    }
    
    if (textLower.includes('chart') || textLower.includes('dashboard') || textLower.includes('analytics') || textLower.includes('report')) {
      generalFeatureTasks.push({
        id: uuidv4(),
        title: 'Build analytics dashboard and charts component',
        description: 'Use a lightweight chart package or SVG grids to render metrics',
        priority: 'medium',
        type: 'frontend',
        order: generalFeatureTasks.length
      });
      generalFeatureTasks.push({
        id: uuidv4(),
        title: 'Write aggregation pipelines for reports generation',
        description: 'Query database documents, group data records, and compute averages',
        priority: 'high',
        type: 'database',
        order: generalFeatureTasks.length
      });
    }
    
    if (textLower.includes('notify') || textLower.includes('email') || textLower.includes('sms')) {
      generalFeatureTasks.push({
        id: uuidv4(),
        title: 'Integrate nodemailer or third-party mailing service',
        description: 'Construct transactional templates and handle transmission queues',
        priority: 'medium',
        type: 'backend',
        order: generalFeatureTasks.length
      });
    }
    
    if (generalFeatureTasks.length === 0) {
      generalFeatureTasks.push(
        {
          id: uuidv4(),
          title: 'Design UI layout for custom project workflows',
          description: 'Establish responsive design components suitable for mobile and desktop viewing',
          priority: 'medium',
          type: 'frontend',
          order: 0
        },
        {
          id: uuidv4(),
          title: 'Build CRUD REST controllers for project resources',
          description: 'Enable creating, reading, updating, and deleting resource entries',
          priority: 'high',
          type: 'backend',
          order: 1
        }
      );
    }
    
    modules.push({
      id: uuidv4(),
      name: 'Application Functionality & Logic',
      description: 'Business logic controllers, dynamic list displays, and search engines.',
      order: currentOrder++,
      features: [
        {
          id: uuidv4(),
          name: 'Core Application Workflow',
          description: 'Key functions requested in the requirement description',
          order: 0,
          tasks: generalFeatureTasks
        }
      ]
    });

    // Deployment and QA
    modules.push({
      id: uuidv4(),
      name: 'Deployment & Quality Assurance',
      description: 'Local unit testing scripts, ESLint setups, and cloud hosting workflows.',
      order: currentOrder++,
      features: [
        {
          id: uuidv4(),
          name: 'Verification & Deployment Prep',
          description: 'Verify correctness and deployment specifications',
          order: 0,
          tasks: [
            {
              id: uuidv4(),
              title: 'Write Jest or Vitest integration tests for API routes',
              description: 'Validate request bodies, authorization scopes, and status codes responses',
              priority: 'medium',
              type: 'testing',
              order: 0
            },
            {
              id: uuidv4(),
              title: 'Establish continuous integration build pipelines',
              description: 'Configure automated compilation checks and linter rules validations',
              priority: 'low',
              type: 'devops',
              order: 1
            }
          ]
        }
      ]
    });
  }

  return modules;
}

// ─── Free Google Gemini API (via OpenAI SDK compatibility) ───────────────────
async function callGemini(requirementText: string): Promise<IModule[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });

  const response = await client.chat.completions.create({
    model: 'gemini-1.5-flash',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Requirement:\n${requirementText}` },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Gemini');
  return parseAIResponse(content);
}

async function callAnthropic(requirementText: string): Promise<IModule[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `${SYSTEM_PROMPT}\n\nRequirement:\n${requirementText}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic');
  }
  return parseAIResponse(block.text);
}

async function callOpenAI(requirementText: string): Promise<IModule[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Requirement:\n${requirementText}` },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');
  return parseAIResponse(content);
}

export async function decomposeRequirement(requirementText: string): Promise<IModule[]> {
  const provider = (process.env.AI_PROVIDER || 'local').toLowerCase();

  if (provider === 'local') {
    return callLocalDecomposer(requirementText);
  }

  // Attempt 1
  try {
    if (provider === 'openai') {
      return await callOpenAI(requirementText);
    }
    if (provider === 'gemini') {
      return await callGemini(requirementText);
    }
    return await callAnthropic(requirementText);
  } catch (err) {
    console.warn(`AI call attempt 1 for ${provider} failed, retrying...`, err);
  }

  // Retry once
  try {
    if (provider === 'openai') {
      return await callOpenAI(requirementText);
    }
    if (provider === 'gemini') {
      return await callGemini(requirementText);
    }
    return await callAnthropic(requirementText);
  } catch (err) {
    console.error(`AI call attempt 2 for ${provider} failed, falling back to local decomposer:`, err);
    // Dynamic fallback to the local decomposer so the user never gets a 500 error
    return callLocalDecomposer(requirementText);
  }
}
