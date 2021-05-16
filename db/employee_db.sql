DROP DATABASE IF EXISTS workplace_db;
CREATE DATABASE workplace_db;

USE workplace_db;

-- Creates department
CREATE TABLE department (
	id INTEGER,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

-- Creates role table
CREATE TABLE role (
	id INTEGER,
    department_id INTEGER,
    title VARCHAR(30),
    salary DECIMAL (10,0),
    PRIMARY KEY (id)
);

-- Creates employee table
CREATE TABLE employee (
	id INTEGER(11) AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
	last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    PRIMARY KEY (id)
);

INSERT INTO department (id, name) VALUES 
(100, "Sales"),
(200, "Engineering"),
(300, "Finance"),
(400, "Legal");

SELECT * FROM department;

INSERT INTO role (id, department_id, title, salary) VALUES 
(101, 100, "Sales Lead", 80000),
(102, 100, "Salesperson", 100000),
(201, 200, "Lead Engineer", 150000),
(202, 200, "Software Engineer", 120000),
(301, 300, "Account Manager", 150000),
(302, 300, "Accountant", 125000),
(401, 400, "Legal Team Lead", 250000),
(402, 400, "Lawyer", 190000);

SELECT * FROM role;

SELECT id FROM role WHERE title = "Lawyer";
SELECT id, title, salary FROM role WHERE department_id = 200;

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
("Harry", "Rosen", 101, NULL),
("Severus", "Snape", 102, 1),
("Joe", "Blow", 201, NULL),
("Daniel", "Pisani", 202, 3),
("Katie", "Ladlow", 301, NULL),
("Tipper", "Kaldwell", 302, 5),
("Carmela", "Dabesti", 401, NULL),
("Ripper", "Chunks", 402, 7);

SELECT * FROM employee;