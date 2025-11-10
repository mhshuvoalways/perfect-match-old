
-- Enable Row Level Security on ai_match_results table
ALTER TABLE ai_match_results ENABLE ROW LEVEL SECURITY;

-- Create policy for parents to view their own AI match results
CREATE POLICY "Parents can view their own AI match results" ON ai_match_results
FOR SELECT USING (auth.uid() = parent_id);

-- Create policy for parents to insert their own AI match results
CREATE POLICY "Parents can create their own AI match results" ON ai_match_results
FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Create policy for parents to update their own AI match results
CREATE POLICY "Parents can update their own AI match results" ON ai_match_results
FOR UPDATE USING (auth.uid() = parent_id);

-- Create policy for parents to delete their own AI match results
CREATE POLICY "Parents can delete their own AI match results" ON ai_match_results
FOR DELETE USING (auth.uid() = parent_id);

-- Enable Row Level Security on resume_library table
ALTER TABLE resume_library ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own resume library items
CREATE POLICY "Users can view their own resume library items" ON resume_library
FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own resume library items
CREATE POLICY "Users can create their own resume library items" ON resume_library
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own resume library items
CREATE POLICY "Users can update their own resume library items" ON resume_library
FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own resume library items
CREATE POLICY "Users can delete their own resume library items" ON resume_library
FOR DELETE USING (auth.uid() = user_id);
