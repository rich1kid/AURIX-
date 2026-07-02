import React, { useState, useEffect } from 'react';

const ProfileTab = () => {
    const [activeTab, setActiveTab] = useState('Profile');
    const [displayName, setDisplayName] = useState(() => {
        return localStorage.getItem('aurix_display_name') || 'Boakye Jeff';
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(displayName);

    const handleSaveProfile = () => {
        setDisplayName(tempName);
        localStorage.setItem('aurix_display_name', tempName);
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-36 px-4 md:px-8 relative z-10 w-full">
            <h2 className="text-3xl font-semibold text-white mb-8">Account Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    {['Profile', 'Appearance', 'Models', 'Memory', 'Voice', 'Security', 'Billing', 'Integrations'].map((item, i) => (
                        <button 
                            key={i} 
                            onClick={() => setActiveTab(item)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${activeTab === item ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                    {displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-white">{displayName}</h3>
                                    <p className="text-sm text-gray-400">boakyejeff.99@gmail.com</p>
                                </div>
                            </div>
                            {!isEditing && activeTab === 'Profile' && (
                                <button 
                                    onClick={() => {
                                        setTempName(displayName);
                                        setIsEditing(true);
                                    }}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                        
                        {activeTab === 'Profile' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                className="flex-1 bg-black border border-cyan-500/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50" 
                                                autoFocus
                                            />
                                            <button 
                                                onClick={handleSaveProfile}
                                                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors shadow-lg"
                                            >
                                                Save
                                            </button>
                                            <button 
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-gray-300 cursor-not-allowed">
                                            {displayName}
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-white/10 mt-6">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Plan</label>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl">
                                        <div>
                                            <div className="text-blue-400 font-medium mb-1">Aurix Pro</div>
                                            <div className="text-xs text-gray-400">Access to Aurix Deep, Vision, and advanced agents.</div>
                                        </div>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab !== 'Profile' && (
                            <div className="py-8 text-center text-gray-400">
                                <div className="text-4xl mb-4">⚙️</div>
                                <p>The {activeTab} settings module is currently being configured.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
