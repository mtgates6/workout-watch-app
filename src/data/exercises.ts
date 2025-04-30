
import { Exercise } from "@/types/workout";

export const exercises: Exercise[] = [
  {
    id: "1",
    name: "Bench Press",
    type: "strength",
    muscleGroups: ["chest", "triceps"],
    instructions: "Lie on a bench with your feet on the ground. Grip the barbell with hands slightly wider than shoulder-width apart. Lower the barbell to your chest, then press it back up."
  },
  {
    id: "2",
    name: "Squat",
    type: "strength",
    muscleGroups: ["quadriceps", "hamstrings", "glutes"],
    instructions: "Stand with feet shoulder-width apart. Lower your body by bending your knees and pushing your hips back as if sitting in a chair. Lower until thighs are parallel to the ground, then return to standing."
  },
  {
    id: "3",
    name: "Deadlift",
    type: "strength",
    muscleGroups: ["back", "hamstrings", "glutes"],
    instructions: "Stand with feet hip-width apart, barbell over midfoot. Bend at hips and knees to grip the bar. Keeping back straight, stand up with the weight by driving through your heels."
  },
  {
    id: "4",
    name: "Pull Up",
    type: "strength",
    muscleGroups: ["back", "biceps"],
    instructions: "Hang from a bar with palms facing away from you. Pull your body up until your chin is over the bar, then lower with control."
  },
  {
    id: "5",
    name: "Running",
    type: "cardio",
    muscleGroups: ["legs", "cardiovascular"],
    instructions: "Maintain good posture, land midfoot, and keep a consistent pace."
  },
  {
    id: "6",
    name: "Plank",
    type: "strength",
    muscleGroups: ["core", "shoulders"],
    instructions: "Start in push-up position. Keep your body in a straight line from head to heels, engaging your core muscles."
  },
  {
    id: "7",
    name: "Shoulder Press",
    type: "strength",
    muscleGroups: ["shoulders", "triceps"],
    instructions: "Hold weights at shoulder height with palms facing forward. Press weights overhead until arms are extended, then lower back to starting position."
  },
  {
    id: "8",
    name: "Bicycle Crunch",
    type: "strength",
    muscleGroups: ["core", "obliques"],
    instructions: "Lie on your back with hands behind head. Bring opposite elbow to opposite knee while extending the other leg."
  },
  {
    id: "9",
    name: "Jumping Rope",
    type: "cardio",
    muscleGroups: ["calves", "shoulders", "cardiovascular"],
    instructions: "Jump with both feet, keeping jumps small and quick. Rotate the rope with wrists, not arms."
  },
  {
    id: "10",
    name: "Downward Dog",
    type: "flexibility",
    muscleGroups: ["hamstrings", "shoulders", "calves"],
    instructions: "Start on hands and knees. Lift hips up and back, straightening legs and pressing chest toward thighs to form an inverted V shape."
  }
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(exercise => exercise.id === id);
};

export const getExercisesByType = (type: string): Exercise[] => {
  return exercises.filter(exercise => exercise.type === type);
};
