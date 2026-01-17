import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Handshake, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (user?.userType === 'volunteer') return '/volunteer/dashboard';
    if (user?.userType === 'organization') return '/organization/dashboard';
    return '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3" onClick={closeMobileMenu} data-testid="logo-link">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Handshake className="text-primary-foreground" size={16} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground font-serif">Community Connect</h1>
              <p className="text-xs font-semibold text-primary hidden sm:block">Empowering Volunteer Engagement</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/projects" className="text-foreground hover:text-primary transition-colors" data-testid="nav-projects">
              Browse Projects
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">About</Link>
            {/* Removed Our Impact link as per user request */}
            {/* <a href="#impact" className="text-foreground hover:text-primary transition-colors">Our Impact</a> */}
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">Contact</Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2" data-testid="user-menu">
                    <User size={16} />
                    <span className="hidden sm:block">{user?.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { navigate(getDashboardPath()); closeMobileMenu(); }} data-testid="dashboard-link">
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { handleLogout(); closeMobileMenu(); }} data-testid="logout-button">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { navigate("/login"); closeMobileMenu(); }} className="hidden sm:block text-sm" data-testid="login-button">
                  Login
                </Button>
                <Button onClick={() => { navigate("/register"); closeMobileMenu(); }} className="btn-primary text-primary-foreground text-sm sm:text-base" data-testid="register-button">
                  Join as Volunteer
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" className="lg:hidden p-2" onClick={toggleMobileMenu} data-testid="mobile-menu-button">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-4">
              <Link
                href="/projects"
                className="block text-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
                data-testid="mobile-nav-projects"
              >
                Browse Projects
              </Link>
              <Link
                href="/about"
                className="block text-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>

              {/* Mobile Auth Links */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => { navigate("/login"); closeMobileMenu(); }}
                    className="w-full justify-start text-sm"
                    data-testid="mobile-login-button"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => { navigate("/register"); closeMobileMenu(); }}
                    className="w-full btn-primary text-primary-foreground text-sm"
                    data-testid="mobile-register-button"
                  >
                    Join as Volunteer
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
