import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { AuthService, authenticateToken } from "./auth.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";

import { insertUserSchema, insertProjectSchema, insertApplicationSchema, loginSchema, profileUpdateSchema } from "./schema.js";

function broadcast(data) {
  if (global.wss) {
    global.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

// MongoDB Change Streams for realtime updates - Disabled for free tier
function setupChangeStreams() {
  console.log('Change streams disabled - requires replica set (M10+ Atlas tier)');
  // Change streams require replica sets which are not available in free Atlas tier
  // Uncomment the following code when upgrading to M10+ tier

  /*
  // Watch Projects collection for changes
  const Project = mongoose.model('Project');
  const projectStream = Project.watch();

  projectStream.on('change', (change) => {
    console.log('Project change detected:', change.operationType);

    if (change.operationType === 'insert') {
      broadcast({
        type: 'project_created',
        project: change.fullDocument
      });
      broadcast({
        type: 'stats_update',
        stats: storage.getStats() // This will be async, but for now sync
      });
    } else if (change.operationType === 'update') {
      broadcast({
        type: 'project_updated',
        project: change.fullDocument
      });
    }
  });

  // Watch Applications collection for changes
  const Application = mongoose.model('Application');
  const applicationStream = Application.watch();

  applicationStream.on('change', (change) => {
    console.log('Application change detected:', change.operationType);

    if (change.operationType === 'insert') {
      broadcast({
        type: 'application_created',
        application: change.fullDocument
      });
      broadcast({
        type: 'stats_update',
        stats: storage.getStats()
      });
    } else if (change.operationType === 'update') {
      broadcast({
        type: 'application_updated',
        application: change.fullDocument
      });
    }
  });

  // Watch Users collection for stats updates
  const User = mongoose.model('User');
  const userStream = User.watch();

  userStream.on('change', (change) => {
    console.log('User change detected:', change.operationType);

    if (change.operationType === 'insert' || change.operationType === 'delete') {
      broadcast({
        type: 'stats_update',
        stats: storage.getStats()
      });
    }
  });
  */
}

export async function registerRoutes(app) {

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Store user data in our database
      const dbUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate a simple token for development
      const token = `dev-token-${dbUser._id}-${Date.now()}`;

      await storage.addActiveVolunteer(dbUser._id.toString());
      broadcast({ type: 'stats_update', stats: await storage.getStats() });

      res.status(201).json({
        message: "User registered successfully",
        user: { ...dbUser, password: undefined },
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);

      console.log('Login attempt for email:', credentials.email);

      // Get user from database
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        console.log('Login attempt: user not found for email:', credentials.email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('User found:', user.email, 'password hash exists:', !!user.password);

      // For users with empty password (migrated from Realm), allow login
      let isValidPassword = false;
      if (!user.password) {
        console.log('User has no password set, allowing login for migration');
        isValidPassword = true;
        // Optionally set a default password or require password reset
      } else {
        isValidPassword = await bcrypt.compare(credentials.password, user.password);
        console.log('Password comparison result:', isValidPassword);
      }

      if (!isValidPassword) {
        console.log('Login attempt: invalid password for email:', credentials.email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('Login successful for email:', credentials.email);

      const { password, ...userWithoutPassword } = user;

      // Generate a simple token for development
      const token = `dev-token-${user._id}-${Date.now()}`;

      await storage.addActiveVolunteer(user._id.toString());
      broadcast({ type: 'stats_update', stats: await storage.getStats() });

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Login failed"
      });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  app.put("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Ensure user can only update their own profile
      if (req.userId !== id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      // Validate input with Zod schema
      const validatedData = profileUpdateSchema.parse(req.body);

      // Only allow updating specific fields
      const allowedUpdates = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        location: validatedData.location,
        bio: validatedData.bio,
        skills: validatedData.skills,
      };

      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => {
        if (allowedUpdates[key] === undefined) {
          delete allowedUpdates[key];
        }
      });

      const updatedUser = await storage.updateUser(id, allowedUpdates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        message: "Profile updated successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Update user error:", error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(err => err.message).join(', ');
        return res.status(400).json({ message: `Validation error: ${errorMessages}` });
      }
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to update profile"
      });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const { category, location, state, city, search } = req.query;
      const filters = {
        category: category,
        location: location,
        state: state,
        city: city,
        search: search,
      };

      const projects = await storage.getProjects(filters);
      res.json({ projects });
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json({ project });
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== 'organization') {
        return res.status(403).json({ message: "Only organizations can create projects" });
      }

      const projectData = insertProjectSchema.parse({
        ...req.body,
        organizationId: req.userId
      });

      const project = await storage.createProject(projectData);
      broadcast({ type: 'project_created', project });
      broadcast({ type: 'stats_update', stats: await storage.getStats() });
      res.status(201).json({
        message: "Project created successfully",
        project
      });
    } catch (error) {
      console.error("Create project error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to create project"
      });
    }
  });

  app.get("/api/my-projects", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== 'organization') {
        return res.status(403).json({ message: "Only organizations can view their projects" });
      }

      const projects = await storage.getProjectsByOrganization(req.userId);
      res.json({ projects });
    } catch (error) {
      console.error("Get my projects error:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.put("/api/projects/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.organization._id.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to update this project" });
      }

      const updatedProject = await storage.updateProject(id, req.body);
      res.json({
        message: "Project updated successfully",
        project: updatedProject
      });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.organization._id.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to delete this project" });
      }

      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete project" });
      }

      // Broadcast project deletion event
      broadcast({ type: 'project_deleted', projectId: id });
      broadcast({ type: 'stats_update', stats: await storage.getStats() });

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Application routes
  app.post("/api/applications", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== 'volunteer') {
        return res.status(403).json({ message: "Only volunteers can apply to projects" });
      }

      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        volunteerId: req.userId
      });

      // Check if user already applied
      const existingApplications = await storage.getApplicationsByVolunteer(req.userId);
      const alreadyApplied = existingApplications.find(app => app.project._id.toString() === applicationData.projectId);

      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this project" });
      }

      const application = await storage.createApplication(applicationData);
      broadcast({ type: 'application_created', application });
      broadcast({ type: 'stats_update', stats: await storage.getStats() });
      res.status(201).json({
        message: "Application submitted successfully",
        application
      });
    } catch (error) {
      console.error("Create application error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to submit application"
      });
    }
  });

  app.get("/api/my-applications", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== 'volunteer') {
        return res.status(403).json({ message: "Only volunteers can view their applications" });
      }

      const applications = await storage.getApplicationsByVolunteer(req.userId);
      res.json({ applications });
    } catch (error) {
      console.error("Get my applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/projects/:id/applications", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.organization._id.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to view applications for this project" });
      }

      const applications = await storage.getApplicationsByProject(id);
      res.json({ applications });
    } catch (error) {
      console.error("Get project applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/organization/applications", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== 'organization') {
        return res.status(403).json({ message: "Only organizations can view applications" });
      }

      const projects = await storage.getProjectsByOrganization(req.userId);
      const projectIds = projects.map(p => p._id.toString());

      if (projectIds.length === 0) {
        return res.json({ applications: [] });
      }

      const Application = mongoose.model('Application');

      // Use aggregation to get applications with project and volunteer data
      const pipeline = [
        { $match: { projectId: { $in: projectIds.map(id => new mongoose.Types.ObjectId(id)) } } },
        { $sort: { createdAt: -1 } },
        {
          $addFields: {
            appliedAt: "$createdAt",
            id: "$_id"
          }
        },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "project"
          }
        },
        { $unwind: { path: "$project", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "users",
            localField: "project.organizationId",
            foreignField: "_id",
            as: "project.organization"
          }
        },
        { $unwind: { path: "$project.organization", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "volunteerId",
            foreignField: "_id",
            as: "volunteer"
          }
        },
        { $unwind: { path: "$volunteer", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "volunteer.password": 0,
            "volunteer.realmId": 0,
            "project.organization.password": 0,
            "project.organization.realmId": 0
          }
        }
      ];

      const applications = await Application.aggregate(pipeline);
      res.json({ applications });
    } catch (error) {
      console.error("Get organization applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put("/api/applications/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const project = await storage.getProject(application.projectId);
      if (!project || project.organization._id.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }

      const updatedApplication = await storage.updateApplication(id, { status });

      // Update volunteersJoined count based on status change
      if (status === 'accepted' && application.status !== 'accepted') {
        await storage.updateProject(application.projectId, {
          $inc: { volunteersJoined: 1 }
        });
      } else if (status === 'rejected' && application.status === 'accepted') {
        await storage.updateProject(application.projectId, {
          $inc: { volunteersJoined: 0 }
        });
      }

      broadcast({ type: 'application_updated', application: updatedApplication });
      broadcast({ type: 'project_updated', project: await storage.getProject(application.projectId) });
      res.json({
        message: "Application updated successfully",
        application: updatedApplication
      });
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.volunteer._id.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to withdraw this application" });
      }

      // If application was accepted, decrement volunteersJoined
      if (application.status === 'accepted') {
        await storage.updateProject(application.projectId, {
          $inc: { volunteersJoined: 0 }
        });
      }

      const deleted = await storage.deleteApplication(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to withdraw application" });
      }

      broadcast({ type: 'application_deleted', applicationId: id, projectId: application.projectId });
      broadcast({ type: 'stats_update', stats: await storage.getStats() });
      res.json({ message: "Application withdrawn successfully" });
    } catch (error) {
      console.error("Withdraw application error:", error);
      res.status(500).json({ message: "Failed to withdraw application" });
    }
  });

  // Stats route with caching
  let statsCache = null;
  let statsCacheTime = 0;
  const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  app.get("/api/stats", async (req, res) => {
    try {
      const now = Date.now();
      if (statsCache && (now - statsCacheTime) < STATS_CACHE_DURATION) {
        return res.json({ stats: statsCache });
      }

      const stats = await storage.getStats();
      statsCache = stats;
      statsCacheTime = now;
      res.json({ stats });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Profile picture upload route
  const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  app.post("/api/users/:id/upload-profile-picture", authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
      const { id } = req.params;

      // Ensure user can only update their own profile
      if (req.userId !== id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Generate file URL (assuming local storage for now)
      const fileUrl = `/uploads/${req.file.filename}`;

      const updatedUser = await storage.updateUser(id, { profilePicture: fileUrl });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        message: "Profile picture uploaded successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to upload profile picture"
      });
    }
  });

  // Contact form route
  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;

      // Basic validation
      if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Here you could save to database, send email, etc.
      // For now, we'll just log it and return success
      console.log("Contact form submission:", {
        firstName,
        lastName,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        message: "Thank you for your message! We'll get back to you soon."
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server
  global.wss = new WebSocketServer({ server: httpServer });

  global.wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Setup MongoDB Change Streams for realtime updates
  setupChangeStreams();

  return httpServer;
}
