import React, { useState, useEffect } from 'react';
import { ProjectsIcon } from './Icons';

interface Project {
    name: string;
    date: string;
    status: string;
    type: string;
}

const ProjectsTab = () => {
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('aurix_projects');
        if (saved) return JSON.parse(saved);
        return [
            { name: 'Trading Journal App', date: 'Updated 2 hrs ago', status: 'In Progress', type: 'React / Node.js' },
            { name: 'Crypto Analyzer Bot', date: 'Updated yesterday', status: 'Deployed', type: 'Python' },
            { name: 'Personal Website', date: 'Updated 3 days ago', status: 'Draft', type: 'Next.js' },
        ];
    });

    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectType, setNewProjectType] = useState('');

    useEffect(() => {
        localStorage.setItem('aurix_projects', JSON.stringify(projects));
    }, [projects]);

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        const newProject: Project = {
            name: newProjectName,
            date: 'Just now',
            status: 'Draft',
            type: newProjectType || 'Unspecified'
        };

        setProjects([newProject, ...projects]);
        setNewProjectName('');
        setNewProjectType('');
        setIsCreating(false);
    };

    const handleDeleteProject = (index: number) => {
        const newProjects = [...projects];
        newProjects.splice(index, 1);
        setProjects(newProjects);
    };

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-36 px-4 md:px-8 relative z-10 w-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold text-white">Projects Workspace</h2>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    New Project
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-lg font-medium text-white mb-4">Create New Project</h3>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Name</label>
                            <input 
                                type="text" 
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" 
                                placeholder="e.g. AI Content Generator"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tech Stack / Type</label>
                            <input 
                                type="text" 
                                value={newProjectType}
                                onChange={(e) => setNewProjectType(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" 
                                placeholder="e.g. React / TypeScript"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {projects.length === 0 && !isCreating ? (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                    <ProjectsIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No Projects</h3>
                    <p className="text-gray-400">Create a new project to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group relative">
                            <button 
                                onClick={() => handleDeleteProject(i)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete project"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <ProjectsIcon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold ${project.status === 'Deployed' ? 'bg-green-500/20 text-green-400' : project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {project.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1 pr-6">{project.name}</h3>
                            <p className="text-xs text-gray-400 mb-4">{project.type}</p>
                            <div className="text-[11px] text-gray-500">{project.date}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsTab;
