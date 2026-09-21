import { ProjectItem, SkillCategory } from './types';

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Web Page Project',
    description: 'A modular, high-performance web platform and portfolio crafted with React, Vite, and modern responsive styling.',
    category: 'Web Apps',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    featured: true,
    repoUrl: 'https://github.com/iantapiareyes-cpu/Web-pageproject-',
  },
  {
    id: 'proj-2',
    title: 'Interactive Studio Sandbox',
    description: 'An experimentation workbench testing modern browser APIs, canvas interactions, and real-time state synchronizations.',
    category: 'Creative',
    tags: ['TypeScript', 'Web APIs', 'Motion UI'],
    featured: true,
    repoUrl: 'https://github.com/iantapiareyes-cpu',
  },
  {
    id: 'proj-3',
    title: 'Distributed Task Dispatcher',
    description: 'Lightweight asynchronous queue consumer and metric reporter designed for cloud containerized workloads.',
    category: 'Tools & Systems',
    tags: ['Node.js', 'Async I/O', 'REST API'],
    featured: false,
    repoUrl: 'https://github.com/iantapiareyes-cpu',
  },
  {
    id: 'proj-4',
    title: 'Minimalist Note & Thought Log',
    description: 'Fast local-first offline workspace with keyboard navigation and markdown previews for daily research logs.',
    category: 'Web Apps',
    tags: ['React', 'LocalStorage', 'Keyboard Shortcuts'],
    featured: false,
    repoUrl: 'https://github.com/iantapiareyes-cpu',
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Frontend Architecture',
    skills: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'Responsive Layouts', 'Web Accessibility (a11y)'],
  },
  {
    title: 'Backend & Systems',
    skills: ['Node.js', 'Express', 'RESTful APIs', 'Async Architecture', 'JSON Schema Validation'],
  },
  {
    title: 'DevOps & Workflow',
    skills: ['Git & GitHub', 'Containerization (Docker)', 'CI/CD Pipelines', 'Cloud Run', 'Vite Bundling'],
  },
  {
    title: 'Core Philosophy',
    skills: ['Clean Code Principles', 'Semantic HTML', 'Rapid Prototyping', 'User-Centric UX'],
  }
];
