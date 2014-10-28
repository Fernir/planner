<?php
$con = mysql_connect("localhost", "root", "") or die (mysql_error());
mysql_select_db("plannerdb") or die (mysql_error());

mysql_query("alter table storage add ts TIMESTAMP") or die (mysql_error());
mysql_query("alter table storage MODIFY COLUMN ts TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP") or die (mysql_error());
?>