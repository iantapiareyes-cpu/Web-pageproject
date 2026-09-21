import React, { useState } from 'react';
import { ExternalLink, GitBranch, Star, Filter, FolderGit2 } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectShowcaseProps {
  projects: ProjectItem[];
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDetailProject, setActiveDetailProject] = useState<ProjectItem | null>(null);

  const categories = ['All', 'Web Apps', 'Tools & Systems', 'Creative'];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects-section" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Curated Work</span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Featured Projects & Repositories
            </h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="tablist">
            <span className="mr-1 inline-flex items-center text-xs font-medium text-stone-400">
              <Filter className="mr-1 h-3 w-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-stone-50'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-2xs transition-all hover:border-stone-300 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                    <FolderGit2 className="h-3 w-3 text-stone-500" />
                    {project.category}
                  </span>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="mt-3.5 text-lg font-bold text-stone-900 hover:text-stone-700">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-stone-100 px-2 py-0.5 text-xs font-mono text-stone-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                <button
                  id={`btn-view-details-${project.id}`}
                  onClick={() => setActiveDetailProject(project)}
                  className="text-xs font-semibold text-stone-700 hover:text-stone-950 underline underline-offset-4"
                >
                  View Details
                </button>

                <div className="flex items-center gap-3">
                  {project.repoUrl && (
                    <a
                      id={`project-repo-link-${project.id}`}
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {project.link && (
                    <a
                      id={`project-live-link-${project.id}`}
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-stone-900 hover:text-stone-700"
                    >
                      <span>Demo</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for detail view */}
        {activeDetailProject && (
          <div
            id="project-detail-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 backdrop-blur-xs p-4"
            onClick={() => setActiveDetailProject(null)}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-stone-500">
                    {activeDetailProject.category}
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-stone-900">
                    {activeDetailProject.title}
                  </h3>
                </div>
                <button
                  id="modal-close-button"
                  onClick={() => setActiveDetailProject(null)}
                  className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                {activeDetailProject.description}
              </p>

              <div className="mt-5">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  Technology Stack
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeDetailProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-mono text-stone-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  id="modal-dismiss-btn"
                  onClick={() => setActiveDetailProject(null)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Close
                </button>
                {activeDetailProject.repoUrl && (
                  <a
                    id="modal-repo-link"
                    href={activeDetailProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-stone-50 hover:bg-stone-800"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>View Repository</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
