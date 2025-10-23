import mongoose from "mongoose";
import { User, Project, Application } from "./models.js";
import { insertUserSchema, insertProjectSchema, insertApplicationSchema } from "./schema.js";

/**
 * @typedef {Object} IStorage
 * @property {function(string): Promise<Object|undefined>} getUser
 * @property {function(string): Promise<Object|undefined>} getUserByEmail
 * @property {function(Object): Promise<Object>} createUser
 * @property {function(string, Object): Promise<Object|undefined>} updateUser
 * @property {function(string): Promise<Object|undefined>} getProject
 * @property {function(Object): Promise<Object[]>} getProjects
 * @property {function(string): Promise<Object[]>} getProjectsByOrganization
 * @property {function(Object): Promise<Object>} createProject
 * @property {function(string, Object): Promise<Object|undefined>} updateProject
 * @property {function(string): Promise<boolean>} deleteProject
 * @property {function(string): Promise<Object|undefined>} getApplication
 * @property {function(string): Promise<Object[]>} getApplicationsByProject
 * @property {function(string): Promise<Object[]>} getApplicationsByVolunteer
 * @property {function(Object): Promise<Object>} createApplication
 * @property {function(string, Object): Promise<Object|undefined>} updateApplication
 * @property {function(string): Promise<void>} addActiveVolunteer
 * @property {function(string): Promise<void>} removeActiveVolunteer
 * @property {function(): Promise<{volunteers: number, projects: number, applications: number, states: number}>} getStats
 */

export class MongoStorage {
  constructor() {
    this.connected = false;
    this.activeVolunteers = new Set();
  }

  async connect(uri, options = {}) {
    if (this.connected) return;
    await mongoose.connect(uri, options);
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
    // Validate with Zod
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
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
    return result.length > 0 ? result[0] : undefined;
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
    // Validate with Zod
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
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
    return result.length > 0 ? result[0] : undefined;
  }

  async getApplicationsByProject(projectId) {
    const pipeline = [
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
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
      { $match: { volunteerId: new mongoose.Types.ObjectId(volunteerId) } },
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
    // Validate with Zod
    insertApplicationSchema.parse(insertApplication);
    const application = new Application({
      ...insertApplication,
      status: insertApplication.status || "pending"
    });
    await application.save();

    // Increment totalApplications for the project
    await Project.findByIdAndUpdate(new mongoose.Types.ObjectId(insertApplication.projectId), {
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
      // Decrement totalApplications for the project
      await Project.findByIdAndUpdate(new mongoose.Types.ObjectId(application.projectId), {
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
    const volunteers = await User.countDocuments({ userType: 'volunteer' });
    const projects = await Project.countDocuments();
    const applications = await Application.countDocuments();
    const states = await Project.distinct("state").then(states => states.length);

    return { volunteers, projects, applications, states };
  }
}

export const storage = new MongoStorage();
