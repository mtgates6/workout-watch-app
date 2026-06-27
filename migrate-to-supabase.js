// Run this once in the browser console to migrate existing localStorage data to Supabase.
// Open the app, open DevTools (F12), paste this into the Console tab, and press Enter.

(async () => {
  const SUPABASE_URL = "https://kshlukrsjngsitcxtobo.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaGx1a3Jzam5nc2l0Y3h0b2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDIyMzUsImV4cCI6MjA4MTQ3ODIzNX0.vJ9Zw1FdOB7u5JqZ01ZgFgu_7yNp8UhjHGVD7jugQpk";

  const userId = prompt("Which user is this data for? Type exactly: matthew  or  amy");
  if (!userId || !["matthew", "amy"].includes(userId)) {
    alert("Invalid user. Type 'matthew' or 'amy'.");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Prefer": "return=minimal",
  };

  async function insert(table, rows) {
    if (!rows || rows.length === 0) return;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...headers, "Prefer": "return=minimal,resolution=ignore-duplicates" },
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`Error inserting into ${table}:`, err);
    } else {
      console.log(`✓ Inserted ${rows.length} row(s) into ${table}`);
    }
  }

  // --- Workouts ---
  const workoutData = JSON.parse(localStorage.getItem("fitness_workout_data") || "{}");
  const workouts = workoutData.workouts || [];

  if (workouts.length === 0) {
    console.log("No workouts found in localStorage.");
  }

  for (const workout of workouts) {
    // Insert workout row
    await insert("workouts", [{
      id: workout.id,
      name: workout.name,
      date: workout.date,
      completed: workout.completed,
      planned: workout.planned || false,
      duration: workout.duration || null,
      notes: workout.notes || null,
      user_id: userId,
    }]);

    // Insert exercises
    if (workout.exercises && workout.exercises.length > 0) {
      await insert("workout_exercises", workout.exercises.map((ex, i) => ({
        id: ex.id,
        workout_id: workout.id,
        exercise_id: ex.exercise.id,
        exercise_name: ex.exercise.name,
        exercise_type: ex.exercise.type || "strength",
        muscle_groups: ex.exercise.muscleGroups || [],
        instructions: ex.exercise.instructions || null,
        notes: ex.notes || null,
        sort_order: i,
      })));

      // Insert sets
      for (const ex of workout.exercises) {
        if (ex.sets && ex.sets.length > 0) {
          await insert("workout_sets", ex.sets.map((set, j) => ({
            id: set.id,
            workout_exercise_id: ex.id,
            weight: set.weight != null ? String(set.weight) : null,
            reps: set.reps != null ? String(set.reps) : null,
            duration: set.duration || null,
            distance: set.distance || null,
            completed: set.completed,
            sort_order: j,
          })));
        }
      }
    }

    // Insert planned exercises
    if (workout.plannedExercises && workout.plannedExercises.length > 0) {
      for (const [i, pe] of workout.plannedExercises.entries()) {
        const peId = crypto.randomUUID();
        await insert("planned_exercises", [{
          id: peId,
          workout_id: workout.id,
          exercise_id: pe.id,
          exercise_name: pe.name,
          exercise_type: pe.type || "strength",
          muscle_groups: pe.muscleGroups || [],
          instructions: pe.instructions || null,
          reference_weight: pe.referenceWeight || null,
          reference_reps: pe.referenceReps || null,
          sort_order: i,
        }]);

        if (pe.previousSets && pe.previousSets.length > 0) {
          await insert("planned_exercise_previous_sets", pe.previousSets.map((ps, j) => ({
            planned_exercise_id: peId,
            weight: ps.weight || null,
            reps: ps.reps || null,
            sort_order: j,
          })));
        }
      }
    }
  }

  // --- Health Goals & Entries ---
  const healthData = JSON.parse(localStorage.getItem("fitness_health_data") || "{}");
  const goals = healthData.goals || [];
  const entries = healthData.entries || [];

  if (goals.length > 0) {
    await insert("health_goals", goals.map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      frequency: g.frequency,
      target: g.target || null,
      unit: g.unit || null,
      emoji: g.emoji || null,
      description: g.description || null,
      active: g.active,
      user_id: userId,
    })));
  }

  if (entries.length > 0) {
    await insert("health_entries", entries.map(e => ({
      id: e.id,
      goal_id: e.goalId,
      date: e.date,
      completed: e.completed,
      value: e.value || null,
      notes: e.notes || null,
      completed_at: e.completedAt || null,
      user_id: userId,
    })));
  }

  // --- Custom Exercises ---
  const customExercises = JSON.parse(localStorage.getItem("custom_exercises") || "[]");
  if (customExercises.length > 0) {
    await insert("custom_exercises", customExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      type: ex.type || "strength",
      muscle_groups: ex.muscleGroups || [],
      instructions: ex.instructions || null,
      user_id: userId,
    })));
  }

  console.log("✅ Migration complete! Refresh the page and select your user.");
})();
