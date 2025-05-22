
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WorkoutExercise } from "@/types/workout";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExerciseNotesProps {
  exerciseItem: WorkoutExercise;
  onSaveNotes: (exerciseId: string, notes: string) => void;
}

const ExerciseNotes: React.FC<ExerciseNotesProps> = ({ exerciseItem, onSaveNotes }) => {
  const [notes, setNotes] = useState(exerciseItem.notes || "");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onSaveNotes(exerciseItem.id, notes);
    setIsOpen(false);
    toast({
      title: "Notes Saved",
      description: `Notes for ${exerciseItem.exercise.name} saved successfully`,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 ml-1 hover:bg-muted"
          title="Exercise Notes"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">
            Notes for {exerciseItem.exercise.name}
          </h4>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about your exercise..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Notes</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExerciseNotes;
