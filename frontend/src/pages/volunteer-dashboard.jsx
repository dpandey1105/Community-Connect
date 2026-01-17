 import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Handshake,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  User,
  Edit
} from "lucide-react";


export default function VolunteerDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const wsUrl = window.location.protocol.replace('http', 'ws') + '//' + window.location.host;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected for volunteer dashboard real-time updates');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message in volunteer dashboard:', data);

        if (data.type === 'application_created' || data.type === 'application_updated' || data.type === 'application_deleted' || data.type === 'project_created') {
          // Invalidate applications and projects queries for real-time updates
          queryClient.invalidateQueries({ queryKey: ['/api/my-applications'] });
          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message in volunteer dashboard:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected for volunteer dashboard');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error in volunteer dashboard:', error);
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);

  // Redirect if not volunteer
  if (user?.userType !== 'volunteer') {
    navigate('/');
    return null;
  }

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/my-applications'],
    enabled: !!user?._id,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user?._id,
  });

  console.log('Projects data:', projectsData);
  console.log('Applications data:', applicationsData);

  const updateProfileMutation = useMutation({
      mutationFn: async (data) => {
        if (!user?._id) throw new Error('User ID is required');
        const response = await apiRequest('PUT', `/api/users/${user._id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file) => {
      if (!user?._id) throw new Error('User ID is required');
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await fetch(`/api/users/${user._id}/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully!",
      });
      setProfilePictureFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    },
  });

  const withdrawApplicationMutation = useMutation({
    mutationFn: async (applicationId) => {
      await apiRequest('DELETE', `/api/applications/${applicationId}`);
      return { message: "Application withdrawn successfully" };
    },
    onSuccess: () => {
      toast({
        title: "Application Withdrawn",
        description: "Your application has been withdrawn successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-applications'] });
    },
    onError: (error) => {
      toast({
        title: "Withdraw Failed",
        description: error.message || "Failed to withdraw application",
        variant: "destructive",
      });
    },
  });

  const applications = applicationsData?.applications || [];
  const projects = projectsData?.projects || [];

  // Filter projects that user hasn't applied to
  const appliedProjectIds = new Set(applications.map((app) => app.projectId.toString()));
  const availableProjects = projects.filter((project) =>
    !appliedProjectIds.has(project._id.toString())
  );

  console.log('Applied project IDs:', Array.from(appliedProjectIds));
  console.log('Available projects:', availableProjects);

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

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
    }
  };

  const handleUploadProfilePicture = () => {
    if (profilePictureFile) {
      uploadProfilePictureMutation.mutate(profilePictureFile);
    }
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
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Track your volunteer journey and discover new opportunities to make a difference.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/projects")}
                  data-testid="browse-projects-button"
                >
                  <Search className="mr-2" size={16} />
                  Browse Projects
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="applications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="applications" data-testid="applications-tab">My Applications</TabsTrigger>
              <TabsTrigger value="discover" data-testid="discover-tab">Discover Projects</TabsTrigger>
              <TabsTrigger value="profile" data-testid="profile-tab">Profile</TabsTrigger>
            </TabsList>

            {/* My Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">My Applications</h2>
                
                {applicationsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-xl shadow-lg h-48 animate-pulse" />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <Card data-testid="no-applications">
                    <CardContent className="text-center py-12">
                      <Handshake className="mx-auto text-muted-foreground mb-4" size={48} />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start your volunteer journey by applying to projects that interest you.
                      </p>
                      <Button onClick={() => navigate("/projects")} data-testid="start-volunteering-button">
                        Start Volunteering
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="applications-grid">
                    {applications.map((application) => (
                      <Card key={application.id} className="card-hover" data-testid={`application-card-${application.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2" data-testid="application-project-title">
                                {application.project.title}
                              </CardTitle>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin size={14} className="mr-1" />
                                <span data-testid="application-project-location">
                                  {application.project.city}, {application.project.state}
                                </span>
                              </div>
                            </div>
                            <Badge 
                              className={`${getStatusColor(application.status)} flex items-center space-x-1`}
                              data-testid="application-status"
                            >
                              {getStatusIcon(application.status)}
                              <span className="capitalize">{application.status}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid="application-project-description">
                            {application.project.description}
                          </p>
                          
                          {application.message && (
                            <div className="mb-4">
                              <div className="text-sm font-medium text-foreground mb-1">Your Message:</div>
                              <div className="text-sm text-muted-foreground italic" data-testid="application-message">
                                "{application.message}"
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              <span data-testid="application-date">
                                Applied {new Date(application.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>{application.project.timeCommitment}</span>
                            </div>
                          </div>

                          {application.status === 'pending' && (
                            <div className="mt-4">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => withdrawApplicationMutation.mutate(application.id)}
                                disabled={withdrawApplicationMutation.isPending}
                                data-testid={`withdraw-button-${application.id}`}
                              >
                                {withdrawApplicationMutation.isPending ? "Withdrawing..." : "Withdraw Application"}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Discover Projects Tab */}
            <TabsContent value="discover" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">Discover New Projects</h2>
                  <Button 
                    onClick={() => navigate("/projects")}
                    variant="outline"
                    data-testid="view-all-projects-button"
                  >
                    View All Projects
                  </Button>
                </div>
                
                {projectsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-xl shadow-lg h-96 animate-pulse" />
                    ))}
                  </div>
                ) : availableProjects.length === 0 ? (
                  <Card data-testid="no-available-projects">
                    <CardContent className="text-center py-12">
                      <Search className="mx-auto text-muted-foreground mb-4" size={48} />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No New Projects</h3>
                      <p className="text-muted-foreground mb-4">
                        You've applied to all available projects. Check back later for new opportunities!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="available-projects-grid">
                    {availableProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card data-testid="profile-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      data-testid="edit-profile-button"
                    >
                      <Edit className="mr-2" size={16} />
                      {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Profile Picture Section */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={32} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="profilePicture">Profile Picture</Label>
                        <Input
                          id="profilePicture"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="mt-1"
                        />
                        {profilePictureFile && (
                          <Button
                            onClick={handleUploadProfilePicture}
                            disabled={uploadProfilePictureMutation.isPending}
                            className="mt-2"
                          >
                            {uploadProfilePictureMutation.isPending ? "Uploading..." : "Upload Picture"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                            data-testid="edit-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                            data-testid="edit-last-name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            data-testid="edit-phone"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            data-testid="edit-location"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">About You</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Tell us about your interests, skills, and what motivates you to volunteer..."
                          data-testid="edit-bio"
                        />
                      </div>

                      <div>
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input
                          id="skills"
                          value={profileData.skills.join(', ')}
                          onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                          placeholder="e.g. Teaching, Cooking, Event Planning"
                          data-testid="edit-skills"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button 
                          onClick={handleUpdateProfile}
                          disabled={updateProfileMutation.isPending}
                          className="btn-primary text-primary-foreground"
                          data-testid="save-profile-button"
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditingProfile(false)}
                          data-testid="cancel-edit-button"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm font-medium text-foreground mb-1">Name</div>
                          <div className="text-muted-foreground" data-testid="profile-name">
                            {user?.firstName} {user?.lastName}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground mb-1">Email</div>
                          <div className="text-muted-foreground" data-testid="profile-email">
                            {user?.email}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground mb-1">Phone</div>
                          <div className="text-muted-foreground" data-testid="profile-phone">
                            {user?.phone || 'Not provided'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground mb-1">Location</div>
                          <div className="text-muted-foreground" data-testid="profile-location">
                            {user?.location || 'Not provided'}
                          </div>
                        </div>
                      </div>

                      {user?.bio && (
                        <div>
                          <div className="text-sm font-medium text-foreground mb-1">About</div>
                          <div className="text-muted-foreground" data-testid="profile-bio">
                            {user.bio}
                          </div>
                        </div>
                      )}

                      {user?.skills && user.skills.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-foreground mb-2">Skills</div>
                          <div className="flex flex-wrap gap-2" data-testid="profile-skills">
                            {user.skills.map((skill, index) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium text-foreground mb-1">Member Since</div>
                        <div className="text-muted-foreground" data-testid="profile-member-since">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card data-testid="applications-stat">
                  <CardContent className="text-center py-6">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {applications.length}
                    </div>
                    <div className="text-muted-foreground">Applications Submitted</div>
                  </CardContent>
                </Card>
                
                <Card data-testid="accepted-stat">
                  <CardContent className="text-center py-6">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {applications.filter((app) => app.status === 'accepted').length}
                    </div>
                    <div className="text-muted-foreground">Applications Accepted</div>
                  </CardContent>
                </Card>
                
                <Card data-testid="pending-stat">
                  <CardContent className="text-center py-6">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {applications.filter((app) => app.status === 'pending').length}
                    </div>
                    <div className="text-muted-foreground">Applications Pending</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
