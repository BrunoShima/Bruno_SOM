// 3D vertical carousel view
// Albums arranged in a cylinder rotating on the X axis

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "../../utils/slugify";

function CarouselView({ albums }) {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [scale, setScale] = useState(1);
    const rotationRef = useRef(0);
    const touchStartY = useRef(null);

    const minSlots = 10;
    const repeated = albums.length < minSlots
        ? Array.from({ length: minSlots }, (_, i) => albums[i % albums.length])
        : albums;

    const count = repeated.length;
    const angleStep = 360 / count;
    const radius = count <= 10 ? 550 : Math.max(550, count * 58);
    const perspective = radius * 2.2;

    // Responsive scale
    useEffect(() => {
        const updateScale = () => {
            if (window.innerWidth < 640) setScale(0.55);
            else if (window.innerWidth < 1024) setScale(0.75);
            else setScale(1);
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    useEffect(() => {
        rotationRef.current = rotation;
    }, [rotation]);

    const spin = useCallback((direction) => {
        setIsSpinning(true);
        if (direction === "prev") {
            setRotation((r) => r + angleStep);
            setActiveIndex((i) => (i - 1 + count) % count);
        } else {
            setRotation((r) => r - angleStep);
            setActiveIndex((i) => (i + 1) % count);
        }
        setTimeout(() => setIsSpinning(false), 700);
    }, [count, angleStep]);

    // Reset carousel position when album count changes
    useEffect(() => {
        if (albums.length === 0) return;
        const newIndex = (albums.length - 1) % count;
        const newRotation = newIndex * angleStep;

        setActiveIndex(0);
        setRotation(0);
        rotationRef.current = 0;

        requestAnimationFrame(() => {
            setActiveIndex(newIndex);
            setRotation(newRotation);
            rotationRef.current = newRotation;
        });
    }, [albums.length]);

    const prev = useCallback(() => spin("prev"), [spin]);
    const next = useCallback(() => spin("next"), [spin]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") prev();
            if (e.key === "ArrowDown" || e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [prev, next]);

    useEffect(() => {
        let timeout;
        const handleWheel = (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (e.deltaY > 0) next();
                else prev();
            }, 50);
        };
        window.addEventListener("wheel", handleWheel, { passive: true });
        return () => window.removeEventListener("wheel", handleWheel);
    }, [prev, next]);

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartY.current === null) return;
        const diff = touchStartY.current - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 40) {
            diff > 0 ? prev() : next();
        }
        touchStartY.current = null;
    };

    const handleAlbumClick = () => {
        const nearestIndex = Math.round(rotationRef.current / angleStep);
        const currentIndex = ((nearestIndex % count) + count) % count;
        navigate(`/albums/${slugify(`${repeated[currentIndex].artist_name} ${repeated[currentIndex].title}`)}`);
    };

    if (!albums.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
                <p className="text-sm uppercase tracking-widest">No albums yet</p>
                <p className="text-xs mt-2">Add your first album to get started</p>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full select-none flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Glow */}
            <div
                style={{
                    position: "absolute",
                    width: "900px",
                    height: "900px",
                    pointerEvents: "none",
                    background: "radial-gradient(circle, rgba(118, 185, 0, 0.6) 0%, rgba(118, 185, 0, 0.2) 40%, transparent 70%)",
                    mixBlendMode: "screen",
                    opacity: isSpinning ? 0 : 1,
                    transition: "opacity 0.9s ease",
                    borderRadius: "50%",
                }}
            />

            {/* 3D carousel container */}
            <div
                style={{
                    width: "280px",
                    height: "280px",
                    perspective: `${perspective}px`,
                    position: "relative",
                    marginTop: "30px",
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                }}
            >
                {/* Spinning cylinder */}
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        transform: `rotateX(${rotation}deg)`,
                    }}
                >
                    {repeated.map((album, i) => {
                        const angle = i * angleStep;
                        const isActive = i === activeIndex;

                        return (
                            <div
                                key={`${album.id}-${i}`}
                                style={{
                                    position: "absolute",
                                    width: "280px",
                                    height: "280px",
                                    transformStyle: "preserve-3d",
                                    transform: `rotateX(-${angle}deg) translateZ(${radius}px)`,
                                    pointerEvents: "none",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        overflow: "hidden",
                                        transform: isActive ? "scale(1.08)" : "scale(1)",
                                        transition: "all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                                    }}
                                >
                                    {album.image_url ? (
                                        <img
                                            src={album.image_url}
                                            alt={album.title}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                background: "#111",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "4rem",
                                            }}
                                        >
                                            ♪
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Click overlay */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "550px",
                        height: "550px",
                        zIndex: 10,
                        cursor: "pointer",
                    }}
                    onClick={handleAlbumClick}
                />
            </div>

            {/* Nav arrows */}
            <button
                onClick={prev}
                className="absolute right-8 top-1/2 -translate-y-8 text-text-muted hover:text-accent transition-colors text-2xl"
            >
                ↑
            </button>
            <button
                onClick={next}
                className="absolute right-8 top-1/2 translate-y-2 text-text-muted hover:text-accent transition-colors text-2xl"
            >
                ↓
            </button>
        </div>
    );
}

export default CarouselView;