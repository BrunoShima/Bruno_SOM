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

        if (accessToken) {
            setSpotifyToken(accessToken);
            setSpotifyRefreshToken(refreshToken);
        }

        navigate("/");
    }, []);

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
            <p className="text-[#666666] text-sm uppercase tracking-widest">Connecting Spotify...</p>
        </div>
    );
}

export default SpotifyCallbackPage;