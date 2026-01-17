import { Button } from "@/components/ui/button";
import { Handshake, Users, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function UserTypeSelection() {
  const [, navigate] = useLocation();

  return (
    <section className="py-16 bg-muted" data-testid="user-type-selection-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-serif">Join Community Connect</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking to volunteer your time or need volunteers for your community project, we have the perfect solution for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Volunteer Registration */}
          <div className="bg-card rounded-xl shadow-lg p-8 card-hover" data-testid="volunteer-registration-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="text-primary-foreground" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">I Want to Volunteer</h3>
              <p className="text-muted-foreground">
                Discover meaningful volunteer opportunities and make a difference in Indian communities.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-primary" size={20} />
                <span className="text-foreground">Browse active projects</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-primary" size={20} />
                <span className="text-foreground">Filter by location and skills</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-primary" size={20} />
                <span className="text-foreground">Track your volunteer impact</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-primary" size={20} />
                <span className="text-foreground">Connect with like-minded people</span>
              </div>
            </div>
            
            <Button
              onClick={() => navigate("/register?type=volunteer")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="register-volunteer-button"
            >
              Register as Volunteer
            </Button>
          </div>

          {/* Organization Registration */}
          <div className="bg-card rounded-xl shadow-lg p-8 card-hover" data-testid="organization-registration-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-secondary-foreground" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">I Need Volunteers</h3>
              <p className="text-muted-foreground">
                Post your community projects and find passionate volunteers to help make them happen.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-secondary" size={20} />
                <span className="text-foreground">Post unlimited projects for free</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-secondary" size={20} />
                <span className="text-foreground">Manage volunteer applications</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-secondary" size={20} />
                <span className="text-foreground">Track project progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-secondary" size={20} />
                <span className="text-foreground">Connect with active volunteers</span>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate("/register?type=organization")}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              data-testid="register-organization-button"
            >
              Register as Organization
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
