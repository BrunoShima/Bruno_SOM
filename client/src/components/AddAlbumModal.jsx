// Add Album Modal — searches Spotify and saves the selected album

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";

function AddAlbumModal({ onAlbumAdded, onClose }) {
    const { authFetch } = useAuth();
    const { spotifyToken, connectSpotify } = useSpotify();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [collection, setCollection] = useState([]);
    const debounceTimer = useRef(null);

    useEffect(() => {
        authFetch(`${import.meta.env.VITE_API_URL}/albums`)
            .then((res) => res.json())
            .then((data) => setCollection(data));
    }, []);

    // Live search — fires 400ms after the user stops typing
    useEffect(() => {
        if (!query.trim() || !spotifyToken) {
            setResults([]);
            return;
        }

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            setError("");

            try {
                const res = await authFetch(
                    `${import.meta.env.VITE_API_URL}/spotify/search?q=${encodeURIComponent(query)}`,
                    { headers: { spotify_token: spotifyToken } }
                );
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Search failed");
                } else {
                    setResults(data);
                }
            } catch {
                setError("Something went wrong. Try again.");
            }

            setLoading(false);
        }, 400);

        return () => clearTimeout(debounceTimer.current);
    }, [query, spotifyToken]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const handleSave = async (album) => {
        setSaving(true);

        try {
            const artistRes = await authFetch(`${import.meta.env.VITE_API_URL}/artists`);
            const artists = await artistRes.json();
            const existing = artists.find(
                (a) => a.name.toLowerCase() === album.artist_name.toLowerCase()
            );

            let artistId;
            if (existing) {
                artistId = existing.id;
            } else {
                const newArtistRes = await authFetch(`${import.meta.env.VITE_API_URL}/artists`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: album.artist_name }),
                });
                const newArtist = await newArtistRes.json();
                artistId = newArtist.artistId;
            }

            await authFetch(`${import.meta.env.VITE_API_URL}/albums`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: album.title,
                    artist_id: artistId,
                    year: album.year,
                    image_url: album.image_url,
                    spotify_id: album.spotify_id,
                }),
            });

            setCollection((prev) => [...prev, album]);
            onAlbumAdded();
        } catch {
            setError("Failed to save album. Try again.");
        }

        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div
                className="bg-surface border border-border rounded-xl w-full max-w-lg relative flex flex-col"
                style={{ maxHeight: "80vh" }}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 shrink-0">
                    <h3 className="text-sm uppercase tracking-widest text-text-muted font-ui font-medium">
                        Add Album
                    </h3>
                </div>

                {/* Search */}
                <div className="px-6 pb-4 shrink-0">
                    {!spotifyToken ? (
                        <div className="text-center py-8">
                            <p className="text-text-muted text-sm mb-4">
                                Connect Spotify to search for albums
                            </p>
                            <button
                                onClick={connectSpotify}
                                className="bg-accent text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors font-ui font-medium"
                            >
                                Connect Spotify
                            </button>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search albums or artists..."
                            autoFocus
                            className="w-full bg-background border border-border text-text-primary px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-accent transition-all"
                        />
                    )}

                    {error && (
                        <p className="text-red-400 text-xs mt-3">{error}</p>
                    )}
                </div>

                {/* Results */}
                <div className="overflow-y-auto flex-1 border-t border-border">
                    {loading && (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-text-muted text-xs uppercase tracking-widest font-ui font-medium">Searching...</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <ul>
                            {results.map((album) => {
                                const owned = collection.some((c) => c.spotify_id === album.spotify_id);
                                return (
                                <li
                                    key={album.spotify_id}
                                    className="flex items-center gap-4 px-6 py-3 border-b border-border hover:bg-background transition-colors"
                                >
                                    {/* Cover */}
                                    <div className="w-10 h-10 shrink-0 overflow-hidden">
                                        {album.image_url ? (
                                            <img
                                                src={album.image_url}
                                                alt={album.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-background flex items-center justify-center text-text-muted">♪</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-text-primary text-sm font-semibold truncate">
                                            {album.title}
                                        </p>
                                        <p className="text-text-muted text-xs truncate">
                                            {album.artist_name} · {album.year}
                                        </p>
                                    </div>

                                    {/* Add button */}
                                    {owned ? (
                                        <span className="shrink-0 text-xs uppercase tracking-widest font-bold text-text-faint border border-text-faint px-3 py-1.5 rounded-lg">
                                            In Collection
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleSave(album)}
                                            disabled={saving}
                                            className="shrink-0 text-xs uppercase tracking-widest font-bold text-accent hover:text-black hover:bg-accent border border-accent px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </li>
                                );
                            })}
                        </ul>
                    )}

                    {!loading && query && results.length === 0 && (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-text-muted text-sm">No results for "{query}"</p>
                        </div>
                    )}

                    {!query && spotifyToken && (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-text-muted text-xs uppercase tracking-widest">
                                Start typing to search
                            </p>
                        </div>
                    )}
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-lg font-bold transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

export default AddAlbumModal;