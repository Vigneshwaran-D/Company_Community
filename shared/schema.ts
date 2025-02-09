import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  isLike: boolean("is_like").notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: integer("author_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  isLike: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;

export type PostWithMeta = Post & {
  author: User;
  reactions: Reaction[];
  comments: (Comment & { author: User })[];
};
