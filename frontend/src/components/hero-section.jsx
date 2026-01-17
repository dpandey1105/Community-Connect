import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useStats } from "@/contexts/stats-context";

export default function HeroSection() {
  const [, navigate] = useLocation();

  const { stats, isLoading } = useStats();

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Hero background with Indian community service project */}
      <div className="absolute inset-0 hero-gradient">
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
          alt="Volunteers teaching children in Indian community" 
          className="w-full h-full object-cover opacity-20" 
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-serif">
          Connect with{" "}
          <span className="text-yellow-300">Community Projects</span>
          {" "}Across India
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join thousands of volunteers making a real difference in Indian communities. From teaching children in Delhi slums to planting trees in Mumbai - find your perfect volunteer opportunity.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            onClick={() => navigate("/projects")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-lg text-base sm:text-lg"
            data-testid="find-projects-button"
          >
            <Search className="mr-2" size={20} />
            Find Projects
          </Button>
          <Button
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 transition-all text-base sm:text-lg"
            data-testid="post-project-button"
          >
            <Plus className="mr-2" size={20} />
            Post a Project
          </Button>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div data-testid="stat-volunteers" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {isLoading || !stats ? "..." : `${stats.volunteers.toLocaleString()}+`}
            </div>
            <div className="text-sm sm:text-base text-white/80">Active Volunteers</div>
          </div>
          <div data-testid="stat-projects" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {isLoading || !stats ? "..." : `${stats.projects.toLocaleString()}+`}
            </div>
            <div className="text-sm sm:text-base text-white/80">Community Projects</div>
          </div>
          <div data-testid="stat-states" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {isLoading || !stats ? "..." : stats.states}
            </div>
            <div className="text-sm sm:text-base text-white/80">Indian States Covered</div>
          </div>
        </div>
      </div>
    </section>
  );
}
