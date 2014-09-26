<?php
//$con = mysql_connect("localhost", "plannerdb", "123qweASD") or die (mysql_error());
$con = mysql_connect("localhost", "root", "") or die (mysql_error());

//mysql_query("create database if not exists plannerdb DEFAULT CHARACTER SET utf8") or die (mysql_error());

mysql_select_db("plannerdb") or die (mysql_error());

/* check for tables */
if (!mysql_query("desc users")) mysql_query("create table if not exists users (room int, user varchar(250), primary key (room, user))") or die (mysql_error());

if (!mysql_query("desc storage")) mysql_query("create table if not exists storage (id varchar(250) not null, user varchar(250) not null, data text, tstart varchar(250) not null, tend varchar(250) not null, room varchar(250) not null, mailed int not null)") or die (mysql_error());

if (!mysql_query("desc members")){
	mysql_query("create table if not exists members (id int not null auto_increment, name varchar(250) not null unique, access int not null, primary key(id))") or die (mysql_error());
	mysql_query("insert ignore members (name, access) values('ann', '1')") or die (mysql_error());
	mysql_query("insert ignore members (name, access) values('ansu', '1')") or die (mysql_error());
	mysql_query("insert ignore members (name, access) values('lav', '1')") or die (mysql_error());
	mysql_query("insert ignore members (name, access) values('kras', '1')") or die (mysql_error());
	
	mysql_query("insert ignore members (name, access) values('nik', '2')") or die (mysql_error());
	mysql_query("insert ignore members (name, access) values('dvs', '2')") or die (mysql_error());
	mysql_query("insert ignore members (name, access) values('zym', '2')") or die (mysql_error());
}

if (!mysql_query("desc headers")){
	mysql_query("create table if not exists headers (id int not null auto_increment, name varchar(250) not null, color varchar(250), primary key(id))") or die (mysql_error());
	mysql_query("insert ignore headers (name, color) values('ADM', 'red')") or die (mysql_error());
	mysql_query("insert ignore headers (name, color) values('PR', 'green')") or die (mysql_error());
}

/* end check for tables */

//rename(__FILE__,__FILE__ . '.lock');
?>
