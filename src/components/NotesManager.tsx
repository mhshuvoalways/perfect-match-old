
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNotes, NoteData } from "@/hooks/useNotes";
import { Plus, Edit, Save, X, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NotesManager = () => {
  const { notes, isLoading, createNote, updateNote, deleteNote } = useNotes();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [editNote, setEditNote] = useState({ title: '', content: '', tags: '' });

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;
    
    const tags = newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    await createNote({
      title: newNote.title,
      content: newNote.content,
      tags,
      is_private: true
    });
    
    setNewNote({ title: '', content: '', tags: '' });
    setIsCreating(false);
  };

  const handleEditNote = (note: NoteData) => {
    setEditingId(note.id);
    setEditNote({
      title: note.title,
      content: note.content || '',
      tags: note.tags?.join(', ') || ''
    });
  };

  const handleUpdateNote = async () => {
    if (!editingId || !editNote.title.trim()) return;
    
    const tags = editNote.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    await updateNote(editingId, {
      title: editNote.title,
      content: editNote.content,
      tags,
      is_private: true
    });
    
    setEditingId(null);
    setEditNote({ title: '', content: '', tags: '' });
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

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
            <CardTitle>Create New Note</CardTitle>
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
                placeholder="Enter your notes..."
                className="min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="new-tags">Tags (comma separated)</Label>
              <Input
                id="new-tags"
                value={newNote.tags}
                onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="match, important, follow-up"
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
                    {editingId === note.id ? (
                      <Input
                        value={editNote.title}
                        onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg font-semibold"
                      />
                    ) : (
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    )}
                    <CardDescription>
                      {formatDistanceToNow(new Date(note.created_at))} ago
                      {note.resume && ` • Related to ${note.resume.name}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {editingId === note.id ? (
                      <>
                        <Button size="sm" onClick={handleUpdateNote}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditNote(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === note.id ? (
                  <>
                    <Textarea
                      value={editNote.content}
                      onChange={(e) => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your notes..."
                      className="min-h-[120px]"
                    />
                    <Input
                      value={editNote.tags}
                      onChange={(e) => setEditNote(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Tags (comma separated)"
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isCreating ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No notes yet</div>
          <p className="text-gray-400 mb-6">Start organizing your thoughts and match insights</p>
        </div>
      ) : null}
    </div>
  );
};

export default NotesManager;
