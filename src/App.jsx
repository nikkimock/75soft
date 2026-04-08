import { Toaster } from "sonner";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/lib/AuthContext";
import PageNotFound from "@/lib/PageNotFound";
import Dashboard from "@/pages/Dashboard";
import Progress from "@/pages/Progress";
import Photos from "@/pages/Photos";
import Settings from "@/pages/Settings";

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/progress" element={<PageWrapper><Progress /></PageWrapper>} />
          <Route path="/photos" element={<PageWrapper><Photos /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}
