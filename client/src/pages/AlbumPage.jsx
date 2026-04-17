// Album detail page — art, info, tracklist, and playback

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";
import logo from "../assets/logo-white.svg";
import Player from "../components/player/Player";
import FullscreenPlayer from "../components/player/FullscreenPlayer";

function AlbumPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authFetch } = useAuth();
    const { spotifyToken, playAlbum, currentTrack, isPlayerReady, deviceId } = useSpotify();

    const [album, setAlbum] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(null);

    useEffect(() => {
        authFetch(`${import.meta.env.VITE_API_URL}/albums/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setAlbum(data);
                if (data.spotify_id && spotifyToken) {
                    fetch(`https://api.spotify.com/v1/albums/${data.spotify_id}/tracks?limit=50`, {
                        headers: { Authorization: `Bearer ${spotifyToken}` },
                    })
                        .then((res) => res.json())
                        .then((trackData) => {
                            setTracks(trackData.items || []);
                            setLoading(false);
                        });
                } else {
                    setLoading(false);
                }
            });
    }, [id, spotifyToken]);

    useEffect(() => {
        authFetch(`${import.meta.env.VITE_API_URL}/albums`)
            .then((res) => res.json())
            .then((data) => setAlbums(data));
    }, []);

    const currentIdx = albums.findIndex((a) => a.id === album?.id);
    const prevAlbum = currentIdx > 0 ? albums[currentIdx - 1] : albums[albums.length - 1];
    const nextAlbum = currentIdx < albums.length - 1 ? albums[currentIdx + 1] : albums[0];

    const handlePlayTrack = (track, index) => {
        if (spotifyToken && isPlayerReady) {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    context_uri: `spotify:album:${album.spotify_id}`,
                    offset: { position: index },
                }),
            });
        } else if (track.preview_url) {
            const audio = new Audio(track.preview_url);
            audio.play();
        }
    };

    const formatDuration = (ms) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading || !album) {
        return (
            <div className="h-screen bg-background flex items-center justify-center">
                <p className="text-text-muted text-sm uppercase tracking-widest">Loading...</p>
            </div>
        );
    }

    if (fullscreen) {
        return (
            <FullscreenPlayer
                album={album}
                onClose={() => setFullscreen(false)}
                onPlay={() => album?.spotify_id && playAlbum(`spotify:album:${album.spotify_id}`)}
            />
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden relative">

            {/* Full page blurred backdrop */}
            {album.image_url && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${album.image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(60px) brightness(0.35) saturate(1.4)",
                        transform: "scale(1.15)",
                        zIndex: 0,
                    }}
                />
            )}

            {/* Gradient mask */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(135deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.75) 100%)",
                    zIndex: 1,
                }}
            />

            {/* Main layout */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative z-10">

                {/* Left — album art + info */}
                <div className="w-full md:w-1/2 flex flex-col overflow-hidden shrink-0">

                    {/* Logo + nav */}
                    <div className="p-8 shrink-0">
                        <Link to="/">
                            <img src={logo} alt="SOM" className="h-7" />
                        </Link>

                        {albums.length > 1 && (
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={() => navigate(`/albums/${prevAlbum.id}`)}
                                    className="flex items-center gap-1.5 text-text-muted hover:text-text-primary font-ui transition-colors text-xs uppercase tracking-widest"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Prev
                                </button>
                                <span className="text-text-faint">·</span>
                                <button
                                    onClick={() => navigate(`/albums/${nextAlbum.id}`)}
                                    className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-xs uppercase tracking-widest"
                                >
                                    Next
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Art + info centered */}
                    <div className="flex flex-col items-center justify-center px-8 pb-4 md:pb-8 gap-6 md:flex-1">

                        {/* Album art */}
                        <div
                            onClick={() => {
                                const isCurrentlyPlaying = currentTrack?.album?.uri?.includes(album.spotify_id);
                                if (album?.spotify_id && !isCurrentlyPlaying) {
                                    playAlbum(`spotify:album:${album.spotify_id}`);
                                }
                                setFullscreen(true);
                            }}
                            className="group relative"
                            style={{
                                width: "58%",
                                aspectRatio: "1",
                                flexShrink: 0,
                                boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
                                cursor: "pointer",
                            }}
                        >
                            {album.image_url ? (
                                <img
                                    src={album.image_url}
                                    alt={album.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-surface flex items-center justify-center text-6xl text-text-muted">
                                    ♪
                                </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15,3 21,3 21,9" />
                                    <polyline points="9,21 3,21 3,15" />
                                    <line x1="21" y1="3" x2="14" y2="10" />
                                    <line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            </div>
                        </div>

                        {/* Album info */}
                        <div className="text-center">
                            <p className="text-text-muted text-xs uppercase font-display tracking-widest mb-2">
                                {album.year}
                            </p>
                            <h1 className="text-3xl font-black uppercase font-display tracking-tight text-text-primary leading-none mb-2">
                                {album.title}
                            </h1>
                            <p className="text-accent text-sm font-display uppercase tracking-widest">
                                {album.artist_name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right — tracklist */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">

                    {/* Header */}
                    <div className="px-10 pt-8 pb-4 shrink-0 border-b border-white/10">
                        <p className="text-text-muted text-xs font-ui uppercase tracking-widest">
                            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                        </p>
                    </div>

                    {/* Tracks */}
                    <div className="flex-1 overflow-y-auto">
                        {tracks.length > 0 ? (
                            <ul>
                                {tracks.map((track, index) => {
                                    const isActive = currentTrack?.id === track.id;
                                    return (
                                        <li
                                            key={track.id}
                                            onClick={() => handlePlayTrack(track, index)}
                                            className="flex items-center gap-4 px-10 py-4 border-b border-white/10 cursor-pointer group transition-colors"
                                        >
                                            <div className="w-5 h-5 shrink-0 relative">
                                                <span className={`absolute inset-0 flex items-center justify-center text-xs group-hover:opacity-0 transition-opacity ${isActive ? "opacity-0" : "text-text-muted font-ui"}`}>
                                                    {index + 1}
                                                </span>
                                                <span className={`absolute inset-0 flex items-center justify-center text-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100" : ""}`}>
                                                    ▶
                                                </span>
                                            </div>
                                            <p className={`flex-1 text-sm truncate transition-colors ${
                                                isActive ? "text-accent font-bold" : "text-text-primary group-hover:text-accent"
                                            }`}>
                                                {track.name}
                                            </p>
                                            <span className="text-text-muted font-ui text-xs shrink-0">
                                                {formatDuration(track.duration_ms)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-text-muted text-xs uppercase tracking-widest">
                                    {spotifyToken ? "No tracks available" : "Connect Spotify to see tracklist"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Player */}
            <div className="relative z-10">
                <Player
                    onPlay={() => album?.spotify_id && playAlbum(`spotify:album:${album.spotify_id}`)}
                    onFullscreen={() => setFullscreen(true)}
                />
            </div>
        </div>
    );
}

export default AlbumPage;