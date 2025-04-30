
import { Exercise } from "@/types/workout";

export const exercises: Exercise[] = [
  {
    id: "1",
    name: "Bench Press",
    type: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
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
  },
  {
    id: "11",
    name: "Dumbbell Row",
    type: "strength",
    muscleGroups: ["back", "biceps", "forearms"],
    instructions: "Place one knee and hand on a bench, with the other foot on the floor. Hold a dumbbell in your free hand, arm extended. Pull the weight up to your side while keeping your back flat."
  },
  {
    id: "12",
    name: "Barbell Curl",
    type: "strength",
    muscleGroups: ["biceps", "forearms"],
    instructions: "Stand with feet shoulder-width apart, holding a barbell with an underhand grip. Keeping elbows close to sides, curl the weight up toward your shoulders, then lower with control."
  },
  {
    id: "13",
    name: "Tricep Dips",
    type: "strength",
    muscleGroups: ["triceps", "shoulders"],
    instructions: "Sit on the edge of a bench or chair, hands gripping the edge. Slide your butt off the bench, lower your body by bending your elbows, then push back up."
  },
  {
    id: "14",
    name: "Leg Press",
    type: "strength",
    muscleGroups: ["quadriceps", "hamstrings", "glutes"],
    instructions: "Sit in the leg press machine with feet on the platform shoulder-width apart. Release the safety bars, lower the platform by bending your knees, then push it back up."
  },
  {
    id: "15",
    name: "Lat Pulldown",
    type: "strength",
    muscleGroups: ["back", "biceps", "shoulders"],
    instructions: "Sit at a lat pulldown machine, grasp the bar with a wide grip. Pull the bar down to chest level while keeping your back straight, then slowly return to the starting position."
  },
  {
    id: "16",
    name: "Romanian Deadlift",
    type: "strength",
    muscleGroups: ["hamstrings", "glutes", "lower back"],
    instructions: "Stand holding a barbell in front of your thighs. Keeping your back straight and knees slightly bent, hinge at the hips to lower the bar toward the floor, then return to standing."
  },
  {
    id: "17",
    name: "Incline Bench Press",
    type: "strength",
    muscleGroups: ["upper chest", "shoulders", "triceps"],
    instructions: "Lie on an incline bench with feet on the floor. Grip the barbell with hands wider than shoulder-width. Lower the bar to your upper chest, then press back up."
  },
  {
    id: "18",
    name: "Face Pull",
    type: "strength",
    muscleGroups: ["rear delts", "upper back", "rotator cuff"],
    instructions: "Stand facing a cable machine with rope attachment at head height. Pull the rope toward your face, separating the ends as you pull, then slowly return to start."
  },
  {
    id: "19",
    name: "Dumbbell Lateral Raise",
    type: "strength",
    muscleGroups: ["shoulders", "traps"],
    instructions: "Stand holding dumbbells at your sides. Keeping a slight bend in the elbows, raise the weights out to the sides until arms are parallel to the floor, then lower with control."
  },
  {
    id: "20",
    name: "Cable Crossover",
    type: "strength",
    muscleGroups: ["chest", "shoulders"],
    instructions: "Stand between two cable machines with handles at chest height. With arms extended, pull the handles forward and across your body, then slowly return to the starting position."
  }
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(exercise => exercise.id === id);
};

export const getExercisesByType = (type: string): Exercise[] => {
  return exercises.filter(exercise => exercise.type === type);
};
