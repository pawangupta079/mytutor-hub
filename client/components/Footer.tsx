import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17L10 7L14 13L20 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="3" r="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-lg font-bold">My_Offline_Tutor</span>
          </div>
          <p className="mt-3 text-sm text-foreground/70">Learn smarter with expert tutors. Book sessions, track progress, and achieve your goals.</p>
          <div className="mt-4 flex gap-3 text-foreground/70">
            <a href="#" aria-label="Facebook" className="hover:text-primary"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-primary"><Instagram size={18} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-primary"><Linkedin size={18} /></a>
            <a href="mailto:support@myofflinetutor.com" aria-label="Email" className="hover:text-primary"><Mail size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Platform</h4>
          <ul className="mt-3 grid gap-2 text-sm text-foreground/70">
            <li><Link to="/find-tutor" className="hover:text-primary">Find a Tutor</Link></li>
            <li><Link to="/register-tutor" className="hover:text-primary">Register as Tutor</Link></li>
            <li><Link to="/learning-demo" className="hover:text-primary">Interactive Learning</Link></li>
            <li><Link to="/schedule" className="hover:text-primary">Scheduling</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Dashboards</h4>
          <ul className="mt-3 grid gap-2 text-sm text-foreground/70">
            <li><Link to="/student-dashboard" className="hover:text-primary">Student</Link></li>
            <li><Link to="/tutor-dashboard" className="hover:text-primary">Tutor</Link></li>
            <li><Link to="/payments" className="hover:text-primary">Payments</Link></li>
            <li><Link to="/support" className="hover:text-primary">Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-3 grid gap-2 text-sm text-foreground/70">
            <li>Email: support@myofflinetutor.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Tutor Lane, Education City</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-sm text-foreground/60">© {new Date().getFullYear()} My_Offline_Tutor. All rights reserved.</div>
    </footer>
  );
}
