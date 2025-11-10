import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface Family {
  id: string;
  childName: string;
  parentName: string;
  parentId: string;
  parentEmail?: string;
  parentPhone?: string;
  age: number;
  gender: string;
  location: string;
  occupation: string;
  education: string;
  background: string;
  hashkafa: string;
  lookingFor: string;
  status: "active" | "paused" | "matched";
  dateAdded: string;
}

export interface MatchSuggestion {
  id: string;
  familyId: string;
  parentId: string;
  suggestedFamilyId: string;
  suggestedName: string;
  familyName: string;
  age: number;
  location: string;
  occupation: string;
  background: string;
  shadchanStatus: "suggested" | "interested" | "declined" | "meeting_set";
  parentStatus: "suggested" | "interested" | "declined" | "meeting_set";
  dateCreated: string;
  shadchanNotes: string;
  parentNotes: string;
  shadchanId: string | null;
  contactInfo?: {
    parentName?: string;
    parentEmail?: string;
    parentPhone?: string;
  };
  resume?: {
    name: string;
    age: number;
    location: string;
    occupation: string;
    education: string;
    background: string;
    gender: string;
    hashkafa: string;
  };
  parent?: {
    name: string;
  };
  familyAge: string;
  familyLocation: string;
  familyOccupation: string;
}

export interface ShadchanNote {
  id: string;
  familyId?: string;
  matchId?: string;
  title: string;
  content: string;
  isVoiceNote: boolean;
  dateCreated: string;
  isPrivate: boolean;
  tags?: string[];
}

export const useShadchan = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [notes, setNotes] = useState<ShadchanNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load families created by this shadchan only
  const loadFamilies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id) // Only show families created by this shadchan
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedFamilies: Family[] = (data || []).map((resume) => ({
        id: resume.id,
        childName: resume.name,
        parentName: "Parent", // We'll get this separately if needed
        parentId: resume.user_id,
        age: resume.age || 0,
        gender: resume.gender || "Not specified",
        location: resume.location || "Unknown",
        occupation: resume.occupation || "Not specified",
        education: resume.education || "Not specified",
        background: resume.background || "No background provided",
        hashkafa: resume.hashkafa || "Not specified",
        lookingFor: resume.family_info?.looking_for || "Not specified",
        status: "active" as const,
        dateAdded: resume.created_at,
      }));

      setFamilies(formattedFamilies);
    } catch (error) {
      console.error("Failed to load families:", error);
      toast({
        title: "Error",
        description: "Failed to load families",
        variant: "destructive",
      });
    }
  };

  // Load match suggestions created by this shadchan
  const loadSuggestions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
        const { data, error } = await supabase
        .from("match_suggestions")
        .select(
          `
          *,
          resumes!match_suggestions_suggested_resume_id_fkey (
            name,
            age,
            location,
            occupation,
            education,
            background,
            gender,
            hashkafa,
            contact_info
          )
        `
        )
        .eq("shadchan_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedSuggestions: MatchSuggestion[] = [];

      for (const suggestion of data || []) {
        // Get the parent family being suggested to
        const { data: parentFamilyData } = await supabase
          .from("resumes")
          .select("name, age, location, occupation")
          .eq("id", suggestion.resume_id)
          .single();

        // Parse contact_info if available
        let contactInfo = {};
        if (suggestion.resumes?.contact_info) {
          try {
            contactInfo = typeof suggestion.resumes.contact_info === 'string' 
              ? JSON.parse(suggestion.resumes.contact_info)
              : suggestion.resumes.contact_info;
          } catch (error) {
            console.error('Error parsing contact_info:', error);
          }
        }

        formattedSuggestions.push({
          id: suggestion.id,
          familyId: suggestion.resume_id || "",
          parentId: suggestion.parent_id || "",
          suggestedFamilyId: suggestion.suggested_resume_id || "",
          suggestedName: suggestion.resumes?.name || "Unknown",
          familyName: parentFamilyData?.name || "Unknown Family",
          familyAge: parentFamilyData?.age || "Unknown Age",
          familyLocation: parentFamilyData?.location || "Unknown Location",
          familyOccupation:
            parentFamilyData?.occupation || "Unknown Occupation",
          age: suggestion.resumes?.age || 0,
          location: suggestion.resumes?.location || "Unknown",
          occupation: suggestion.resumes?.occupation || "Unknown",
          background: suggestion.resumes?.background || "Unknown",
          shadchanStatus:
            (suggestion.shadchan_status as MatchSuggestion["shadchanStatus"]) ||
            "suggested",
          parentStatus:
            (suggestion.parent_status as MatchSuggestion["parentStatus"]) ||
            "suggested",
          dateCreated: suggestion.created_at,
          shadchanNotes: suggestion.shadchan_notes || "",
          parentNotes: suggestion.parent_notes || "",
          shadchanId: suggestion.shadchan_id || null,
          contactInfo: contactInfo,
          resume: suggestion.resumes,
        });
      }

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load private notes for this shadchan
  const loadNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_private", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedNotes: ShadchanNote[] = (data || []).map((note) => ({
        id: note.id,
        title: note.title || "Untitled",
        content: note.content || "",
        isVoiceNote: !!note.voice_url,
        dateCreated: note.created_at,
        isPrivate: note.is_private,
        tags: note.tags || [],
      }));

      setNotes(formattedNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    }
  };

  const addFamily = async (
    family: Omit<Family, "id" | "dateAdded" | "parentId">
  ) => {
    if (!user) return;

    try {
      const contactInfo = {
        parentName: family.parentName,
        parentEmail: family.parentEmail || "",
        parentPhone: family.parentPhone || "",
      };

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id, // Shadchan creates the family
          name: family.childName,
          age: family.age,
          gender: family.gender,
          location: family.location,
          occupation: family.occupation,
          education: family.education,
          background: family.background,
          hashkafa: family.hashkafa,
          contact_info: JSON.stringify(contactInfo),
          family_info: {
            looking_for: family.lookingFor,
          },
        })
        .select()
        .single();

      if (error) throw error;

      await loadFamilies(); // Reload to get the formatted data

      toast({
        title: "Family Added",
        description: `${family.childName} has been added successfully`,
      });
    } catch (error) {
      console.error("Failed to add family:", error);
      toast({
        title: "Error",
        description: "Failed to add family",
        variant: "destructive",
      });
    }
  };

  const deleteFamily = async (familyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", familyId)
        .eq("user_id", user.id); // Ensure only the creator can delete

      if (error) throw error;

      setFamilies((prev) => prev.filter((family) => family.id !== familyId));

      toast({
        title: "Family Deleted",
        description: "Family has been deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete family:", error);
      toast({
        title: "Error",
        description: "Failed to delete family",
        variant: "destructive",
      });
    }
  };

  const addSuggestion = async (suggestion: {
    familyId: string;
    suggestedFamilyId: string;
    shadchanNotes: string;
    shadchanStatus: MatchSuggestion["shadchanStatus"];
  }) => {
    if (!user) return;

    try {
      // Get the parent family (who we're suggesting to)
      const { data: parentFamilyData, error: parentError } = await supabase
        .from("resumes")
        .select("user_id")
        .eq("id", suggestion.familyId)
        .single();

      if (parentError) throw parentError;

      // Create the match suggestion
      const { data, error } = await supabase
        .from("match_suggestions")
        .insert({
          shadchan_id: user.id,
          resume_id: suggestion.familyId, // Parent's family being suggested to
          parent_id: parentFamilyData.user_id, // Parent user ID
          suggested_resume_id: suggestion.suggestedFamilyId, // Shadchan's family being suggested
          shadchan_status: suggestion.shadchanStatus,
          parent_status: "suggested",
          shadchan_notes: suggestion.shadchanNotes,
          parent_notes: "",
        })
        .select()
        .single();

      if (error) throw error;

      await loadSuggestions(); // Reload to get the formatted data

      toast({
        title: "Suggestion Added",
        description: `New suggestion created successfully`,
      });
    } catch (error) {
      console.error("Failed to add suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to create suggestion",
        variant: "destructive",
      });
    }
  };

  const deleteSuggestion = async (suggestionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("match_suggestions")
        .delete()
        .eq("id", suggestionId)
        .eq("shadchan_id", user.id); // Ensure only the creator can delete

      if (error) throw error;

      setSuggestions((prev) =>
        prev.filter((suggestion) => suggestion.id !== suggestionId)
      );

      toast({
        title: "Suggestion Deleted",
        description: "Suggestion has been deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to delete suggestion",
        variant: "destructive",
      });
    }
  };

  const updateSuggestionStatus = async (
    suggestionId: string,
    status: MatchSuggestion["shadchanStatus"],
    isParent: boolean = false
  ) => {
    if (!user) return;

    try {
      const updateData = isParent
        ? { parent_status: status }
        : { shadchan_status: status };

      const { error } = await supabase
        .from("match_suggestions")
        .update(updateData)
        .eq("id", suggestionId);

      if (error) throw error;

      setSuggestions((prev) =>
        prev.map((suggestion) =>
          suggestion.id === suggestionId
            ? {
                ...suggestion,
                ...(isParent
                  ? { parentStatus: status as MatchSuggestion["parentStatus"] }
                  : { shadchanStatus: status }),
              }
            : suggestion
        )
      );

      toast({
        title: "Status Updated",
        description: `${
          isParent ? "Parent" : "Shadchan"
        } status has been updated`,
      });
    } catch (error) {
      console.error("Failed to update suggestion status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const updateSuggestionNotes = async (
    suggestionId: string,
    notes: string,
    isParent: boolean = false
  ) => {
    if (!user) return;

    try {
      const updateData = isParent
        ? { parent_notes: notes }
        : { shadchan_notes: notes };

      const { error } = await supabase
        .from("match_suggestions")
        .update(updateData)
        .eq("id", suggestionId);

      if (error) throw error;

      setSuggestions((prev) =>
        prev.map((suggestion) =>
          suggestion.id === suggestionId
            ? {
                ...suggestion,
                ...(isParent
                  ? { parentNotes: notes }
                  : { shadchanNotes: notes }),
              }
            : suggestion
        )
      );
    } catch (error) {
      console.error("Failed to update suggestion notes:", error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    }
  };

  const addNote = async (note: Omit<ShadchanNote, "id" | "dateCreated">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title: note.title,
          content: note.content,
          is_private: true,
          tags: note.tags || [],
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: ShadchanNote = {
        id: data.id,
        title: data.title,
        content: data.content || "",
        isVoiceNote: false,
        dateCreated: data.created_at,
        isPrivate: data.is_private,
        tags: data.tags || [],
      };

      setNotes((prev) => [newNote, ...prev]);

      toast({
        title: "Note Added",
        description: "Your note has been saved successfully",
      });
    } catch (error) {
      console.error("Failed to add note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
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
        title: "Note Deleted",
        description: "Your note has been deleted successfully",
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

  const getSuggestionStatusColor = (
    status: MatchSuggestion["shadchanStatus"]
  ) => {
    switch (status) {
      case "suggested":
        return "bg-blue-100 text-blue-800";
      case "interested":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "meeting_set":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSuggestionStatusLabel = (
    status: MatchSuggestion["shadchanStatus"]
  ) => {
    switch (status) {
      case "suggested":
        return "Suggested";
      case "interested":
        return "Interested";
      case "declined":
        return "Declined";
      case "meeting_set":
        return "Meeting Set";
      default:
        return status;
    }
  };

  useEffect(() => {
    if (user) {
      loadFamilies();
      loadSuggestions();
      loadNotes();
    }
  }, [user]);

  return {
    families,
    suggestions,
    notes,
    isLoading,
    addFamily,
    deleteFamily,
    addSuggestion,
    deleteSuggestion,
    updateSuggestionStatus,
    updateSuggestionNotes,
    addNote,
    deleteNote,
    getSuggestionStatusColor,
    getSuggestionStatusLabel,
    loadFamilies,
    loadSuggestions,
    loadNotes,
  };
};
