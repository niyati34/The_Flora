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
import Category from "./pages/Category";
import Compare from "./pages/Compare";
import PlantScanner from "./pages/PlantScanner";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider } from "./context/CompareContext";
import { NotesProvider } from "./context/NotesContext";
import { StockProvider } from "./context/StockContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import { PriceAlertProvider } from "./context/PriceAlertContext";
import { CareReminderProvider } from "./context/CareReminderContext";
import { WalletProvider } from "./context/WalletContext";
import { CustomerSupportProvider } from "./context/CustomerSupportContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import CustomerSupportPage from "./pages/CustomerSupportPage";
import Wallet from "./pages/Wallet";

export default function App() {
  return (
    <CustomerSupportProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <NotesProvider>
              <StockProvider>
                <RecentlyViewedProvider>
                  <PriceAlertProvider>
                    <CareReminderProvider>
                      <WalletProvider>
                        <BrowserRouter>
                          <Header />
                          <main>
                            <ErrorBoundary>
                              <Routes>
                                <Route path="/" element={<Home />} />
                                <Route
                                  path="/plants/air-purifying"
                                  element={<AirPurifying />}
                                />
                                <Route
                                  path="/plants/indoor"
                                  element={<IndoorPlants />}
                                />
                                <Route
                                  path="/plants/low-maintenance"
                                  element={<LowMaintenance />}
                                />
                                <Route
                                  path="/planters"
                                  element={<Planters />}
                                />
                                <Route
                                  path="/category"
                                  element={<Category />}
                                />
                                <Route path="/compare" element={<Compare />} />
                                <Route
                                  path="/plant-scanner"
                                  element={<PlantScanner />}
                                />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route
                                  path="/product/:id"
                                  element={<ProductDetail />}
                                />
                                <Route path="/wallet" element={<Wallet />} />
                                <Route
                                  path="/customer-support"
                                  element={<CustomerSupportPage />}
                                />
                              </Routes>
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </BrowserRouter>
                      </WalletProvider>
                    </CareReminderProvider>
                  </PriceAlertProvider>
                </RecentlyViewedProvider>
              </StockProvider>
            </NotesProvider>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </CustomerSupportProvider>
  );
}
