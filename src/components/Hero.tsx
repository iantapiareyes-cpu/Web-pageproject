import React from 'react';
import { ArrowDown, Code2, Terminal, ExternalLink, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreProjects: () => void;
  onOpenPlanner: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProjects, onOpenPlanner }) => {
  return (
    <section id="hero-section" className="border-b border-stone-200 bg-stone-100/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-2xs mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
            </span>
            <span>Live Workspace &bull; Repository Synced</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl font-sans leading-tight sm:leading-tight">
            Building intuitive digital experiences and robust web systems.
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-600">
            Welcome to <strong className="text-stone-900 font-semibold">Web-pageproject</strong> by{' '}
            <span className="text-stone-900 font-medium">Ian Tapia Reyes</span>. Explore deployed work,
            technical concepts, and interactive web architecture prototypes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              id="hero-explore-projects-btn"
              onClick={onExploreProjects}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-stone-900 px-5 text-sm font-medium text-stone-50 shadow-xs hover:bg-stone-800 transition-colors"
            >
              <Code2 className="h-4 w-4" />
              <span>Explore Projects</span>
              <ArrowDown className="h-4 w-4 text-stone-400" />
            </button>

            <button
              id="hero-open-planner-btn"
              onClick={onOpenPlanner}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-stone-800 shadow-2xs hover:bg-stone-50 transition-colors"
            >
              <Terminal className="h-4 w-4 text-stone-600" />
              <span>Interactive Idea Board</span>
            </button>

            <a
              id="hero-github-repo-link"
              href="https://github.com/iantapiareyes-cpu/Web-pageproject-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-transparent px-4 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-stone-200 pt-6 sm:grid-cols-3">
            <div>
              <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">Architecture</div>
              <div className="mt-1 text-sm font-semibold text-stone-900">React 19 + Vite + Node 22</div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">Status</div>
              <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Active & Healthy</span>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">Port & Runtime</div>
              <div className="mt-1 text-sm font-semibold text-stone-900">0.0.0.0:3000 Clean</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
