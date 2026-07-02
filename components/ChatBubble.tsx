import React from 'react';
import { ChatMessage } from '../types';
import Logo from './Logo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiAvatar = () => (
    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black border border-white/10 flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
        <Logo className="w-5 h-5 text-cyan-400" />
    </div>
);

const ChatBubble: React.FC<ChatMessage> = ({ sender, text, sources, imageUrl, userImageUrl }) => {
    const isUser = sender === 'user';

    const textToShow = text === '...' 
        ? <span className="inline-block content-[''] before:content-['.'] after:content-['.'] loading-dots"></span>
        : text;

    if (isUser) {
        return (
            <div className="flex justify-end w-full mb-6 group">
                <div className="bg-gradient-to-br from-blue-600/90 to-cyan-600/90 backdrop-blur-md text-white rounded-3xl rounded-tr-sm px-5 py-3 max-w-[75%] inline-block text-[15px] leading-relaxed shadow-[0_4px_20px_rgba(37,99,235,0.2)] border border-white/10">
                    {userImageUrl && (
                        <div className="mb-3">
                            <img 
                                src={userImageUrl} 
                                alt="User attachment" 
                                className="rounded-xl max-w-sm w-full h-auto object-cover border border-white/20" 
                            />
                        </div>
                    )}
                    <div className="whitespace-pre-wrap">{textToShow}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-4 w-full mb-8 max-w-3xl group">
            <AiAvatar />
            <div className="flex-1 min-w-0 pt-0.5">
                {imageUrl && (
                    <div className="mb-4">
                        <img 
                            src={imageUrl} 
                            alt="AI generated" 
                            className="rounded-xl max-w-sm w-full h-auto object-cover border border-white/10 shadow-lg" 
                        />
                    </div>
                )}
                <div className="leading-relaxed text-[15px] text-gray-200 font-normal">
                    {text === '...' ? (
                        <div className="whitespace-pre-wrap">{textToShow}</div>
                    ) : (
                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1A1D27] prose-pre:border prose-pre:border-white/10 prose-headings:text-white prose-a:text-blue-400">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {text}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                {sources && sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Sources</h4>
                        <ul className="flex flex-wrap gap-2">
                            {sources.map((source, index) => (
                                <li key={index}>
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors border border-white/5 backdrop-blur-sm"
                                        title={source.title}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="truncate max-w-[150px]">{source.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;
