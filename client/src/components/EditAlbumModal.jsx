// Edit Album Form

import { useState, useEffect } from "react";

function EditAlbumModal({ album, onAlbumUpdated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState(album.title);
    const [year, setYear] = useState(album.year);
    const [image, setImage] = useState(null);
    const [artist, setArtist] = useState(album.artist_id);
    const [dbArtists, setDbArtists] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/artists")
            .then((res) => res.json())
            .then((data) => setDbArtists(data));
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("artist_id", artist);
        formData.append("year", year);
        if (image) formData.append("image", image);

        await fetch(`http://localhost:3000/albums/${album.id}`, {
            method: "PUT",
            body: formData,
        });

        onAlbumUpdated();
        setIsOpen(false);
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-yellow-400 text-black font-black uppercase tracking-widest text-sm px-6 py-3 rounded hover:bg-yellow-300 transition-colors"
            >
                Edit
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 w-full max-w-md relative">
                        <h3 className="text-4xl font-black uppercase tracking-widest text-yellow-400 mb-6">
                            Edit Album
                        </h3>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Artist</label>
                                <select
                                    value={artist}
                                    onChange={(e) => setArtist(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-yellow-400"
                                >
                                    {dbArtists.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Replace Cover Image</label>
                                {album.image_filename && (
                                    <img
                                        src={`http://localhost:3000/images/${album.image_filename}`}
                                        alt="Current cover"
                                        className="w-20 h-20 object-cover rounded mb-2"
                                    />
                                )}
                                <label className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors">
                                    <span>📎</span>
                                    <span>{image ? image.name : "Choose file..."}</span>
                                    <input
                                        type="file"
                                        onChange={(e) => setImage(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-black font-black uppercase tracking-widest py-3 rounded hover:bg-yellow-300 transition-colors mt-2"
                            >
                                Save Changes
                            </button>
                        </form>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-bold transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditAlbumModal;