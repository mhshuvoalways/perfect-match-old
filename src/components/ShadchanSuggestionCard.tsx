import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MatchSuggestion } from "@/hooks/useShadchan";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageSquare,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

interface ShadchanSuggestionCardProps {
  suggestion: MatchSuggestion;
  onStatusUpdate: (
    suggestionId: string,
    status: MatchSuggestion["shadchanStatus"],
    isParent?: boolean
  ) => void;
  onNotesUpdate: (
    suggestionId: string,
    notes: string,
    isParent?: boolean
  ) => void;
  onDelete?: (suggestionId: string) => void;
  getStatusColor: (status: MatchSuggestion["shadchanStatus"]) => string;
  getStatusLabel: (status: MatchSuggestion["shadchanStatus"]) => string;
}

const ShadchanSuggestionCard = ({
  suggestion,
  onStatusUpdate,
  onNotesUpdate,
  onDelete,
  getStatusColor,
  getStatusLabel,
}: ShadchanSuggestionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shadchanNotes, setShadchanNotes] = useState(suggestion.shadchanNotes);
  const [parentNotes, setParentNotes] = useState(suggestion.parentNotes);

  const handleShadchanNotesBlur = () => {
    if (shadchanNotes !== suggestion.shadchanNotes) {
      onNotesUpdate(suggestion.id, shadchanNotes, false);
    }
  };

  const handleParentNotesBlur = () => {
    if (parentNotes !== suggestion.parentNotes) {
      onNotesUpdate(suggestion.id, parentNotes, true);
    }
  };

  const handleDelete = () => {
    if (
      onDelete &&
      confirm("Are you sure you want to delete this suggestion?")
    ) {
      onDelete(suggestion.id);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {suggestion.familyName} → {suggestion.suggestedName}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {suggestion.familyAge} years old
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {suggestion.familyLocation}
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {suggestion.familyOccupation}
              </div>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Shadchan:</span>
                <Badge className={getStatusColor(suggestion.shadchanStatus)}>
                  {getStatusLabel(suggestion.shadchanStatus)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Parent:</span>
                <Badge className={getStatusColor(suggestion.parentStatus)}>
                  {getStatusLabel(suggestion.parentStatus)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(suggestion.dateCreated).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
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
                <p className="text-sm text-gray-600 mt-1">
                  {suggestion.background}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`shadchan-notes-${suggestion.id}`}
                    className="flex items-center mb-2"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">Shadchan Notes</span>
                  </Label>
                  <Textarea
                    id={`shadchan-notes-${suggestion.id}`}
                    value={shadchanNotes}
                    onChange={(e) => setShadchanNotes(e.target.value)}
                    onBlur={handleShadchanNotesBlur}
                    placeholder="Add your thoughts about this suggestion..."
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`parent-notes-${suggestion.id}`}
                    className="flex items-center mb-2"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Parent Notes</span>
                  </Label>
                  <Textarea
                    id={`parent-notes-${suggestion.id}`}
                    value={parentNotes}
                    onChange={(e) => setParentNotes(e.target.value)}
                    onBlur={handleParentNotesBlur}
                    placeholder="Parent's feedback..."
                    className="min-h-[80px]"
                    readOnly
                  />
                </div>
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

            <div className="flex items-center space-x-2">
              <Label className="text-sm">Shadchan Status:</Label>
              <Select
                value={suggestion.shadchanStatus}
                onValueChange={(value) =>
                  onStatusUpdate(
                    suggestion.id,
                    value as MatchSuggestion["shadchanStatus"],
                    false
                  )
                }
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
  );
};

export default ShadchanSuggestionCard;
