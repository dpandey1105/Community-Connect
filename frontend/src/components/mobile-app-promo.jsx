import { Button } from "@/components/ui/button";
import { CheckCircle, Smartphone } from "lucide-react";
import { SiApple, SiGoogleplay } from "react-icons/si";

export default function MobileAppPromo() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary to-secondary" data-testid="mobile-app-promo-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-serif">Take Community Connect With You</h2>
            <p className="text-white/90 text-base sm:text-lg mb-6">
              Download our mobile app to discover volunteer opportunities on the go, get real-time project updates, and connect with your community anywhere in India.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-white" size={20} />
                <span className="text-white">Browse projects offline</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-white" size={20} />
                <span className="text-white">Get instant notifications</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-white" size={20} />
                <span className="text-white">Track your volunteer hours</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                data-testid="app-store-button"
              >
                <SiApple size={24} />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Button>
              <Button 
                className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                data-testid="google-play-button"
              >
                <SiGoogleplay size={24} />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <div className="relative inline-block">
              <Smartphone className="text-white/20" size={300} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold mb-2">Community Connect</div>
                  <div className="text-sm">Mobile App</div>
                  <div className="text-xs mt-2">Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
