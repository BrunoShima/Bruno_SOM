// Full screen listening mode
// Minimal UI — centered album art, current track info, player at bottom

import { useState, useEffect, useRef } from "react";
import Player from "./Player";
import { useSpotify } from "../../context/SpotifyContext";
import { useImageColor } from "../../hooks/useImageColor";

function FullscreenPlayer({ album, onClose, onPlay }) {
    const { currentTrack } = useSpotify();
    const [uiVisible, setUiVisible] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const hideUiTimer = useRef(null);
    const [showAnimText, setShowAnimText] = useState(false);
    const animTextTimer = useRef(null);

    const artUrl = currentTrack?.album?.images?.[0]?.url || album.image_url;
    const vibrantColor = useImageColor(artUrl);

    const handleMouseMove = () => {
        setUiVisible(true);
        clearTimeout(hideUiTimer.current);
        hideUiTimer.current = setTimeout(() => {
            setUiVisible(false);
        }, 3000);
    };

    // Enter native fullscreen on mount, exit on unmount
    useEffect(() => {
        document.documentElement.requestFullscreen?.().catch(() => {});
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen?.().catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        hideUiTimer.current = setTimeout(() => setUiVisible(false), 3000);
        return () => {
            clearTimeout(hideUiTimer.current);
            clearTimeout(animTextTimer.current);
        };
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                onClose();
            }
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, [onClose]);

    return (
        <div
            className="h-screen flex flex-col overflow-hidden relative"
            onMouseMove={handleMouseMove}
            style={{ cursor: uiVisible ? "default" : "none" }}
        >
            {/* Blurred backdrop — slow drift animation */}
            {artUrl && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${artUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(60px) brightness(0.35) saturate(1.4)",
                        transform: "scale(1.2)",
                        zIndex: 0,
                        animation: animationsEnabled ? "backdropDrift 20s ease-in-out infinite alternate" : "none",
                    }}
                />
            )}

            {/* Gradient mask */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(135deg, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.3) 50%, rgba(8,8,8,0.6) 100%)",
                    zIndex: 1,
                }}
            />

            {/* Floating orbs — only render if vibrantColor is available */}
            {vibrantColor && (
                <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 2, pointerEvents: "none" }}>
                    <div
                        style={{
                            position: "absolute",
                            width: "600px",
                            height: "600px",
                            borderRadius: "50%",
                            background: `radial-gradient(circle, rgba(${vibrantColor},0.2) 0%, transparent 70%)`,
                            top: "-100px",
                            left: "-100px",
                            animation: animationsEnabled ? "orbFloat1 18s ease-in-out infinite alternate" : "none",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            width: "500px",
                            height: "500px",
                            borderRadius: "50%",
                            background: `radial-gradient(circle, rgba(${vibrantColor},0.15) 0%, transparent 70%)`,
                            bottom: "-100px",
                            right: "-100px",
                            animation: animationsEnabled ? "orbFloat2 22s ease-in-out infinite alternate" : "none",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            width: "400px",
                            height: "400px",
                            borderRadius: "50%",
                            background: `radial-gradient(circle, rgba(${vibrantColor},0.12) 0%, transparent 70%)`,
                            top: "40%",
                            right: "20%",
                            animation: animationsEnabled ? "orbFloat3 15s ease-in-out infinite alternate" : "none",
                        }}
                    />
                </div>
            )}

            {/* Top right controls */}
            <div
                className="absolute top-6 right-8 z-20 flex items-center gap-4 transition-opacity duration-500"
                style={{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? "auto" : "none" }}
            >
                {/* Animations toggle */}
                <div className="flex items-center gap-2">
                    <span
                        className="text-text-muted text-xs uppercase tracking-widest transition-opacity duration-300"
                        style={{ opacity: showAnimText ? 1 : 0 }}
                    >
                        {animationsEnabled ? "Animations On" : "Animations Off"}
                    </span>
                    <button
                        onClick={() => {
                            setAnimationsEnabled((v) => !v);
                            setShowAnimText(true);
                            clearTimeout(animTextTimer.current);
                            animTextTimer.current = setTimeout(() => setShowAnimText(false), 2000);
                        }}
                        className="text-text-muted hover:text-text-primary transition-colors"
                        title="Toggle animations"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 3a9 9 0 0 1 6.36 15.36" />
                            <path d="M12 21a9 9 0 0 1-6.36-15.36" />
                        </svg>
                    </button>
                </div>

                {/* Close */}
                <button
                    onClick={() => {
                        if (document.fullscreenElement) {
                            document.exitFullscreen?.().catch(() => {});
                        }
                        onClose();
                    }}
                    className="text-text-muted hover:text-text-primary transition-colors text-xl font-bold"
                >
                    ✕
                </button>
            </div>

            {/* Centered album art + current track */}
            <div
                className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6"
                style={{ marginTop: "70px" }}
            >
                {/* Album art */}
                <div
                    style={{
                        width: "min(500px, 75vw)",
                        height: "min(500px, 75vw)",
                        boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
                    }}
                >
                    {artUrl ? (
                        <img
                            src={artUrl}
                            alt={currentTrack?.name || album.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-surface flex items-center justify-center text-6xl text-text-muted">
                            ♪
                        </div>
                    )}
                </div>

                {/* Current track info */}
                <div className="text-center px-8">
                    {currentTrack ? (
                        <>
                            <p className="text-text-primary text-lg font-display font-bold uppercase tracking-tight leading-none mb-1">
                                {currentTrack.name}
                            </p>
                            <p className="text-accent text-xs font-display uppercase tracking-widest">
                                {currentTrack.artists?.[0]?.name}
                            </p>
                        </>
                    ) : (
                        <p className="text-text-muted text-xs uppercase tracking-widest">Not playing</p>
                    )}
                </div>
            </div>

            {/* Player — bottom, no track info, fades with UI */}
            <div
                className="relative z-10 transition-opacity duration-500"
                style={{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? "auto" : "none" }}
            >
                <Player onPlay={onPlay} hideTrackInfo />
            </div>
        </div>
    );
}

export default FullscreenPlayer;