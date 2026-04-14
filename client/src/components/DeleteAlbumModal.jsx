// Delete Album (plus confirm)

import { useState } from "react";

function DeleteAlbumModal({ album, onAlbumDeleted }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = () => {
        fetch(`http://localhost:3000/albums/${album.id}`, { method: "DELETE" })
            .then((res) => res.json())
            .then(() => {
                onAlbumDeleted();
                setIsOpen(false);
            });
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="border border-red-500 text-red-500 font-black uppercase tracking-widest text-sm px-6 py-3 rounded hover:bg-red-500 hover:text-white transition-colors"
            >
                Delete
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 w-full max-w-md relative">
                        <h3 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
                            Delete Album
                        </h3>
                        <p className="text-zinc-400 mb-8">
                            Are you sure you want to delete <span className="text-white font-bold">{album.title}</span>? This can't be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-500 text-white font-black uppercase tracking-widest py-3 rounded hover:bg-red-600 transition-colors"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 border border-zinc-700 text-zinc-400 font-black uppercase tracking-widest py-3 rounded hover:text-white hover:border-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeleteAlbumModal;