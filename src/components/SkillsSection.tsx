import React from 'react';
import { Layers, Terminal, Cpu, Sparkles } from 'lucide-react';
import { SkillCategory } from '../types';

interface SkillsSectionProps {
  categories: SkillCategory[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ categories }) => {
  const getIcon = (title: string) => {
    if (title.includes('Frontend')) return <Layers className="h-4 w-4 text-stone-700" />;
    if (title.includes('Backend')) return <Cpu className="h-4 w-4 text-stone-700" />;
    if (title.includes('DevOps')) return <Terminal className="h-4 w-4 text-stone-700" />;
    return <Sparkles className="h-4 w-4 text-stone-700" />;
  };

  return (
    <section id="skills-section" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-b border-stone-200 pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Technical Stack
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Core Competencies & Toolchain
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Technologies, libraries, and design principles applied across web applications.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.title}
              id={`skill-card-${idx}`}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs hover:border-stone-300 transition-colors"
            >
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100">
                  {getIcon(cat.title)}
                </div>
                <h3 className="text-sm font-bold text-stone-900">{cat.title}</h3>
              </div>

              <ul className="mt-3 space-y-2">
                {cat.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2 text-xs text-stone-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
