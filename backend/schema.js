import { z } from "zod";

// Zod schemas for MongoDB models
export const insertUserSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  userType: z.enum(['volunteer', 'organization']),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  skills: z.array(z.string().trim()).default([]),
  bio: z.string().trim().optional(),
  verified: z.boolean().default(false),
  realmId: z.string().optional(), // For MongoDB Realm integration
});

export const insertProjectSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().min(1),
  category: z.string().trim().min(1),
  location: z.string().trim().min(1),
  state: z.string().trim().min(1),
  city: z.string().trim().min(1),
  organizationId: z.string().min(1), // MongoDB ObjectId as string
  skillsRequired: z.array(z.string().trim()).default([]),
  timeCommitment: z.string().min(1),
  volunteersNeeded: z.number().int().min(1),
  imageUrl: z.string().trim().optional(),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const insertApplicationSchema = z.object({
  projectId: z.string().min(1), // MongoDB ObjectId as string
  volunteerId: z.string().min(1), // MongoDB ObjectId as string
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
  message: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Schema for profile updates (partial, allows skills array)
export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal("")),
  location: z.string().trim().max(100, "Location too long").optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Bio too long").optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1, "Skill cannot be empty").max(30, "Skill too long")).default([]),
  profilePicture: z.string().optional(),
}).partial();

// Type definitions (using JSDoc for documentation)
/**
 * @typedef {Object} InsertUser
 * @property {string} email
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 * @property {'volunteer' | 'organization'} userType
 * @property {string} [phone]
 * @property {string} [location]
 * @property {string[]} [skills]
 * @property {string} [bio]
 * @property {boolean} [verified]
 * @property {string} [realmId]
 */

/**
 * @typedef {Object} InsertProject
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} location
 * @property {string} state
 * @property {string} city
 * @property {string} organizationId
 * @property {string[]} [skillsRequired]
 * @property {string} timeCommitment
 * @property {number} volunteersNeeded
 * @property {string} [imageUrl]
 * @property {'active' | 'completed' | 'paused'} [status]
 * @property {Date} [startDate]
 * @property {Date} [endDate]
 */

/**
 * @typedef {Object} InsertApplication
 * @property {string} projectId
 * @property {string} volunteerId
 * @property {'pending' | 'accepted' | 'rejected'} [status]
 * @property {string} [message]
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

// MongoDB document types (with MongoDB-specific fields)
/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} email
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 * @property {'volunteer' | 'organization'} userType
 * @property {string} [phone]
 * @property {string} [location]
 * @property {string[]} skills
 * @property {string} [bio]
 * @property {boolean} verified
 * @property {string} [realmId]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Project
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} location
 * @property {string} state
 * @property {string} city
 * @property {string} organizationId
 * @property {string[]} skillsRequired
 * @property {string} timeCommitment
 * @property {number} volunteersNeeded
 * @property {number} volunteersJoined
 * @property {string} [imageUrl]
 * @property {'active' | 'completed' | 'paused'} status
 * @property {Date} [startDate]
 * @property {Date} [endDate]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Application
 * @property {string} _id
 * @property {string} projectId
 * @property {string} volunteerId
 * @property {'pending' | 'accepted' | 'rejected'} status
 * @property {string} [message]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// Extended types for API responses
/**
 * @typedef {Project & {organization: User}} ProjectWithOrganization
 */

/**
 * @typedef {Application & {project: Project, volunteer: User}} ApplicationWithDetails
 */
