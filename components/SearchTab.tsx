import React, { useState } from 'react';
import { SearchIcon } from './Icons';

const SearchTab = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<{title: string, summary: string, source: string}[] | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setIsSearching(true);
        setResults(null);
        
        // Simulate a search delay
        setTimeout(() => {
            setIsSearching(false);
            setResults([
                {
                    title: `Analysis of ${query}`,
                    summary: `According to recent data, ${query} has shown significant development in the past few months. Key factors include technological advancements and market adoption.`,
                    source: 'Global Research Daily'
                },
                {
                    title: `The Future of ${query}`,
                    summary: `Experts predict that ${query} will revolutionize the industry by 2027. We are already seeing early signs of this shift in enterprise environments.`,
                    source: 'Tech Insights'
                }
            ]);
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-36 px-4 md:px-8 relative z-10 w-full">
            <h2 className="text-3xl font-semibold text-white mb-8">Deep Search</h2>
            
            <form onSubmit={handleSearch} className="relative mb-12">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything or search the web..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-lg transition-all"
                />
                <button 
                    type="submit"
                    disabled={isSearching || !query.trim()}
                    className="absolute inset-y-2 right-2 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Search'}
                </button>
            </form>

            {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 animate-pulse">Deep scanning web sources...</h3>
                    <p className="text-sm text-gray-500">Synthesizing information from 40+ trusted sources</p>
                </div>
            ) : results ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <SearchIcon className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-medium text-white">Research Synthesis</h3>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-200 leading-relaxed mb-6">
                            Based on multiple sources, <strong className="text-white">{query}</strong> is experiencing rapid evolution. The consensus among experts highlights both immediate practical applications and long-term structural shifts in the industry.
                        </p>
                        
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Cited Sources</h4>
                        <div className="space-y-4">
                            {results.map((res, i) => (
                                <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/5">
                                    <h5 className="text-blue-400 font-medium mb-1">{res.title}</h5>
                                    <p className="text-sm text-gray-400 mb-2">{res.summary}</p>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        {res.source}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trending Research</h3>
                        <div className="space-y-3">
                            {['Latest AI Models 2026', 'Quantum Computing Breakthroughs', 'Global Market Trends Q3'].map((item, i) => (
                                <button key={i} onClick={() => {setQuery(item); handleSearch({preventDefault: () => {}} as any)}} className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-left group">
                                    <SearchIcon className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                    <span className="text-gray-200 text-sm group-hover:text-white transition-colors">{item}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Search Modes</h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-cyan-500/20 rounded-xl">
                                <h4 className="text-cyan-400 font-medium mb-1">Deep Research</h4>
                                <p className="text-xs text-gray-400">Synthesizes information from multiple sources with citations.</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                <h4 className="text-gray-200 font-medium mb-1">Academic Mode</h4>
                                <p className="text-xs text-gray-400">Searches papers, journals, and educational resources.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchTab;
