import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import {
  Plus,
  MapPin,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Edit,
  Trash2,
  Eye
} from "lucide-react";



const indianStates = [
  "Delhi", "Maharashtra", "West Bengal", "Karnataka", "Tamil Nadu",
  "Uttar Pradesh", "Gujarat", "Rajasthan", "Punjab", "Haryana",
  "Kerala", "Madhya Pradesh", "Bihar", "Odisha", "Telangana",
  "Andhra Pradesh", "Jharkhand", "Assam", "Chhattisgarh", "Uttarakhand"
];

const categories = [
  "Education", "Healthcare", "Environment", "Women Empowerment",
  "Child Welfare", "Elder Care", "Food Security", "Water & Sanitation"
];

export default function OrganizationDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // WebSocket connection for real-time updates
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

        if (data.type === 'project_created') {
          // Invalidate projects and stats queries
          queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        } else if (data.type === 'project_deleted') {
          // Invalidate projects and stats queries
          queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        } else if (data.type === 'project_updated') {
          // Invalidate projects and stats queries for real-time completion updates
          queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        } else if (data.type === 'application_created' || data.type === 'application_updated') {
          // Invalidate applications for the selected project and projects/stats
          if (selectedProjectId) {
            queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProjectId, 'applications'] });
          }
          queryClient.invalidateQueries({ queryKey: ['/api/organization/applications'] });
          queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
          // Invalidate project details to update volunteersJoined count
          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
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
  }, [queryClient, selectedProjectId]);

  // Redirect if not organization
  if (user?.userType !== 'organization') {
    navigate('/');
    return null;
  }

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/my-projects'],
    enabled: true,
  });

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/projects', selectedProjectId, 'applications'],
    enabled: !!selectedProjectId,
  });

  const { data: allApplicationsData, isLoading: allApplicationsLoading } = useQuery({
    queryKey: ['/api/organization/applications'],
    enabled: true,
  });

  const createProjectForm = useForm({
    resolver: zodResolver(insertProjectSchema.omit({ organizationId: true })),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      state: "",
      city: "",
      skillsRequired: [],
      timeCommitment: "",
      volunteersNeeded: 1,
      imageUrl: "",
    },
  });

  // Update form when editing
  useEffect(() => {
    if (editingProject) {
      createProjectForm.reset({
        title: editingProject.title || "",
        description: editingProject.description || "",
        category: editingProject.category || "",
        location: editingProject.location || "",
        state: editingProject.state || "",
        city: editingProject.city || "",
        skillsRequired: editingProject.skillsRequired || [],
        timeCommitment: editingProject.timeCommitment || "",
        volunteersNeeded: editingProject.volunteersNeeded || 1,
        imageUrl: editingProject.imageUrl || "",
      });
    } else {
      createProjectForm.reset({
        title: "",
        description: "",
        category: "",
        location: "",
        state: "",
        city: "",
        skillsRequired: [],
        timeCommitment: "",
        volunteersNeeded: 1,
        imageUrl: "",
      });
    }
  }, [editingProject, createProjectForm]);

  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "Your project has been created successfully!",
      });
      // Close dialog after successful creation
      setIsCreateDialogOpen(false);
      setEditingProject(null);
      createProjectForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      if (error.message.startsWith("401")) {
        logout();
        toast({
          title: "Session Expired",
          description: "Session expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Creation Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PUT', `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Updated",
        description: "Your project has been updated successfully!",
      });
      // Keep dialog open and reset form for creating another project
      setEditingProject(null);
      createProjectForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest('DELETE', `/api/projects/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully!",
      });
      setProjectToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }) => {
      const response = await apiRequest('PUT', `/api/applications/${applicationId}`, { status });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Application Updated",
        description: `Application has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProjectId, 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-projects'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const projects = projectsData?.projects || [];
  const applications = applicationsData?.applications || [];
  const allApplications = allApplicationsData?.applications || [];

  const onCreateProject = (data) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject._id, data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const handleApplicationAction = (applicationId, status) => {
    updateApplicationMutation.mutate({ applicationId, status });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-yellow-600" />;
    }
  };

  const getTotalApplications = () => {
    return projects.reduce((total, project) => {
      return total + (project.totalApplications || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 font-serif" data-testid="welcome-header">
                  Welcome, {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your projects and connect with passionate volunteers.
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  setEditingProject(null);
                  createProjectForm.reset();
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="btn-primary text-primary-foreground" 
                    style={{ backgroundColor: 'hsl(25, 100%, 50%)' }} 
                    data-testid="create-project-button"
                  >
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...createProjectForm}>
                    <form onSubmit={createProjectForm.handleSubmit(onCreateProject)} className="space-y-4">
                      <FormField
                        control={createProjectForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="project-title-input">Project Title</FormLabel>
                            <FormControl>
                              <Input id="project-title-input" placeholder="e.g., Teach English to Children in Delhi" {...field} data-testid="project-title-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createProjectForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="project-description-input">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                id="project-description-input"
                                placeholder="Describe your project, its goals, and what volunteers will be doing..."
                                {...field}
                                data-testid="project-description-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createProjectForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="project-category-select">Category</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger id="project-category-select" data-testid="project-category-select">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createProjectForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="project-state-select">State</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger id="project-state-select" data-testid="project-state-select">
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {indianStates.map((state) => (
                                      <SelectItem key={state} value={state}>{state}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createProjectForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="project-city-input">City</FormLabel>
                              <FormControl>
                                <Input id="project-city-input" placeholder="e.g., Mumbai" {...field} data-testid="project-city-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createProjectForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="project-location-input">Specific Location</FormLabel>
                              <FormControl>
                                <Input id="project-location-input" placeholder="e.g., Dharavi Community Center" {...field} data-testid="project-location-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createProjectForm.control}
                          name="timeCommitment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="project-time-input">Time Commitment</FormLabel>
                              <FormControl>
                                <Input id="project-time-input" placeholder="e.g., 2-3 hours/week" {...field} data-testid="project-time-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createProjectForm.control}
                          name="volunteersNeeded"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="project-volunteers-input">Volunteers Needed</FormLabel>
                              <FormControl>
                                <Input
                                  id="project-volunteers-input"
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  data-testid="project-volunteers-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={createProjectForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="project-image-input">Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input id="project-image-input" placeholder="https://example.com/image.jpg" {...field} data-testid="project-image-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="submit"
                          disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                          variant="outline"
                          data-testid="submit-project-button"
                        >
                          {createProjectMutation.isPending || updateProjectMutation.isPending
                            ? (editingProject ? "Updating..." : "Creating...")
                            : (editingProject ? "Update Project" : "Create Project")
                          }
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                          data-testid="cancel-project-button"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="projects-stat">
              <CardContent className="text-center py-6">
                <div className="text-2xl font-bold text-foreground mb-2">
                  {projects.length}
                </div>
                <div className="text-muted-foreground">Active Projects</div>
              </CardContent>
            </Card>
            
            <Card data-testid="applications-stat">
              <CardContent className="text-center py-6">
                <div className="text-2xl font-bold text-primary mb-2">
                  {getTotalApplications()}
                </div>
                <div className="text-muted-foreground">Total Applications</div>
              </CardContent>
            </Card>
            
            <Card data-testid="volunteers-stat">
              <CardContent className="text-center py-6">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {projects.reduce((total, project) => total + (project.volunteersJoined || 0), 0)}
                </div>
                <div className="text-muted-foreground">Volunteers Joined</div>
              </CardContent>
            </Card>
            
            <Card data-testid="completion-stat">
              <CardContent className="text-center py-6">
                <div className="text-2xl font-bold text-accent mb-2">
                  {projects.filter((p) => p.status === 'completed').length}
                </div>
                <div className="text-muted-foreground">Completed Projects</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects" data-testid="projects-tab">My Projects</TabsTrigger>
              <TabsTrigger value="applications" data-testid="applications-tab">
                Volunteer Applications {allApplications.length > 0 ? `(${allApplications.length})` : ''}
              </TabsTrigger>
            </TabsList>

            {/* My Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">My Projects</h2>
                
                {projectsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-xl shadow-lg h-64 animate-pulse" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card data-testid="no-projects">
                    <CardContent className="text-center py-12">
                      <Building2 className="mx-auto text-muted-foreground mb-4" size={48} />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first project to start connecting with volunteers.
                      </p>
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="btn-primary"
                        style={{ color: 'black', fontWeight: 'bold' }}
                        data-testid="create-first-project-button"
                      >
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="projects-grid">
                    {projects.map((project) => (
                      <Card key={project._id} className="card-hover" data-testid={`project-card-${project._id}`}>
                        {project.imageUrl && (
                          <img 
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-32 object-cover rounded-t-xl"
                            data-testid="project-image"
                          />
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2" data-testid="project-title">
                                {project.title}
                              </CardTitle>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin size={14} className="mr-1" />
                                <span data-testid="project-location">
                                  {project.city}, {project.state}
                                </span>
                              </div>
                              <Badge variant="outline" data-testid="project-category">
                                {project.category}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid="project-description">
                            {project.description}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Users size={14} className="mr-1" />
                                <span>Volunteers</span>
                              </div>
                              <span className="font-medium" data-testid="project-volunteers">
                                {project.volunteersJoined || 0}/{project.volunteersNeeded}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Clock size={14} className="mr-1" />
                                <span>Commitment</span>
                              </div>
                              <span data-testid="project-time">{project.timeCommitment}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Calendar size={14} className="mr-1" />
                                <span>Created</span>
                              </div>
                              <span data-testid="project-date">
                                {new Date(project.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/projects/${project._id}`)}
                              data-testid={`view-project-${project._id}`}
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProjectId(project._id)}
                              data-testid={`manage-applications-${project._id}`}
                            >
                              <Users size={14} className="mr-1" />
                              Applications
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProject(project);
                                setIsCreateDialogOpen(true);
                              }}
                              data-testid={`edit-project-${project._id}`}
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  data-testid={`delete-project-${project._id}`}
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{project.title}"? This action cannot be undone and will remove all associated applications.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteProjectMutation.mutate(project._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteProjectMutation.isPending}
                                  >
                                    {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Volunteer Applications</h2>

                {allApplicationsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-xl shadow-lg h-32 animate-pulse" />
                    ))}
                  </div>
                ) : allApplications.filter(app => app.status === 'pending').length > 0 ? (
                  <div className="space-y-4" data-testid="applications-list">
                    {allApplications.filter(app => app.status === 'pending').map((application) => (
                      <Card key={application.id} data-testid={`application-card-${application.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div>
                                  <h4 className="font-semibold text-foreground" data-testid="volunteer-name">
                                    {application.volunteer.firstName} {application.volunteer.lastName}
                                  </h4>
                                  <p className="text-sm text-muted-foreground" data-testid="volunteer-email">
                                    {application.volunteer.email}
                                  </p>
                                  {application.volunteer.location && (
                                    <p className="text-sm text-muted-foreground flex items-center">
                                      <MapPin size={12} className="mr-1" />
                                      {application.volunteer.location}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mb-4">
                                <div className="text-sm font-medium text-foreground mb-1">Applied to Project:</div>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg" data-testid="application-project">
                                  "{application.project.title}"
                                </div>
                              </div>

                              {application.message && (
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-foreground mb-1">Application Message:</div>
                                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg" data-testid="application-message">
                                    "{application.message}"
                                  </div>
                                </div>
                              )}

                              {application.volunteer.bio && (
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-foreground mb-1">About the Volunteer:</div>
                                  <div className="text-sm text-muted-foreground" data-testid="volunteer-bio">
                                    {application.volunteer.bio}
                                  </div>
                                </div>
                              )}

                              {application.volunteer.skills && application.volunteer.skills.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-foreground mb-2">Skills:</div>
                                  <div className="flex flex-wrap gap-2" data-testid="volunteer-skills">
                                    {application.volunteer.skills.map((skill, index) => (
                                      <Badge key={index} variant="outline">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="text-sm text-muted-foreground">
                                  Applied on {new Date(application.appliedAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-3">
                              <Badge
                                className={`${getStatusColor(application.status)} flex items-center space-x-1`}
                                data-testid="application-status"
                              >
                                {getStatusIcon(application.status)}
                                <span className="capitalize">{application.status}</span>
                              </Badge>

                              {application.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApplicationAction(application.id, 'accepted')}
                                    disabled={updateApplicationMutation.isPending}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    data-testid={`accept-application-${application.id}`}
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApplicationAction(application.id, 'rejected')}
                                    disabled={updateApplicationMutation.isPending}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    data-testid={`reject-application-${application.id}`}
                                  >
                                    <XCircle size={14} className="mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card data-testid="no-applications">
                    <CardContent className="text-center py-12">
                      <Users className="mx-auto text-muted-foreground mb-4" size={48} />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground">
                        No volunteer applications to review at this time.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
