// Floating mini player — appears on all pages except album page when something is playing

import { useSpotify } from "../../context/SpotifyContext";
import { useLocation } from "react-router-dom";

function MiniPlayer() {
    const { currentTrack, isPlaying, togglePlayback, player } = useSpotify();
    const location = useLocation();

    // Hide on album page — it has its own full player
    if (location.pathname.startsWith("/albums/")) return null;

    // Hide if nothing is playing
    if (!currentTrack) return null;

    const handlePrev = () => player?.previousTrack();
    const handleNext = () => player?.nextTrack();

    return (
        <div
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 50,
                background: "rgba(17, 17, 17, 0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "12px 16px",
                width: "280px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(118,185,0,0.1)",
            }}
        >
            <div className="flex items-center gap-3">

                {/* Album art */}
                <div className="w-10 h-10 shrink-0 overflow-hidden rounded">
                    {currentTrack.album?.images?.[0]?.url ? (
                        <img
                            src={currentTrack.album.images[0].url}
                            alt={currentTrack.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-surface flex items-center justify-center text-text-muted text-xs">♪</div>
                    )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-xs font-semibold truncate">{currentTrack.name}</p>
                    <p className="text-text-muted text-xs truncate">{currentTrack.artists?.[0]?.name}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handlePrev}
                        className="text-text-muted hover:text-text-primary transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="19,20 9,12 19,4" />
                            <rect x="5" y="4" width="2" height="16" />
                        </svg>
                    </button>

                    <button
                        onClick={togglePlayback}
                        className="w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center hover:bg-accent-hover transition-colors"
                    >
                        {isPlaying ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5,3 19,12 5,21" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={handleNext}
                        className="text-text-muted hover:text-text-primary transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,4 15,12 5,20" />
                            <rect x="17" y="4" width="2" height="16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MiniPlayer;