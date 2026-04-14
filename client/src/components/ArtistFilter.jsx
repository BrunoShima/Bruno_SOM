// Filter by Artist

import { useState, useEffect } from "react";

function ArtistFilter({ onFilterChange }) {
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/artists")
            .then((res) => res.json())
            .then((data) => setArtists(data));
    }, []);

    return (
        <div>
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">
                Filter by Artist
            </h3>
            <ul className="space-y-1">
                <li>
                    <button
                        onClick={() => onFilterChange("")}
                        className="w-full text-left px-3 py-2 rounded text-sm text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 transition-colors"
                    >
                        All Artists
                    </button>
                </li>
                {artists.map((artist) => (
                    <li key={artist.id}>
                        <button
                            onClick={() => onFilterChange(artist.id)}
                            className="w-full text-left px-3 py-2 rounded text-sm text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 transition-colors"
                        >
                            {artist.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ArtistFilter;