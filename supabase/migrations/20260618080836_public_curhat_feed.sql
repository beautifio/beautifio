-- Allow anonymous users to read visible curhat posts (needed for homepage feed)
DROP POLICY IF EXISTS "Curhat visible posts readable by all authenticated" ON curhat_posts;
CREATE POLICY "Curhat visible posts readable by everyone" ON curhat_posts
  FOR SELECT USING (status = 'visible');
