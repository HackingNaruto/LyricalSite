"use client";
import { useState, useEffect } from "react";
import songsData from "../../data/songsData";
import Link from "next/link";
import { FiMusic, FiHome, FiEdit3, FiTrash2, FiPlus, FiSave, FiX, FiLock, FiSettings, FiDollarSign } from "react-icons/fi";

export default function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState("songs");
    const [songs, setSongs] = useState([]);

    // Forms
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ title: "", movie: "", singer: "", music: "", lyrics: "", lyrics_tamil: "" });
    const [adSettings, setAdSettings] = useState({ showAds: false, headerAd: "", sidebarAd: "" });

    useEffect(() => {
        setSongs(songsData.map((s, i) => ({ ...s, originalId: i })));
        fetch("/api/admin").then(res => res.json()).then(data => setAdSettings(data));
    }, []);

    const handleLogin = () => { if (password === "admin123") setIsAuthenticated(true); else alert("Wrong Password!"); };

    const handleSongSubmit = async (e) => {
        e.preventDefault();
        const action = isEditing ? "UPDATE" : "CREATE";
        const res = await fetch("/api/admin", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, id: editId, newData: formData }),
        });
        if (res.ok) window.location.reload();
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch("/api/admin", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "DELETE", id }),
        });
        if (res.ok) window.location.reload();
    };

    const saveAds = async () => {
        await fetch("/api/admin", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "UPDATE_ADS", adData: adSettings }),
        });
        alert("Ads Saved!");
    };

    const openEdit = (song) => { setIsEditing(true); setEditId(song.originalId); setFormData(song); window.scrollTo(0, 0); };
    const openCreate = () => { setIsEditing(false); setEditId(null); setFormData({ title: "", movie: "", singer: "", music: "", lyrics: "", lyrics_tamil: "" }); window.scrollTo(0, 0); };

    // ═══════════════ LOGIN SCREEN ═══════════════
    if (!isAuthenticated) return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a1a] transition-colors duration-500">
            <div className="w-full max-w-sm mx-4">
                <div className="glass-card rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/30">
                    {/* Lock Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <FiLock className="text-white text-2xl" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-center text-gray-800 dark:text-white mb-2">Admin Access</h2>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your credentials to continue</p>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all mb-4"
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        id="admin-password"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300"
                        id="admin-login-btn"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );

    // ═══════════════ DASHBOARD ═══════════════
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a] transition-colors duration-500 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 glass-card rounded-2xl p-4 md:p-5 border border-gray-200/50 dark:border-gray-700/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <FiSettings className="text-white text-lg" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-800 dark:text-white">Admin Dashboard</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{songs.length} songs in database</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveTab("songs")}
                        className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all duration-300 ${activeTab === 'songs'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                        id="tab-songs"
                    >
                        <FiMusic size={14} /> Songs
                    </button>
                    <button
                        onClick={() => setActiveTab("ads")}
                        className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all duration-300 ${activeTab === 'ads'
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                            : 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                        id="tab-ads"
                    >
                        <FiDollarSign size={14} /> Ads
                    </button>
                    <Link href="/" className="px-4 py-2 rounded-xl bg-gray-800 dark:bg-gray-700 text-white font-bold text-sm flex items-center gap-1.5 hover:bg-gray-700 dark:hover:bg-gray-600 transition-all">
                        <FiHome size={14} /> Home
                    </Link>
                </div>
            </div>

            {/* ═══════════════ SONGS TAB ═══════════════ */}
            {activeTab === "songs" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Song Form */}
                    <div className="glass-card rounded-2xl p-6 lg:col-span-1 h-fit sticky top-4 border border-gray-200/50 dark:border-gray-700/30">
                        <div className="flex items-center gap-2 mb-5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEditing
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                }`}>
                                {isEditing ? <FiEdit3 size={16} /> : <FiPlus size={16} />}
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">{isEditing ? "Edit Song" : "Add New Song"}</h2>
                        </div>
                        <form onSubmit={handleSongSubmit} className="space-y-3">
                            <input className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            <input className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all" placeholder="Movie" value={formData.movie} onChange={e => setFormData({ ...formData, movie: e.target.value })} />
                            <input className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all" placeholder="Singer" value={formData.singer} onChange={e => setFormData({ ...formData, singer: e.target.value })} />
                            <input className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all" placeholder="Music" value={formData.music} onChange={e => setFormData({ ...formData, music: e.target.value })} />
                            <textarea className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm h-32 resize-none transition-all" placeholder="Lyrics (English)" value={formData.lyrics} onChange={e => setFormData({ ...formData, lyrics: e.target.value })} required />
                            <textarea className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm h-24 resize-none transition-all" placeholder="Lyrics (Tamil - Optional)" value={formData.lyrics_tamil || ""} onChange={e => setFormData({ ...formData, lyrics_tamil: e.target.value })} />
                            <div className="flex gap-2 pt-1">
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-1.5">
                                    <FiSave size={14} /> {isEditing ? "Update" : "Create"}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={openCreate} className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-1.5">
                                        <FiX size={14} /> Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Songs Table */}
                    <div className="glass-card rounded-2xl p-6 lg:col-span-2 overflow-hidden border border-gray-200/50 dark:border-gray-700/30">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FiMusic className="text-indigo-500" /> All Songs
                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-full">{songs.length}</span>
                            </h2>
                            <button onClick={openCreate} className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-1.5">
                                <FiPlus size={13} /> Add New
                            </button>
                        </div>
                        <div className="h-[500px] overflow-y-auto rounded-xl border border-gray-200/50 dark:border-gray-700/30">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 dark:bg-gray-800/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Song</th>
                                        <th className="p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {songs.map((song) => (
                                        <tr key={song.originalId} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="p-3">
                                                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{song.title}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">{song.movie}</span>
                                            </td>
                                            <td className="p-3 text-right space-x-1">
                                                <button onClick={() => openEdit(song)} className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-all inline-flex items-center gap-1">
                                                    <FiEdit3 size={12} /> Edit
                                                </button>
                                                <button onClick={() => handleDelete(song.originalId)} className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all inline-flex items-center gap-1">
                                                    <FiTrash2 size={12} /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ ADS TAB ═══════════════ */}
            {activeTab === "ads" && (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card rounded-2xl p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                                <FiDollarSign className="text-white text-lg" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Ad Management</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Configure ads across the site</p>
                            </div>
                        </div>

                        {/* Toggle */}
                        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={adSettings.showAds} onChange={e => setAdSettings({ ...adSettings, showAds: e.target.checked })} className="w-5 h-5 text-indigo-600 rounded" />
                                <span className="font-bold text-gray-800 dark:text-white">Enable Ads on Website</span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">Toggle this to show/hide ads instantly across the site.</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">Header Ad Script</label>
                                <textarea
                                    className="w-full px-3 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-mono h-32 resize-none transition-all"
                                    placeholder="Paste Google Adsense / HTML code here..."
                                    value={adSettings.headerAd}
                                    onChange={e => setAdSettings({ ...adSettings, headerAd: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">Sidebar Ad Script</label>
                                <textarea
                                    className="w-full px-3 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-mono h-32 resize-none transition-all"
                                    placeholder="Paste Google Adsense / HTML code here..."
                                    value={adSettings.sidebarAd}
                                    onChange={e => setAdSettings({ ...adSettings, sidebarAd: e.target.value })}
                                />
                            </div>
                            <button onClick={saveAds} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                                <FiSave size={16} /> Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
