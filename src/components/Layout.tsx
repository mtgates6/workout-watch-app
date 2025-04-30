
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Dumbbell, Home, Library, MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, label, icon, active, onClick }: NavItemProps) => (
  <Link to={to} onClick={onClick}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        active
          ? "bg-fitness-primary text-primary-foreground hover:bg-fitness-primary/90 hover:text-primary-foreground"
          : "hover:bg-muted"
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    {
      to: "/",
      label: "Dashboard",
      icon: <Home size={20} />,
    },
    {
      to: "/workout",
      label: "Workout",
      icon: <Dumbbell size={20} />,
    },
    {
      to: "/exercises",
      label: "Exercises",
      icon: <Library size={20} />,
    },
    {
      to: "/history",
      label: "History",
      icon: <BarChart3 size={20} />,
    },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">WorkoutWatch</h1>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar for desktop / Drawer for mobile */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform",
            isMobile ? "transform top-0" : "sticky top-0 h-screen",
            isMobile && !menuOpen && "-translate-x-full"
          )}
        >
          {isMobile && (
            <div className="flex h-14 items-center border-b px-4">
              <h1 className="text-lg font-bold">WorkoutWatch</h1>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={closeMenu}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-auto p-4">
            <div className={cn("space-y-1", !isMobile && "pt-8")}>
              {!isMobile && (
                <div className="px-2 mb-8">
                  <h1 className="text-2xl font-bold">WorkoutWatch</h1>
                </div>
              )}
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    active={location.pathname === item.to}
                    onClick={isMobile ? closeMenu : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            isMobile ? "pb-16" : "p-8"
          )}
        >
          <div className={cn("mx-auto max-w-5xl", isMobile ? "p-4" : "")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
