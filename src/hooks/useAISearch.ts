import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AIMatchResult {
  id: string;
  parent_id: string;
  child_resume_id: string;
  resume_library_id: string;
  match_score: number;
  highlights: {
    strengths: string[];
    concerns: string[];
    summary: string;
  };
  created_at: string;
  child_resume?: {
    name: string;
    age: number;
    location: string;
    occupation: string;
  };
  matched_resume?: {
    parsed_data: any;
    uploaded_by: string;
  };
}

export const useAISearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchResults, setMatchResults] = useState<AIMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const runAISearchForChild = async (childResumeId: string) => {
    if (!user) return;

    setIsSearching(true);
    try {
      // Get the specific child resume
      const { data: childResumes, error: resumeError } = await supabase
        .from("resumes")
        .select("id, name, age, location, occupation, education, background, hashkafa, gender")
        .eq("user_id", user.id)
        .eq("id", childResumeId);

      if (resumeError) throw resumeError;

      if (!childResumes || childResumes.length === 0) {
        toast({
          title: "Child Resume Not Found",
          description: "The selected child's resume could not be found.",
          variant: "destructive",
        });
        return;
      }

      const childResume = childResumes[0];

      // Check for uploaded resumes specifically for AI Search
      const { data: uploadedResumes, error: libraryError } = await supabase
        .from("resume_library")
        .select("id")
        .eq("user_id", user.id)
        .eq("uploaded_for", "AI Search");

      if (libraryError) throw libraryError;

      if (!uploadedResumes || uploadedResumes.length === 0) {
        toast({
          title: "No Uploaded Resumes Found",
          description: "Please upload at least one resume for AI search before running the analysis.",
          variant: "destructive",
        });
        return;
      }

      console.log(`Starting AI search for ${childResume.name} with ${uploadedResumes.length} uploaded resumes`);

      // Call edge function to parse resumes and find matches for this specific child
      const { data, error } = await supabase.functions.invoke('parse-resume-and-match', {
        body: {
          childResume,
          userId: user.id
        }
      });

      if (error) {
        console.error('Error in AI search:', error);
        throw error;
      }

      if (!data.matches || data.matches.length === 0) {
        toast({
          title: "No Matches Found",
          description: `No compatible matches were found for ${childResume.name}.`,
        });
        return;
      }

      console.log(`AI search completed with ${data.matches.length} matches for ${childResume.name}`);

      // Save all match results to database
      const matchesToInsert = data.matches.map((match: any) => ({
        parent_id: user.id,
        child_resume_id: match.child_resume_id,
        resume_library_id: match.resume_library_id,
        match_score: match.match_score,
        highlights: match.highlights
      }));

      const { data: insertedMatches, error: insertError } = await supabase
        .from("ai_match_results")
        .insert(matchesToInsert)
        .select(`
          *,
          resumes!ai_match_results_child_resume_id_fkey(name, age, location, occupation),
          resume_library!ai_match_results_resume_library_id_fkey(parsed_data, uploaded_by)
        `);

      if (insertError) throw insertError;

      // Format the results
      const formattedResults: AIMatchResult[] = insertedMatches.map((match: any) => ({
        id: match.id,
        parent_id: match.parent_id,
        child_resume_id: match.child_resume_id,
        resume_library_id: match.resume_library_id,
        match_score: match.match_score,
        highlights: match.highlights,
        created_at: match.created_at,
        child_resume: match.resumes,
        matched_resume: match.resume_library
      }));

      setMatchResults(prev => [...formattedResults, ...prev]);

      toast({
        title: "AI Search Complete!",
        description: `Found ${data.matches.length} potential matches for ${childResume.name} from ${data.totalProcessed} uploaded resumes.`,
      });

    } catch (error) {
      console.error('Failed to run AI search:', error);
      toast({
        title: "Error",
        description: "Failed to run AI search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Keep the old function for backward compatibility, but make it call all children
  const runAISearch = async () => {
    if (!user) return;

    // Get all child resumes and run search for each
    const { data: childResumes, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id);

    if (resumeError || !childResumes || childResumes.length === 0) {
      toast({
        title: "No Child Resumes Found",
        description: "Please create at least one child's resume before running AI search.",
        variant: "destructive",
      });
      return;
    }

    // Run search for each child sequentially
    for (const child of childResumes) {
      await runAISearchForChild(child.id);
    }
  };

  const loadMatchResults = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_match_results")
        .select(`
          *,
          resumes!ai_match_results_child_resume_id_fkey(name, age, location, occupation),
          resume_library!ai_match_results_resume_library_id_fkey(parsed_data, uploaded_by)
        `)
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedResults: AIMatchResult[] = (data || []).map((match: any) => ({
        id: match.id,
        parent_id: match.parent_id,
        child_resume_id: match.child_resume_id,
        resume_library_id: match.resume_library_id,
        match_score: match.match_score,
        highlights: match.highlights,
        created_at: match.created_at,
        child_resume: match.resumes,
        matched_resume: match.resume_library
      }));

      setMatchResults(formattedResults);
    } catch (error) {
      console.error('Failed to load match results:', error);
      toast({
        title: "Error",
        description: "Failed to load match results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMatchResult = async (matchId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("ai_match_results")
        .delete()
        .eq("id", matchId)
        .eq("parent_id", user.id);

      if (error) throw error;

      setMatchResults(prev => prev.filter(match => match.id !== matchId));
      
      toast({
        title: "Success!",
        description: "Match result deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete match result:', error);
      toast({
        title: "Error",
        description: "Failed to delete match result",
        variant: "destructive",
      });
    }
  };

  return {
    matchResults,
    isLoading,
    isSearching,
    runAISearch,
    runAISearchForChild,
    loadMatchResults,
    deleteMatchResult
  };
};
