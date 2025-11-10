
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Briefcase, GraduationCap, Heart, Calendar, MessageSquare } from "lucide-react";
import { MatchData } from "@/hooks/useMatches";

interface MatchCardProps {
  match: MatchData;
  onStatusUpdate: (matchId: string, status: MatchData['status']) => void;
  onNotesUpdate: (matchId: string, notes: string) => void;
  getStatusColor: (status: MatchData['status']) => string;
  getStatusLabel: (status: MatchData['status']) => string;
}

const MatchCard = ({ match, onStatusUpdate, onNotesUpdate, getStatusColor, getStatusLabel }: MatchCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(match.notes);

  const handleNotesBlur = () => {
    if (notes !== match.notes) {
      onNotesUpdate(match.id, notes);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{match.name}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {match.age} years old
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {match.location}
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {match.occupation}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(match.status)}>
                {getStatusLabel(match.status)}
              </Badge>
              <span className="text-sm text-gray-500">
                Suggested by {match.shadchanName}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(match.suggestedDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isExpanded && (
            <>
              <div>
                <div className="flex items-center mb-2">
                  <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Education</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{match.education}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Heart className="h-4 w-4 mr-2 text-red-600" />
                  <span className="font-medium">Background</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{match.background}</p>
              </div>
              
              <div>
                <Label htmlFor={`notes-${match.id}`} className="flex items-center mb-2">
                  <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-medium">My Notes</span>
                </Label>
                <Textarea
                  id={`notes-${match.id}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Add your thoughts about this match..."
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
              {isExpanded ? 'Show Less' : 'View Details'}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Status:</Label>
              <Select value={match.status} onValueChange={(value) => onStatusUpdate(match.id, value as MatchData['status'])}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Suggestion</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="meeting_arranged">Meeting Arranged</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
