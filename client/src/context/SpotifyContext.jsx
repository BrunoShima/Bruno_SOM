// Manages Spotify authentication and playback state globally
// Handles token storage, refresh, and player initialization

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";

const SpotifyContext = createContext();

export function SpotifyProvider({ children }) {
    const { token } = useAuth();
    const [spotifyToken, setSpotifyToken] = useState(
        localStorage.getItem("spotify_access_token") || null
    );
    const [spotifyRefreshToken, setSpotifyRefreshToken] = useState(
        localStorage.getItem("spotify_refresh_token") || null
    );
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const refreshTimerRef = useRef(null);

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
                `http://localhost:3000/spotify/refresh?refresh_token=${storedRefreshToken}`
            );
            const data = await res.json();

            if (data.access_token) {
                setSpotifyToken(data.access_token);
                localStorage.setItem("spotify_access_token", data.access_token);

                // Update expiry time
                const expiresAt = Date.now() + data.expires_in * 1000;
                localStorage.setItem("spotify_expires_at", expiresAt.toString());

                console.log("Spotify token refreshed successfully");
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

        // Refresh 5 minutes before expiry
        const refreshIn = timeUntilExpiry - 5 * 60 * 1000;

        if (refreshIn <= 0) {
            // Already expired or about to expire — refresh immediately
            refreshSpotifyToken();
        } else {
            // Schedule refresh
            refreshTimerRef.current = setTimeout(() => {
                refreshSpotifyToken();
            }, refreshIn);
        }

        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [spotifyToken, refreshSpotifyToken]);

    // Initialize the Spotify Web Playback SDK once we have a token
    useEffect(() => {
        if (!spotifyToken) return;

        fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${spotifyToken}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setIsPremium(data.product === "premium");
            });

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: "SOM Player",
                getOAuthToken: (cb) => cb(spotifyToken),
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
            setPlayer(spotifyPlayer);
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [spotifyToken]);

    const connectSpotify = () => {
        window.location.href = "http://localhost:3000/spotify/login";
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
        if (player) player.togglePlay();
    };

    const disconnectSpotify = () => {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_refresh_token");
        localStorage.removeItem("spotify_expires_at");
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
                isPremium,
                isPlayerReady,
                currentTrack,
                isPlaying,
                connectSpotify,
                playAlbum,
                togglePlayback,
                disconnectSpotify,
            }}
        >
            {children}
        </SpotifyContext.Provider>
    );
}

export function useSpotify() {
    return useContext(SpotifyContext);
}