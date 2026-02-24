
-- Drop all restrictive policies and recreate as permissive

DROP POLICY IF EXISTS "Users can manage their own workouts" ON public.workouts;
CREATE POLICY "Users can manage their own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own workout exercises" ON public.workout_exercises;
CREATE POLICY "Users can manage their own workout exercises" ON public.workout_exercises FOR ALL USING (EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own workout sets" ON public.workout_sets;
CREATE POLICY "Users can manage their own workout sets" ON public.workout_sets FOR ALL USING (EXISTS (SELECT 1 FROM workout_exercises we JOIN workouts w ON w.id = we.workout_id WHERE we.id = workout_sets.workout_exercise_id AND w.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM workout_exercises we JOIN workouts w ON w.id = we.workout_id WHERE we.id = workout_sets.workout_exercise_id AND w.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own planned exercises" ON public.planned_exercises;
CREATE POLICY "Users can manage their own planned exercises" ON public.planned_exercises FOR ALL USING (EXISTS (SELECT 1 FROM workouts w WHERE w.id = planned_exercises.workout_id AND w.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM workouts w WHERE w.id = planned_exercises.workout_id AND w.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own planned exercise sets" ON public.planned_exercise_previous_sets;
CREATE POLICY "Users can manage their own planned exercise sets" ON public.planned_exercise_previous_sets FOR ALL USING (EXISTS (SELECT 1 FROM planned_exercises pe JOIN workouts w ON w.id = pe.workout_id WHERE pe.id = planned_exercise_previous_sets.planned_exercise_id AND w.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM planned_exercises pe JOIN workouts w ON w.id = pe.workout_id WHERE pe.id = planned_exercise_previous_sets.planned_exercise_id AND w.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own health goals" ON public.health_goals;
CREATE POLICY "Users can manage their own health goals" ON public.health_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own health entries" ON public.health_entries;
CREATE POLICY "Users can manage their own health entries" ON public.health_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own custom exercises" ON public.custom_exercises;
CREATE POLICY "Users can manage their own custom exercises" ON public.custom_exercises FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
