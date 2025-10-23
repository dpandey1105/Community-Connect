// backend/index.js
import express2 from "express";

// backend/routes.js
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// backend/storage.js
import mongoose2 from "mongoose";

// backend/models.js
import mongoose from "mongoose";
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  userType: {
    type: String,
    required: true,
    enum: ["volunteer", "organization"]
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  realmId: {
    type: String,
    sparse: true
    // For mapping to Realm users
  }
}, {
  timestamps: true
});
var projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  timeCommitment: {
    type: String,
    required: true
  },
  volunteersNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  volunteersJoined: {
    type: Number,
    default: 0,
    min: 0
  },
  totalApplications: {
    type: Number,
    default: 0,
    min: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "completed", "paused"],
    default: "active"
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});
var applicationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  message: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});
userSchema.index({ userType: 1 });
projectSchema.index({ organizationId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ state: 1 });
projectSchema.index({ city: 1 });
projectSchema.index({ location: 1 });
projectSchema.index({ title: "text", description: "text" });
applicationSchema.index({ projectId: 1 });
applicationSchema.index({ volunteerId: 1 });
applicationSchema.index({ status: 1 });
userSchema.virtual("fullName").get(function() {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });
var User = mongoose.model("User", userSchema);
var Project = mongoose.model("Project", projectSchema);
var Application = mongoose.model("Application", applicationSchema);

// backend/schema.js
import { z } from "zod";
var insertUserSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  userType: z.enum(["volunteer", "organization"]),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  skills: z.array(z.string().trim()).default([]),
  bio: z.string().trim().optional(),
  verified: z.boolean().default(false),
  realmId: z.string().optional()
  // For MongoDB Realm integration
});
var insertProjectSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().min(1),
  category: z.string().trim().min(1),
  location: z.string().trim().min(1),
  state: z.string().trim().min(1),
  city: z.string().trim().min(1),
  organizationId: z.string().min(1),
  // MongoDB ObjectId as string
  skillsRequired: z.array(z.string().trim()).default([]),
  timeCommitment: z.string().min(1),
  volunteersNeeded: z.number().int().min(1),
  imageUrl: z.string().trim().optional(),
  status: z.enum(["active", "completed", "paused"]).default("active"),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});
var insertApplicationSchema = z.object({
  projectId: z.string().min(1),
  // MongoDB ObjectId as string
  volunteerId: z.string().min(1),
  // MongoDB ObjectId as string
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  message: z.string().trim().optional()
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
var profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal("")),
  location: z.string().trim().max(100, "Location too long").optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Bio too long").optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1, "Skill cannot be empty").max(30, "Skill too long")).default([]),
  profilePicture: z.string().optional()
}).partial();

// backend/storage.js
var MongoStorage = class {
  constructor() {
    this.connected = false;
    this.activeVolunteers = /* @__PURE__ */ new Set();
  }
  async connect(uri, options = {}) {
    if (this.connected) return;
    await mongoose2.connect(uri, options);
    this.connected = true;
  }
  // User operations
  async getUser(id) {
    return User.findById(id).lean();
  }
  async getUserByEmail(email) {
    return User.findOne({ email }).lean();
  }
  async createUser(insertUser) {
    insertUserSchema.parse(insertUser);
    const user = new User({
      ...insertUser,
      verified: false
    });
    await user.save();
    return user.toObject();
  }
  async updateUser(id, updates) {
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).lean();
    return user;
  }
  // Project operations
  async getProject(id) {
    const pipeline = [
      { $match: { _id: new mongoose2.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization"
        }
      },
      { $unwind: "$organization" },
      {
        $project: {
          "organization.password": 0,
          "organization.realmId": 0
        }
      }
    ];
    const result = await Project.aggregate(pipeline);
    return result.length > 0 ? result[0] : void 0;
  }
  async getProjects(filters = {}) {
    let match = { status: "active" };
    if (filters.category) match.category = filters.category;
    if (filters.state) match.state = filters.state;
    if (filters.city) match.city = filters.city;
    if (filters.location) {
      const regex = new RegExp(filters.location, "i");
      match.$or = [
        { location: regex },
        { city: regex },
        { state: regex }
      ];
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      const searchCondition = {
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      };
      if (match.$or) {
        match = {
          $and: [
            match,
            searchCondition
          ]
        };
      } else {
        Object.assign(match, searchCondition);
      }
    }
    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization"
        }
      },
      { $unwind: "$organization" },
      {
        $project: {
          "organization.password": 0,
          "organization.realmId": 0
        }
      }
    ];
    const projects = await Project.aggregate(pipeline);
    return projects;
  }
  async getProjectsByOrganization(organizationId) {
    return Project.find({ organizationId }).sort({ createdAt: -1 }).lean();
  }
  async createProject(insertProject) {
    insertProjectSchema.parse(insertProject);
    const project = new Project({
      ...insertProject,
      volunteersJoined: insertProject.volunteersJoined || 0,
      totalApplications: insertProject.totalApplications || 0
    });
    await project.save();
    return project.toObject();
  }
  async updateProject(id, updates) {
    const project = await Project.findByIdAndUpdate(id, updates, { new: true }).lean();
    return project;
  }
  async deleteProject(id) {
    const result = await Project.findByIdAndDelete(id);
    return !!result;
  }
  // Application operations
  async getApplication(id) {
    const pipeline = [
      { $match: { _id: new mongoose2.Types.ObjectId(id) } },
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
      { $unwind: "$project" },
      {
        $lookup: {
          from: "users",
          localField: "volunteerId",
          foreignField: "_id",
          as: "volunteer"
        }
      },
      { $unwind: "$volunteer" },
      {
        $project: {
          "volunteer.password": 0,
          "volunteer.realmId": 0
        }
      }
    ];
    const result = await Application.aggregate(pipeline);
    return result.length > 0 ? result[0] : void 0;
  }
  async getApplicationsByProject(projectId) {
    const pipeline = [
      { $match: { projectId: new mongoose2.Types.ObjectId(projectId) } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          appliedAt: "$createdAt",
          id: "$_id"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "volunteerId",
          foreignField: "_id",
          as: "volunteer"
        }
      },
      { $unwind: "$volunteer" },
      {
        $project: {
          "volunteer.password": 0,
          "volunteer.realmId": 0
        }
      }
    ];
    const applications = await Application.aggregate(pipeline);
    return applications;
  }
  async getApplicationsByVolunteer(volunteerId) {
    const pipeline = [
      { $match: { volunteerId: new mongoose2.Types.ObjectId(volunteerId) } },
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
      { $unwind: "$project" }
    ];
    const applications = await Application.aggregate(pipeline);
    return applications;
  }
  async createApplication(insertApplication) {
    insertApplicationSchema.parse(insertApplication);
    const application = new Application({
      ...insertApplication,
      status: insertApplication.status || "pending"
    });
    await application.save();
    await Project.findByIdAndUpdate(new mongoose2.Types.ObjectId(insertApplication.projectId), {
      $inc: { totalApplications: 1 }
    });
    return application.toObject();
  }
  async updateApplication(id, updates) {
    const application = await Application.findByIdAndUpdate(id, updates, { new: true }).lean();
    return application;
  }
  async deleteApplication(id) {
    const application = await Application.findById(id);
    if (application) {
      await Project.findByIdAndUpdate(new mongoose2.Types.ObjectId(application.projectId), {
        $inc: { totalApplications: -1 }
      });
    }
    const result = await Application.findByIdAndDelete(id);
    return !!result;
  }
  // Active volunteers tracking
  async addActiveVolunteer(id) {
    this.activeVolunteers.add(id);
  }
  async removeActiveVolunteer(id) {
    this.activeVolunteers.delete(id);
  }
  async getStats() {
    const volunteers = await User.countDocuments({ userType: "volunteer" });
    const projects = await Project.countDocuments();
    const applications = await Application.countDocuments();
    const states = await Project.distinct("state").then((states2) => states2.length);
    return { volunteers, projects, applications, states };
  }
};
var storage = new MongoStorage();

// backend/auth.js
var AuthService = class {
  // Simple token-based authentication for development
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
};
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = AuthService.extractTokenFromHeader(authHeader);
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  if (token.startsWith("dev-token-")) {
    const parts = token.split("-");
    if (parts.length >= 3) {
      const userId = parts[2];
      try {
        const user = await storage.getUser(userId);
        if (user) {
          req.userId = userId;
          req.userType = user.userType;
          req.user = user;
          return next();
        }
      } catch (error) {
        console.error("Dev token verification error:", error);
      }
    }
  }
  return res.status(403).json({ message: "Invalid token" });
};

// backend/routes.js
import mongoose3 from "mongoose";
import bcrypt from "bcryptjs";
import multer from "multer";
function broadcast(data) {
  if (global.wss) {
    global.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}
function setupChangeStreams() {
  console.log("Change streams disabled - requires replica set (M10+ Atlas tier)");
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const dbUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const token = `dev-token-${dbUser._id}-${Date.now()}`;
      await storage.addActiveVolunteer(dbUser._id.toString());
      broadcast({ type: "stats_update", stats: await storage.getStats() });
      res.status(201).json({
        message: "User registered successfully",
        user: { ...dbUser, password: void 0 },
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      console.log("Login attempt for email:", credentials.email);
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        console.log("Login attempt: user not found for email:", credentials.email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.log("User found:", user.email, "password hash exists:", !!user.password);
      let isValidPassword = false;
      if (!user.password) {
        console.log("User has no password set, allowing login for migration");
        isValidPassword = true;
      } else {
        isValidPassword = await bcrypt.compare(credentials.password, user.password);
        console.log("Password comparison result:", isValidPassword);
      }
      if (!isValidPassword) {
        console.log("Login attempt: invalid password for email:", credentials.email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.log("Login successful for email:", credentials.email);
      const { password, ...userWithoutPassword } = user;
      const token = `dev-token-${user._id}-${Date.now()}`;
      await storage.addActiveVolunteer(user._id.toString());
      broadcast({ type: "stats_update", stats: await storage.getStats() });
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
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
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
  app2.put("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      if (req.userId !== id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      const validatedData = profileUpdateSchema.parse(req.body);
      const allowedUpdates = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        location: validatedData.location,
        bio: validatedData.bio,
        skills: validatedData.skills
      };
      Object.keys(allowedUpdates).forEach((key) => {
        if (allowedUpdates[key] === void 0) {
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
      if (error.name === "ZodError") {
        const errorMessages = error.errors.map((err) => err.message).join(", ");
        return res.status(400).json({ message: `Validation error: ${errorMessages}` });
      }
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to update profile"
      });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const { category, location, state, city, search } = req.query;
      const filters = {
        category,
        location,
        state,
        city,
        search
      };
      const projects = await storage.getProjects(filters);
      res.json({ projects });
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
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
  app2.post("/api/projects", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== "organization") {
        return res.status(403).json({ message: "Only organizations can create projects" });
      }
      const projectData = insertProjectSchema.parse({
        ...req.body,
        organizationId: req.userId
      });
      const project = await storage.createProject(projectData);
      broadcast({ type: "project_created", project });
      broadcast({ type: "stats_update", stats: await storage.getStats() });
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
  app2.get("/api/my-projects", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== "organization") {
        return res.status(403).json({ message: "Only organizations can view their projects" });
      }
      const projects = await storage.getProjectsByOrganization(req.userId);
      res.json({ projects });
    } catch (error) {
      console.error("Get my projects error:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.put("/api/projects/:id", authenticateToken, async (req, res) => {
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
  app2.delete("/api/projects/:id", authenticateToken, async (req, res) => {
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
      broadcast({ type: "project_deleted", projectId: id });
      broadcast({ type: "stats_update", stats: await storage.getStats() });
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  app2.post("/api/applications", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== "volunteer") {
        return res.status(403).json({ message: "Only volunteers can apply to projects" });
      }
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        volunteerId: req.userId
      });
      const existingApplications = await storage.getApplicationsByVolunteer(req.userId);
      const alreadyApplied = existingApplications.find((app3) => app3.project._id.toString() === applicationData.projectId);
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this project" });
      }
      const application = await storage.createApplication(applicationData);
      broadcast({ type: "application_created", application });
      broadcast({ type: "stats_update", stats: await storage.getStats() });
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
  app2.get("/api/my-applications", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== "volunteer") {
        return res.status(403).json({ message: "Only volunteers can view their applications" });
      }
      const applications = await storage.getApplicationsByVolunteer(req.userId);
      res.json({ applications });
    } catch (error) {
      console.error("Get my applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app2.get("/api/projects/:id/applications", authenticateToken, async (req, res) => {
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
  app2.get("/api/organization/applications", authenticateToken, async (req, res) => {
    try {
      if (req.userType !== "organization") {
        return res.status(403).json({ message: "Only organizations can view applications" });
      }
      const projects = await storage.getProjectsByOrganization(req.userId);
      const projectIds = projects.map((p) => p._id.toString());
      if (projectIds.length === 0) {
        return res.json({ applications: [] });
      }
      const Application2 = mongoose3.model("Application");
      const pipeline = [
        { $match: { projectId: { $in: projectIds.map((id) => new mongoose3.Types.ObjectId(id)) } } },
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
      const applications = await Application2.aggregate(pipeline);
      res.json({ applications });
    } catch (error) {
      console.error("Get organization applications error:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app2.put("/api/applications/:id", authenticateToken, async (req, res) => {
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
      if (status === "accepted" && application.status !== "accepted") {
        await storage.updateProject(application.projectId, {
          $inc: { volunteersJoined: 1 }
        });
      } else if (status === "rejected" && application.status === "accepted") {
        await storage.updateProject(application.projectId, {
          $inc: { volunteersJoined: 0 }
        });
      }
      broadcast({ type: "application_updated", application: updatedApplication });
      broadcast({ type: "project_updated", project: await storage.getProject(application.projectId) });
      res.json({
        message: "Application updated successfully",
        application: updatedApplication
      });
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });
  app2.delete("/api/applications/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (application.volunteer._id.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to withdraw this application" });
      }
      if (application.status === "accepted") {
        await storage.updateProject(application.projectId, {
          $inc: { volunteersJoined: 0 }
        });
      }
      const deleted = await storage.deleteApplication(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to withdraw application" });
      }
      broadcast({ type: "application_deleted", applicationId: id, projectId: application.projectId });
      broadcast({ type: "stats_update", stats: await storage.getStats() });
      res.json({ message: "Application withdrawn successfully" });
    } catch (error) {
      console.error("Withdraw application error:", error);
      res.status(500).json({ message: "Failed to withdraw application" });
    }
  });
  let statsCache = null;
  let statsCacheTime = 0;
  const STATS_CACHE_DURATION = 5 * 60 * 1e3;
  app2.get("/api/stats", async (req, res) => {
    try {
      const now = Date.now();
      if (statsCache && now - statsCacheTime < STATS_CACHE_DURATION) {
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
  const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 },
    // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    }
  });
  app2.post("/api/users/:id/upload-profile-picture", authenticateToken, upload.single("profilePicture"), async (req, res) => {
    try {
      const { id } = req.params;
      if (req.userId !== id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
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
  app2.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;
      if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      console.log("Contact form submission:", {
        firstName,
        lastName,
        email,
        subject,
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(200).json({
        message: "Thank you for your message! We'll get back to you soon."
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  const httpServer = createServer(app2);
  global.wss = new WebSocketServer({ server: httpServer });
  global.wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
  setupChangeStreams();
  return httpServer;
}

// backend/vite.js
import express from "express";
import fs from "fs";
import path2, { dirname } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  base: process.env.NODE_ENV === "production" ? "/Community-Connect/" : "/",
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"],
          query: ["@tanstack/react-query"]
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend", "src"),
      "@shared": path.resolve(__dirname, "backend"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "frontend"),
  server: {
    port: 5176,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// backend/vite.js
import { nanoid } from "nanoid";
var viteLogger = createLogger();
var __dirname2 = dirname(fileURLToPath2(import.meta.url));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: false,
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "frontend",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// backend/atlasWhitelist.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// backend/index.js
import dotenv2 from "dotenv";
import cors from "cors";
import compression from "compression";
dotenv2.config();
var app = express2();
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/community-connect";
var mongooseOptions = process.env.NODE_ENV === "production" ? {
  serverSelectionTimeoutMS: 5e3,
  socketTimeoutMS: 45e3,
  maxPoolSize: 10
} : {};
storage.connect(MONGODB_URI, mongooseOptions).then(() => {
  log("Connected to MongoDB");
}).catch((err) => {
  log(`MongoDB connection error: ${err}`);
  process.exit(1);
});
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173", "http://localhost:5176", "http://127.0.0.1:5173", "http://127.0.0.1:5176"],
  credentials: true
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.use(compression());
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
