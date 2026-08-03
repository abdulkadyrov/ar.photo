-- Synthetic local-only fixtures. Password for every seeded user: ArPhotoDemo1!
insert into public.subscription_plans (
  id,
  code,
  name,
  description,
  storage_limit_bytes,
  project_limit,
  group_limit,
  ar_item_limit,
  video_duration_limit_seconds,
  max_video_size_bytes,
  team_limit
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'trial',
    'Trial',
    'Synthetic development trial',
    1073741824,
    3,
    12,
    100,
    120,
    52428800,
    3
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'studio',
    'Studio',
    'Synthetic development studio plan',
    107374182400,
    100,
    1000,
    10000,
    600,
    524288000,
    20
  )
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    storage_limit_bytes = excluded.storage_limit_bytes,
    project_limit = excluded.project_limit,
    group_limit = excluded.group_limit,
    ar_item_limit = excluded.ar_item_limit,
    video_duration_limit_seconds = excluded.video_duration_limit_seconds,
    max_video_size_bytes = excluded.max_video_size_bytes,
    team_limit = excluded.team_limit,
    is_active = true;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'admin@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"AR Photo Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000010',
    'authenticated',
    'authenticated',
    'owner-a@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Owner Alpha"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000011',
    'authenticated',
    'authenticated',
    'editor-a@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Editor Alpha"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000012',
    'authenticated',
    'authenticated',
    'viewer-a@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Viewer Alpha"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000013',
    'authenticated',
    'authenticated',
    'inactive-a@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Inactive Alpha"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000020',
    'authenticated',
    'authenticated',
    'owner-b@arphoto.example',
    extensions.crypt('ArPhotoDemo1!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Owner Beta"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(),
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email like '%@arphoto.example'
on conflict (provider_id, provider) do nothing;

update public.profiles
set role = 'superadmin'
where id = '10000000-0000-4000-8000-000000000001';

insert into public.accounts (id, name, slug, owner_user_id)
values
  ('20000000-0000-4000-8000-000000000001', 'Alpha Studio', 'alpha-studio', '10000000-0000-4000-8000-000000000010'),
  ('20000000-0000-4000-8000-000000000002', 'Beta Studio', 'beta-studio', '10000000-0000-4000-8000-000000000020');

update public.profiles
set account_id = '20000000-0000-4000-8000-000000000001'
where id in (
  '10000000-0000-4000-8000-000000000010',
  '10000000-0000-4000-8000-000000000011',
  '10000000-0000-4000-8000-000000000012',
  '10000000-0000-4000-8000-000000000013'
);
update public.profiles
set account_id = '20000000-0000-4000-8000-000000000002'
where id = '10000000-0000-4000-8000-000000000020';

insert into public.account_members (id, account_id, user_id, role, is_active, accepted_at)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000010',
    'owner',
    true,
    now()
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000011',
    'editor',
    true,
    now()
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000012',
    'viewer',
    true,
    now()
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000013',
    'editor',
    false,
    null
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000020',
    'owner',
    true,
    now()
  );

insert into public.subscriptions (
  id,
  account_id,
  plan_id,
  status,
  starts_at,
  expires_at,
  grace_period_ends_at
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'active',
    now() - interval '1 day',
    now() + interval '90 days',
    now() + interval '97 days'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    (select id from public.subscription_plans where code = 'trial'),
    'expired',
    now() - interval '60 days',
    now() - interval '30 days',
    now() - interval '23 days'
  );

insert into public.projects (
  id,
  account_id,
  name,
  category,
  status,
  idempotency_key,
  created_by
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Выпускной 2027',
    'graduation',
    'active',
    '51000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000010'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Beta Archive',
    'other',
    'active',
    '51000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000020'
  );

insert into public.groups (id, account_id, project_id, name, idempotency_key, created_by)
values
  (
    '60000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '11А класс',
    '61000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000010'
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000002',
    'Beta Group',
    '61000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000020'
  );

insert into public.ar_items (
  id,
  account_id,
  project_id,
  group_id,
  title,
  public_slug,
  status,
  tracking_status,
  created_by
)
values
  (
    '70000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    'Иванов Иван',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'ready',
    'ready',
    '10000000-0000-4000-8000-000000000010'
  );

insert into storage.objects (bucket_id, name, metadata)
values (
  'markers-private',
  'accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/70000000-0000-4000-8000-000000000001/marker/original.jpg',
  '{"mimetype":"image/jpeg","size":1024}'::jsonb
);
