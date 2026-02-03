import React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Workout } from "@/types/workout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MonthlyViewProps {
  currentMonth: Date;
  workouts: Workout[];
  selectedDate: Date;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  setSelectedDate: (date: Date) => void;
  handleOpenPlanDialog: (workout: Workout) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentMonth,
  workouts,
  selectedDate,
  createDialogOpen,
  setCreateDialogOpen,
  setSelectedDate,
  handleOpenPlanDialog,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getWorkoutsForDay = (date: Date) => {
    return workouts.filter(
      w => w.planned && format(new Date(w.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="space-y-2">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayWorkouts = getWorkoutsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          
          return (
            <Card 
              key={day.toISOString()} 
              className={cn(
                "min-h-[100px] sm:min-h-[120px] transition-colors",
                !isCurrentMonth && "opacity-40",
                isToday && "ring-2 ring-primary"
              )}
            >
              <CardContent className="p-2 h-full flex flex-col">
                <div className={cn(
                  "text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </div>
                
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[80px]">
                  {dayWorkouts.slice(0, 3).map(workout => (
                    <Badge 
                      key={workout.id}
                      variant="secondary"
                      className="w-full justify-start text-xs truncate cursor-pointer hover:bg-secondary/80 block"
                      onClick={() => handleOpenPlanDialog(workout)}
                    >
                      {workout.name}
                    </Badge>
                  ))}
                  {dayWorkouts.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{dayWorkouts.length - 3} more
                    </span>
                  )}
                </div>
                
                {isCurrentMonth && (
                  <Dialog 
                    open={createDialogOpen && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')} 
                    onOpenChange={(open) => {
                      setCreateDialogOpen(open);
                      if (open) setSelectedDate(day);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-6 mt-1 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
