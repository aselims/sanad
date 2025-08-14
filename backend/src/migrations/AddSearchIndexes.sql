-- Full-text search indexes for AI search optimization
-- This script adds GIN indexes for improved text search performance

-- Users search index
CREATE INDEX IF NOT EXISTS idx_users_fulltext_search ON users USING GIN(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(email, '') || ' ' || 
    COALESCE(organization, '') || ' ' || 
    COALESCE(bio, '') || ' ' || 
    COALESCE(role, '')
  )
);

-- Challenges search index
CREATE INDEX IF NOT EXISTS idx_challenges_fulltext_search ON challenges USING GIN(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(organization, '')
  )
);

-- Partnerships search index  
CREATE INDEX IF NOT EXISTS idx_partnerships_fulltext_search ON partnerships USING GIN(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(array_to_string(participants, ' '), '')
  )
);

-- Ideas search index
CREATE INDEX IF NOT EXISTS idx_ideas_fulltext_search ON ideas USING GIN(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(category, '') || ' ' || 
    COALESCE(target_audience, '') || ' ' || 
    COALESCE(potential_impact, '') || ' ' || 
    COALESCE(resources_needed, '') || ' ' ||
    COALESCE(array_to_string(participants, ' '), '')
  )
);

-- Additional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_stage ON ideas(stage);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);

-- Create a view for optimized search queries
CREATE OR REPLACE VIEW v_searchable_content AS
SELECT 
  'user' as entity_type,
  id,
  first_name || ' ' || last_name as title,
  COALESCE(bio, first_name || ' ' || last_name || ' - ' || role || ' at ' || COALESCE(organization, 'Unknown')) as description,
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(email, '') || ' ' || 
    COALESCE(organization, '') || ' ' || 
    COALESCE(bio, '') || ' ' || 
    COALESCE(role, '')
  ) as search_vector,
  created_at
FROM users 
WHERE is_active = true

UNION ALL

SELECT 
  'challenge' as entity_type,
  id,
  title,
  description,
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(organization, '')
  ) as search_vector,
  created_at
FROM challenges

UNION ALL

SELECT 
  'partnership' as entity_type,
  id,
  title,
  description,
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(array_to_string(participants, ' '), '')
  ) as search_vector,
  created_at
FROM partnerships

UNION ALL

SELECT 
  'idea' as entity_type,
  id,
  title,
  description,
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(category, '') || ' ' || 
    COALESCE(target_audience, '') || ' ' || 
    COALESCE(potential_impact, '') || ' ' || 
    COALESCE(resources_needed, '') || ' ' ||
    COALESCE(array_to_string(participants, ' '), '')
  ) as search_vector,
  created_at
FROM ideas;

-- Create index on the search view
CREATE INDEX IF NOT EXISTS idx_searchable_content_vector ON v_searchable_content USING GIN(search_vector);