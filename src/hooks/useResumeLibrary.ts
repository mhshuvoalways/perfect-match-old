
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export interface ResumeLibraryItem {
  id: string;
  uploaded_by: string;
  uploaded_for?: string;
  parsed_data?: any;
  tags?: string[];
  created_at: string;
}

export const useResumeLibrary = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<ResumeLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadResume = async (
    file: File,
    uploadedFor: string = "AI Profile"
  ) => {
    if (!user) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(
        "https://file-parser-server.vercel.app/extract-file",
        {
          method: "POST",
          body: formData,
        }
      );

      const fileContent = await res.json();

      // Save to resume_library table
      const { data, error } = await supabase
        .from("resume_library")
        .insert({
          user_id: user.id,
          uploaded_by: user.email || "Unknown",
          uploaded_for: uploadedFor,
          tags: [],
        })
        .select()
        .single();

      if (error) throw error;

      // Parse the resume using edge function
      try {
        const { data: organizeData, error: parseError } =
          await supabase.functions.invoke("parse-resume", {
            body: {
              fileContent: fileContent.text,
            },
          });

        if (parseError) {
          console.error("Failed to organize resume:", parseError);
        } else if (organizeData?.parsedData) {
          // Update resume library with parsed data
          const { error: updateError } = await supabase
            .from("resume_library")
            .update({ parsed_data: organizeData.parsedData })
            .eq("id", data.id)
            .eq("user_id", user.id);

          if (updateError) {
            console.error("Failed to update parsed data:", updateError);
          }
        }
      } catch (parseError) {
        console.error("Resume parsing failed:", parseError);
        // Continue without parsed data - not a critical failure
      }

      const newItem: ResumeLibraryItem = {
        id: data.id,
        uploaded_by: data.uploaded_by,
        uploaded_for: data.uploaded_for,
        parsed_data: data.parsed_data,
        tags: data.tags || [],
        created_at: data.created_at,
      };

      setItems((prev) => [newItem, ...prev]);

      toast({
        title: "Success!",
        description:
          uploadedFor === "AI Search"
            ? "Resume uploaded successfully. You can now run AI search to find matches."
            : "Resume uploaded successfully. You can now run AI search to find matches.",
      });

      return newItem;
    } catch (error) {
      console.error("Failed to upload resume:", error);
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const loadResumeLibrary = async (uploadedFor?: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("resume_library")
        .select("*")
        .eq("user_id", user.id);

      if (uploadedFor) {
        query = query.eq("uploaded_for", uploadedFor);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      const formattedItems: ResumeLibraryItem[] = (data || []).map((item) => ({
        id: item.id,
        uploaded_by: item.uploaded_by,
        uploaded_for: item.uploaded_for,
        parsed_data: item.parsed_data,
        tags: item.tags || [],
        created_at: item.created_at,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Failed to load resume library:", error);
      toast({
        title: "Error",
        description: "Failed to load resume library",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResumeLibraryItem = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("resume_library")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));

      toast({
        title: "Success!",
        description: "Resume deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    isLoading,
    isUploading,
    uploadResume,
    loadResumeLibrary,
    deleteResumeLibraryItem,
  };
};
