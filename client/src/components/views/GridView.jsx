// Grid view — all albums in a sortable grid with metadata

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SORT_OPTIONS = [
    { label: "Recently Added", value: "recent" },
    { label: "Title A–Z", value: "title" },
    { label: "Artist A–Z", value: "artist" },
    { label: "Year", value: "year" },
];

function GridView({ albums, onAlbumDeleted }) {
    const navigate = useNavigate();
    const { authFetch } = useAuth();
    const [sort, setSort] = useState("recent");
    const [search, setSearch] = useState("");

    const handleDelete = async (id) => {
        await authFetch(`http://localhost:3000/albums/${id}`, {
            method: "DELETE",
        });
        onAlbumDeleted();
    };

    const sorted = [...albums]
        .filter((a) => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                a.title.toLowerCase().includes(q) ||
                a.artist_name.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sort === "title") return a.title.localeCompare(b.title);
            if (sort === "artist") return a.artist_name.localeCompare(b.artist_name);
            if (sort === "year") return b.year - a.year;
            return 0;
        });

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-8 py-8 pt-20">

                {/* Controls */}
                <div className="flex flex-col gap-3 mb-8">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter by title or artist..."
                        className="bg-surface border border-border text-text-primary px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-accent transition-all w-full max-w-xs"
                    />
                    <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 self-start">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSort(opt.value)}
                                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all ${
                                    sort === opt.value
                                        ? "bg-accent text-black"
                                        : "text-text-muted hover:text-text-primary"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Count */}
                <p className="text-text-muted text-xs uppercase tracking-widest font-ui mb-6">
                    {sorted.length} {sorted.length === 1 ? "album" : "albums"}
                </p>

                {/* Grid */}
                {sorted.length === 0 ? (
                    <div className="flex items-center justify-center py-24">
                        <p className="text-text-muted text-sm uppercase tracking-widest">No albums found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {sorted.map((album) => (
                            <div
                                key={album.id}
                                className="group cursor-pointer relative"
                            >
                                {/* Cover */}
                                <div
                                    onClick={() => navigate(`/albums/${album.id}`)}
                                    className="aspect-square bg-surface overflow-hidden mb-3 relative"
                                >
                                    {album.image_url || album.image_filename ? (
                                        <img
                                            src={album.image_url || `http://localhost:3000/images/${album.image_filename}`}
                                            alt={album.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-muted text-4xl">
                                            ♪
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(album.id);
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/70 text-text-muted hover:text-red-400 flex items-center justify-center opacity-80 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3,6 5,6 21,6" />
                                            <path d="M19,6l-1,14H6L5,6" />
                                            <path d="M10,11v6M14,11v6" />
                                            <path d="M9,6V4h6v2" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Info */}
                                <div onClick={() => navigate(`/albums/${album.id}`)}>
                                    <p className="text-text-primary text-xs font-bold uppercase tracking-wide truncate group-hover:text-accent transition-colors font-display font-bold">
                                        {album.title}
                                    </p>
                                    <p className="text-text-muted text-xs truncate font-display mt-0.5">
                                        {album.artist_name}
                                    </p>
                                    <p className="text-text-faint text-xs font-display mt-0.5">
                                        {album.year}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GridView;