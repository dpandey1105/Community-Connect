import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Clock, Users, Building2, Calendar } from "lucide-react";


export default function ProjectDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [applicationMessage, setApplicationMessage] = useState("");

  const { data: projectData, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  const project = projectData?.project;

  // WebSocket connection for real-time project updates
  useEffect(() => {
    const wsUrl = window.location.protocol.replace('http', 'ws') + '//' + window.location.host;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected for real-time updates');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);

        if (data.type === 'project_updated' && data.project._id === id) {
          // Invalidate project query to refetch updated data
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
        } else if (data.type === 'application_deleted' && data.projectId === id) {
          // Refetch applications query to update apply button state
          queryClient.refetchQueries({ queryKey: ['/api/my-applications'] });
        } else if (data.type === 'application_created' || data.type === 'application_updated') {
          // Invalidate project query to update volunteersJoined count
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [queryClient, id]);

  const { data: applicationsData } = useQuery({
    queryKey: ['/api/my-applications'],
    enabled: isAuthenticated && user?.userType === 'volunteer',
  });

  const hasApplied = applicationsData?.applications?.some(
    (app) => app.projectId === id
  );

  const applyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/applications', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your volunteer application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setApplicationMessage("");
      // Navigate back to volunteer dashboard to see updated Discover Projects tab
      navigate("/volunteer/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.userType !== 'volunteer') {
      toast({
        title: "Access Denied",
        description: "Only volunteers can apply to projects.",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate({
      projectId: id,
      message: applicationMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded-xl mb-8"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/projects")}>Browse Other Projects</Button>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Project Header */}
          {project.imageUrl && (
            <div className="mb-8">
              <img 
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-64 object-cover rounded-xl"
                data-testid="project-image"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge className={getCategoryColor(project.category)} data-testid="project-category">
                  {project.category}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4 font-serif" data-testid="project-title">
                {project.title}
              </h1>

              <div className="flex items-center text-muted-foreground mb-6">
                <MapPin size={16} className="mr-2" />
                <span data-testid="project-location">{project.location}, {project.state}</span>
              </div>

              <div className="prose prose-gray max-w-none mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">About This Project</h3>
                <p className="text-foreground leading-relaxed" data-testid="project-description">
                  {project.description}
                </p>
              </div>

              {project.skillsRequired && project.skillsRequired.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2" data-testid="project-skills">
                    {project.skillsRequired.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card data-testid="project-info-card">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-3 text-muted-foreground" />
                    <div>
                      <div className="font-medium" data-testid="time-commitment">Time Commitment</div>
                      <div className="text-sm text-muted-foreground">{project.timeCommitment}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users size={16} className="mr-3 text-muted-foreground" />
                    <div>
                      <div className="font-medium" data-testid="volunteers-needed">Volunteers Needed</div>
                      <div className="text-sm text-muted-foreground">
                        {project.volunteersJoined || 0}/{project.volunteersNeeded} joined
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Building2 size={16} className="mr-3 text-muted-foreground" />
                    <div>
                      <div className="font-medium" data-testid="organization-name">Organization</div>
                      <div className="text-sm text-muted-foreground">
                        {project.organization.firstName} {project.organization.lastName}
                      </div>
                    </div>
                  </div>

                  {project.createdAt && (
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Posted</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application Section */}
              <Card className="mt-6" data-testid="application-card">
                <CardHeader>
                  <CardTitle>Apply to Volunteer</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div>
                      <Alert className="mb-4" data-testid="login-required-alert">
                        <AlertDescription>
                          You need to be logged in to apply for this project.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={() => navigate("/login")} className="w-full" data-testid="login-to-apply-button">
                        Login to Apply
                      </Button>
                    </div>
                  ) : user?.userType !== 'volunteer' ? (
                    <Alert variant="destructive" data-testid="volunteer-only-alert">
                      <AlertDescription>
                        Only volunteers can apply to projects.
                      </AlertDescription>
                    </Alert>
                  ) : hasApplied ? (
                    <Alert data-testid="already-applied-alert">
                      <AlertDescription>
                        You have already applied to this project.
                      </AlertDescription>
                    </Alert>
                  ) : project.volunteersJoined >= project.volunteersNeeded ? (
                    <Alert variant="destructive" data-testid="limit-reached-alert">
                      <AlertDescription>
                        Limit Reached. This project has reached its volunteer capacity.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="application-message">Why do you want to volunteer for this project?</Label>
                        <Textarea
                          id="application-message"
                          placeholder="Tell the organization why you're interested and what you can contribute..."
                          value={applicationMessage}
                          onChange={(e) => setApplicationMessage(e.target.value)}
                          className="mt-2"
                          data-testid="application-message-input"
                        />
                      </div>
                      <Button
                        onClick={handleApply}
                        disabled={applyMutation.isPending}
                        className="w-full text-primary-foreground"
                        style={{ backgroundColor: 'var(--primary)' }}
                        data-testid="submit-application-button"
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {project.organization.bio && (
                <Card className="mt-6" data-testid="organization-info-card">
                  <CardHeader>
                    <CardTitle>About the Organization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground" data-testid="organization-bio">
                      {project.organization.bio}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
