import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema, insertReactionSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Posts
  app.get("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const posts = await storage.getPosts();
    const postsWithMeta = await Promise.all(
      posts.map(async (post) => {
        const author = await storage.getUser(post.authorId);
        const reactions = await storage.getReactions(post.id);
        const comments = await storage.getComments(post.id);
        const commentsWithAuthors = await Promise.all(
          comments.map(async (comment) => ({
            ...comment,
            author: await storage.getUser(comment.authorId),
          }))
        );
        return {
          ...post,
          author,
          reactions,
          comments: commentsWithAuthors,
        };
      })
    );
    res.json(postsWithMeta);
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const post = await storage.createPost(req.user.id, parsed.data);
    res.status(201).json(post);
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const comment = await storage.createComment(
      req.user.id,
      parseInt(req.params.postId),
      parsed.data
    );
    res.status(201).json(comment);
  });

  app.post("/api/posts/:postId/reactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertReactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const reaction = await storage.createReaction(
      req.user.id,
      parseInt(req.params.postId),
      parsed.data
    );
    res.status(201).json(reaction);
  });

  const httpServer = createServer(app);
  return httpServer;
}
