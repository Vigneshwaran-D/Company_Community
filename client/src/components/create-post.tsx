import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CreatePost() {
  const [content, setContent] = useState("");

  const createPostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/posts", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setContent("");
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <Textarea
          placeholder="Share something with your colleagues..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => createPostMutation.mutate()}
          disabled={!content.trim() || createPostMutation.isPending}
        >
          Post
        </Button>
      </CardFooter>
    </Card>
  );
}
