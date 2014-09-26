<?php

$con = mysql_connect("localhost", "root", "") or die (mysql_error());
if (!mysql_select_db("plannerdb")) include_once('patch.php');
error_reporting(1);
session_start();

$_ADMINS = array();
$res = mysql_query("select name, access from members where access!='0'");
while($ret=mysql_fetch_array($res, MYSQL_ASSOC))
	if ($ret[access]=='1') $_ADMINS[] = $ret[name]; 

$_ADMINS[] = 'nalekseev';
$_ADMINS[] = 'asukhanova';
mysql_free_result($res);

if (!isset($_SESSION[user])){
	require_once 'openid.php';
	$openid = new LightOpenID((!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']);
	$openid->identity = 'https://openid.corp.hostcomm.ru/';
	if(!$openid->mode) header('Location: ' . $openid->authUrl());
	if($openid->validate() == 1) {
	  	$out = $openid->data;
	  	if (!empty($out['openid_identity'])){
	  		preg_match('#idpage/?\?user=(.+)$#is', urldecode($out['openid_identity']), $matches);
			$_SESSION[user] = $matches[1];
		}
	}
}

$isAdmin = in_array($_SESSION[user], $_ADMINS);

?>