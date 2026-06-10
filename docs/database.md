# Beautifio — Database Specification

**Version:** 1.0
**Status:** Draft
**Last Updated:** June 2026
**Platform:** Supabase (PostgreSQL)

---

## 1. Conventions

- **Naming:** snake_case
- **Timestamps:** All tables include `created_at` and `updated_at`
- **UUID:** All primary keys use UUID v4
- **Soft delete:** All tables include `deleted_at` nullable
- **Indexes:** Foreign keys and frequently queried columns are indexed
- **RLS:** Row Level Security enabled on all tables

---

## 2. Tables

### 2.1 `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| full_name | VARCHAR(100) | NOT NULL | Display name |
| role | user_role | NOT NULL, DEFAULT 'user' | user, mentor, admin |
| avatar_url | TEXT | | Profile picture URL |
| bio | TEXT | | Short biography |
| city | VARCHAR(100) | | User's city/region |
| phone | VARCHAR(20) | | Contact number |
| status | user_status | NOT NULL, DEFAULT 'active' | active, suspended, banned |
| is_verified | BOOLEAN | DEFAULT false | Email verification |
| last_active_at | TIMESTAMPTZ | | Last activity timestamp |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | | Soft delete |

**Indexes:**
- `idx_users_email` ON email
- `idx_users_role` ON role
- `idx_users_created_at` ON created_at

**RLS Policies:**
- Users can read own profile
- Admin can read all
- Users can update own profile (non-role fields)

---

### 2.2 `user_goals`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), NOT NULL | Reference to user |
| goal_name | VARCHAR(200) | NOT NULL | Goal title |
| goal_category | goal_category | NOT NULL | karir, pendidikan, skill, bisnis |
| target_date | DATE | | Target completion date |
| status | goal_status | DEFAULT 'active' | active, completed, archived |
| progress | INTEGER | DEFAULT 0, CHECK (0-100) | Completion percentage |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | | |

**Indexes:**
- `idx_user_goals_user_id` ON user_id
- `idx_user_goals_category` ON goal_category

**RLS:** Users can CRUD own goals only.

---

### 2.3 `circles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(150) | NOT NULL | Circle name |
| description | TEXT | | Circle description |
| goal_category | goal_category | | Linked goal category |
| mentor_id | UUID | FK → users(id), NULL | Assigned mentor |
| cover_url | TEXT | | Cover image |
| capacity | INTEGER | DEFAULT 50 | Max members |
| member_count | INTEGER | DEFAULT 0 | Current members |
| status | circle_status | DEFAULT 'active' | active, full, inactive |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | | |

**Indexes:**
- `idx_circles_category` ON goal_category
- `idx_circles_mentor` ON mentor_id

**RLS:**
- Anyone can read active circles
- Mentor can update assigned circle
- Admin has full access

---

### 2.4 `circle_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| circle_id | UUID | FK → circles(id), NOT NULL | Reference to circle |
| user_id | UUID | FK → users(id), NOT NULL | Reference to user |
| role | member_role | DEFAULT 'member' | member, co-host |
| joined_at | TIMESTAMPTZ | DEFAULT now() | |
| left_at | TIMESTAMPTZ | | When member left |

**Unique:** UNIQUE(circle_id, user_id)

**Indexes:**
- `idx_circle_members_circle` ON circle_id
- `idx_circle_members_user` ON user_id

---

### 2.5 `messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| circle_id | UUID | FK → circles(id), NOT NULL | Reference to circle |
| sender_id | UUID | FK → users(id), NOT NULL | Message sender |
| parent_id | UUID | FK → messages(id) | Reply to message |
| message | TEXT | NOT NULL | Message content |
| message_type | message_type | DEFAULT 'text' | text, image, system |
| is_pinned | BOOLEAN | DEFAULT false | Pinned by mentor |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

**Indexes:**
- `idx_messages_circle` ON circle_id
- `idx_messages_sender` ON sender_id
- `idx_messages_created` ON (circle_id, created_at DESC)

---

### 2.6 `mentor_questions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| circle_id | UUID | FK → circles(id), NOT NULL | Reference to circle |
| user_id | UUID | FK → users(id), NOT NULL | Question author |
| title | VARCHAR(200) | NOT NULL | Question title |
| content | TEXT | NOT NULL | Question detail |
| is_answered | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

---

### 2.7 `mentor_answers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| question_id | UUID | FK → mentor_questions(id), NOT NULL | Reference to question |
| mentor_id | UUID | FK → users(id), NOT NULL | Mentor who answered |
| content | TEXT | NOT NULL | Answer content |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

---

### 2.8 `mentor_profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), UNIQUE, NOT NULL | Reference to user |
| bio | TEXT | | Mentor biography |
| expertise | TEXT[] | NOT NULL | Array of expertise areas |
| company | VARCHAR(150) | | Current company |
| position | VARCHAR(150) | | Current position |
| years_experience | INTEGER | | Years of experience |
| verification_status | verification_status | DEFAULT 'pending' | pending, verified, rejected |
| is_available | BOOLEAN | DEFAULT true | Accepting mentees |
| max_mentees | INTEGER | DEFAULT 10 | Maximum mentees |
| session_link | TEXT | | Calendly/external link |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

---

### 2.9 `mentor_sessions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| mentor_id | UUID | FK → users(id), NOT NULL | Reference to mentor |
| circle_id | UUID | FK → circles(id), NULL | Linked circle |
| title | VARCHAR(200) | NOT NULL | Session title |
| description | TEXT | | Session description |
| session_date | TIMESTAMPTZ | NOT NULL | Scheduled date/time |
| duration_minutes | INTEGER | DEFAULT 30 | Session duration |
| max_participants | INTEGER | DEFAULT 20 | |
| status | session_status | DEFAULT 'scheduled' | scheduled, ongoing, completed, cancelled |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

---

### 2.10 `opportunities`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| title | VARCHAR(200) | NOT NULL | Opportunity title |
| category | opp_category | NOT NULL | beasiswa, magang, kompetisi, workshop |
| organization | VARCHAR(200) | NOT NULL | Organizer name |
| description | TEXT | | Full description |
| requirements | TEXT | | Requirements list |
| location | VARCHAR(200) | | Location or 'Remote' |
| deadline | DATE | NOT NULL | Application deadline |
| url | TEXT | | External application link |
| contact_email | VARCHAR(255) | | Contact information |
| is_featured | BOOLEAN | DEFAULT false | Featured on home |
| is_active | BOOLEAN | DEFAULT true | |
| created_by | UUID | FK → users(id) | Admin who posted |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | | |

**Indexes:**
- `idx_opportunities_category` ON category
- `idx_opportunities_deadline` ON deadline
- `idx_opportunities_active` ON is_active

---

### 2.11 `saved_opportunities`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), NOT NULL | |
| opportunity_id | UUID | FK → opportunities(id), NOT NULL | |
| has_applied | BOOLEAN | DEFAULT false | |
| saved_at | TIMESTAMPTZ | DEFAULT now() | |

**Unique:** UNIQUE(user_id, opportunity_id)

---

### 2.12 `milestones`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), NOT NULL | |
| goal_id | UUID | FK → user_goals(id), NOT NULL | |
| title | VARCHAR(200) | NOT NULL | Milestone name |
| description | TEXT | | Milestone details |
| order_index | INTEGER | NOT NULL | Sequence number |
| resources | TEXT[] | | Resource links |
| status | milestone_status | DEFAULT 'locked' | locked, available, in_progress, completed |
| completed_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

**Indexes:**
- `idx_milestones_user_goal` ON (user_id, goal_id)
- `idx_milestones_order` ON (goal_id, order_index)

---

### 2.13 `reports`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| reporter_id | UUID | FK → users(id), NOT NULL | User who reported |
| target_type | report_target | NOT NULL | message, user, circle, opportunity |
| target_id | UUID | NOT NULL | ID of reported entity |
| reason | TEXT | NOT NULL | Report reason |
| status | report_status | DEFAULT 'pending' | pending, reviewed, resolved, dismissed |
| handled_by | UUID | FK → users(id) | Admin who handled |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

---

### 2.14 `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), NOT NULL | Notification recipient |
| type | notif_type | NOT NULL | message, mentor_reply, milestone, opportunity, system |
| title | VARCHAR(200) | NOT NULL | Notification title |
| body | TEXT | | Notification body |
| data | JSONB | | Extra payload |
| is_read | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

**Indexes:**
- `idx_notifications_user` ON (user_id, is_read, created_at DESC)

---

## 3. Enums

```sql
CREATE TYPE user_role AS ENUM ('user', 'mentor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE goal_category AS ENUM ('karir', 'pendidikan', 'skill', 'bisnis');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE circle_status AS ENUM ('active', 'full', 'inactive');
CREATE TYPE member_role AS ENUM ('member', 'co-host');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE opp_category AS ENUM ('beasiswa', 'magang', 'kompetisi', 'workshop');
CREATE TYPE milestone_status AS ENUM ('locked', 'available', 'in_progress', 'completed');
CREATE TYPE report_target AS ENUM ('message', 'user', 'circle', 'opportunity');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE notif_type AS ENUM ('message', 'mentor_reply', 'milestone', 'opportunity', 'system');
```

---

## 4. Relationships

```
users 1──N user_goals
users 1──N circle_members
users 1──N messages
users 1──N mentor_questions
users 1──N mentor_answers
users 1──1 mentor_profiles
users 1──N mentor_sessions
users 1──N saved_opportunities
users 1──N milestones
users 1──N notifications
users 1──N reports (as reporter)

circles 1──N circle_members
circles 1──N messages
circles 1──N mentor_questions
circles N──1 users (as mentor)

opportunities 1──N saved_opportunities
user_goals 1──N milestones
mentor_questions 1──N mentor_answers
```

---

## 5. Row Level Security (RLS) Summary

| Table | User can read | User can write | Mentor can | Admin can |
|-------|---------------|----------------|------------|-----------|
| users | Own row | Own row (limited) | - | All |
| user_goals | Own | Own CRUD | - | All |
| circles | Active only | - | Update assigned | All CRUD |
| circle_members | Own | Join/leave | Add members | All |
| messages | Own circles | Own circles | Delete any | All |
| mentor_questions | Own circles | Own | Answer | All |
| mentor_answers | Own circles | - | Create | All |
| mentor_profiles | All | Own | Own | All |
| mentor_sessions | Own circles | - | Create | All |
| opportunities | Active only | - | - | All CRUD |
| saved_opportunities | Own | Own | - | All |
| milestones | Own | Own | - | All |
| reports | Own | Create | - | All |
| notifications | Own | - | - | - |

---

## 6. Future Tables (Post-MVP)

- `jobs` — Job listings marketplace
- `scholarships` — Detailed scholarship info
- `badges` — Achievement system
- `achievements` — User achievements
- `bookmarks` — General bookmarking
- `sessions_attendees` — Mentor session attendance
- `circle_waitlist` — Full circle waitlist
- `user_settings` — Notification preferences
