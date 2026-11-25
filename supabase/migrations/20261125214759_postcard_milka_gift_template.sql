-- Add a gift-basket artwork; keep all existing printed layouts immutable.
alter table public.postcard_batches drop constraint postcard_batches_template_code_check;
alter table public.postcard_batches add constraint postcard_batches_template_code_check check (
 template_code in ('new-year','eid','march-8','autumn-ball','best-friend','brother-vip','love-meadow','love-moon','milka-gift')
);
insert into private.postcard_template_layouts(template_code,frame) values
 ('milka-gift','{"x":0.085,"y":0.255,"width":0.83,"height":0.4}');
