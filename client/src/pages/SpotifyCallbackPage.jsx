// Handles the redirect from Spotify after OAuth
// Grabs the tokens from the URL and stores them

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpotify } from "../context/SpotifyContext";

function SpotifyCallbackPage() {
    const navigate = useNavigate();
    const { setSpotifyToken, setSpotifyRefreshToken } = useSpotify();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresIn = params.get("expires_in");

        if (accessToken) {
            setSpotifyToken(accessToken);
            setSpotifyRefreshToken(refreshToken);

            // Store expiry time as a timestamp
            if (expiresIn) {
                const expiresAt = Date.now() + parseInt(expiresIn) * 1000;
                localStorage.setItem("spotify_expires_at", expiresAt.toString());
            }
        }

        navigate("/");
    }, []);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-text-muted text-sm uppercase tracking-widest">Connecting Spotify...</p>
        </div>
    );
}

export default SpotifyCallbackPage;