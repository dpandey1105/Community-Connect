import { useQuery } from "@tanstack/react-query";
import { Users, FolderOpen, MapPin, Handshake, Quote } from "lucide-react";

export default function ImpactStats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['/api/stats'],
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const stats = statsData?.stats || {
    volunteers: 0,
    projects: 0,
    applications: 0,
    states: 0
  };

  return (
    <section className="py-16 bg-background" data-testid="impact-stats-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-serif">Our Community Impact</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Together, we're creating lasting change across India. See how our volunteers and organizations are transforming communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center" data-testid="stat-volunteers">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary-foreground" size={32} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              {isLoading ? "..." : `${stats.volunteers.toLocaleString()}+`}
            </div>
            <div className="text-muted-foreground">Active Volunteers</div>
          </div>
          
          <div className="text-center" data-testid="stat-projects">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="text-secondary-foreground" size={32} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              {isLoading ? "..." : `${stats.projects.toLocaleString()}+`}
            </div>
            <div className="text-muted-foreground">Active Projects</div>
          </div>
          
          <div className="text-center" data-testid="stat-states">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-accent-foreground" size={32} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              {isLoading ? "..." : stats.states}
            </div>
            <div className="text-muted-foreground">Indian States</div>
          </div>
          
          <div className="text-center" data-testid="stat-applications">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Handshake className="text-primary-foreground" size={32} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              {isLoading ? "..." : `${(stats.applications * 4).toLocaleString()}+`}
            </div>
            <div className="text-muted-foreground">Lives Impacted</div>
          </div>
        </div>

        {/* Impact Stories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl shadow-lg p-6" data-testid="testimonial-volunteer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Quote className="text-primary-foreground" size={20} />
              </div>
              <div>
                <p className="text-foreground mb-4">
                  "Through Community Connect, I found my passion for teaching. Working with children in Delhi slums has been the most rewarding experience of my life. I've helped 50+ children learn basic English and seen their confidence grow."
                </p>
                <div className="font-semibold text-foreground">Priya Sharma</div>
                <div className="text-sm text-muted-foreground">Volunteer • Delhi Education Project</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl shadow-lg p-6" data-testid="testimonial-organization">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Quote className="text-secondary-foreground" size={20} />
              </div>
              <div>
                <p className="text-foreground mb-4">
                  "Our tree plantation project in Mumbai found 200+ volunteers through this platform. We've successfully planted 8,000 trees across the city. The volunteers' dedication has made our environmental mission possible."
                </p>
                <div className="font-semibold text-foreground">Rajesh Patel</div>
                <div className="text-sm text-muted-foreground">Project Organizer • Green Mumbai Initiative</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
