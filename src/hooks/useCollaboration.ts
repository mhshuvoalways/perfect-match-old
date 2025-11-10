import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface CollaborationData {
  id: string;
  sender_id: string;
  receiver_id: string;
  shared_resume_id: string;
  permission: "view" | "edit";
  comment_thread: any[];
  created_at: string;
  resume_name?: string;
  sender_name?: string;
  receiver_name?: string;
}

export const useCollaboration = () => {
  const [sentCollaborations, setSentCollaborations] = useState<
    CollaborationData[]
  >([]);
  const [receivedCollaborations, setReceivedCollaborations] = useState<
    CollaborationData[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadCollaborations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log("Loading collaborations for user:", user.id);

      // Load sent collaborations
      const { data: sentData, error: sentError } = await supabase
        .from("collaborations")
        .select(
          `
          *,
          resumes!collaborations_shared_resume_id_fkey (name)
        `
        )
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (sentError) {
        console.error("Error loading sent collaborations:", sentError);
        throw sentError;
      }

      // Load received collaborations
      const { data: receivedData, error: receivedError } = await supabase
        .from("collaborations")
        .select(
          `
          *,
          resumes!collaborations_shared_resume_id_fkey (name)
        `
        )
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (receivedError) {
        console.error("Error loading received collaborations:", receivedError);
        throw receivedError;
      }

      // Format sent collaborations
      const formattedSent: CollaborationData[] = (sentData || []).map(
        (collab) => ({
          id: collab.id,
          sender_id: collab.sender_id,
          receiver_id: collab.receiver_id,
          shared_resume_id: collab.shared_resume_id,
          permission: collab.permission as "view" | "edit",
          comment_thread: collab.comment_thread || [],
          created_at: collab.created_at,
          resume_name: (collab as any).resumes?.name || "Unknown Resume",
        })
      );

      // Format received collaborations
      const formattedReceived: CollaborationData[] = (receivedData || []).map(
        (collab) => ({
          id: collab.id,
          sender_id: collab.sender_id,
          receiver_id: collab.receiver_id,
          shared_resume_id: collab.shared_resume_id,
          permission: collab.permission as "view" | "edit",
          comment_thread: collab.comment_thread || [],
          created_at: collab.created_at,
          resume_name: (collab as any).resumes?.name || "Unknown Resume",
        })
      );

      setSentCollaborations(formattedSent);
      setReceivedCollaborations(formattedReceived);
    } catch (error) {
      console.error("Failed to load collaborations:", error);
      toast({
        title: "Error",
        description: "Failed to load collaborations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCollaborationComments = (
    collaborationId: string,
    comments: any[]
  ) => {
    console.log(
      "Updating collaboration comments locally:",
      collaborationId,
      comments
    );
    setSentCollaborations((prev) =>
      prev.map((collab) =>
        collab.id === collaborationId
          ? { ...collab, comment_thread: comments }
          : collab
      )
    );
    setReceivedCollaborations((prev) =>
      prev.map((collab) =>
        collab.id === collaborationId
          ? { ...collab, comment_thread: comments }
          : collab
      )
    );
  };

  const deleteCollaboration = async (collaborationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("collaborations")
        .delete()
        .eq("id", collaborationId)
        .eq("sender_id", user.id); // Only sender can delete

      if (error) throw error;

      setSentCollaborations((prev) =>
        prev.filter((collab) => collab.id !== collaborationId)
      );

      toast({
        title: "Collaboration Deleted",
        description: "The collaboration has been removed successfully.",
      });
    } catch (error) {
      console.error("Failed to delete collaboration:", error);
      toast({
        title: "Error",
        description: "Failed to delete collaboration",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadCollaborations();
    }
  }, [user]);

  return {
    sentCollaborations,
    receivedCollaborations,
    isLoading,
    loadCollaborations,
    updateCollaborationComments,
    deleteCollaboration,
  };
};
