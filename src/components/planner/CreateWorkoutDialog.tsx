
import React from "react";
import { format } from "date-fns";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateWorkoutDialogProps {
  selectedDate: Date;
  newWorkoutName: string;
  setNewWorkoutName: (name: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  handleCreateWorkout: () => void;
}

export const CreateWorkoutDialog: React.FC<CreateWorkoutDialogProps> = ({
  selectedDate,
  newWorkoutName,
  setNewWorkoutName,
  setCreateDialogOpen,
  handleCreateWorkout,
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Plan Workout for {format(selectedDate, 'EEEE, MMMM d')}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Input
            placeholder="Workout Name"
            value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleCreateWorkout}>Create Workout</Button>
      </DialogFooter>
    </DialogContent>
  );
};
