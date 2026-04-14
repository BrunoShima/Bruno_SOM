// Main page displaying all albums in a large cover grid
// Includes artist filter and add album button

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArtistFilter from "../components/ArtistFilter";
import AddAlbumModal from "../components/AddAlbumModal";


function AllAlbums() {
    const [albums, setAlbums] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState("");

    const getAllAlbums = () => {
        fetch("http://localhost:3000/albums")
            .then((res) => res.json())
            .then((data) => setAlbums(data));
    };

    useEffect(() => {
        getAllAlbums();
    }, []);

    const filteredAlbums = selectedArtist
        ? albums.filter((album) => album.artist_id === Number(selectedArtist))
        : albums;

    return (
        <div className="min-h-screen bg-black text-white">

            {/* Header */}
            <header className="border-b border-zinc-800 px-8 py-6 flex items-center justify-between">
                <h1 className="text-5xl font-black uppercase tracking-widest text-yellow-400">
                    My Album Collection
                </h1>
                <AddAlbumModal onAlbumAdded={getAllAlbums} />
            </header>

            <div className="flex">

                {/* Sidebar */}
                <aside className="w-64 min-h-screen border-r border-zinc-800 p-6 shrink-0">
                    <ArtistFilter onFilterChange={setSelectedArtist} />
                </aside>

                {/* Album Grid */}
                <main className="flex-1 p-8">
                    <p className="text-zinc-500 text-sm uppercase tracking-widest mb-6">
                        {filteredAlbums.length} albums
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAlbums.map((album) => (
                            <Link
                                to={`/albums/${album.id}`}
                                key={album.id}
                                className="group block"
                            >
                                {/* Cover Art */}
                                <div className="aspect-square bg-zinc-900 overflow-hidden rounded mb-3">
                                    {album.image_filename ? (
                                        <img
                                            src={`http://localhost:3000/images/${album.image_filename}`}
                                            alt={album.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-6xl">
                                            ♪
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <h2 className="font-black uppercase text-sm tracking-wide truncate group-hover:text-yellow-400 transition-colors">
                                    {album.title}
                                </h2>
                                <p className="text-zinc-500 text-xs mt-1">{album.artist_name} · {album.year}</p>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AllAlbums;