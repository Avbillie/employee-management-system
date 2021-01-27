DROP DATABASE IF EXISTS employee_manager_db;

CREATE DATABASE employee_manager_db;

USE employee_manager_db;

CREATE TABLE department (
    ID INT NOT NULL AUTO_INCREMENT,
    Department VARCHAR(30) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE role (
    ID INT NOT NULL AUTO_INCREMENT,
    Title VARCHAR(30) NOT NULL,
    Salary DECIMAL(10.4) NOT NULL,
    Department_ID INT NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE employee (
    ID INT NOT NULL AUTO_INCREMENT,
    First_name VARCHAR(30) NOT NULL,
    Last_name VARCHAR(30) NOT NULL,
    Role_ID INT NOT NULL,
    Manager_ID INT NULL REFERENCES employee(ID),
    PRIMARY KEY (ID)
);