import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface NoteData {
  id: string;
  title: string;
  content?: string;
  voice_url?: string;
  transcript?: string;
  tags?: string[];
  is_private: boolean;
  created_at: string;
  resume_id?: string;
  resume?: {
    name: string;
  };
}

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadNotes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .select(`*`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedNotes: NoteData[] = (data || []).map((note) => ({
        id: note.id,
        title: note.title || "Untitled Note",
        content: note.content,
        voice_url: note.voice_url,
        transcript: note.transcript,
        tags: note.tags || [],
        is_private: note.is_private || false,
        created_at: note.created_at,
        resume_id: note.resume_id,
        resume: note.resumes,
      }));

      setNotes(formattedNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (noteData: Partial<NoteData>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title: noteData.title || "New Note",
          content: noteData.content,
          tags: noteData.tags || [],
          is_private: noteData.is_private || false,
          resume_id: noteData.resume_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: NoteData = {
        id: data.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        is_private: data.is_private,
        created_at: data.created_at,
        resume_id: data.resume_id,
      };

      setNotes((prev) => [newNote, ...prev]);

      toast({
        title: "Success!",
        description: "Note created successfully",
      });

      return newNote;
    } catch (error) {
      console.error("Failed to create note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const updateNote = async (noteId: string, updates: Partial<NoteData>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notes")
        .update({
          title: updates.title,
          content: updates.content,
          tags: updates.tags,
          is_private: updates.is_private,
        })
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, ...updates } : note
        )
      );

      toast({
        title: "Success!",
        description: "Note updated successfully",
      });
    } catch (error) {
      console.error("Failed to update note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== noteId));

      toast({
        title: "Success!",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    loadNotes,
  };
};
