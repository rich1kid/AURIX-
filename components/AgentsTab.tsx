import React, { useState, useEffect } from 'react';
import { AgentsIcon } from './Icons';

interface Agent {
    name: string;
    desc: string;
    icon: string;
    color: string;
    bg: string;
    active: boolean;
}

const AgentsTab = () => {
    const defaultAgents = [
        { name: 'Research Agent', desc: 'Autonomous web research and synthesis', icon: '🔍', color: 'text-blue-400', bg: 'bg-blue-500/20', active: false },
        { name: 'Coding Agent', desc: 'Writes, reviews, and deploys code', icon: '💻', color: 'text-purple-400', bg: 'bg-purple-500/20', active: false },
        { name: 'Trading Agent', desc: 'Analyzes markets and technical indicators', icon: '📈', color: 'text-green-400', bg: 'bg-green-500/20', active: false },
        { name: 'Writing Agent', desc: 'Drafts emails, blogs, and reports', icon: '✍️', color: 'text-orange-400', bg: 'bg-orange-500/20', active: false }
    ];

    const [agents, setAgents] = useState<Agent[]>(() => {
        const saved = localStorage.getItem('aurix_agents');
        if (saved) return JSON.parse(saved);
        return defaultAgents;
    });

    const [isCreating, setIsCreating] = useState(false);
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentDesc, setNewAgentDesc] = useState('');

    useEffect(() => {
        localStorage.setItem('aurix_agents', JSON.stringify(agents));
    }, [agents]);

    const handleCreateAgent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAgentName.trim()) return;

        const newAgent: Agent = {
            name: newAgentName,
            desc: newAgentDesc || 'Custom Autonomous Agent',
            icon: '🤖',
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/20',
            active: false
        };

        setAgents([...agents, newAgent]);
        setNewAgentName('');
        setNewAgentDesc('');
        setIsCreating(false);
    };

    const toggleAgentStatus = (index: number) => {
        const newAgents = [...agents];
        newAgents[index].active = !newAgents[index].active;
        setAgents(newAgents);
    };

    const handleDeleteAgent = (index: number) => {
        const newAgents = [...agents];
        newAgents.splice(index, 1);
        setAgents(newAgents);
    };

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-36 px-4 md:px-8 relative z-10 w-full">
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-semibold text-white mb-2">Autonomous Agents</h2>
                <p className="text-gray-400">Deploy specialized AI agents for complex tasks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent, i) => (
                    <div key={i} className={`flex items-center gap-4 bg-white/5 border p-4 rounded-2xl transition-all group relative ${agent.active ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-white/10 hover:border-white/20'}`}>
                        {i >= 4 && (
                            <button 
                                onClick={() => handleDeleteAgent(i)}
                                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10 hover:bg-red-500/80"
                                title="Delete Agent"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${agent.bg}`}>
                            {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-medium mb-0.5 truncate ${agent.color}`}>{agent.name}</h3>
                            <p className="text-xs text-gray-400 truncate pr-2">{agent.desc}</p>
                        </div>
                        <button 
                            onClick={() => toggleAgentStatus(i)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border flex-shrink-0 ${agent.active ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}
                        >
                            {agent.active ? 'Active' : 'Deploy'}
                        </button>
                    </div>
                ))}
            </div>
            
            {isCreating ? (
                <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-lg font-medium text-white mb-4">Create Custom Agent</h3>
                    <form onSubmit={handleCreateAgent} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agent Name</label>
                            <input 
                                type="text" 
                                value={newAgentName}
                                onChange={(e) => setNewAgentName(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" 
                                placeholder="e.g. SEO Optimizer"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                            <input 
                                type="text" 
                                value={newAgentDesc}
                                onChange={(e) => setNewAgentDesc(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" 
                                placeholder="e.g. Optimizes blog posts for SEO"
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
            ) : (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-cyan-500/20 rounded-2xl text-center">
                    <h3 className="text-lg font-medium text-white mb-2">Build Custom Agent</h3>
                    <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">Create a specialized AI agent with custom instructions, tools, and access to your data.</p>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-500 transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                    >
                        Create Agent
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgentsTab;
