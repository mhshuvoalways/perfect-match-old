
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { MatchSuggestion, Family } from "@/hooks/useShadchan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddSuggestionFormProps {
  families: Family[];
  onAddSuggestion: (suggestion: { familyId: string; suggestedFamilyId: string; shadchanNotes: string; shadchanStatus: MatchSuggestion['shadchanStatus'] }) => void;
  onCancel: () => void;
}

const AddSuggestionForm = ({ families, onAddSuggestion, onCancel }: AddSuggestionFormProps) => {
  const { user } = useAuth();
  const [parentFamilies, setParentFamilies] = useState<Family[]>([]);
  const [formData, setFormData] = useState({
    familyId: "",
    suggestedFamilyId: "",
    shadchanNotes: "",
    shadchanStatus: "suggested" as MatchSuggestion['shadchanStatus']
  });

  // Load all families created by parents (not shadchans)
  const loadParentFamilies = async () => {
    if (!user) return;

    try {
      // Get all profiles that are parents
      const { data: parentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'parent');

      if (profilesError) throw profilesError;

      const parentUserIds = parentProfiles?.map(p => p.user_id) || [];

      if (parentUserIds.length === 0) {
        setParentFamilies([]);
        return;
      }

      // Get resumes created by parents
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .in('user_id', parentUserIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFamilies: Family[] = (data || []).map(resume => ({
        id: resume.id,
        childName: resume.name,
        parentName: 'Parent',
        parentId: resume.user_id,
        age: resume.age || 0,
        gender: resume.gender || 'Not specified',
        location: resume.location || 'Unknown',
        occupation: resume.occupation || 'Not specified',
        education: resume.education || 'Not specified',
        background: resume.background || 'No background provided',
        hashkafa: resume.hashkafa || 'Not specified',
        lookingFor: resume.family_info?.looking_for || 'Not specified',
        status: 'active' as const,
        dateAdded: resume.created_at
      }));

      setParentFamilies(formattedFamilies);
    } catch (error) {
      console.error('Failed to load parent families:', error);
    }
  };

  useEffect(() => {
    loadParentFamilies();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.familyId && formData.suggestedFamilyId && formData.familyId !== formData.suggestedFamilyId) {
      onAddSuggestion({
        familyId: formData.familyId,
        suggestedFamilyId: formData.suggestedFamilyId,
        shadchanNotes: formData.shadchanNotes,
        shadchanStatus: formData.shadchanStatus
      });
      setFormData({
        familyId: "",
        suggestedFamilyId: "",
        shadchanNotes: "",
        shadchanStatus: "suggested"
      });
      onCancel();
    }
  };

  const selectedFamily = parentFamilies.find(f => f.id === formData.familyId);
  const suggestedFamily = families.find(f => f.id === formData.suggestedFamilyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-green-600" />
            <span>Add New Suggestion</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="family">Select Parent Family to Suggest Match For *</Label>
            <Select value={formData.familyId} onValueChange={(value) => setFormData(prev => ({ ...prev, familyId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent family" />
              </SelectTrigger>
              <SelectContent>
                {parentFamilies.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.childName} ({family.age} years old) - {family.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFamily && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedFamily.childName} ({selectedFamily.age} years old)
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Looking for:</strong> {selectedFamily.lookingFor}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="suggested-family">Select Your Family to Suggest *</Label>
            <Select value={formData.suggestedFamilyId} onValueChange={(value) => setFormData(prev => ({ ...prev, suggestedFamilyId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your family to suggest" />
              </SelectTrigger>
              <SelectContent>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.childName} ({family.age} years old) - {family.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {suggestedFamily && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Suggested:</strong> {suggestedFamily.childName} ({suggestedFamily.age} years old)
                </p>
                <p className="text-sm text-green-700">
                  <strong>Background:</strong> {suggestedFamily.background}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="status">Initial Shadchan Status</Label>
            <Select value={formData.shadchanStatus} onValueChange={(value: MatchSuggestion['shadchanStatus']) => setFormData(prev => ({ ...prev, shadchanStatus: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="meeting_set">Meeting Set</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Shadchan Notes</Label>
            <Textarea
              id="notes"
              value={formData.shadchanNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, shadchanNotes: e.target.value }))}
              placeholder="Add your thoughts about why this is a good match..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.familyId || !formData.suggestedFamilyId || formData.familyId === formData.suggestedFamilyId}
            >
              Create Suggestion
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSuggestionForm;
