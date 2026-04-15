// List view — albums in a sortable table-style list

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SORT_OPTIONS = [
    { label: "Recently Added", value: "recent" },
    { label: "Title A–Z", value: "title" },
    { label: "Artist A–Z", value: "artist" },
    { label: "Year", value: "year" },
];

function ListView({ albums, onAlbumDeleted }) {
    const navigate = useNavigate();
    const { authFetch } = useAuth();
    const [sort, setSort] = useState("recent");
    const [search, setSearch] = useState("");

    const handleDelete = async (id) => {
        await authFetch(`https://som-server-zwz3.onrender.com/albums/${id}`, {
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
            <div className="max-w-4xl mx-auto px-8 py-8 pt-20">

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
                <p className="text-text-muted text-xs uppercase tracking-widest font-ui mb-4">
                    {sorted.length} {sorted.length === 1 ? "album" : "albums"}
                </p>

                {/* Header row */}
                <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-border mb-1">
                    <div className="col-span-1" />
                    <div className="col-span-5 text-xs uppercase tracking-widest text-text-muted font-ui">Title</div>
                    <div className="col-span-4 text-xs uppercase tracking-widest text-text-muted font-ui">Artist</div>
                    <div className="col-span-1 text-xs uppercase tracking-widest text-text-muted font-ui text-right">Year</div>
                    <div className="col-span-1" />
                </div>

                {/* Rows */}
                {sorted.length === 0 ? (
                    <div className="flex items-center justify-center py-24">
                        <p className="text-text-muted text-sm uppercase tracking-widest">No albums found</p>
                    </div>
                ) : (
                    <ul>
                        {sorted.map((album, index) => (
                            <li
                                key={album.id}
                                className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-border hover:bg-surface cursor-pointer group transition-colors"
                            >
                                {/* Index */}
                                <div className="col-span-1 text-text-faint text-xs group-hover:hidden text-right">
                                    {index + 1}
                                </div>
                                <div className="col-span-1 text-accent text-xs hidden group-hover:block">
                                    ▶
                                </div>

                                {/* Title + thumbnail */}
                                <div
                                    className="col-span-5 flex items-center gap-3 min-w-0"
                                    onClick={() => navigate(`/albums/${album.id}`)}
                                >
                                    <div className="w-9 h-9 shrink-0 overflow-hidden">
                                        {album.image_url ? (
                                            <img
                                                src={album.image_url}
                                                alt={album.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-surface flex items-center justify-center text-text-muted text-xs">♪</div>
                                        )}
                                    </div>
                                    <p className="text-text-primary text-sm font-semibold truncate group-hover:text-accent transition-colors font-display">
                                        {album.title}
                                    </p>
                                </div>

                                {/* Artist */}
                                <div
                                    className="col-span-4 text-text-muted text-sm font-display truncate"
                                    onClick={() => navigate(`/albums/${album.id}`)}
                                >
                                    {album.artist_name}
                                </div>

                                {/* Year */}
                                <div
                                    className="col-span-1 text-text-muted  font-display text-sm text-right"
                                    onClick={() => navigate(`/albums/${album.id}`)}
                                >
                                    {album.year}
                                </div>

                                {/* Delete */}
                                <div className="col-span-1 hidden sm:flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(album.id);
                                        }}
                                        className="w-7 h-7 rounded-lg text-text-faint hover:text-red-400 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3,6 5,6 21,6" />
                                            <path d="M19,6l-1,14H6L5,6" />
                                            <path d="M10,11v6M14,11v6" />
                                            <path d="M9,6V4h6v2" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ListView;