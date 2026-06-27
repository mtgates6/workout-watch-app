import React from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

// Change these to your actual names
const USERS = [
  { label: "Matthew", id: "matthew" },
  { label: "Amy🫶🏻", id: "amy" },
];

const UserPickerScreen = () => {
  const { setUser } = useUser();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Dumbbell className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">WorkoutWatch</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">Who's working out today?</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {USERS.map((user) => (
            <Button key={user.id} size="lg" onClick={() => setUser(user.id)} className="text-base">
              {user.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPickerScreen;
