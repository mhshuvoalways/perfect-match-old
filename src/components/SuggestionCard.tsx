
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Briefcase, Calendar, MessageSquare, ChevronDown, ChevronUp, Download, Heart } from "lucide-react";
import { MatchSuggestion } from "@/hooks/useShadchan";
import PaymentModal from "./PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SuggestionCardProps {
  suggestion: MatchSuggestion;
  familyName: string;
  onStatusUpdate: (suggestionId: string, status: MatchSuggestion['parentStatus']) => void;
  onNotesUpdate: (suggestionId: string, notes: string) => void;
  getStatusColor: (status: MatchSuggestion['parentStatus']) => string;
  getStatusLabel: (status: MatchSuggestion['parentStatus']) => string;
}

const SuggestionCard = ({ 
  suggestion, 
  familyName, 
  onStatusUpdate, 
  onNotesUpdate, 
  getStatusColor, 
  getStatusLabel 
}: SuggestionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(suggestion.parentNotes);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [shadchanName, setShadchanName] = useState("Shadchan");
  const { toast } = useToast();

  const handleNotesBlur = () => {
    if (notes !== suggestion.parentNotes) {
      onNotesUpdate(suggestion.id, notes);
    }
  };

  const generatePDFContent = (suggestion: MatchSuggestion) => {
    // Include contact info in the generated PDF content
    const contactSection = suggestion.contactInfo ? `
    
    Contact Information:
    Parent Name: ${suggestion.contactInfo.parentName || 'Not provided'}
    Parent Email: ${suggestion.contactInfo.parentEmail || 'Not provided'}
    Parent Phone: ${suggestion.contactInfo.parentPhone || 'Not provided'}
    ` : '';

    return `
      Name: ${suggestion.suggestedName}
      Age: ${suggestion.age}
      Location: ${suggestion.location}
      Occupation: ${suggestion.occupation}
      Background: ${suggestion.background}
      
      ${suggestion.resume ? `
      Education: ${suggestion.resume.education}
      Gender: ${suggestion.resume.gender}
      Hashkafa: ${suggestion.resume.hashkafa}
      ` : ''}${contactSection}
    `;
  };

  const handleDownloadResume = async () => {
    try {
      // Get shadchan name if we have shadchanId
      if (suggestion.shadchanId) {
        const { data: shadchanProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', suggestion.shadchanId)
          .maybeSingle();
        
        if (shadchanProfile?.name) {
          setShadchanName(shadchanProfile.name);
        }
      }

      // Generate PDF content from suggestion data
      const pdfContent = generatePDFContent(suggestion);
      
      // Create a blob with the content
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${suggestion.suggestedName}_resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading resume for ${suggestion.suggestedName}`,
      });
    } catch (error) {
      console.error('Error in download process:', error);
      toast({
        title: "Error",
        description: "An error occurred while downloading the resume",
        variant: "destructive"
      });
    }
  };

  // Get shadchan name when component mounts or when opening payment modal
  const handleOpenPaymentModal = async () => {
    if (suggestion.shadchanId) {
      try {
        const { data: shadchanProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', suggestion.shadchanId)
          .maybeSingle();
        
        if (shadchanProfile?.name) {
          setShadchanName(shadchanProfile.name);
        }
      } catch (error) {
        console.error('Error fetching shadchan name:', error);
      }
    }
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {suggestion.suggestedName} → {familyName}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {suggestion.age} years old
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {suggestion.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {suggestion.occupation}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(suggestion.parentStatus)}>
                  {getStatusLabel(suggestion.parentStatus)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(suggestion.dateCreated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {isExpanded && (
              <>
                <div>
                  <span className="font-medium text-gray-700">Background:</span>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.background}</p>
                </div>
                
                <div>
                  <Label htmlFor={`notes-${suggestion.id}`} className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">My Notes</span>
                  </Label>
                  <Textarea
                    id={`notes-${suggestion.id}`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Add your thoughts about this suggestion..."
                    className="min-h-[80px]"
                  />
                </div>
              </>
            )}
            
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    View Details
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadResume}
              >
                <Download className="h-4 w-4 mr-1" />
                Download Resume
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPaymentModal}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Heart className="h-4 w-4 mr-1" />
                Send Thank You
              </Button>
              
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Status:</Label>
                <Select 
                  value={suggestion.parentStatus} 
                  onValueChange={(value) => onStatusUpdate(suggestion.id, value as MatchSuggestion['parentStatus'])}
                >
                  <SelectTrigger className="w-40">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        shadchanName={shadchanName}
        shadchanId={suggestion.shadchanId || ""}
      />
    </>
  );
};

export default SuggestionCard;
