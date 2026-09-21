import React, { useState } from 'react';
import { Mail, GitBranch, Send, CheckCircle } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="contact-section" className="border-t border-stone-200 bg-stone-100/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Get in Touch
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Let&apos;s Build Together
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Whether you want to discuss frontend architecture, open source contributions, or collaborative
              projects, feel free to drop a line.
            </p>

            <div className="mt-6 space-y-3">
              <a
                id="contact-email-link"
                href="mailto:iantapiareyes@gmail.com"
                className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3 text-xs text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-stone-800">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Email Directly</div>
                  <div className="text-stone-500 font-mono">iantapiareyes@gmail.com</div>
                </div>
              </a>

              <a
                id="contact-github-profile-link"
                href="https://github.com/iantapiareyes-cpu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3 text-xs text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-stone-800">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">GitHub Profile</div>
                  <div className="text-stone-500 font-mono">github.com/iantapiareyes-cpu</div>
                </div>
              </a>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              {submitted ? (
                <div id="contact-success-box" className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-stone-900">Message Received!</h3>
                  <p className="mt-2 text-xs text-stone-600 max-w-sm mx-auto">
                    Thank you for reaching out, {name}. The message note has been stored in this session.
                  </p>
                  <button
                    id="btn-send-another"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="mt-5 inline-flex items-center rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-medium text-stone-700">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-medium text-stone-700">
                        Your Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-medium text-stone-700">
                      Message / Project Scope
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share project ideas, questions, or collaboration inquiries..."
                      className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      id="btn-submit-contact"
                      className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-xs font-medium text-stone-50 shadow-xs hover:bg-stone-800 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
