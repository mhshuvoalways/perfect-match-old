
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Save, X, Trash2, MessageSquare, Mic } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ShadchanNote } from "@/hooks/useShadchan";

interface ShadchanNotesManagerProps {
  notes: ShadchanNote[];
  onAddNote: (note: Omit<ShadchanNote, 'id' | 'dateCreated'>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

const ShadchanNotesManager = ({ notes, onAddNote, onDeleteNote }: ShadchanNotesManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;
    
    const tags = newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    await onAddNote({
      title: newNote.title,
      content: newNote.content,
      isVoiceNote: false,
      isPrivate: true,
      tags
    });
    
    setNewNote({ title: '', content: '', tags: '' });
    setIsCreating(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await onDeleteNote(noteId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Note Section */}
      {!isCreating ? (
        <div className="text-center py-8">
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Note
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Private Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-title">Title *</Label>
              <Input
                id="new-title"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter note title"
              />
            </div>
            <div>
              <Label htmlFor="new-content">Content</Label>
              <Textarea
                id="new-content"
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your private notes..."
                className="min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="new-tags">Tags (comma separated)</Label>
              <Input
                id="new-tags"
                value={newNote.tags}
                onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="important, follow-up, research"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateNote} disabled={!newNote.title.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', tags: '' });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {note.isVoiceNote && <Mic className="h-4 w-4 text-blue-500" />}
                      {note.title}
                    </CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(note.dateCreated))} ago
                      {note.isPrivate && (
                        <Badge variant="outline" className="ml-2">
                          Private
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {note.content && (
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isCreating ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <div className="text-gray-500 mb-4">No private notes yet</div>
          <p className="text-gray-400 mb-6">Start organizing your thoughts and insights</p>
        </div>
      ) : null}
    </div>
  );
};

export default ShadchanNotesManager;
