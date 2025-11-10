import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Share2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollaborationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeName: string;
  onShareSuccess?: () => void;
}

interface ShadchanProfile {
  user_id: string;
  name: string;
}

const CollaborationShareModal = ({
  isOpen,
  onClose,
  resumeId,
  resumeName,
  onShareSuccess,
}: CollaborationShareModalProps) => {
  const [shadchanim, setShadchanim] = useState<ShadchanProfile[]>([]);
  const [selectedShadchan, setSelectedShadchan] = useState("");
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [initialNote, setInitialNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load all shadchanim when modal opens
  useEffect(() => {
    if (isOpen) {
      loadShadchanim();
    }
  }, [isOpen]);

  const loadShadchanim = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name")
        .eq("role", "shadchan")
        .neq("user_id", user?.id) // Exclude current user
        .order("name");

      if (error) throw error;
      setShadchanim(data || []);
    } catch (error) {
      console.error("Failed to load shadchanim:", error);
    }
  };

  const handleShare = async () => {
    if (!user || !selectedShadchan) return;

    setIsLoading(true);
    try {
      // Create collaboration record
      const { error } = await supabase.from("collaborations").insert({
        sender_id: user.id,
        receiver_id: selectedShadchan,
        shared_resume_id: resumeId,
        permission,
        comment_thread: initialNote
          ? [
              {
                id: crypto.randomUUID(),
                sender_id: user.id,
                message: initialNote,
                timestamp: new Date().toISOString(),
                type: "initial_note",
              },
            ]
          : [],
      });

      if (error) throw error;

      toast({
        title: "Profile Shared Successfully",
        description: `${resumeName} has been shared with the shadchan.`,
      });
      
      // Trigger refresh of collaborations
      if (onShareSuccess) {
        onShareSuccess();
      }
      
      onClose();
      setSelectedShadchan("");
      setInitialNote("");
      setPermission("view");
    } catch (error) {
      console.error("Failed to share profile:", error);
      toast({
        title: "Error",
        description: "Failed to share profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedShadchanName = shadchanim.find(s => s.user_id === selectedShadchan)?.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            <span>Share Profile</span>
          </DialogTitle>
          <DialogDescription>
            Share "{resumeName}" with another shadchan for collaboration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="shadchan">Select Shadchan</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedShadchanName || "Select shadchan..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search shadchanim..." />
                  <CommandList>
                    <CommandEmpty>No shadchan found.</CommandEmpty>
                    <CommandGroup>
                      {shadchanim.map((shadchan) => (
                        <CommandItem
                          key={shadchan.user_id}
                          value={shadchan.name}
                          onSelect={() => {
                            setSelectedShadchan(shadchan.user_id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedShadchan === shadchan.user_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {shadchan.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="permission">Permission Level</Label>
            <Select value={permission} onValueChange={(value: "view" | "edit") => setPermission(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="edit">View & Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="initial-note">Initial Message (Optional)</Label>
            <Textarea
              id="initial-note"
              placeholder="Add a note about this profile or why you're sharing it..."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={!selectedShadchan || isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Sharing..." : "Share Profile"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationShareModal;
