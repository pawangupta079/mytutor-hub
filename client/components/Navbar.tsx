import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/find-tutor", label: "Find a Tutor" },
  { to: "/register-tutor", label: "Register as Tutor" },
  { to: "/student-dashboard", label: "Student Dashboard" },
  { to: "/tutor-dashboard", label: "Tutor Dashboard" },
  { to: "/learning-demo", label: "Interactive Learning" },
  { to: "/schedule", label: "Scheduling" },
  { to: "/payments", label: "Payments" },
  { to: "/support", label: "Support" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white shadow-md">
            <svg
              width="20"
              height="20"
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
          <span className="text-lg font-bold tracking-tight text-foreground">
            My_Offline_Tutor
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-foreground/70",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            className="text-foreground/80 hover:text-foreground"
          >
            Log in
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign up
          </Button>
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
              <Button variant="outline" className="flex-1">
                Log in
              </Button>
              <Button className="flex-1">Sign up</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
