import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SeoManager from "./components/SeoManager";
import FavoritesProvider from "./context/FavoritesProvider";
import LanguageProvider from "./context/LanguageProvider";
import RecipeCatalogProvider from "./context/RecipeCatalogProvider";
import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <RecipeCatalogProvider>
        <FavoritesProvider>
          <Router>
            <div className="app-shell">
              <SeoManager />
              <Header />
              <main className="app-content">
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </FavoritesProvider>
      </RecipeCatalogProvider>
    </LanguageProvider>
  );
}

export default App;
