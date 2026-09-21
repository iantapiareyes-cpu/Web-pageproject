import React from 'react';
import { Globe, GitBranch, Mail } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection }) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-stone-200 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-stone-50 shadow-xs">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-stone-900">
              Web-pageproject
            </span>
            <span className="hidden text-xs text-stone-500 sm:inline-block sm:ml-2 font-mono">
              / Ian Tapia Reyes
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main Navigation">
          {[
            { id: 'projects', label: 'Projects' },
            { id: 'planner', label: 'Idea Planner' },
            { id: 'skills', label: 'Skills' },
            { id: 'contact', label: 'Contact' },
          ].map((item) => (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-stone-200 text-stone-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            id="nav-github-link"
            href="https://github.com/iantapiareyes-cpu/Web-pageproject-"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-100 transition-colors"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button
            id="nav-contact-button"
            onClick={() => onNavigate('contact')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-900 px-3 text-xs font-medium text-stone-50 shadow-2xs hover:bg-stone-800 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Connect</span>
          </button>
        </div>
      </div>
    </header>
  );
};
