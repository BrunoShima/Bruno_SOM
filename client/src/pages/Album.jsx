// Single album detail page
// Shows full cover art, album info, and edit/delete controls

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import EditAlbumModal from "../components/EditAlbumModal";
import DeleteAlbumModal from "../components/DeleteAlbumModal";

function Album() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);

    const getAlbum = () => {
        fetch(`http://localhost:3000/albums/${id}`)
            .then((res) => res.json())
            .then((data) => setAlbum(data));
    };

    useEffect(() => {
        getAlbum();
    }, []);

    if (!album) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white">

            {/* Header */}
            <header className="border-b border-zinc-800 px-8 py-6">
                <Link to="/" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-yellow-400 transition-colors">
                    ← Back to Collection
                </Link>
            </header>

            <main className="max-w-4xl mx-auto px-8 py-16 flex gap-16 items-start">

                {/* Cover Art */}
                <div className="w-72 shrink-0">
                    <div className="aspect-square bg-zinc-900 rounded overflow-hidden">
                        {album.image_filename ? (
                            <img
                                src={`http://localhost:3000/images/${album.image_filename}`}
                                alt={album.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-8xl">
                                ♪
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{album.year}</p>
                    <h1 className="text-6xl font-black uppercase tracking-wide text-white leading-none mb-4">
                        {album.title}
                    </h1>
                    <p className="text-yellow-400 text-xl font-bold uppercase tracking-widest mb-12">
                        {album.artist_name}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <EditAlbumModal album={album} onAlbumUpdated={getAlbum} />
                        <DeleteAlbumModal
                            album={album}
                            onAlbumDeleted={() => navigate("/")}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Album;