import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const publicNavItems = [
  { to: "/find-tutor", label: "Find a Tutor" },
  { to: "/support", label: "Support" },
];

const studentNavItems = [
  { to: "/student-dashboard", label: "Dashboard" },
  { to: "/schedule", label: "My Sessions" },
  { to: "/payments", label: "Payments" },
];

const tutorNavItems = [
  { to: "/tutor-dashboard", label: "Dashboard" },
  { to: "/schedule", label: "Sessions" },
  { to: "/payments", label: "Earnings" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    if (!isAuthenticated || !user) return publicNavItems;
    
    if (user.role === 'student') {
      return [...publicNavItems, ...studentNavItems];
    } else if (user.role === 'tutor') {
      return [...publicNavItems, ...tutorNavItems];
    }
    
    return publicNavItems;
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 17L10 7L14 13L20 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="3" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
            MyTutor
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "nav-link px-4 py-2 rounded-lg transition-all duration-200 hover:bg-primary/5",
                  isActive ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors duration-200">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="gradient-primary text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 glass border-border/50 shadow-modern-lg" align="end" forceMount>
                <div className="flex items-center justify-start gap-3 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="gradient-primary text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-primary/5">
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-primary/5">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-destructive/10 text-destructive">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                className="nav-link text-foreground/80 hover:text-foreground hover:bg-primary/5"
                onClick={() => navigate('/login')}
              >
                Log in
              </Button>
              <Button 
                className="btn-modern gradient-primary text-white hover:shadow-lg hover:shadow-primary/25 px-6 py-2"
                onClick={() => navigate('/register')}
              >
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md border md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="container grid gap-2 py-4">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    isActive ? "text-primary" : "text-foreground/80",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" className="flex-1" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      navigate('/login');
                      setOpen(false);
                    }}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      navigate('/register');
                      setOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
