// Manages Spotify authentication and playback state globally
// Handles token storage, refresh, and player initialization

import { createContext, useContext, useState, useEffect } from "react";
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

    useEffect(() => {
        if (spotifyToken) localStorage.setItem("spotify_access_token", spotifyToken);
        if (spotifyRefreshToken) localStorage.setItem("spotify_refresh_token", spotifyRefreshToken);
    }, [spotifyToken, spotifyRefreshToken]);

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
        setSpotifyToken(null);
        setSpotifyRefreshToken(null);
        setPlayer(null);
        setDeviceId(null);
        setIsPlayerReady(false);
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