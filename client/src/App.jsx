import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CollectionPage from "./pages/CollectionPage";
import AlbumPage from "./pages/AlbumPage";
import SpotifyCallbackPage from "./pages/SpotifyCallbackPage";

// Wraps any route that requires the user to be logged in
function ProtectedRoute({ children }) {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/spotify-callback" element={<SpotifyCallbackPage />} />

                {/* Protected routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <CollectionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/albums/:id"
                    element={
                        <ProtectedRoute>
                            <AlbumPage />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;