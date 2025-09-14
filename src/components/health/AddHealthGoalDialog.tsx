import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHealth } from "@/context/HealthContext";
import { HealthGoalType, HealthGoalFrequency } from "@/types/health";

interface AddHealthGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goalTypeOptions = [
  { value: 'supplement' as HealthGoalType, label: 'Supplement', emoji: '💊' },
  { value: 'hydration' as HealthGoalType, label: 'Hydration', emoji: '💧' },
  { value: 'sleep' as HealthGoalType, label: 'Sleep', emoji: '😴' },
  { value: 'activity' as HealthGoalType, label: 'Activity', emoji: '🚶' },
  { value: 'custom' as HealthGoalType, label: 'Custom', emoji: '🎯' },
];

const AddHealthGoalDialog = ({ open, onOpenChange }: AddHealthGoalDialogProps) => {
  const { createHealthGoal } = useHealth();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '' as HealthGoalType,
    frequency: 'daily' as HealthGoalFrequency,
    target: '',
    unit: '',
    emoji: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      return;
    }

    const selectedOption = goalTypeOptions.find(option => option.value === formData.type);
    const emoji = formData.emoji || selectedOption?.emoji || '';
    
    createHealthGoal(
      formData.name,
      formData.type,
      formData.frequency,
      formData.target ? parseInt(formData.target) : undefined,
      formData.unit || undefined,
      emoji,
      formData.description || undefined
    );

    // Reset form
    setFormData({
      name: '',
      type: '' as HealthGoalType,
      frequency: 'daily',
      target: '',
      unit: '',
      emoji: '',
      description: '',
    });

    onOpenChange(false);
  };

  const handleTypeChange = (value: HealthGoalType) => {
    const selectedOption = goalTypeOptions.find(option => option.value === value);
    setFormData(prev => ({
      ...prev,
      type: value,
      emoji: selectedOption?.emoji || prev.emoji,
      // Set default units based on type
      unit: value === 'hydration' ? 'glasses' : 
            value === 'sleep' ? 'hours' :
            value === 'activity' ? 'minutes' :
            prev.unit
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Health Goal</DialogTitle>
          <DialogDescription>
            Create a new health tracking goal to monitor your daily or weekly habits.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Drink 8 glasses of water"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={handleTypeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={formData.frequency} 
                onValueChange={(value: HealthGoalFrequency) => 
                  setFormData(prev => ({ ...prev, frequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Amount</Label>
              <Input
                id="target"
                type="number"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                placeholder="e.g., 8"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g., glasses, hours"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji (optional)</Label>
            <Input
              id="emoji"
              value={formData.emoji}
              onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
              placeholder="🎯"
              maxLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add notes about this goal..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.type}>
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHealthGoalDialog;