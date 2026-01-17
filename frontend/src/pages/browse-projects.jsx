import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProjectCard from "@/components/project-card";
import Searchfilters from "@/components/search-filters";


export default function BrowseProjects() {
  const [location] = useLocation();
  const [searchParams] = useSearchParams();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['/api/projects', searchParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/projects?${searchParams.toString()}`);
      return res.json();
    },
    enabled: true,
  });

  const projects = projectsData?.projects || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-serif">Browse Volunteer Projects</h1>
            <p className="text-lg text-muted-foreground">
              Discover meaningful volunteer opportunities across India and make a lasting impact.
            </p>
          </div>

          {/* Community Searchfilters */}
          <Searchfilters />

          {/* Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground" data-testid="results-count">
              {isLoading ? "Loading..." : `${projects.length} projects found`}
            </h2>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl shadow-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12" data-testid="no-results">
              <div className="text-muted-foreground text-lg mb-4">No projects found matching your criteria</div>
              <p className="text-muted-foreground">Try adjusting your search filters or browse all projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="projects-grid">
                {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
