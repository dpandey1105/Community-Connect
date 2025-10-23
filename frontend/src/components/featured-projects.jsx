import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ProjectCard from "./project-card";
import { API_BASE_URL } from "@/lib/config";

import { useLocation } from "wouter";

export default function FeaturedProjects() {
  const [, navigate] = useLocation();

  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');

  const { data, isLoading } = useQuery({
    queryKey: ['/api/projects', searchParams.toString()],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/projects?${searchParams.toString()}`);
      return res.json();
    },
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes for projects
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">Featured Community Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl shadow-lg h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hasFilters = searchParams.get('search') || (searchParams.get('location') && searchParams.get('location') !== 'All Locations') || (searchParams.get('category') && searchParams.get('category') !== 'All Categories');
  const projects = hasFilters ? (data?.projects || []) : (data?.projects?.slice(0, 3) || []);

  return (
    <section className="py-16 bg-background" data-testid="featured-projects-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-serif">Featured Community Projects</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover high-impact volunteer opportunities currently seeking passionate individuals to make a difference across India.
          </p>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => navigate("/projects")}
            data-testid="view-all-projects-button"
          >
            Browse All Projects <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
