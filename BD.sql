create database users_app;
use users_app;

create table roles(id_rol int not null auto_increment primary key, name_rol char(20));
insert into roles (name_rol) values ("user");
insert into roles (name_rol) values ("admin");

create table users(id_use int not null auto_increment primary key, name_use char(50), id_rol int, email_use varchar(150) unique, password_use varchar(255), tries_use int(3), active_use int(1), foreign key(id_rol) references roles(id_rol));
insert into users (name_use, id_rol, email_use, password_use, tries_use, active_use) values("admin", 2, "admin@gmail.com", "123", 0, 1);
insert into users (name_use, id_rol, email_use, password_use, tries_use, active_use) values("user", 1, "user@gmail.com", "321", 0, 1);