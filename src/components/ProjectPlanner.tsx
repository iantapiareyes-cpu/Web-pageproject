import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, AlertCircle, Trash2, Lightbulb } from 'lucide-react';
import { WebIdeaItem } from '../types';

const STORAGE_KEY = 'web_page_project_ideas';

const INITIAL_IDEAS: WebIdeaItem[] = [
  {
    id: 'idea-1',
    title: 'Integrate Live GitHub Activity Feed',
    notes: 'Fetch public commit summaries and repository release tags dynamically.',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-09-18',
  },
  {
    id: 'idea-2',
    title: 'Interactive 3D WebGL / Shader Canvas',
    notes: 'Experiment with lightweight Three.js or canvas particle loops for creative experiments.',
    priority: 'Medium',
    status: 'Planned',
    createdAt: '2026-09-18',
  },
  {
    id: 'idea-3',
    title: 'Deploy to Cloud Container Registry',
    notes: 'Set up automated build verification and health monitoring endpoints.',
    priority: 'High',
    status: 'Completed',
    createdAt: '2026-09-18',
  },
];

export const ProjectPlanner: React.FC = () => {
  const [ideas, setIdeas] = useState<WebIdeaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_IDEAS;
  });

  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch {
      // ignore
    }
  }, [ideas]);

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: WebIdeaItem = {
      id: `idea-${Date.now()}`,
      title: newTitle.trim(),
      notes: newNotes.trim(),
      priority: newPriority,
      status: 'Planned',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setIdeas([newItem, ...ideas]);
    setNewTitle('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleToggleStatus = (id: string) => {
    setIdeas((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus: Record<WebIdeaItem['status'], WebIdeaItem['status']> = {
          'Planned': 'In Progress',
          'In Progress': 'Completed',
          'Completed': 'Planned',
        };
        return { ...item, status: nextStatus[item.status] };
      })
    );
  };

  const handleDelete = (id: string) => {
    setIdeas((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section id="planner-section" className="border-t border-stone-200 bg-stone-100/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              <span>Interactive Roadmap</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Project Idea & Feature Scratchpad
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Track upcoming improvements, architecture goals, and feature concepts with local persistence.
            </p>
          </div>

          <button
            id="btn-toggle-add-idea"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg bg-stone-900 px-4 text-xs font-medium text-stone-50 shadow-2xs hover:bg-stone-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? 'Close Form' : 'New Idea / Goal'}</span>
          </button>
        </div>

        {isAdding && (
          <form
            id="add-idea-form"
            onSubmit={handleAddIdea}
            className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-stone-900">Add New Milestone or Roadmap Item</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="idea-title-input" className="block text-xs font-medium text-stone-700">
                  Title
                </label>
                <input
                  id="idea-title-input"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement dynamic theme switcher or GraphQL client"
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="idea-priority-select" className="block text-xs font-medium text-stone-700">
                  Priority
                </label>
                <select
                  id="idea-priority-select"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                  className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:outline-hidden"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="idea-notes-input" className="block text-xs font-medium text-stone-700">
                  Notes & Details
                </label>
                <textarea
                  id="idea-notes-input"
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional context, tech specs, or links..."
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                id="btn-cancel-add-idea"
                onClick={() => setIsAdding(false)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-idea"
                className="rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-medium text-stone-50 hover:bg-stone-800"
              >
                Save to Roadmap
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(['Planned', 'In Progress', 'Completed'] as const).map((colStatus) => {
            const columnItems = ideas.filter((item) => item.status === colStatus);

            return (
              <div
                key={colStatus}
                id={`roadmap-column-${colStatus.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    {colStatus === 'Planned' && <AlertCircle className="h-4 w-4 text-stone-500" />}
                    {colStatus === 'In Progress' && <Clock className="h-4 w-4 text-blue-600" />}
                    {colStatus === 'Completed' && <Check className="h-4 w-4 text-emerald-600" />}
                    <h3 className="text-sm font-semibold text-stone-800">{colStatus}</h3>
                  </div>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                    {columnItems.length}
                  </span>
                </div>

                <div className="mt-3 flex flex-1 flex-col gap-3">
                  {columnItems.length === 0 ? (
                    <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-stone-200 text-xs text-stone-400">
                      No items in {colStatus}
                    </div>
                  ) : (
                    columnItems.map((item) => (
                      <div
                        key={item.id}
                        id={`idea-card-${item.id}`}
                        className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 shadow-2xs hover:bg-white transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-stone-900 leading-snug">{item.title}</h4>
                          <button
                            id={`btn-delete-idea-${item.id}`}
                            onClick={() => handleDelete(item.id)}
                            title="Delete item"
                            className="text-stone-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {item.notes && (
                          <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">{item.notes}</p>
                        )}

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-200/60">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              item.priority === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : item.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {item.priority}
                          </span>

                          <button
                            id={`btn-toggle-status-${item.id}`}
                            onClick={() => handleToggleStatus(item.id)}
                            className="text-[11px] font-medium text-stone-600 hover:text-stone-950 underline underline-offset-2"
                          >
                            Advance &rarr;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
