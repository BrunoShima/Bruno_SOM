// Manages Spotify authentication and playback state globally
// Handles token storage, refresh, and player initialization

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
const SpotifyContext = createContext();

export function SpotifyProvider({ children }) {
    const [spotifyToken, setSpotifyToken] = useState(
        localStorage.getItem("spotify_access_token") || null
    );
    const [spotifyRefreshToken, setSpotifyRefreshToken] = useState(
        localStorage.getItem("spotify_refresh_token") || null
    );
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const refreshTimerRef = useRef(null);
    const playerRef = useRef(null);

    // Save tokens to localStorage whenever they change
    useEffect(() => {
        if (spotifyToken) localStorage.setItem("spotify_access_token", spotifyToken);
        if (spotifyRefreshToken) localStorage.setItem("spotify_refresh_token", spotifyRefreshToken);
    }, [spotifyToken, spotifyRefreshToken]);

    // Refresh the Spotify access token using the refresh token
    const refreshSpotifyToken = useCallback(async () => {
        const storedRefreshToken = localStorage.getItem("spotify_refresh_token");
        if (!storedRefreshToken) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/spotify/refresh?refresh_token=${storedRefreshToken}`
            );
            const data = await res.json();

            if (data.access_token) {
                // Update token in localStorage directly
                localStorage.setItem("spotify_access_token", data.access_token);

                // Update expiry time
                const expiresAt = Date.now() + data.expires_in * 1000;
                localStorage.setItem("spotify_expires_at", expiresAt.toString());

                // Update the existing player's OAuth token instead of reinitializing
                if (playerRef.current) {
                    playerRef.current._options.getOAuthToken = (cb) => cb(data.access_token);
                }

                // Update state without triggering SDK reinitialization
                setSpotifyToken(data.access_token);
            }
        } catch (err) {
            console.error("Failed to refresh Spotify token:", err);
        }
    }, []);

    // Set up auto-refresh timer based on stored expiry time
    useEffect(() => {
        if (!spotifyToken) return;

        const expiresAt = parseInt(localStorage.getItem("spotify_expires_at") || "0");
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        const refreshIn = timeUntilExpiry - 5 * 60 * 1000;

        if (refreshIn <= 0) {
            refreshSpotifyToken();
        } else {
            refreshTimerRef.current = setTimeout(() => {
                refreshSpotifyToken();
            }, refreshIn);
        }

        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [spotifyToken, refreshSpotifyToken]);

    // Initialize the Spotify Web Playback SDK — only once
    useEffect(() => {
        if (!spotifyToken) return;

        // Don't reinitialize if player already exists
        if (playerRef.current) return;

        const initPlayer = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: "SOM Player",
                getOAuthToken: (cb) => {
                    // Always use the latest token from localStorage
                    cb(localStorage.getItem("spotify_access_token") || spotifyToken);
                },
                volume: 0.8,
            });

            spotifyPlayer.addListener("ready", ({ device_id }) => {
                setDeviceId(device_id);
                setIsPlayerReady(true);
            });

            spotifyPlayer.addListener("player_state_changed", (state) => {
                if (!state) return;
                setCurrentTrack(state.track_window.current_track);
                setIsPlaying(!state.paused);
            });

            spotifyPlayer.connect();
            playerRef.current = spotifyPlayer;
            setPlayer(spotifyPlayer);
        };

        // Only load script if not already loaded
        if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);
            window.onSpotifyWebPlaybackSDKReady = initPlayer;
        } else if (window.Spotify) {
            initPlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initPlayer;
        }
    }, [spotifyToken]);

    const connectSpotify = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/spotify/login`;
    };

    const playAlbum = async (spotifyUri) => {
        if (!spotifyToken || !deviceId) return;

        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ context_uri: spotifyUri }),
        });
    };

    const togglePlayback = () => {
        if (playerRef.current) playerRef.current.togglePlay();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code !== "Space") return;
            const tag = document.activeElement?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;
            e.preventDefault();
            if (playerRef.current) playerRef.current.togglePlay();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const changeVolume = (val) => {
        setVolume(val);
        playerRef.current?.setVolume(val);
    };

    const disconnectSpotify = () => {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_refresh_token");
        localStorage.removeItem("spotify_expires_at");
        if (playerRef.current) {
            playerRef.current.disconnect();
            playerRef.current = null;
        }
        setSpotifyToken(null);
        setSpotifyRefreshToken(null);
        setPlayer(null);
        setDeviceId(null);
        setIsPlayerReady(false);
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };

    return (
        <SpotifyContext.Provider
            value={{
                spotifyToken,
                setSpotifyToken,
                setSpotifyRefreshToken,
                player,
                deviceId,
                isPlayerReady,
                currentTrack,
                isPlaying,
                connectSpotify,
                playAlbum,
                togglePlayback,
                disconnectSpotify,
                volume,
                changeVolume,
            }}
        >
            {children}
        </SpotifyContext.Provider>
    );
}

export function useSpotify() {
    return useContext(SpotifyContext);
}