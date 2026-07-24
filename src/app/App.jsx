import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Scan from "../pages/Scan";
import Report from "../pages/Report";
import Pricing from "../pages/Pricing";
import Account from "../pages/Account";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import NotFound from "../pages/NotFound";

// Layout wrapper for app pages
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white pt-16">
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      {/* Protected app pages */}
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/scan" element={<AppLayout><Scan /></AppLayout>} />
      <Route path="/report/:id" element={<AppLayout><Report /></AppLayout>} />
      <Route path="/account" element={<AppLayout><Account /></AppLayout>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
