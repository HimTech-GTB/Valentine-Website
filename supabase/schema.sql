-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS TABLE
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  slug text unique not null,
  pin text not null check (pin ~ '^[0-9]{4}$'), -- exactly 4 digits
  partner_name text not null,
  nickname text,
  proposal_title text default 'Will you be my Valentine?',
  proposal_message text,
  love_message text,
  love_letter text, -- long love letter
  description text,
  countdown_date timestamp with time zone,
  anniversary_date date,
  first_meeting_date date,
  favorite_food text,
  favorite_color text,
  relationship_start_date date,
  music_url text, -- audio URL
  bg_cover_url text, -- couple background
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GALLERY IMAGES TABLE
create table public.gallery_images (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  image_url text not null,
  caption text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LOVE MESSAGES / CARDS TABLE
create table public.love_messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUIZ QUESTIONS TABLE
create table public.quiz_questions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  question text not null,
  correct_answer text not null,
  options text[] not null, -- array of choices
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GIFT BOXES TABLE
create table public.gift_boxes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  question text not null,
  correct_answer text not null,
  gift_content text not null, -- hidden message or love letter
  image_url text, -- image reward
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FUTURE DREAMS TABLE
create table public.future_dreams (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TIMELINE EVENTS TABLE
create table public.timeline_events (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  event_date date not null,
  title text not null,
  description text,
  image_url text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CAPTURED IMAGES TABLE (mirror webcam images uploaded by partner)
create table public.captured_images (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ITEM INTERACTIONS TABLE (reactions & replies to gallery images, love messages, etc.)
create table public.item_interactions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  item_type text not null, -- 'gallery_image', 'love_message', 'project_description'
  item_id uuid not null, -- targets gallery_images.id, love_messages.id or projects.id (for description)
  reaction text, -- emoji reaction (e.g. '❤️')
  reply text, -- comment/reply text
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PARTNER FEEDBACK TABLE (general letter left at the end)
create table public.partner_feedback (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
---------------------------------------------------------

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.gallery_images enable row level security;
alter table public.love_messages enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.gift_boxes enable row level security;
alter table public.future_dreams enable row level security;
alter table public.timeline_events enable row level security;
alter table public.captured_images enable row level security;
alter table public.item_interactions enable row level security;
alter table public.partner_feedback enable row level security;

-- PROFILES Policies
create policy "Users can view and edit their own profiles"
  on public.profiles
  for all
  using (auth.uid() = id);

-- PROJECTS Policies
create policy "Creators can manage their own projects"
  on public.projects
  for all
  using (auth.uid() = user_id);

-- Note: We intentionally do NOT create a public SELECT policy for projects.
-- Receivers can only read the project data by entering the correct PIN via the RPC function below.

-- Sub-tables policies for Creators (SELECT, INSERT, UPDATE, DELETE)
create policy "Creators can manage gallery_images"
  on public.gallery_images for all using (auth.uid() = user_id);

create policy "Creators can manage love_messages"
  on public.love_messages for all using (auth.uid() = user_id);

create policy "Creators can manage quiz_questions"
  on public.quiz_questions for all using (auth.uid() = user_id);

create policy "Creators can manage gift_boxes"
  on public.gift_boxes for all using (auth.uid() = user_id);

create policy "Creators can manage future_dreams"
  on public.future_dreams for all using (auth.uid() = user_id);

create policy "Creators can manage timeline_events"
  on public.timeline_events for all using (auth.uid() = user_id);

-- Captured images policies
create policy "Creators can view captured images"
  on public.captured_images for select
  using (exists (
    select 1 from public.projects
    where public.projects.id = public.captured_images.project_id
    and public.projects.user_id = auth.uid()
  ));

create policy "Public receivers can upload captured images"
  on public.captured_images for insert
  with check (exists (
    select 1 from public.projects
    where public.projects.id = public.captured_images.project_id
  ));

-- Interactions policies
create policy "Creators can view interactions"
  on public.item_interactions for select
  using (exists (
    select 1 from public.projects
    where public.projects.id = public.item_interactions.project_id
    and public.projects.user_id = auth.uid()
  ));

create policy "Public receivers can create interactions"
  on public.item_interactions for insert
  with check (exists (
    select 1 from public.projects
    where public.projects.id = public.item_interactions.project_id
  ));

-- Feedback policies
create policy "Creators can view partner feedback"
  on public.partner_feedback for select
  using (exists (
    select 1 from public.projects
    where public.projects.id = public.partner_feedback.project_id
    and public.projects.user_id = auth.uid()
  ));

create policy "Public receivers can leave feedback"
  on public.partner_feedback for insert
  with check (exists (
    select 1 from public.projects
    where public.projects.id = public.partner_feedback.project_id
  ));


---------------------------------------------------------
-- PROFILE CREATION TRIGGER ON SIGNUP
---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Valentine Creator'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


---------------------------------------------------------
-- SECURE RECEIVER RPC GATEKEEPER
---------------------------------------------------------
create or replace function public.get_project_details(p_slug text, p_pin text)
returns table (
  id uuid,
  partner_name text,
  nickname text,
  proposal_title text,
  proposal_message text,
  love_message text,
  love_letter text,
  description text,
  countdown_date timestamp with time zone,
  anniversary_date date,
  first_meeting_date date,
  favorite_food text,
  favorite_color text,
  relationship_start_date date,
  music_url text,
  bg_cover_url text,
  gallery json,
  messages json,
  quiz json,
  gifts json,
  dreams json,
  timeline json
) security definer as $$
declare
  v_project_id uuid;
  v_pin text;
begin
  -- Get project id and pin
  select p.id, p.pin into v_project_id, v_pin
  from public.projects p
  where p.slug = p_slug;

  -- Verify pin is correct
  if v_project_id is null or v_pin != p_pin then
    return;
  end if;

  return query
  select
    p.id,
    p.partner_name,
    p.nickname,
    p.proposal_title,
    p.proposal_message,
    p.love_message,
    p.love_letter,
    p.description,
    p.countdown_date,
    p.anniversary_date,
    p.first_meeting_date,
    p.favorite_food,
    p.favorite_color,
    p.relationship_start_date,
    p.music_url,
    p.bg_cover_url,
    (
      select coalesce(json_agg(g order by display_order), '[]'::json)
      from public.gallery_images g
      where g.project_id = p.id
    ) as gallery,
    (
      select coalesce(json_agg(m order by display_order), '[]'::json)
      from public.love_messages m
      where m.project_id = p.id
    ) as messages,
    (
      select coalesce(json_agg(q order by display_order), '[]'::json)
      from public.quiz_questions q
      where q.project_id = p.id
    ) as quiz,
    (
      select coalesce(json_agg(gb order by display_order), '[]'::json)
      from public.gift_boxes gb
      where gb.project_id = p.id
    ) as gifts,
    (
      select coalesce(json_agg(fd order by display_order), '[]'::json)
      from public.future_dreams fd
      where fd.project_id = p.id
    ) as dreams,
    (
      select coalesce(json_agg(t order by display_order), '[]'::json)
      from public.timeline_events t
      where t.project_id = p.id
    ) as timeline
  from public.projects p
  where p.id = v_project_id;
end;
$$ language plpgsql;
