// Extracts the most vibrant color from an image URL using canvas sampling
// Returns null if extraction fails or no vibrant color is found

import { useState, useEffect } from "react";

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

export function useImageColor(imageUrl) {
    const [color, setColor] = useState(null);

    useEffect(() => {
        if (!imageUrl) return;

        setColor(null);

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const size = 100; // Sample at 100x100 for performance
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, size, size);

                const { data } = ctx.getImageData(0, 0, size, size);

                let rSum = 0, gSum = 0, bSum = 0, count = 0;

                // Sample every 4th pixel for performance
                for (let i = 0; i < data.length; i += 16) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const { s, l } = rgbToHsl(r, g, b);

                    // Filter out near-black, near-white, and desaturated colors
                    if (s < 30 || l < 15 || l > 85) continue;

                    rSum += r;
                    gSum += g;
                    bSum += b;
                    count++;
                }

                if (count === 0) {
                    // No vibrant colors found — fall back to white
                    setColor("255, 255, 255");
                    return;
                }

                const r = Math.round(rSum / count);
                const g = Math.round(gSum / count);
                const b = Math.round(bSum / count);

                setColor(`${r}, ${g}, ${b}`);
            } catch (err) {
                // CORS or canvas error — don't show orbs
                setColor(null);
            }
        };

        img.onerror = () => {
            setColor(null);
        };

        img.src = imageUrl;
    }, [imageUrl]);

    return color;
}