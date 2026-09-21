export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: 'Web Apps' | 'Tools & Systems' | 'Creative';
  tags: string[];
  stars?: number;
  featured?: boolean;
  link?: string;
  repoUrl?: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface WebIdeaItem {
  id: string;
  title: string;
  notes: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Planned' | 'Completed';
  createdAt: string;
}
