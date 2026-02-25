
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
    muscleGroups: ["quads", "hamstrings", "glutes"],
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
    name: "Pec Deck",
    type: "strength",
    muscleGroups: ["chest", "shoulders"],
    instructions: "Sit on the machine with your back against the pad. Adjust the seat height so that your arms are at shoulder level. Grasp the handles and bring them together in front of you, then return to start."
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
    name: "Kickbacks",
    type: "strength",
    muscleGroups: ["triceps", "shoulders"],
    instructions: "Stand with feet shoulder-width apart, holding a dumbbell in each hand. Bend at the waist with a flat back, keeping elbows close to your body. Extend your arms back until they are straight, then return to start."
  },
  {
    id: "9",
    name: "Overhead Tricep Extension",
    type: "strength",
    muscleGroups: ["triceps", "shoulders"],
    instructions: "Stand with feet shoulder-width apart, holding a dumbbell with both hands above your head. Keeping your elbows close to your ears, lower the weight behind your head, then press it back up."
  },
  {
    id: "10",
    name: "Shrugs",
    type: "strength",
    muscleGroups: ["shoulders", "back"],
    instructions: "Stand with feet shoulder-width apart, holding dumbbells at your sides. Raise your shoulders toward your ears as high as possible, then lower back down."
  },
  {
    id: "11",
    name: "Dumbbell Row",
    type: "strength",
    muscleGroups: ["back", "biceps"],
    instructions: "Place one knee and hand on a bench, with the other foot on the floor. Hold a dumbbell in your free hand, arm extended. Pull the weight up to your side while keeping your back flat."
  },
  {
    id: "12",
    name: "Barbell Curl",
    type: "strength",
    muscleGroups: ["biceps"],
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
    muscleGroups: ["quads", "hamstrings", "glutes"],
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
    name: "Romanian Deadlift (RDL)",
    type: "strength",
    muscleGroups: ["hamstrings", "glutes", "back"],
    instructions: "Stand holding a barbell in front of your thighs. Keeping your back straight and knees slightly bent, hinge at the hips to lower the bar toward the floor, then return to standing."
  },
  {
    id: "17",
    name: "Incline Bench Press",
    type: "strength",
    muscleGroups: ["chest", "shoulders", "triceps"],
    instructions: "Lie on an incline bench with feet on the floor. Grip the barbell with hands wider than shoulder-width. Lower the bar to your upper chest, then press back up."
  },
  {
    id: "18",
    name: "Face Pull",
    type: "strength",
    muscleGroups: ["shoulders", "back"],
    instructions: "Stand facing a cable machine with rope attachment at head height. Pull the rope toward your face, separating the ends as you pull, then slowly return to start."
  },
  {
    id: "19",
    name: "Dumbbell Lateral Raise",
    type: "strength",
    muscleGroups: ["shoulders"],
    instructions: "Stand holding dumbbells at your sides. Keeping a slight bend in the elbows, raise the weights out to the sides until arms are parallel to the floor, then lower with control."
  },
  {
    id: "20",
    name: "Cable Crossover",
    type: "strength",
    muscleGroups: ["chest", "shoulders"],
    instructions: "Stand between two cable machines with handles at chest height. With arms extended, pull the handles forward and across your body, then slowly return to the starting position."
  },
  {
    id: "21",
    name: "Seated Row",
    type: "strength",
    muscleGroups: ["back", "biceps"],
    instructions: "Sit at a cable row machine with feet on the platform. Grasp the handle with both hands, keeping your back straight. Pull the handle toward your abdomen, squeezing your shoulder blades together, then return to start."
  },
  {
    id: "22",
    name: "Leg Curl",
    type: "strength",
    muscleGroups: ["hamstrings"],
    instructions: "Lie face down on a leg curl machine with ankles under the pad. Curl your legs up toward your butt, then lower back to start."
  },
  {
    id: "23",
    name: "Calf Raise",
    type: "strength",
    muscleGroups: ["calves"],
    instructions: "Stand on the edge of a step with heels hanging off. Raise your heels as high as possible, then lower them below the step level."
  },
  {
    id: "24",
    name: "Chest Fly",
    type: "strength",
    muscleGroups: ["chest", "shoulders"],
    instructions: "Lie on a bench with dumbbells in each hand, arms extended above your chest. Lower the weights out to the sides in a wide arc, then bring them back together over your chest."
  },
  {
    id: "25",
    name: "Russian Twist",
    type: "strength",
    muscleGroups: ["core"],
    instructions: "Sit on the floor with knees bent and feet flat. Lean back slightly, holding a weight with both hands. Rotate your torso to one side, then the other, while keeping your core engaged."
  },
  {
    id: "26",
    name: "Preacher Curl",
    type: "strength",
    muscleGroups: ["biceps"],
    instructions: "Sit at a preacher curl bench with your upper arms resting on the pad. Hold a barbell or dumbbell with an underhand grip. Curl the weight up toward your shoulders, then lower with control."
  },
  {
    id: "27",
    name: "Skull Crusher",
    type: "strength",
    muscleGroups: ["triceps"],
    instructions: "Lie on a bench holding a barbell or dumbbells above your chest. Lower the weight toward your forehead by bending your elbows, then press back up."
  },
  {
    id: "28",
    name: "Leg Extension",
    type: "strength",
    muscleGroups: ["quads"],
    instructions: "Sit on a leg extension machine with ankles under the pad. Extend your legs until they are straight, then lower back to start."
  },
  {
    id: "29",
    name: "Hip Thrust",
    type: "strength",
    muscleGroups: ["glutes", "hamstrings"],
    instructions: "Sit on the ground with your upper back against a bench and feet flat on the floor. Roll a barbell over your hips. Drive through your heels to lift your hips toward the ceiling, squeezing your glutes at the top."
  },
  {
    id: "30",
    name: "Cable Tricep Pushdown",
    type: "strength",
    muscleGroups: ["triceps"],
    instructions: "Stand facing a cable machine with a rope or straight bar attachment. Grasp the handle with both hands, elbows close to your body. Push the handle down until your arms are fully extended, then return to start."
  },
  {
    id: "31",
    name: "Seated Dumbbell Shoulder Press",
    type: "strength",
    muscleGroups: ["shoulders", "triceps"],
    instructions: "Sit on a bench with back support, holding dumbbells at shoulder height. Press the weights overhead until arms are fully extended, then lower back to starting position."
  },
  {
    id: "32",
    name: "Cable Lateral Raise",
    type: "strength",
    muscleGroups: ["shoulders"],
    instructions: "Stand next to a cable machine with the pulley at the lowest setting. Grasp the handle with one hand and raise it out to the side until your arm is parallel to the floor, then lower with control."
  },
  {
    id: "33",
    name: "Dumbbell Fly",
    type: "strength",
    muscleGroups: ["chest", "shoulders"],
    instructions: "Lie on a bench holding dumbbells above your chest. Lower the weights out to the sides in a wide arc, then bring them back together over your chest."
  },
  {
    id: "34",
    name: "Cable Face Pull",
    type: "strength",
    muscleGroups: ["shoulders", "back"],
    instructions: "Stand facing a cable machine with the pulley at head height. Grasp the rope attachment with both hands and pull it toward your face, separating the ends as you pull, then slowly return to start."
  },
  {
    id: "35",
    name: "Dumbbell Bench Press",
    type: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    instructions: "Lie on a bench holding dumbbells at chest level. Press the weights overhead until arms are fully extended, then lower back to starting position."
  },
  {
    id: "36",
    name: "Cable Row",
    type: "strength",
    muscleGroups: ["back", "biceps"],
    instructions: "Sit at a cable row machine with feet on the platform. Grasp the handle with both hands, keeping your back straight. Pull the handle toward your abdomen, squeezing your shoulder blades together, then return to start."   
  },
  {
    id: "37",
    name: "Chest Supported Row",
    type: "strength",
    muscleGroups: ["back", "biceps"],
    instructions: "Lie face down on an incline bench with a dumbbell in each hand. Pull the weights up toward your sides, squeezing your shoulder blades together, then lower with control."  
  },
  {
    id: "38",
    name: "Hack Squat",
    type: "strength",
    muscleGroups: ["quads", "hamstrings", "glutes"],
    instructions: "Stand on a hack squat machine with feet shoulder-width apart. Lower your body by bending your knees and pushing your hips back, then press back up to standing." 
  },
  {
    id: "39",
    name: "Cable Crunch",
    type: "strength",
    muscleGroups: ["core"],
    instructions: "Kneel in front of a cable machine with the pulley at the highest setting. Grasp the rope attachment and pull it down to your shoulders. Crunch your abs, bringing your elbows toward your knees, then return to start."
  },
  {
    id: "40",
    name: "Lunges",
    type: "strength",
    muscleGroups: ["quads", "hamstrings", "glutes"],
    instructions: "Stand with feet shoulder-width apart. Step forward with one leg, lowering your body until both knees are bent at 90 degrees. Push back to starting position and repeat on the other leg."  
  },
  {
    id: "41",
    name: " Dumbbell Squat",
    type: "strength",
    muscleGroups: ["quads", "hamstrings", "glutes"],  
    instructions: "Stand with feet shoulder-width apart, holding a dumbbell in each hand. Lower your body by bending your knees and pushing your hips back, then return to standing."
  },
  {
    id: "42",
    name: "Hammer Curl",
    type: "strength",
    muscleGroups: ["biceps"],
    instructions: "Stand with feet shoulder-width apart, holding dumbbells at your sides with palms facing each other. Curl the weights up toward your shoulders, keeping elbows close to your body, then lower with control."
  },
  {
    id: "43",
    name: "Step Ups",
    type: "strength",
    muscleGroups: ["quads", "hamstrings", "glutes"],
    instructions: "Stand in front of a bench or step. Step up with one foot, pressing through your heel to lift your body up. Step back down and repeat on the other leg."
  },
  {
    id: "44",
    name: "Dumbbell Curl",
    type: "strength",
    muscleGroups: ["biceps"],
    instructions: "Stand with feet shoulder-width apart, holding a dumbbell in each hand. Curl the weights up toward your shoulders, keeping elbows close to your body, then lower with control."
  },
  {
    id: "45",
    name: "Standing Lateral Raise Machine",
    type: "strength",
    muscleGroups: ["shoulders"],
    instructions: "Stand in a lateral raise machine with your arms at your sides. Raise the weights out to the sides until your arms are parallel to the floor, then lower with control."
  },
  {
    id: "46",
    name: "Rear Delt Fly",
    type: "strength",
    muscleGroups: ["shoulders", "back"],
    instructions: "Sit in a rear delt fly machine with your chest against the pad. Grasp the handles and pull them out to the sides, squeezing your shoulder blades together, then return to start."
  },
  {
    id: "47",
    name: "Machine Chest Press",
    type: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    instructions: "Sit in a chest press machine with your back against the pad. Grasp the handles and press them forward until arms are fully extended, then return to start."
  },
  {
    id: "48",
    name: "Hip Abduction",
    type: "strength",
    muscleGroups: ["glutes"],
    instructions: "Sit in a hip abduction machine with your back against the pad. Push the pads away from each other, then return to start."
  },
  {
    id: "49",
    name: "Hip Adduction",
    type: "strength",
    muscleGroups: ["glutes"],
    instructions: "Sit in a hip adduction machine with your back against the pad. Push the pads together, then return to start."
  },
  {
    id: "50",
    name: "Close Grip Bench Press",
    type: "strength",
    muscleGroups: ["triceps", "chest"],
    instructions: "Lie on a bench with feet on the ground. Grip the barbell with hands closer than shoulder-width apart. Lower the barbell to your chest, then press it back up."
  },
  {
    id: "51",
    name: "Incline Machine Press",
    type: "strength",
    muscleGroups: ["chest", "shoulders", "triceps"],
    instructions: "Sit in an incline machine press with your back against the pad. Grasp the handles and press them forward until arms are fully extended, then return to start."
  },
  {
    id: "52",
    name: "Decline Bench Press",
    type: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    instructions: "Lie on a decline bench with feet on the ground. Grip the barbell with hands wider than shoulder-width. Lower the bar to your lower chest, then press back up."
  },
  {
    id: "53",
    name: "Bicep Pull Down",
    type: "strength",
    muscleGroups: ["biceps", "back"],
    instructions: "Set up on a lat pull down and squeeze biceps to your chin."
  },
  {
    id: "54",
    name: "Bulgarian Split Squat",
    type: "strength",
    muscleGroups: ["quads", "hamstrings", "glutes"],
    instructions: "Stand a few feet in front of a bench with one foot resting on the bench behind you. Lower your body by bending your front knee until your thigh is parallel to the ground. Push through your front heel to return to the starting position."
  },
  {
    id: "55",
    name: "Back Extension",
    type: "strength",
    muscleGroups:["hamstrings", "back", "glutes"],
    instructions: "Using a back extension bench (Roman chair), place your feet securely, adjust the pad to just below your hip crease, and lower your torso slowly. Contract your glutes and lower back to raise your body until it is in a straight line with your legs, avoiding hyperextension"
  },
  {
    id: "56",
    name: "Tricep Kickback",
    type: "strength",
    muscleGroups:["triceps"],
    instructions: "extending the arm at the elbow while keeping the upper arm stationary, often performed with a slight forward lean or a lean back"
  },
  {
    id: "57",
    name: "Hanging Leg Raise",
    type: "strength",
    muscleGroups: ["core"],
    instructions: "Hang from a pull-up bar with arms fully extended, engage core and raise legs by flexing hips and knees until thighs are parallel to ground or higher, lower with control"
  },
  {
    id: "58",
    name: "Dumbbell Pullover",
    type: "strength",
    muscleGroups: ["back"],
    instructions: "Lie perpendicular on bench with upper back supported, hold one dumbbell with both hands above chest, lower weight back over head in an arc while keeping slight elbow bend, pull back to start position"
  }

];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(exercise => exercise.id === id);
};

export const getExercisesByType = (type: string): Exercise[] => {
  return exercises.filter(exercise => exercise.type === type);
};
