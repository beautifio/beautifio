# DATABASE SCHEMA

**Project:** Beautifio
**Total Tables:** 29
**Last Updated:** 2026-06-11

---

## Table of Contents

1. [users](#users)
2. [user_goals](#user_goals)
3. [circles](#circles)
4. [circle_members](#circle_members)
5. [messages](#messages)
6. [milestones](#milestones)
7. [opportunities](#opportunities)
8. [saved_opportunities](#saved_opportunities)
9. [story_categories](#story_categories)
10. [stories](#stories)
11. [story_likes](#story_likes)
12. [story_saves](#story_saves)
13. [story_comments](#story_comments)
14. [story_recommendations](#story_recommendations)
15. [roadmap_templates](#roadmap_templates)
16. [roadmap_template_milestones](#roadmap_template_milestones)
17. [roadmap_template_recommendations](#roadmap_template_recommendations)
18. [journals](#journals)
19. [journal_entries](#journal_entries)
20. [journal_milestones](#journal_milestones)
21. [journal_followers](#journal_followers)
22. [journal_reactions](#journal_reactions)
23. [familia_merchants](#familia_merchants)
24. [familia_affiliate_deals](#familia_affiliate_deals)
25. [familia_achievement_rewards](#familia_achievement_rewards)
26. [familia_voucher_sessions](#familia_voucher_sessions)
27. [familia_redemption_log](#familia_redemption_log)
28. [familia_user_achievements](#familia_user_achievements)
29. [familia_event_benefits](#familia_event_benefits)

---

## users

**Core user profiles.** Created via trigger on `auth.users` INSERT.

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK, FK → `auth.users(id)` ON DELETE CASCADE | |
| `email` | `TEXT` | NOT NULL | |
| `full_name` | `TEXT` | NOT NULL | `''` |
| `avatar_url` | `TEXT` | | |
| `bio` | `TEXT` | | `''` |
| `city` | `TEXT` | | `''` |
| `interests` | `TEXT[]` | | `{}` |
| `goals` | `TEXT[]` | | `{}` |
| `role` | `TEXT` | CHECK (`user`, `mentor`, `admin`) | `'user'` |
| `status` | `TEXT` | CHECK (`active`, `suspended`, `banned`) | `'active'` |
| `is_verified` | `BOOLEAN` | NOT NULL | `false` |
| `onboarding_completed` | `BOOLEAN` | NOT NULL | `false` |
| `last_active_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:** None (PK only)

**Triggers:**
- `on_auth_user_created` — AFTER INSERT on `auth.users` → calls `handle_new_user()`

**Functions:**
- `handle_new_user()` — SECURITY DEFINER, inserts row into `users` from `NEW.raw_user_meta_data`

**RLS Policies:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Users can view own profile | SELECT | `auth.uid() = id` |
| Users can update own profile | UPDATE | `auth.uid() = id` |
| System can insert profiles | INSERT | `true` (SECURITY DEFINER) |

---

## user_goals

**User-defined goals from onboarding or manual creation.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `goal_name` | `TEXT` | NOT NULL | |
| `goal_category` | `TEXT` | NOT NULL, CHECK (`karir`, `pendidikan`, `skill`, `bisnis`) | |
| `target_date` | `TIMESTAMPTZ` | | |
| `status` | `TEXT` | NOT NULL, CHECK (`active`, `completed`, `archived`) | `'active'` |
| `progress` | `INT` | NOT NULL | `0` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_user_goals_user` ON `user_id`
- `idx_user_goals_status` ON `status`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Users can view own goals | SELECT | `auth.uid() = user_id` |
| Users can create own goals | INSERT | `auth.uid() = user_id` |
| Users can update own goals | UPDATE | `auth.uid() = user_id` |
| Users can delete own goals | DELETE | `auth.uid() = user_id` |

---

## circles

**Community groups users can join.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `name` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `goal_category` | `TEXT` | NOT NULL | |
| `mentor_id` | `UUID` | FK → `users(id)` ON DELETE SET NULL | |
| `cover_url` | `TEXT` | | |
| `capacity` | `INT` | NOT NULL | `50` |
| `member_count` | `INT` | NOT NULL | `0` |
| `status` | `TEXT` | NOT NULL, CHECK (`active`, `full`, `inactive`) | `'active'` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_circles_status` ON `status`
- `idx_circles_category` ON `goal_category`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Circles are public | SELECT | `true` |

---

## circle_members

**Many-to-many relationship between users and circles.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `circle_id` | `UUID` | NOT NULL, FK → `circles(id)` ON DELETE CASCADE | |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `role` | `TEXT` | NOT NULL, CHECK (`member`, `co-host`) | `'member'` |
| `joined_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `left_at` | `TIMESTAMPTZ` | | |

**Indexes:**
- `idx_circle_members_user` ON `user_id`
- `idx_circle_members_circle` ON `circle_id`
- `idx_circle_members_active` UNIQUE ON `(circle_id, user_id)` WHERE `left_at IS NULL`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Members can view own memberships | SELECT | `auth.uid() = user_id` |
| Users can join circles | INSERT | `auth.uid() = user_id` |

---

## messages

**Chat messages within circles.** Realtime-enabled.

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `circle_id` | `UUID` | NOT NULL, FK → `circles(id)` ON DELETE CASCADE | |
| `sender_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `parent_id` | `UUID` | FK → `messages(id)` ON DELETE CASCADE | |
| `message` | `TEXT` | NOT NULL | |
| `message_type` | `TEXT` | NOT NULL, CHECK (`text`, `image`, `system`) | `'text'` |
| `is_pinned` | `BOOLEAN` | NOT NULL | `false` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_messages_circle` ON `circle_id`
- `idx_messages_sender` ON `sender_id`
- `idx_messages_created` ON `(circle_id, created_at)`

**Realtime:** Added to `supabase_realtime` publication.

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Messages are viewable by circle members | SELECT | EXISTS active membership |
| Circle members can send messages | INSERT | EXISTS active membership |

---

## milestones

**Steps/stages within a user goal.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `goal_id` | `UUID` | NOT NULL, FK → `user_goals(id)` ON DELETE CASCADE | |
| `title` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `order_index` | `INT` | NOT NULL | |
| `status` | `TEXT` | NOT NULL, CHECK (`locked`, `available`, `in_progress`, `completed`) | `'locked'` |
| `completed_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_milestones_goal` ON `goal_id`
- `idx_milestones_user` ON `user_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Users can view own milestones | SELECT | `auth.uid() = user_id` |
| Users can update own milestones | UPDATE | `auth.uid() = user_id` |

---

## opportunities

**Discoverable opportunities (scholarships, internships, competitions, etc.).**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `title` | `TEXT` | NOT NULL | |
| `category` | `TEXT` | NOT NULL, CHECK (`beasiswa`, `magang`, `pekerjaan`, `turnamen`, `kompetisi`, `relawan`, `pendanaan`, `program-kreator`) | |
| `organization` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `deadline` | `TIMESTAMPTZ` | NOT NULL | |
| `url` | `TEXT` | | |
| `is_featured` | `BOOLEAN` | NOT NULL | `false` |
| `is_active` | `BOOLEAN` | NOT NULL | `true` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_opportunities_active` ON `is_active`
- `idx_opportunities_category` ON `category`
- `idx_opportunities_deadline` ON `deadline`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Opportunities are public | SELECT | `is_active = true` |

---

## saved_opportunities

**User bookmarks for opportunities.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `opportunity_id` | `UUID` | NOT NULL, FK → `opportunities(id)` ON DELETE CASCADE | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| | | UNIQUE `(user_id, opportunity_id)` | |

**Indexes:**
- `idx_saved_opps_user` ON `user_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Users can view own saved opportunities | SELECT | `auth.uid() = user_id` |
| Users can save opportunities | INSERT | `auth.uid() = user_id` |
| Users can unsave opportunities | DELETE | `auth.uid() = user_id` |

---

## story_categories

**Categories for story content.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `name` | `TEXT` | NOT NULL | |
| `slug` | `TEXT` | UNIQUE, NOT NULL | |
| `icon` | `TEXT` | | |
| `description` | `TEXT` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Seed data:** 9 categories (Education, Career, Business, Sports, Music, Gaming, Creator, Beauty, Technology)

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Categories are public | SELECT | `true` |

---

## stories

**Published articles/stories.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `slug` | `TEXT` | UNIQUE, NOT NULL | |
| `title` | `TEXT` | NOT NULL | |
| `cover_image` | `TEXT` | | |
| `author_id` | `UUID` | FK → `users(id)` ON DELETE SET NULL | |
| `author_name` | `TEXT` | NOT NULL | |
| `author_avatar` | `TEXT` | | |
| `content` | `TEXT` | NOT NULL | |
| `category_id` | `UUID` | NOT NULL, FK → `story_categories(id)` | |
| `reading_time` | `INT` | NOT NULL | `1` |
| `like_count` | `INT` | NOT NULL | `0` |
| `save_count` | `INT` | NOT NULL | `0` |
| `comment_count` | `INT` | NOT NULL | `0` |
| `is_published` | `BOOLEAN` | NOT NULL | `false` |
| `published_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `deleted_at` | `TIMESTAMPTZ` | | |

**Indexes:**
- `idx_stories_category` ON `category_id` WHERE `is_published = true`
- `idx_stories_published_at` ON `published_at DESC` WHERE `is_published = true`
- `idx_stories_slug` ON `slug`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Published stories are public | SELECT | `is_published = true AND deleted_at IS NULL` |

---

## story_likes

**User likes on stories.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `story_id` | `UUID` | NOT NULL, FK → `stories(id)` ON DELETE CASCADE | |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| | | UNIQUE `(story_id, user_id)` | |

**Indexes:**
- `idx_story_likes_story` ON `story_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Authenticated users can like | ALL | `auth.uid() = user_id` |

---

## story_saves

**User bookmarks on stories.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `story_id` | `UUID` | NOT NULL, FK → `stories(id)` ON DELETE CASCADE | |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| | | UNIQUE `(story_id, user_id)` | |

**Indexes:**
- `idx_story_saves_story` ON `story_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Authenticated users can save | ALL | `auth.uid() = user_id` |

---

## story_comments

**Comments on stories with threading support.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `story_id` | `UUID` | NOT NULL, FK → `stories(id)` ON DELETE CASCADE | |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `parent_id` | `UUID` | FK → `story_comments(id)` ON DELETE CASCADE | |
| `content` | `TEXT` | NOT NULL | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_story_comments_story` ON `story_id`
- `idx_story_comments_parent` ON `parent_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Authenticated users can comment | ALL | `auth.uid() = user_id` |

---

## story_recommendations

**Cross-module recommendations linked to stories.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `story_id` | `UUID` | NOT NULL, FK → `stories(id)` ON DELETE CASCADE | |
| `resource_type` | `TEXT` | NOT NULL, CHECK (`roadmap`, `circle`, `product`) | |
| `resource_id` | `TEXT` | NOT NULL | |
| `resource_name` | `TEXT` | NOT NULL | |
| `resource_description` | `TEXT` | | |
| `resource_image` | `TEXT` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_story_recommendations_story` ON `story_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Recommendations are public | SELECT | `true` |

---

## roadmap_templates

**Predefined roadmap templates (e.g., Football Player, Doctor).**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `slug` | `TEXT` | UNIQUE, NOT NULL | |
| `title` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | NOT NULL | |
| `category` | `TEXT` | NOT NULL | |
| `icon` | `TEXT` | | |
| `color` | `TEXT` | | |
| `estimated_duration` | `TEXT` | | |
| `total_milestones` | `INT` | NOT NULL | `4` |
| `cover_image` | `TEXT` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_rtm_templates_slug` ON `slug`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Templates are public | SELECT | `true` |

---

## roadmap_template_milestones

**Milestone definitions within a roadmap template.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `template_id` | `UUID` | NOT NULL, FK → `roadmap_templates(id)` ON DELETE CASCADE | |
| `title` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `order_index` | `INT` | NOT NULL | |
| `tasks` | `JSONB` | NOT NULL | `'[]'` |
| `estimated_days` | `INT` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_rtm_milestones_template` ON `template_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Template milestones are public | SELECT | `true` |

---

## roadmap_template_recommendations

**Cross-module recommendations for roadmap milestones.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `template_id` | `UUID` | NOT NULL, FK → `roadmap_templates(id)` ON DELETE CASCADE | |
| `milestone_id` | `UUID` | FK → `roadmap_template_milestones(id)` ON DELETE CASCADE | |
| `resource_type` | `TEXT` | NOT NULL, CHECK (`circle`, `mentor`, `opportunity`) | |
| `resource_id` | `TEXT` | NOT NULL | |
| `resource_name` | `TEXT` | NOT NULL | |
| `resource_description` | `TEXT` | | |
| `resource_image` | `TEXT` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_rtm_recommendations_template` ON `template_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Template recommendations are public | SELECT | `true` |

---

## journals

**User-created personal journey journals.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `title` | `TEXT` | NOT NULL | |
| `slug` | `TEXT` | UNIQUE, NOT NULL | |
| `description` | `TEXT` | | |
| `cover_image` | `TEXT` | | |
| `goal_category` | `TEXT` | | |
| `roadmap_slug` | `TEXT` | | |
| `is_public` | `BOOLEAN` | NOT NULL | `true` |
| `entry_count` | `INT` | NOT NULL | `0` |
| `follower_count` | `INT` | NOT NULL | `0` |
| `reaction_count` | `INT` | NOT NULL | `0` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `deleted_at` | `TIMESTAMPTZ` | | |

**Indexes:**
- `idx_journals_user` ON `user_id` WHERE `deleted_at IS NULL`
- `idx_journals_slug` ON `slug`
- `idx_journals_public` ON `is_public` WHERE `is_public = true AND deleted_at IS NULL`

**Triggers:**
- `journal_entries_count_trigger` — AFTER INSERT/DELETE on `journal_entries` → `update_journal_entry_count()`
- `journal_followers_count_trigger` — AFTER INSERT/DELETE on `journal_followers` → `update_journal_follower_count()`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Public journals are viewable by everyone | SELECT | `is_public = true AND deleted_at IS NULL` |
| Users can manage their own journals | ALL | `auth.uid() = user_id` |

---

## journal_entries

**Daily entries within a journal.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `journal_id` | `UUID` | NOT NULL, FK → `journals(id)` ON DELETE CASCADE | |
| `title` | `TEXT` | | |
| `content` | `TEXT` | NOT NULL | |
| `mood` | `TEXT` | CHECK (`sangat_bahagia`, `bahagia`, `biasa`, `sedih`, `sangat_sedih`) | |
| `day_number` | `INT` | NOT NULL | `1` |
| `milestone_id` | `UUID` | FK → `journal_milestones(id)` ON DELETE SET NULL | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_journal_entries_journal` ON `journal_id`
- `idx_journal_entries_day` ON `(journal_id, day_number)`

**RLS:** See journals — entries inherit visibility from parent journal.

---

## journal_milestones

**Milestones within a journal journey.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `journal_id` | `UUID` | NOT NULL, FK → `journals(id)` ON DELETE CASCADE | |
| `title` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `is_achieved` | `BOOLEAN` | NOT NULL | `false` |
| `achieved_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_journal_milestones_journal` ON `journal_id`

**RLS:** See journals — milestones inherit visibility from parent journal.

---

## journal_followers

**Users following a journal.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `journal_id` | `UUID` | NOT NULL, FK → `journals(id)` ON DELETE CASCADE | |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| | | UNIQUE `(journal_id, user_id)` | |

**Indexes:**
- `idx_journal_followers_journal` ON `journal_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Followers are viewable if journal is public | SELECT | EXISTS parent journal public |
| Authenticated users can follow journals | INSERT | `auth.uid() = user_id` |
| Users can unfollow | DELETE | `auth.uid() = user_id` |

---

## journal_reactions

**Emoji reactions on journal entries.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `journal_id` | `UUID` | NOT NULL, FK → `journals(id)` ON DELETE CASCADE | |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `emoji` | `TEXT` | NOT NULL | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| | | UNIQUE `(journal_id, user_id, emoji)` | |

**Indexes:**
- `idx_journal_reactions_journal` ON `journal_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Reactions are viewable if journal is public | SELECT | EXISTS parent journal public |
| Authenticated users can react | ALL | `auth.uid() = user_id` |

---

## familia_merchants

**Voucher merchants in the Familia ecosystem.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `name` | `TEXT` | NOT NULL | |
| `slug` | `TEXT` | UNIQUE, NOT NULL | |
| `category` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `logo_url` | `TEXT` | | |
| `cover_url` | `TEXT` | | |
| `merchant_code` | `TEXT` | UNIQUE, NOT NULL | |
| `daily_pin` | `TEXT` | NOT NULL | `'0000'` |
| `monthly_quota` | `INT` | NOT NULL | `30` |
| `voucher_types` | `TEXT[]` | NOT NULL | `{}` |
| `is_active` | `BOOLEAN` | NOT NULL | `true` |
| `total_vouchers` | `INT` | NOT NULL | `0` |
| `total_redeemed` | `INT` | NOT NULL | `0` |
| `total_expired` | `INT` | NOT NULL | `0` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_familia_merchants_active` ON `is_active`
- `idx_familia_merchants_category` ON `category`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Merchants are public | SELECT | `true` |
| Admins can manage merchants | ALL | `auth.uid() IN (SELECT id FROM users WHERE role = 'admin')` |

---

## familia_affiliate_deals

**Affiliate product links for users.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `title` | `TEXT` | NOT NULL | |
| `slug` | `TEXT` | UNIQUE, NOT NULL | |
| `description` | `TEXT` | | |
| `image_url` | `TEXT` | | |
| `category` | `TEXT` | NOT NULL | |
| `partner_name` | `TEXT` | NOT NULL | |
| `partner_url` | `TEXT` | NOT NULL | |
| `platform` | `TEXT` | NOT NULL, CHECK (`tokopedia`, `shopee`, `tiktok`, `website`) | |
| `goal_category` | `TEXT` | | |
| `is_featured` | `BOOLEAN` | NOT NULL | `false` |
| `click_count` | `INT` | NOT NULL | `0` |
| `is_active` | `BOOLEAN` | NOT NULL | `true` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_familia_affiliate_featured` ON `is_featured` WHERE `is_featured = true`
- `idx_familia_affiliate_category` ON `category`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Deals are public | SELECT | `is_active = true` |

---

## familia_achievement_rewards

**Achievement-based reward definitions.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `title` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `trigger_type` | `TEXT` | NOT NULL, CHECK (`discovery_complete`, `roadmap_milestones`, `circle_days`, `mentor_program`, `journal_entries`, `story_posted`) | |
| `trigger_value` | `INT` | NOT NULL | `1` |
| `reward_type` | `TEXT` | NOT NULL, CHECK (`voucher`, `discount`, `special_benefit`) | |
| `reward_description` | `TEXT` | | |
| `reward_merchant_id` | `UUID` | FK → `familia_merchants(id)` ON DELETE SET NULL | |
| `icon` | `TEXT` | | |
| `color` | `TEXT` | | |
| `is_active` | `BOOLEAN` | NOT NULL | `true` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_familia_achievement_active` ON `is_active`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Achievements are public | SELECT | `is_active = true` |

---

## familia_voucher_sessions

**Active voucher claims by users.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `merchant_id` | `UUID` | NOT NULL, FK → `familia_merchants(id)` ON DELETE CASCADE | |
| `voucher_code` | `TEXT` | NOT NULL | |
| `status` | `TEXT` | NOT NULL, CHECK (`active`, `redeemed`, `expired`) | `'active'` |
| `pin_required` | `TEXT` | NOT NULL | `'0000'` |
| `activated_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | |
| `redeemed_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_familia_voucher_user` ON `(user_id, status)`
- `idx_familia_voucher_merchant` ON `merchant_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Users can view own voucher sessions | SELECT | `auth.uid() = user_id` |
| Users can insert own voucher sessions | INSERT | `auth.uid() = user_id` |
| Admins can view all sessions | ALL | `auth.uid() IN (SELECT id FROM users WHERE role = 'admin')` |

---

## familia_redemption_log

**Anti-fraud redemption audit log.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `merchant_id` | `UUID` | NOT NULL, FK → `familia_merchants(id)` ON DELETE CASCADE | |
| `voucher_code` | `TEXT` | NOT NULL | |
| `pin_entered` | `TEXT` | NOT NULL | |
| `status` | `TEXT` | NOT NULL, CHECK (`success`, `invalid_pin`, `expired`, `duplicate`) | |
| `redeemed_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**Indexes:**
- `idx_familia_redemption_user` ON `(user_id, merchant_id, redeemed_at)`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Users can view own redemption log | SELECT | `auth.uid() = user_id` |

---

## familia_user_achievements

**Per-user achievement progress tracking.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `users(id)` ON DELETE CASCADE | |
| `achievement_id` | `UUID` | NOT NULL, FK → `familia_achievement_rewards(id)` ON DELETE CASCADE | |
| `progress` | `INT` | NOT NULL | `0` |
| `is_completed` | `BOOLEAN` | NOT NULL | `false` |
| `completed_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| | | UNIQUE `(user_id, achievement_id)` | |

**Indexes:**
- `idx_familia_user_achievements_user` ON `user_id`

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Users can view own achievements | SELECT | `auth.uid() = user_id` |

---

## familia_event_benefits

**Event-based discount/benefit offerings.**

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `UUID` | PK | `gen_random_uuid()` |
| `title` | `TEXT` | NOT NULL | |
| `description` | `TEXT` | | |
| `image_url` | `TEXT` | | |
| `event_date` | `TIMESTAMPTZ` | | |
| `discount_type` | `TEXT` | NOT NULL, CHECK (`percentage`, `nominal`, `free`) | |
| `discount_value` | `TEXT` | NOT NULL | |
| `code` | `TEXT` | | |
| `is_active` | `BOOLEAN` | NOT NULL | `true` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` |

**RLS:**
| Policy | Command | Using/Check |
|--------|---------|-------------|
| Event benefits are public | SELECT | `is_active = true` |

---

## Functions

| Function | Returns | Purpose |
|----------|---------|---------|
| `handle_new_user()` | `TRIGGER` | Inserts row into `users` after `auth.users` INSERT |
| `update_journal_entry_count()` | `TRIGGER` | Updates `journals.entry_count` on INSERT/DELETE |
| `update_journal_follower_count()` | `TRIGGER` | Updates `journals.follower_count` on INSERT/DELETE |

## Triggers

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` |
| `journal_entries_count_trigger` | `journal_entries` | AFTER INSERT OR DELETE | `update_journal_entry_count()` |
| `journal_followers_count_trigger` | `journal_followers` | AFTER INSERT OR DELETE | `update_journal_follower_count()` |

## Relationships Diagram (Simplified)

```
auth.users
    │ (trigger: on_auth_user_created)
    ▼
users ──── user_goals ──── milestones
  │            │
  │            └── saved_opportunities ──── opportunities
  │
  ├── circle_members ──── circles ──── messages
  │
  ├── stories ──── story_likes
  │     │         ──── story_saves
  │     │         ──── story_comments
  │     │         ──── story_recommendations
  │     │
  │     └── story_categories
  │
  ├── journals ──── journal_entries
  │     │          ──── journal_milestones
  │     │          ──── journal_followers
  │     │          ──── journal_reactions
  │
  ├── familia_voucher_sessions ──── familia_merchants
  │                                   └── familia_achievement_rewards
  ├── familia_redemption_log              └── familia_user_achievements
  │
  ├── familia_user_achievements
  │
  └── roadmap templates (not user-owned)
        └── roadmap_template_milestones
              └── roadmap_template_recommendations
```
