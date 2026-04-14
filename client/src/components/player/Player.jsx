// Persistent playback bar — used across all pages

import { useState, useEffect, useRef } from "react";
import { useSpotify } from "../../context/SpotifyContext";

function Player({ onPlay }) {
    const { player, togglePlayback, isPlaying, currentTrack } = useSpotify();
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const progressInterval = useRef(null);

    useEffect(() => {
        if (!player) return;

        const tick = () => {
            player.getCurrentState().then((state) => {
                if (!state) return;
                setProgress(state.position);
                setDuration(state.duration);
            });
        };

        progressInterval.current = setInterval(tick, 500);
        return () => clearInterval(progressInterval.current);
    }, [player]);

    const handlePrev = () => player?.previousTrack();
    const handleNext = () => player?.nextTrack();

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        const pos = Math.floor(pct * duration);
        player?.seek(pos);
        setProgress(pos);
    };

    const formatDuration = (ms) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <div className="shrink-0 px-10 py-4">

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-4">

                {/* Track info — left */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="w-10 shrink-0" />
                    <div className="min-w-0">
                        {currentTrack ? (
                            <>
                                <p className="text-text-primary text-xs font-semibold truncate">{currentTrack.name}</p>
                                <p className="text-text-muted text-xs truncate">{currentTrack.artists?.[0]?.name}</p>
                            </>
                        ) : (
                            <p className="text-text-muted text-xs uppercase tracking-widest">Not playing</p>
                        )}
                    </div>
                </div>

                {/* Prev */}
                <button
                    onClick={handlePrev}
                    className="text-text-muted hover:text-text-primary transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="19,20 9,12 19,4" />
                        <rect x="5" y="4" width="2" height="16" />
                    </svg>
                </button>

                {/* Play / Pause */}
                <button
                    onClick={currentTrack ? togglePlayback : onPlay}
                    className="w-11 h-11 rounded-full bg-accent text-black flex items-center justify-center hover:bg-accent-hover transition-colors"
                >
                    {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    )}
                </button>

                {/* Next */}
                <button
                    onClick={handleNext}
                    className="text-text-muted hover:text-text-primary transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,4 15,12 5,20" />
                        <rect x="17" y="4" width="2" height="16" />
                    </svg>
                </button>

                {/* Right spacer */}
                <div className="flex-1" />
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
                <span className="text-text-muted text-xs tabular-nums w-10 text-right shrink-0">
                    {formatDuration(progress)}
                </span>
                <div
                    className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-accent rounded-full relative transition-all"
                        style={{ width: `${progressPct}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
                <span className="text-text-muted text-xs tabular-nums w-10 shrink-0">
                    {formatDuration(duration)}
                </span>
            </div>
        </div>
    );
}

export default Player;