
import React from 'react';
import Logo from './Logo';

const HistoryIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.333.183-.582.495-.645.87l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.87l.213-1.281Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);


interface HeaderProps {
    onHistoryClick: () => void;
    onExperimentsClick: () => void;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHistoryClick, onExperimentsClick, onSettingsClick }) => {
    return (
        <header className="flex items-center justify-between p-4 border-b border-[#1A1D27]/50 bg-[#0A0C14]">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Logo className="w-10 h-10 text-white" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0A0C14]"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white leading-tight">Aurix</span>
                    <span className="text-[11px] text-gray-400 font-medium">Your AI Assistant</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onExperimentsClick} className="p-2.5 rounded-2xl bg-[#1A1D27] hover:bg-[#252836] transition-colors" aria-label="AI Experiments">
                    <SparklesIcon className="w-5 h-5 text-blue-400" />
                </button>
                 <button onClick={onHistoryClick} className="p-2.5 rounded-2xl bg-[#1A1D27] hover:bg-[#252836] transition-colors" aria-label="Conversation History">
                    <HistoryIcon className="w-5 h-5 text-gray-300" />
                </button>
                 <button onClick={onSettingsClick} className="p-2.5 rounded-2xl bg-[#1A1D27] hover:bg-[#252836] transition-colors" aria-label="Settings">
                    <SettingsIcon className="w-5 h-5 text-gray-300" />
                </button>
            </div>
        </header>
    );
};

export default Header;
