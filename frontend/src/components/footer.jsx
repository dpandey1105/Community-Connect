import { Handshake } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Handshake className="text-primary-foreground" size={16} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-serif">Community Connect</h3>
                <p className="text-xs font-semibold text-primary">Empowering Volunteer Engagement</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
              Connecting passionate volunteers with meaningful community projects across India. Together, we're building stronger, more vibrant communities one project at a time.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="social-facebook">
                <SiFacebook size={14} />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="social-twitter">
                <SiX size={14} />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="social-instagram">
                <SiInstagram size={14} />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="social-linkedin">
                <SiLinkedin size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Browse Projects</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Post a Project</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Volunteer Login</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Organization Login</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Success Stories</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-0">
            © 2025 Community Connect. All rights reserved.
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
            <span>Made with <Handshake className="inline text-red-500" size={14} /> for India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
