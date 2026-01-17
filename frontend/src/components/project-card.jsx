import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { useLocation } from "wouter";

const getCategoryColor = (category) => {
  const colors = {
    "Education": "bg-accent text-accent-foreground",
    "Environment": "bg-secondary text-secondary-foreground",
    "Food Security": "bg-destructive text-destructive-foreground",
    "Healthcare": "bg-accent text-accent-foreground",
    "Women Empowerment": "bg-secondary text-secondary-foreground",
    "Water & Sanitation": "bg-accent text-accent-foreground",
  };
  return colors[category] || "bg-muted text-muted-foreground";
};

export default function ProjectCard({ project }) {
  const [, navigate] = useLocation();

  const handleApplyClick = () => {
    navigate(`/projects/${project._id}`);
  };

  // Show only first 3-5 lines of description in card
  const shortDescription = project.description.split(' ').slice(0, 40).join(' ') + '...';

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden card-hover" data-testid={`project-card-${project._id}`}>
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-48 object-cover"
          data-testid="project-image"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getCategoryColor(project.category)} data-testid="project-category">
            {project.category}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center" data-testid="project-location">
            <MapPin size={14} className="mr-1" />
            {project.city}, {project.state}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2" data-testid="project-title">
          {project.title}
        </h3>

        <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-3" data-testid="project-description">
          {shortDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground flex items-center" data-testid="project-time">
            <Clock size={14} className="mr-1" />
            {project.timeCommitment}
          </div>
          <div
            onClick={handleApplyClick}
            className="bg-white/20 backdrop-blur-md border border-white/30 px-3 sm:px-4 py-2 rounded-md cursor-pointer hover:bg-white/30 hover:backdrop-blur-lg transition-all duration-500 ease-in-out shadow-lg"
            data-testid="learn-more-button"
          >
            <span className="text-sm sm:text-base text-orange-500 font-medium">Learn More</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground" data-testid="project-volunteers">
          {project.volunteersJoined >= project.volunteersNeeded ? "Limit Reached" : `${project.volunteersJoined || 0}/${project.volunteersNeeded} volunteers joined`}
        </div>
      </div>
    </div>
  );
}
