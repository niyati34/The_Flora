import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Planters from "./pages/Planters";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

import AirPurifying from "./pages/AirPurifying";
import IndoorPlants from "./pages/IndoorPlants";
import LowMaintenance from "./pages/LowMaintenance";
import ProductDetail from "./pages/ProductDetail";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Header />
        <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants/air-purifying" element={<AirPurifying />} />
          <Route path="/plants/indoor" element={<IndoorPlants />} />
          <Route path="/plants/low-maintenance" element={<LowMaintenance />} />
          <Route path="/planters" element={<Planters />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
    </CartProvider>
  );
}
