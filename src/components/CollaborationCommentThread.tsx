import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Comment {
  id: string;
  sender_id: string;
  message: string;
  timestamp: string;
  type?: string;
}

interface CollaborationCommentThreadProps {
  collaborationId: string;
  comments: Comment[];
  canComment: boolean;
  onCommentsUpdate: (comments: Comment[]) => void;
}

const CollaborationCommentThread = ({
  collaborationId,
  comments,
  canComment,
  onCommentsUpdate,
}: CollaborationCommentThreadProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Ref for the comment container
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when comments change
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop = commentsEndRef.current.scrollHeight;
    }
  }, [comments]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment: Comment = {
        id: crypto.randomUUID(),
        sender_id: user.id,
        message: newComment.trim(),
        timestamp: new Date().toISOString(),
        type: "comment",
      };

      const updatedComments = [...comments, comment];

      console.log(
        "Saving comment to collaboration:",
        collaborationId,
        updatedComments
      );

      const { error } = await supabase
        .from("collaborations")
        .update({ comment_thread: updatedComments })
        .eq("id", collaborationId);

      if (error) {
        console.error("Supabase error saving comment:", error);
        throw error;
      }

      console.log("Comment saved successfully");
      onCommentsUpdate(updatedComments);
      setNewComment("");

      toast({
        title: "Comment Added",
        description: "Your comment has been added to the collaboration.",
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-4 w-4 text-purple-600" />
        <h4 className="font-medium">Collaboration Thread</h4>
      </div>

      {/* Add ref here */}
      <div className="space-y-3 max-h-60 overflow-y-auto" ref={commentsEndRef}>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {comment.sender_id === user?.id ? "You" : "Shadchan"}
                  </span>
                  {comment.type === "initial_note" && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Initial Note
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(comment.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.message}</p>
            </div>
          ))
        )}
      </div>

      {canComment && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment or feedback..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationCommentThread;
