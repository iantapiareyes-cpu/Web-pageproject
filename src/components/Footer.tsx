import React from 'react';
import { ArrowUp, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="border-t border-stone-200 bg-stone-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="font-semibold text-stone-700">Web-pageproject</span>
          <span>&bull;</span>
          <span>Designed & Maintained by Ian Tapia Reyes</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            id="footer-github-link"
            href="https://github.com/iantapiareyes-cpu/Web-pageproject-"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>

          <button
            id="btn-scroll-top"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 transition-colors shadow-2xs"
          >
            <ArrowUp className="h-3 w-3" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
