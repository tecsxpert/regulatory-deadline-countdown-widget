create table if not exists regulatory_deadlines (
    id bigserial primary key,
    title varchar(150) not null,
    regulatory_body varchar(120) not null,
    jurisdiction varchar(100) not null,
    category varchar(80) not null,
    description varchar(2000) not null,
    deadline_date date not null,
    reminder_date date,
    status varchar(30) not null,
    priority varchar(20) not null,
    responsible_team varchar(100) not null,
    owner_name varchar(100) not null,
    owner_email varchar(150) not null,
    reference_url varchar(500),
    ai_description varchar(4000),
    ai_recommendations varchar(4000),
    risk_score integer,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table if not exists app_users (
    id bigserial primary key,
    name varchar(100) not null,
    email varchar(150) not null unique,
    password varchar(255) not null,
    role varchar(30) not null,
    enabled boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index if not exists idx_regulatory_deadlines_deadline_date
    on regulatory_deadlines (deadline_date);

create index if not exists idx_regulatory_deadlines_status
    on regulatory_deadlines (status);

create index if not exists idx_regulatory_deadlines_active
    on regulatory_deadlines (active);
