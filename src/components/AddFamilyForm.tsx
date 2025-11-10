
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Family } from "@/hooks/useShadchan";

interface AddFamilyFormProps {
  onAddFamily: (family: Omit<Family, 'id' | 'dateAdded' | 'parentId'>) => void;
  onCancel: () => void;
}

const AddFamilyForm = ({ onAddFamily, onCancel }: AddFamilyFormProps) => {
  const [formData, setFormData] = useState({
    childName: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    age: "",
    gender: "",
    location: "",
    occupation: "",
    education: "",
    background: "",
    hashkafa: "",
    lookingFor: "",
    status: "active" as Family['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.childName && formData.parentName && formData.age) {
      onAddFamily({
        ...formData,
        age: parseInt(formData.age)
      });
      setFormData({
        childName: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        age: "",
        gender: "",
        location: "",
        occupation: "",
        education: "",
        background: "",
        hashkafa: "",
        lookingFor: "",
        status: "active"
      });
      onCancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-green-600" />
            <span>Add New Family</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="child-name">Name *</Label>
              <Input
                id="child-name"
                value={formData.childName}
                onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              <Label htmlFor="parent-name">Parent's Name *</Label>
              <Input
                id="parent-name"
                value={formData.parentName}
                onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                placeholder="Enter parent's name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parent-email">Parent's Email</Label>
              <Input
                id="parent-email"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                placeholder="Enter parent's email"
              />
            </div>
            <div>
              <Label htmlFor="parent-phone">Parent's Phone</Label>
              <Input
                id="parent-phone"
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                placeholder="Enter parent's phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder="Enter occupation"
              />
            </div>
            <div>
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                placeholder="Enter education"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="background">Background</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
              placeholder="Describe background, family, etc."
            />
          </div>

          <div>
            <Label htmlFor="hashkafa">Hashkafa/Religious Level</Label>
            <Input
              id="hashkafa"
              value={formData.hashkafa}
              onChange={(e) => setFormData(prev => ({ ...prev, hashkafa: e.target.value }))}
              placeholder="Enter hashkafa/religious level"
            />
          </div>

          <div>
            <Label htmlFor="looking-for">Looking For</Label>
            <Textarea
              id="looking-for"
              value={formData.lookingFor}
              onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
              placeholder="Describe what they're looking for in a match"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: Family['status']) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Family
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddFamilyForm;
