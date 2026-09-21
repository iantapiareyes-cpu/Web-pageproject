import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProjectShowcase } from './components/ProjectShowcase';
import { ProjectPlanner } from './components/ProjectPlanner';
import { SkillsSection } from './components/SkillsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { INITIAL_PROJECTS, SKILL_CATEGORIES } from './data';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('projects');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`${sectionId}-section`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased flex flex-col">
      <Navbar onNavigate={scrollToSection} activeSection={activeSection} />

      <main className="flex-1">
        <Hero
          onExploreProjects={() => scrollToSection('projects')}
          onOpenPlanner={() => scrollToSection('planner')}
        />

        <ProjectShowcase projects={INITIAL_PROJECTS} />

        <ProjectPlanner />

        <SkillsSection categories={SKILL_CATEGORIES} />

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default App;
