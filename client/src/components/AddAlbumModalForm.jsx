// New Album (and artist) form

import { useState, useEffect } from "react";

function AddAlbumModalForm({ onClose, onAlbumAdded }) {
    const [title, setTitle] = useState("");
    const [year, setYear] = useState("");
    const [image, setImage] = useState(null);
    const [artist, setArtist] = useState("");
    const [dbArtists, setDbArtists] = useState([]);
    const [isNewArtist, setIsNewArtist] = useState(false);
    const [newArtist, setNewArtist] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/artists")
            .then((res) => res.json())
            .then((data) => {
                setDbArtists(data);
                if (data.length > 0) setArtist(data[0].id);
            });
    }, []);

    const handleArtistSelectChange = (e) => {
        if (e.target.value === "-1") {
            setIsNewArtist(true);
            setArtist("");
        } else {
            setIsNewArtist(false);
            setArtist(e.target.value);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        let artistId = artist;

        if (isNewArtist) {
            const artistResponse = await fetch("http://localhost:3000/artists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newArtist }),
            });
            const artistData = await artistResponse.json();
            artistId = artistData.artistId;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("artist_id", artistId);
        formData.append("year", year);
        if (image) formData.append("image", image);

        await fetch("http://localhost:3000/albums", {
            method: "POST",
            body: formData,
        });

        onAlbumAdded();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 w-full max-w-md relative">
                <h3 className="text-4xl font-black uppercase tracking-widest text-yellow-400 mb-6">
                    Add Album
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
                        {!isNewArtist ? (
                            <select
                                value={artist}
                                onChange={handleArtistSelectChange}
                                className="w-full bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-yellow-400"
                            >
                                {dbArtists.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                                <option value="-1">+ New Artist</option>
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newArtist}
                                    onChange={(e) => setNewArtist(e.target.value)}
                                    placeholder="Artist name"
                                    className="flex-1 bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-yellow-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsNewArtist(false)}
                                    className="text-xs uppercase tracking-widest text-zinc-400 border border-zinc-700 px-3 py-2 rounded hover:text-white hover:border-white transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">Cover Image</label>
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
                        Add Album
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-bold transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

export default AddAlbumModalForm;