import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Camera, Settings } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Today" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/photos", icon: Camera, label: "Photos" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const pageTitles = {
  "/": "Today",
  "/progress": "Progress",
  "/photos": "Photos",
  "/settings": "Settings",
};

export default function Layout() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "75 Soft";

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto flex items-center h-12 px-4 gap-2">
          <h1 className="text-base font-extrabold text-foreground flex-1 ml-1">{pageTitle}</h1>
        </div>
      </header>

      <div className="flex-1 pb-24 max-w-lg mx-auto w-full">
        <Outlet />
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-lg mx-auto flex justify-around py-2 px-4">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
