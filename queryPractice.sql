USE workplace_db;

SELECT e.id, e.first_name, e.last_name, r.title, d.name AS 'department', r.salary, e.manager_id 
FROM employee e
INNER JOIN role r ON e.role_id = r.id
INNER JOIN department d ON d.id = r.department_id;

-- Function #1 - View All Employees
SELECT id, CONCAT(employee.first_name, ' ', employee.last_name) AS 'full_name' FROM employee;

-- Function #2 - View All Employees By Department
SELECT CONCAT(e.first_name, ' ', e.last_name) AS 'full_name', d.name, r.title, r.salary
FROM employee e
INNER JOIN role r ON e.role_id = r.id
INNER JOIN department d ON d.id = r.department_id
WHERE d.name = "Finance";
-- Options include: Sales, Legal, Finance, Engineering


-- Function #3 - View All Employees By Manager
SELECT CONCAT(e.first_name, ' ', e.last_name) AS 'full_name', d.name, r.title
FROM employee e
INNER JOIN role r ON e.role_id = r.id
INNER JOIN department d ON d.id = r.department_id
WHERE e.manager_id = 3;

SELECT CONCAT(e.first_name, ' ', e.last_name) AS 'full_name', e.id, d.name, r.title
FROM employee e
INNER JOIN role r ON e.role_id = r.id
INNER JOIN department d ON d.id = r.department_id
WHERE r.title = "Sales Lead" OR r.title = "Lead Engineer" OR r.title = "Account Manager" OR r.title = "Legal Team Lead";


-- Function #4 - Add Employee
SELECT manager_id FROM employee;

-- Q1) What is the employee's first name?
-- inquirer: firstName
-- Q2) What is the employee's last name?
-- inquirer: lastName
-- Q3) What is the employee's role? List of employees
-- inquirer: empRole
-- Q4) What is the employee's manager? List of managers (with NULLs removed)
-- inquirer: empManager
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(firstName, lastName, empRole, empManager);


-- Function #5 - Remove employee
-- Need to update based on full name, or ID based on CONCAT first and last name
SET SQL_SAFE_UPDATES = 0;
DELETE FROM employee WHERE first_name = 'Tipper';
SET SQL_SAFE_UPDATES = 1;

-- Function #6 - Update Employee Role

-- Q1 - Which employee do you want to update? CONCAT First and Last name
-- Q2 - Which role is your employee now working?

-- ROLE_ID's property will be a variable;

SET SQL_SAFE_UPDATES = 0;

UPDATE employee
SET role_id = 102
-- WHERE first_name = 'Daniel';
WHERE id = 20041293;

SET SQL_SAFE_UPDATES = 1;


-- 7) Update Employee Manager
-- Q1) Which employee's manager do you want to update?
-- Q2) Which employee do you want to set as manager for the selected employee?

SET SQL_SAFE_UPDATES = 0;
UPDATE employee
SET manager_id = 6983475
WHERE first_name = 'Daniel';
SET SQL_SAFE_UPDATES = 1;

-- 8) View Budgets By Department

SELECT SUM(salary)
FROM employee e
INNER JOIN role r ON e.role_id = r.id
INNER JOIN department d ON d.id = r.department_id
WHERE d.name = "Engineering";
-- Options include: Sales, Legal, Finance, Engineering