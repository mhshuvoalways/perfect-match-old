import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MatchData {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  education: string;
  background: string;
  shadchanName: string;
  shadchanId: string | null;
  status: "suggested" | "interested" | "declined" | "meeting_set";
  suggestedDate: string;
  notes: string;
  childName: string; // Add child name to identify which child this match is for
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
    gender?: string;
    hashkafa?: string;
  };
  shadchan?: {
    name: string;
  };
}

export const useMatches = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('match_suggestions')
        .select(`
          *,
          resumes!match_suggestions_resume_id_fkey (
            name,
            age,
            location,
            occupation,
            education,
            background
          )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMatches: MatchData[] = [];

      for (const match of data || []) {
        // Get the child's resume (the one being matched)
        const { data: childResumeData } = await supabase
          .from('resumes')
          .select('name')
          .eq('id', match.resume_id)
          .maybeSingle();

        // Get the suggested family's resume
        const { data: suggestedResumeData } = await supabase
          .from('resumes')
          .select('name, age, location, occupation, education, background, gender, hashkafa, contact_info')
          .eq('id', match.suggested_resume_id || match.resume_id)
          .maybeSingle();

        // Parse contact_info if available
        let contactInfo = {};
        if (suggestedResumeData?.contact_info) {
          try {
            contactInfo = typeof suggestedResumeData.contact_info === 'string' 
              ? JSON.parse(suggestedResumeData.contact_info)
              : suggestedResumeData.contact_info;
          } catch (error) {
            console.error('Error parsing contact_info:', error);
          }
        }

        formattedMatches.push({
          id: match.id,
          name: suggestedResumeData?.name || 'Unknown',
          age: suggestedResumeData?.age || 0,
          location: suggestedResumeData?.location || 'Unknown',
          occupation: suggestedResumeData?.occupation || 'Unknown',
          education: suggestedResumeData?.education || 'Unknown',
          background: suggestedResumeData?.background || 'Unknown',
          shadchanName: 'Shadchan', // We'll get this separately if needed
          shadchanId: match.shadchan_id || null,
          status: match.parent_status as MatchData['status'] || 'suggested',
          suggestedDate: match.created_at,
          notes: match.parent_notes || '',
          childName: childResumeData?.name || 'Unknown Child',
          contactInfo: contactInfo,
          resume: suggestedResumeData ? {
            name: suggestedResumeData.name,
            age: suggestedResumeData.age,
            location: suggestedResumeData.location,
            occupation: suggestedResumeData.occupation,
            education: suggestedResumeData.education,
            background: suggestedResumeData.background,
            gender: suggestedResumeData.gender || "",
            hashkafa: suggestedResumeData.hashkafa || ""
          } : undefined
        });
      }

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMatchStatus = async (matchId: string, status: MatchData['status']) => {
    if (!user) return;

    try {    
      const { data: existingMatch, error: fetchError } = await supabase
        .from('match_suggestions')
        .select('*')
        .eq('id', matchId)
        .eq('parent_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing match:', fetchError);
        throw fetchError;
      }

      if (!existingMatch) {
        console.error('No match found with ID:', matchId, 'for user:', user.id);
      }

      // Now update the status
      const { data, error } = await supabase
        .from('match_suggestions')
        .update({ parent_status: status })
        .eq('id', matchId)
        .eq('parent_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId ? { ...match, status } : match
        )
      );
      
      toast({
        title: "Status Updated",
        description: "Match status has been updated successfully"
      });
    } catch (error) {
      console.error('Failed to update match status:', error);
      toast({
        title: "Error",
        description: "Failed to update match status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateMatchNotes = async (matchId: string, notes: string) => {
    if (!user) return;

    try {
      console.log('Updating match notes:', { matchId, notes, userId: user.id });
      
      // First verify the match exists
      const { data: existingMatch, error: fetchError } = await supabase
        .from('match_suggestions')
        .select('*')
        .eq('id', matchId)
        .eq('parent_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing match:', fetchError);
        throw fetchError;
      }

      if (!existingMatch) {
        console.error('No match found with ID:', matchId, 'for user:', user.id);
        throw new Error('Match not found');
      }

      const { data, error } = await supabase
        .from('match_suggestions')
        .update({ parent_notes: notes })
        .eq('id', matchId)
        .eq('parent_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Update failed - no data returned');
      }

      console.log('Notes update result:', data);

      setMatches(prev => 
        prev.map(match => 
          match.id === matchId ? { ...match, notes } : match
        )
      );
    } catch (error) {
      console.error('Failed to update match notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: MatchData['status']) => {
    switch (status) {
      case 'suggested': return 'bg-blue-100 text-blue-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'meeting_set': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MatchData['status']) => {
    switch (status) {
      case 'suggested': return 'New Suggestion';
      case 'interested': return 'Interested';
      case 'declined': return 'Not Interested';
      case 'meeting_set': return 'Meeting Set';
      default: return status;
    }
  };

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  return {
    matches,
    isLoading,
    updateMatchStatus,
    updateMatchNotes,
    getStatusColor,
    getStatusLabel,
    loadMatches
  };
};
