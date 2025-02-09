import { InsertUser, User, Post, Comment, Reaction, InsertPost, InsertComment, InsertReaction } from "@shared/schema";
import { db, users, posts, comments, reactions } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createPost(authorId: number, post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;

  createComment(authorId: number, postId: number, comment: InsertComment): Promise<Comment>;
  getComments(postId: number): Promise<Comment[]>;

  createReaction(userId: number, postId: number, reaction: InsertReaction): Promise<Reaction>;
  getReactions(postId: number): Promise<Reaction[]>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createPost(authorId: number, insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({ ...insertPost, authorId })
      .returning();
    return post;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts);
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createComment(authorId: number, postId: number, insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({ ...insertComment, authorId, postId })
      .returning();
    return comment;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId));
  }

  async createReaction(userId: number, postId: number, insertReaction: InsertReaction): Promise<Reaction> {
    const [reaction] = await db
      .insert(reactions)
      .values({ ...insertReaction, userId, postId })
      .returning();
    return reaction;
  }

  async getReactions(postId: number): Promise<Reaction[]> {
    return await db.select().from(reactions).where(eq(reactions.postId, postId));
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();