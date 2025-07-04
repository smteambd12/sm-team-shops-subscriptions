import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HashRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import Favorites from "./pages/Favorites";
import AdminDashboard from "./pages/AdminDashboard";
import UserSubscriptions from "./components/UserSubscriptions";
import OrderConfirmation from "./pages/OrderConfirmation";
import Dashboard from "./pages/Dashboard";
import LiveChat from "./pages/LiveChat";
import AdminChat from "./pages/AdminChat";
import TeamSupport from "./pages/TeamSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <HashRouter>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/team-support" element={<TeamSupport />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/subscriptions" element={<UserSubscriptions />} />
                    <Route path="/chat" element={<LiveChat />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/chat" element={<AdminChat />} />

                    {/* ভুল বা অন্য URL এ NotFound দেখাবে */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </HashRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
