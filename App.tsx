import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, GroundingSource } from './types';
import { 
    getAiChatResponse, 
    generateTextToSpeech, 
    generateImage,
    editImage
} from './services/geminiService';
import { playAudio } from './utils/audioUtils';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import ChatBubble from './components/ChatBubble';
import MicrophoneIcon from './components/MicrophoneIcon';
import VoiceWave from './components/VoiceWave';
import SendIcon from './components/SendIcon';
import AttachmentIcon from './components/AttachmentIcon';
import Modal from './components/Modal';
import Logo from './components/Logo';
import { SearchIcon, ProjectsIcon, AgentsIcon, ProfileIcon, FilesIcon, MemoryIcon, ToolsIcon, ChevronDownIcon, ChatIcon } from './components/Icons';
import SearchTab from './components/SearchTab';
import ProjectsTab from './components/ProjectsTab';
import AgentsTab from './components/AgentsTab';
import ProfileTab from './components/ProfileTab';

type AppState = 'splash' | 'chat';
type Status = 'idle' | 'listening' | 'processing';
type Tab = 'chat' | 'search' | 'projects' | 'agents' | 'profile';
type Model = 'Aurix Fast' | 'Aurix Smart' | 'Aurix Deep' | 'Aurix Vision' | 'Aurix Code';

const DEFAULT_WAKE_WORD = 'hey aurix';

const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const storedHistory = localStorage.getItem('chatHistory');
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (e) { return []; }
    });

    const [appState, setAppState] = useState<AppState>('splash');
    const [status, setStatus] = useState<Status>('idle');
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState<Tab>('chat');
    const [activeModel, setActiveModel] = useState<Model>('Aurix Smart');

    const [wakeWord, setWakeWord] = useState<string>(() => {
        return localStorage.getItem('aurix-wake-word') || DEFAULT_WAKE_WORD;
    });

    const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('aurix-voice-enabled');
        return saved === null ? true : saved === 'true';
    });

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(console.error);
        }
        return audioContextRef.current;
    }, []);

    const stopSpeaking = useCallback(() => {
        if (activeAudioSourceRef.current) {
            try {
                activeAudioSourceRef.current.stop();
            } catch (e) {}
            activeAudioSourceRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    useEffect(() => {
        if (appState === 'splash') {
            const timer = setTimeout(() => setAppState('chat'), 2000);
            return () => clearTimeout(timer);
        }
    }, [appState]);

    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }, [messages]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputText]);

    const addMessage = useCallback((message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const handleSpeechResult = useCallback((transcript: string) => {
        handleSendMessage(transcript);
    }, []);

    const { isListening, startListening, stopListening } = useSpeechRecognition(handleSpeechResult);

    const speakAndAddMessage = useCallback(async (text: string, sources?: GroundingSource[], imageUrl?: string) => {
        addMessage({ id: `ai-${crypto.randomUUID()}`, sender: 'ai', text, sources, imageUrl });
        
        stopListening();
        stopSpeaking();
        
        if (!isVoiceEnabled) return;

        const audio = await generateTextToSpeech(text);
        if (audio) {
            const { source, finished } = await playAudio(audio, getAudioContext());
            activeAudioSourceRef.current = source;
            setIsSpeaking(true);
            await finished;
            if (activeAudioSourceRef.current === source) {
                setIsSpeaking(false);
                activeAudioSourceRef.current = null;
            }
        }
    }, [addMessage, getAudioContext, stopListening, stopSpeaking, isVoiceEnabled]);

    const handleSendMessage = useCallback(async (message: string) => {
        if (isSpeaking) stopSpeaking();
        if (!message.trim() && !selectedImage) return;
        
        getAudioContext();
        setStatus('processing');
        
        const currentImage = selectedImage;
        addMessage({ 
            id: `user-${crypto.randomUUID()}`, 
            sender: 'user', 
            text: message, 
            userImageUrl: currentImage || undefined 
        });
        setSelectedImage(null);
        setInputText('');

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        const command = message.trim().toLowerCase();
        
        try {
            if (command.includes('create image') || command.includes('generate image')) {
                const prompt = message.replace(/create image|generate image/gi, '').trim();
                const genUrl = await generateImage(prompt || "a beautiful futuristic city");
                if (genUrl) {
                    await speakAndAddMessage("I've generated that image for you.", [], genUrl);
                } else {
                    await speakAndAddMessage("I'm sorry, I couldn't generate that image right now.");
                }
            } 
            else if ((command.includes('edit image') || command.includes('modify image')) && currentImage) {
                const prompt = message.replace(/edit image|modify image/gi, '').trim();
                const editUrl = await editImage(prompt || "add more detail", currentImage);
                if (editUrl) {
                    await speakAndAddMessage("I've modified the image as requested.", [], editUrl);
                } else {
                    await speakAndAddMessage("I'm sorry, I couldn't edit that image.");
                }
            }
            else {
                const aiResponse = await getAiChatResponse(message, currentImage || undefined);
                await speakAndAddMessage(aiResponse.text, aiResponse.sources);
            }
        } catch (error) {
            await speakAndAddMessage("I'm sorry, I encountered an issue. Please try again.");
        } finally {
            setStatus('idle');
        }
    }, [addMessage, speakAndAddMessage, getAudioContext, isSpeaking, stopSpeaking, selectedImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputText);
        }
    };

    if (appState === 'splash') {
        return (
            <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-96 h-96 bg-blue-600/20 rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
                </div>
                <Logo className="w-20 h-20 text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10" />
                <h1 className="text-3xl font-semibold tracking-tight z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AURIX v3.0</h1>
                <p className="text-gray-400 mt-3 text-sm z-10 font-medium tracking-wide">Initializing Core Engine...</p>
            </div>
        );
    }
    
    return (
        <div className="flex h-screen bg-black text-gray-200 font-sans overflow-hidden selection:bg-blue-500/30">
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop) */}
            <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-black/50 backdrop-blur-xl flex flex-col border-r border-white/10 transition-transform duration-300 ease-in-out`}>
                <div className="p-4 flex items-center justify-between">
                    <button 
                        onClick={() => { setMessages([]); setInputText(''); setCurrentTab('chat'); }}
                        className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all group mr-2 border border-white/5"
                    >
                        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-1.5 rounded-lg">
                            <Logo className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">New Chat</span>
                    </button>
                    <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-3 py-2">
                    <div className="space-y-1">
                        <button onClick={() => setCurrentTab('chat')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentTab === 'chat' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                            <ChatIcon className="w-5 h-5" />
                            <span className="text-sm">Chats</span>
                        </button>
                        <button onClick={() => setCurrentTab('projects')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentTab === 'projects' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                            <ProjectsIcon className="w-5 h-5" />
                            <span className="text-sm">Projects</span>
                        </button>
                        <button onClick={() => setCurrentTab('agents')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentTab === 'agents' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                            <AgentsIcon className="w-5 h-5" />
                            <span className="text-sm">Agents</span>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar mt-4">
                    <div className="text-[11px] font-bold text-gray-500 mb-3 px-3 uppercase tracking-widest">Recent Chats</div>
                    {messages.length > 0 ? (
                        <div className="px-3 py-2.5 bg-white/5 rounded-xl text-sm text-gray-200 truncate cursor-pointer font-medium hover:bg-white/10 transition-colors">
                            {messages[0].text ? messages[0].text.substring(0, 30) : 'Conversation'}
                        </div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-600 italic">
                            No history yet
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                            <span>Aurix Pro Network</span>
                        </div>
                        <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-300">Active</span>
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                            BJ
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-200 truncate w-full">Boakye Jeff</span>
                            <span className="text-[11px] text-gray-500">Pro Plan</span>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative h-full min-w-0 bg-black">
                {/* Top Actions Nav */}
                <header className="h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 backdrop-blur-md bg-black/60 border-b border-white/5 z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 md:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        {/* Model Switcher */}
                        <div className="flex items-center gap-2 text-sm text-gray-200 font-medium hover:bg-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/10 group">
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text font-bold">{activeModel}</span>
                            <ChevronDownIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                        {status === 'listening' && <VoiceWave />}
                        {isSpeaking && (
                            <button 
                                onClick={stopSpeaking}
                                className="mr-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold hover:bg-red-500/30 transition-colors border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                            >
                                Stop
                            </button>
                        )}
                        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Files">
                            <FilesIcon className="w-4 h-4" />
                            <span className="hidden lg:inline">Files</span>
                        </button>
                        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Memory">
                            <MemoryIcon className="w-4 h-4" />
                            <span className="hidden lg:inline">Memory</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Tools">
                            <ToolsIcon className="w-4 h-4" />
                            <span className="hidden lg:inline">Tools</span>
                        </button>
                    </div>
                </header>

                {/* Main View Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative" ref={chatContainerRef}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none"></div>
                    
                    {currentTab === 'chat' && (
                        <div className="max-w-3xl mx-auto pt-8 pb-72 px-4 md:px-0 relative z-10">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[50vh] mt-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] border border-white/5 backdrop-blur-xl">
                                        <Logo className="w-10 h-10 text-cyan-400 drop-shadow-md" />
                                    </div>
                                    <h2 className="text-[32px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-10 tracking-tight text-center">Good afternoon, Boakye.</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl px-4">
                                        <button onClick={() => handleSendMessage("Create a futuristic UI dashboard")} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all group backdrop-blur-md">
                                            <div className="text-sm text-gray-200 font-medium mb-1 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Generate UI Design
                                            </div>
                                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Futuristic dashboard with neon</div>
                                        </button>
                                        <button onClick={() => handleSendMessage("Analyze the latest market trends")} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all group backdrop-blur-md">
                                            <div className="text-sm text-gray-200 font-medium mb-1 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                                Market Analysis
                                            </div>
                                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Scan crypto and forex trends</div>
                                        </button>
                                        <button onClick={() => handleSendMessage("Help me debug this React component")} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all group backdrop-blur-md">
                                            <div className="text-sm text-gray-200 font-medium mb-1 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                Code Assistant
                                            </div>
                                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Fix bugs or refactor logic</div>
                                        </button>
                                        <button onClick={() => handleSendMessage("Research the latest AI models")} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all group backdrop-blur-md">
                                            <div className="text-sm text-gray-200 font-medium mb-1 flex items-center gap-2">
                                                <SearchIcon className="w-4 h-4 text-green-400" />
                                                Deep Research
                                            </div>
                                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Browse web and synthesize</div>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map(msg => <ChatBubble key={msg.id} {...msg} />)}
                                    {status === 'processing' && (
                                        <ChatBubble id="temp" sender="ai" text="..." />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Placeholders for other tabs */}
                    {currentTab === 'search' && <SearchTab />}
                    {currentTab === 'projects' && <ProjectsTab />}
                    {currentTab === 'agents' && <AgentsTab />}
                    {currentTab === 'profile' && <ProfileTab />}
                </main>

                {/* Input Area */}
                {currentTab === 'chat' && (
                    <div className="absolute bottom-16 md:bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-6 px-4 md:px-0 z-20 pointer-events-none">
                        <div className="max-w-3xl mx-auto pointer-events-auto">
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all focus-within:ring-1 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/30">
                                {selectedImage && (
                                    <div className="p-3 pb-0">
                                        <div className="relative inline-block group">
                                            <img src={selectedImage} className="w-16 h-16 object-cover rounded-xl border border-white/20" alt="Preview" />
                                            <button 
                                                onClick={() => setSelectedImage(null)} 
                                                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-white/20"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <form 
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
                                    className="flex flex-col px-2 py-2"
                                >
                                    <textarea 
                                        ref={textareaRef}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Message Aurix..."
                                        className="w-full bg-transparent text-gray-100 resize-none max-h-[200px] py-3 px-3 focus:outline-none placeholder-gray-500 text-[16px] leading-relaxed"
                                        rows={1}
                                        disabled={status !== 'idle' || isSpeaking}
                                    />
                                    <div className="flex items-center justify-between mt-1 px-2 pb-1">
                                        <div className="flex items-center gap-2">
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                            <button 
                                                type="button" 
                                                onClick={() => fileInputRef.current?.click()} 
                                                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                                                title="Attach image or file"
                                            >
                                                <AttachmentIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                type="button" 
                                                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors hidden sm:block"
                                                title="Web Search"
                                            >
                                                <SearchIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => status === 'listening' ? stopListening() : startListening(false)}
                                                disabled={isSpeaking}
                                                className={`p-2 rounded-xl transition-all flex items-center justify-center ${status === 'listening' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-50`}
                                                title="Voice input"
                                            >
                                                <MicrophoneIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={isSpeaking || (!inputText.trim() && !selectedImage)} 
                                                className="p-2 rounded-xl transition-all flex items-center justify-center bg-white text-black hover:bg-gray-200 disabled:bg-white/10 disabled:text-white/30"
                                            >
                                                <SendIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="text-center mt-3 text-[11px] text-gray-500 font-medium">
                                Aurix v3.0 can make mistakes. Verify important information.
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation (Mobile) */}
                <div className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-30">
                    <button onClick={() => setCurrentTab('chat')} className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'chat' ? 'text-cyan-400' : 'text-gray-500'}`}>
                        <ChatIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                    <button onClick={() => setCurrentTab('search')} className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'search' ? 'text-cyan-400' : 'text-gray-500'}`}>
                        <SearchIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Search</span>
                    </button>
                    <button onClick={() => setCurrentTab('projects')} className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'projects' ? 'text-cyan-400' : 'text-gray-500'}`}>
                        <ProjectsIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Projects</span>
                    </button>
                    <button onClick={() => setCurrentTab('agents')} className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'agents' ? 'text-cyan-400' : 'text-gray-500'}`}>
                        <AgentsIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Agents</span>
                    </button>
                    <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'profile' ? 'text-cyan-400' : 'text-gray-500'}`}>
                        <ProfileIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            <Modal title="Settings" isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <label className="font-medium text-gray-200">Voice Feedback</label>
                         <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${isVoiceEnabled ? 'bg-cyan-600' : 'bg-white/10'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform ${isVoiceEnabled ? 'translate-x-6' : ''}`} />
                         </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-200">Wake Word</label>
                        <input type="text" value={wakeWord} onChange={(e) => setWakeWord(e.target.value)} className="w-full p-2.5 bg-white/5 text-white border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        <p className="text-xs text-gray-500 mt-2">The phrase used to activate voice listening automatically.</p>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-500 text-center">Aurix v3.0 • Premium Edition</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default App;
