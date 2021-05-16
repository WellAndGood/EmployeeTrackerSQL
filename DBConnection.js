const mysql = require('mysql');
const connection = require('./config/connection.js') //env file
const inquirer = require('inquirer')

connection.connect(function(err) {
    if (err) throw err;
    console.log(`Connected as id ${connection.threadId}`);
    initProgram()
});

console.log(
`
.#######.##.....#.########.##.......#######.##....#.#######.########
.##......###...##.##.....#.##......##.....#..##..##.##......##......
.##......####.###.##.....#.##......##.....#...####..##......##......
.######..##.###.#.########.##......##.....#....##...######..######..
.##......##.....#.##.......##......##.....#....##...##......##......
.##......##.....#.##.......##......##.....#....##...##......##......
.#######.##.....#.##.......#######..#######....##...#######.########`
)
console.log(
`                           
.#######.########....###....######.##....#.#######.########.
....##...##.....#...##.##..##....#.##...##.##......##.....##
....##...##.....#..##...##.##......##..##..##......##.....##
....##...########.##.....#.##......#####...######..########.
....##...##...##..########.##......##..##..##......##...##..
....##...##....##.##.....#.##....#.##...##.##......##....##.
....##...##.....#.##.....#..######.##....#.#######.##.....##`
)
console.log("------------------------------------------------------------")
console.log("------------------------------------------------------------")
console.log("")
console.log("")

function initProgram() {
    inquirer.prompt({
        type: 'list',
        name: 'startOptions',
        message: 'How can I help you today?',
        choices: ['1) View All Employees', 
        '2) View All Employees By Department', 
        '3) View All Employees By Manager', 
        '4) Add Employee',
        '5) Remove Employee',
        '6) Update Employee Role',
        '7) Update Employee Manager',
        '8) View budgets by department']
    }).then((reply) => {
        switch (reply.startOptions) {
            case '1) View All Employees':
                console.log('View all employees')
                showEmployees()
                break;
            case '2) View All Employees By Department':
                viewAllByDepartment();
                break;
            case '3) View All Employees By Manager':
                console.log('View by Manager')
                viewByManager()
                break;
            case '4) Add Employee':
                // console.log('Add Employee')
                addEmployee()
                break;
            case '5) Remove Employee':
                console.log('Remove employee')
                deleteEmployee() // error code when run; ReferenceError --> not defined?
                break;
            case '6) Update Employee Role':
                console.log("Update Employees");
                updateEmployee()
                break;
            case '7) Update Employee Manager':
                console.log("update employee manager")
                updateManager()
                break;
            case '8) View budgets by department':
                console.log('view budgets')
                viewBudgets();
                break;
            default:
                break;
        }
    })
}

// Function #1 - Show Employees ✔️
const showEmployees = () => {
    console.log('Generating a list of all employees...\n');
    connection.query(
        `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS 'department', r.salary, e.manager_id
        FROM employee e
        INNER JOIN role r ON e.role_id = r.id
        INNER JOIN department d ON d.id = r.department_id;`,
        function(err, res){
            // console.log(res)
            console.table(res)
            initProgram()
        }
    )
}

// const showEmployeesInner = () => {
//     console.log('Generating a list of all employees...\n');
//     connection.query(
//         `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS 'department', r.salary, e.manager_id
//         FROM employee e
//         INNER JOIN role r ON e.role_id = r.id
//         INNER JOIN department d ON d.id = r.department_id;`,
//         function(err, res){
//             // console.log(res)
//             console.table(res)
//         }
//     )
// }

// Function #2 - View All Employees By Department ✔️, but need to readjust list based on QUERY
const viewAllByDepartment = () => {
    
    inquirer.prompt({
        type: 'list',
        name: 'whichDepartment',
        message: 'Which department would you like to view?',
        choices: ['Sales', 'Legal', 'Finance', 'Engineering']
    }).then((data) => {
    console.log(`Finding all employees in ${data.whichDepartment}...\n`);
    connection.query(
        `SELECT CONCAT(e.first_name, ' ', e.last_name) AS 'full_name', d.name, r.title, r.salary
        FROM employee e
        INNER JOIN role r ON e.role_id = r.id
        INNER JOIN department d ON d.id = r.department_id
        WHERE d.name = "${data.whichDepartment}";`,
        function(err, res){
            console.table(res);
            initProgram()
        }
    )}
)};

// Function #3 - View All Employees By Manager  ✔️ need to double check specifics
const viewByManager = () => {
    connection.query(
        `SELECT CONCAT(e.first_name, ' ', e.last_name) AS 'full_name', e.id, d.name, r.title
        FROM employee e
        INNER JOIN role r ON e.role_id = r.id
        INNER JOIN department d ON d.id = r.department_id
        WHERE r.title IN ("Sales Lead", "Lead Engineer", "Account Manager", "Legal Team Lead");`,
        function(err, res){
            
            // console.log(res)
            let listOfManagers = []
            let managersID = {}
            res.forEach(({ full_name, id }) => {
                
                // Push names into first array
                listOfManagers.push(full_name)

                // Push names + id into object
                managersID[full_name] = id
              });
            // console.log(listOfManagers)
            console.table(res)
            
            inquirer.prompt([
            {
                name: 'listOfManagers',
                type: 'list',
                message: `Choose which manager`,
                choices: listOfManagers
            }
        ]).then((response) => {
            // This inserts the manager's name string into the key:value dictionary of managersID
            let managersIDToUse = parseInt(managersID[response.listOfManagers]);
            // console.log(managersIDToUse)

            // is querying an empty table
            connection.query(
                'SELECT first_name, last_name, manager_id ' + 
                'FROM employee ' +
                'WHERE manager_id = ?',
                [ managersIDToUse ]
                ,
                function(err, manager){
                    console.table(manager)
                    initProgram()
                });
        })
    })
}

// Function #4 - Add Employee ✔️
const addEmployee = () => {
    inquirer
    .prompt([
      {
        type: 'item',
        name: 'firstName',
        message: `Q1) What is the employee's first name?`,
      },
      {
        type: 'item',
        name: 'lastName',
        message: `Q2) What is the employee's last name?`,
      },
    ]).then((answer) => {
        
        let employeeMap = [answer.firstName, answer.lastName]
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'empRole',
                message: `What is the employee's role?`,
                choices: ['Sales Lead', 'Salesperson', 'Software Engineer', 'Lead Engineer', 'Account Manager', 'Accountant', 'Legal Team Lead', 'Lawyer']
            },
        ]).then((answer) => {
            let toStringID = ""
            console.log(answer.empRole)
            connection.query(
                // Uses question 3's response to fill the 'title' query
                `SELECT id FROM role WHERE title = "${answer.empRole}"`,
                (err, res) => {
                    if (err) throw err;
                    toStringID = JSON.stringify(res[0].id);
                    employeeMap.push(toStringID)
                    // console.log(employeeMap)

                    // Gets a list of employees
                    connection.query(`SELECT * FROM employee`, (err, res) => {
                        if (err) throw err;
                        
                        const managersToChoose = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, id: id }));
                        
                        const managersNames = []
                        function addManagers() {
                            managersToChoose.forEach((element) => {
                            managersNames.push(element.name)
                        });
                        }
                        addManagers()
                        managersNames.push("None")

                        // console.log(managersNames[0]) //These are successful, but why won't the array work in inquirer?
                        // console.log(managersNames[1])
                        
                        inquirer.prompt([
                            {
                                type: 'list',
                                name: 'manager',
                                message: `Who is the employee's manager?`,
                                choices: managersNames // Does not work.
                            }
                        ]).then((answer) => {
                            // console.log(answer.manager)

                            // Returns the manager's ID based on their full name
                            managersID = ""
                            function findID(name) {
                                managersToChoose.forEach((element) => {
                                    if (element.name === name) {
                                        return managersID = element.id
                                    } 
                                })
                            }

                            findID(answer.manager)
                            console.log("managers ID " + managersID)

                            if (answer.manager === "None") {
                                managersID = null;
                            }

                            employeeMap.push(managersID)
                            
                            connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, employeeMap, (err, res) => {
                                // console.log(employeeMap);
                                if (err) throw err;
                                showEmployees()
                            })
                        });
                    });
                }
            )
        })
    })
}

// Function #5 - Remove Employee ✔️
const deleteEmployee = () =>  {
    connection.query(`SELECT * FROM employee`, (err, res) => {
        if (err) throw err;
        
        const employeesToChoose = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, id: id }));
        
        const employeeNames = []
        function addEmployeesToList() {
            employeesToChoose.forEach((element) => {
                employeeNames.push(element.name)
            });
        }
        addEmployeesToList()

        // `employeeNames` prints, but does not appear on the inquirer
        // console.log(employeesToChoose)
        // console.log(employeeNames) 

        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: `Which employee would you like to remove today?`,
                choices: employeeNames // Does not work.
            }
        ]).then((answer) => {
            const chosenName = answer.employee
            console.log(chosenName)

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'confirm',
                    message: `Are you sure you want to delete this employee: ${answer.employee}? (Cannot be undone) `,
                    choices: [`Delete`, `Don't Delete`]
                }
                    ]).then((answer) => {
                    if (answer.confirm === `Don't Delete`) {
                        console.log("Did not delete")
                        showEmployees()
                    } else if (answer.confirm === `Delete`) {
                        console.log("You've chosen to delete");
                        deleteProcedure()
                    } else {
                        showEmployees()
                    }
                })

            function deleteProcedure() {
                let employeesID = ""
                function findID(name) {
                    employeesToChoose.forEach((element) => {
                        if (element.name === name) {
                            return employeesID = element.id
                        } 
                    })
                }

                findID(chosenName)
                console.log("employeesID = " + employeesID)
                employeesID = parseInt(employeesID)
                
                connection.query(`DELETE FROM employee WHERE id = ?;`,
                employeesID, 
                (err, res) => {
                    if (err) throw err;
                    showEmployees()
                });
            }
        })
    })
}

// Function #6 - Update Employee Role ✔️
const updateEmployee = () => {
    console.log('Updating an employee...\n');

    connection.query(
        `SELECT e.id AS 'id', e.first_name, e.last_name, r.title, r.id AS 'role_id', d.name AS 'department', r.salary, e.manager_id
        FROM employee e
        INNER JOIN role r ON e.role_id = r.id
        INNER JOIN department d ON d.id = r.department_id;`,
        function(err, res) {
            let employeeToChange = {}
            let employeeList = []
            
            // console.log(res)
            // console.table(res)

            employeeToChange = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, id: id }));
            employeeList = res.map(({first_name, last_name}) => (`${first_name} ${last_name}`));
            
            // console.log(employeeToChange)
            // console.log(employeeList)

            connection.query(
                `SELECT id, title FROM role;`, // grabs a table of department codes (INT) and its written titles (e.g., 401 - "Lawyer") 

                function(err, res) {
                    let rolesMap = res.map((role) => ({title: role.title, role_code: role.id}));
                    let listOfRoles = res.map((role) => (role.title))
                    // console.log(res)
                    // console.log(rolesMap) 
                    // console.log(listOfRoles)

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'chooseName',
                            message: `Select the employee you'd like to change`,
                            choices: employeeList
                        },
                        {
                            type: 'list',
                            name: 'newRole',
                            message: `To what role would you like to change this employee?`,
                            choices: listOfRoles
                        }
                    ]).then((answer) => {
                        let queryArray = []
                        let employeeID = ""
                            function findID(name) {
                                employeeToChange.forEach((element) => {
                                    
                                    // console.log(element.name, name, element.id)
                                    
                                    if (element.name === name) {
                                        employeeID = parseInt(element.id)
                                        queryArray.push(employeeID)
                                        return employeeID
                                    }
                                })
                            }
                        findID(answer.chooseName)
                        // console.log("employeesID = " + employeeID)

                        let roleCode = ""

                        function findroleID(role) {
                            // console.log(role)
                            rolesMap.forEach((element) => {
                                
                                // console.log(element)
                                
                                if (element.title === role) {
                                    roleCode = parseInt(element.role_code)
                                    queryArray.unshift(roleCode)
                                    return roleCode
                                } 
                            })
                        }
                        findroleID(answer.newRole)
                        // console.log(queryArray)

                        connection.query(
                        `UPDATE employee
                        SET role_id = ?
                        WHERE id = ?;`, queryArray,
                        function(err, res) {
                            console.log(`${answer.chooseName} updated to ${answer.newRole}!`)
                            // console.log(res)
                            showEmployees()
                        }
                    )  
                })             
            })
        }
    )
};

// Function #7 - Update Employee's Manager ✔️
const updateManager = () => {
    connection.query(
        `SELECT e.id AS 'id', e.first_name, e.last_name, r.title, r.id AS 'role_id', d.name AS 'department', r.salary, e.manager_id
        FROM employee e
        INNER JOIN role r ON e.role_id = r.id
        INNER JOIN department d ON d.id = r.department_id;`,
        function(err, res) {
            let employeeToChange = {}
            let employeeList = []
            
            // console.log(res)
            // console.table(res)

            // Maps employees into an employee Object array (full name + id) and array (full name)
            employeeToChange = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, id: id }));
            employeeList = res.map(({first_name, last_name}) => (`${first_name} ${last_name}`));
            
            // Maps employees into a management Object array (full name + id) and array (full name)
            managerToAssign = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, id: id }));
            managerList = res.map(({first_name, last_name}) => (`${first_name} ${last_name}`));

            // console.log(employeeToChange)
            // console.log(employeeList)
            // console.log(managerToAssign)
            // console.log(managerList)

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'chooseName',
                    message: `Select the employee you'd like to change`,
                    choices: employeeList
                },
                {
                    type: 'list',
                    name: 'newManager',
                    message: `To what manager would you like to assign this employee?`,
                    choices: managerList
                }
            ]).then((answer) => {
                let queryArray = []
                let employeeID = ""
                    function findID(name) {
                        employeeToChange.forEach((element) => {
                            // console.log(element.name, name, element.id)
                            if (element.name === name) {
                                employeeID = parseInt(element.id)
                                queryArray.push(employeeID)
                                return employeeID
                            }
                        })
                    }

                findID(answer.chooseName)
                // console.log("employeesID = " + employeeID)

                let managementID = ""
                    function findManagementID(name) {
                        managerToAssign.forEach((element) => {
                            
                            // console.log(element.name, name, element.id)
                            
                            if (element.name === name) {
                                managementID = parseInt(element.id)
                                queryArray.unshift(managementID)
                                return managementID
                            }
                        })
                    }

                findManagementID(answer.newManager)
                // console.log("managementID = " + managementID)
                // console.log(queryArray)

                connection.query(
                    `UPDATE employee
                    SET manager_id = ?
                    WHERE id = ?;`, queryArray,
                    function(err, res) {
                        console.log(`${answer.chooseName} is now assigned ${answer.newManager} as a manager!`)
                        // console.log(res)
                        showEmployees()
                    }
                )  
            });
        }
    )
};

// Function #8 - 
const viewBudgets = () => {
    inquirer.prompt({
        type: 'list',
        name: 'whichDepartment',
        message: 'Whose department would you like to view budgets?',
        choices: ['Sales', 'Legal', 'Finance', 'Engineering']
    }).then((data) => {
        connection.query(
            `SELECT SUM(salary)
            FROM employee e
            INNER JOIN role r ON e.role_id = r.id
            INNER JOIN department d ON d.id = r.department_id
            WHERE d.name = "${data.whichDepartment}";`,
            function(err, res){
                let totalBudget = res[0]['SUM(salary)'];
                console.table(res)
                console.log(`The total budget is for the ${data.whichDepartment} department is $${totalBudget}.`)
                console.log("")
                console.log("")
                showEmployees()
            }
        )}
    )};