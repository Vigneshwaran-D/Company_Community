import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import type { PostWithMeta } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post }: { post: PostWithMeta }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const likeMutation = useMutation({
    mutationFn: async (isLike: boolean) => {
      await apiRequest("POST", `/api/posts/${post.id}/reactions`, { isLike });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/comments`, {
        content: newComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewComment("");
    },
  });

  const likes = post.reactions.filter((r) => r.isLike).length;
  const dislikes = post.reactions.filter((r) => !r.isLike).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold">{post.author.username}</p>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate(true)}
            disabled={likeMutation.isPending}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate(false)}
            disabled={likeMutation.isPending}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            {dislikes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {post.comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-4">
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="pl-4 border-l-2">
                  <p className="text-sm font-medium">{comment.author.username}</p>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
              />
              <Button
                onClick={() => commentMutation.mutate()}
                disabled={!newComment.trim() || commentMutation.isPending}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
