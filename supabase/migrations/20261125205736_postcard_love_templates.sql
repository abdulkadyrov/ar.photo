-- Extend only the template registry. Existing printed marker bytes and v1 layouts stay unchanged.
alter table public.postcard_batches drop constraint postcard_batches_template_code_check;
alter table public.postcard_batches add constraint postcard_batches_template_code_check check (
 template_code in ('new-year','eid','march-8','autumn-ball','best-friend','brother-vip','love-meadow','love-moon')
);
insert into private.postcard_template_layouts(template_code,frame) values
 ('love-meadow','{"x":0.068,"y":0.169,"width":0.863,"height":0.621}'),
 ('love-moon','{"x":0.08,"y":0.156,"width":0.84,"height":0.608}');
