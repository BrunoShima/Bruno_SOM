// Main landing page after login
// Minimal chrome — logo top left, action icons top right

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";
import { useNavigate } from "react-router-dom";
import CarouselView from "../components/views/CarouselView";
import GridView from "../components/views/GridView";
import ListView from "../components/views/ListView";
import AddAlbumModal from "../components/AddAlbumModal";
import logo from "../assets/logo-white.svg";

function CollectionPage() {
    const { authFetch, logout } = useAuth();
    const { connectSpotify, spotifyToken, disconnectSpotify } = useSpotify();
    const navigate = useNavigate();
    const [albums, setAlbums] = useState([]);
    const [view, setView] = useState("carousel");
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showViewMenu, setShowViewMenu] = useState(false);
    const profileRef = useRef(null);
    const viewRef = useRef(null);

    const getAlbums = () => {
        authFetch("http://localhost:3000/albums")
            .then((res) => res.json())
            .then((data) => {
                setAlbums(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        getAlbums();
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
            if (viewRef.current && !viewRef.current.contains(e.target)) {
                setShowViewMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="h-screen bg-background overflow-hidden relative">

            {/* Logo — top left */}
            <button onClick={() => setView("carousel")}>
                <div className="absolute top-6 left-8 z-20">
                    <img src={logo} alt="SOM" className="h-7" />
                </div>
            </button>

            {/* Controls — top right, vertical stack */}
            <div className="absolute top-6 right-8 z-20 flex flex-row sm:flex-col items-center gap-3">

                {/* Profile */}
                <div ref={profileRef} className="relative">
                    <button
                        onClick={() => {
                            setShowProfileMenu((v) => !v);
                            setShowViewMenu(false);
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent transition-all"
                        title="Profile"
                    >
                        <svg width="14" height="14" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </button>

                    {/* Opens to the LEFT so it doesn't go behind view menu */}
                    {showProfileMenu && (
                        <div className="absolute right-0 top-12 sm:right-12 sm:top-0 bg-surface border border-border rounded-xl overflow-hidden w-48 shadow-xl">
                            {spotifyToken ? (
                                <button
                                    onClick={() => { disconnectSpotify(); setShowProfileMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-accent hover:bg-background transition-colors font-ui font-medium"
                                >
                                    Spotify Connected ✓
                                </button>
                            ) : (
                                <button
                                    onClick={() => { connectSpotify(); setShowProfileMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-text-muted hover:text-accent hover:bg-background transition-colors"
                                >
                                    Connect Spotify
                                </button>
                            )}
                            <div className="border-t border-border" />
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-text-muted hover:text-text-primary hover:bg-background transition-colors font-ui"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Album */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent transition-all"
                    title="Add Album"
                >
                    <svg width="14" height="14" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                </button>

                {/* View switcher */}
                <div ref={viewRef} className="relative">
                    <button
                        onClick={() => {
                            setShowViewMenu((v) => !v);
                            setShowProfileMenu(false);
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent transition-all"
                        title="Switch View"
                    >
                        <svg width="14" height="14" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </button>

                    {/* Opens to the LEFT */}
                    {showViewMenu && (
                        <div className="absolute right-0 top-12 sm:right-12 sm:top-0 bg-surface border border-border rounded-xl overflow-hidden w-40 shadow-xl">
                            {["carousel", "grid", "list"].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => { setView(v); setShowViewMenu(false); }}
                                    className={`w-full text-left px-4 py-3 text-xs uppercase font-ui tracking-widest transition-colors ${
                                        view === v
                                            ? "text-accent bg-background"
                                            : "text-text-muted hover:text-text-primary hover:bg-background"
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Spotify status — bottom left */}
            <div className="hidden sm:flex absolute bottom-8 left-8 z-20">
                {spotifyToken ? (
                    <div className="flex items-center gap-2 bg-surface border border-border px-4 py-2.5 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-xs uppercase tracking-widest text-text-muted font-ui font-lig">
                            Spotify Connected
                        </span>
                    </div>
                ) : (
                    <button
                        onClick={connectSpotify}
                        className="flex items-center gap-2 bg-accent text-black font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl hover:bg-accent-hover transition-all"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.519-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
                        </svg>
                        Connect Spotify
                    </button>
                )}
            </div>

            {/* Main content */}
            <main className="h-full">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-text-muted text-sm uppercase tracking-widest">Loading...</p>
                    </div>
                ) : (
                    <>
                        {view === "carousel" && <CarouselView albums={albums} />}
                        {view === "grid" && <GridView albums={albums} onAlbumDeleted={getAlbums} />}
                        {view === "list" && <ListView albums={albums} onAlbumDeleted={getAlbums} />}
                    </>
                )}
            </main>

            {/* Add Album Modal */}
            {showAddModal && (
                <AddAlbumModal
                    onAlbumAdded={getAlbums}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
}

export default CollectionPage;