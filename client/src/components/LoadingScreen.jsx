// Full-screen branded loading screen
// Shows a warming-up message after a delay to handle Render cold starts

import { useState, useEffect } from "react";
import logo from "../assets/logo-white.svg";

function LoadingScreen() {
    const [showWarmup, setShowWarmup] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowWarmup(true), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
            <div className="flex flex-col items-center gap-8">
                <img
                    src={logo}
                    alt="SOM"
                    className="h-10 animate-pulse"
                />
                <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p
                    className="text-text-muted text-xs uppercase tracking-widest transition-opacity duration-700"
                    style={{ opacity: showWarmup ? 1 : 0 }}
                >
                    Server is waking up, please wait...
                </p>
            </div>
        </div>
    );
}

export default LoadingScreen;
