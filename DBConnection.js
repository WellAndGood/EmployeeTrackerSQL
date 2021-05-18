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
        '8) View budgets by department',
        '9) Add role or department',
        '10) Delete role or department']
    }).then((reply) => {
        switch (reply.startOptions) {
            case '1) View All Employees':
                showEmployees()
                break;
            case '2) View All Employees By Department':
                viewAllByDepartment();
                break;
            case '3) View All Employees By Manager':
                viewByManager()
                break;
            case '4) Add Employee':
                addEmployee()
                break;
            case '5) Remove Employee':
                deleteEmployee() // error code when run; ReferenceError --> not defined?
                break;
            case '6) Update Employee Role':
                updateEmployee()
                break;
            case '7) Update Employee Manager':
                updateManager()
                break;
            case '8) View budgets by department':
                viewBudgets();
                break;
            case '9) Add role or department':
                createPosition();
                break
            case '10) Delete role or department':
                deletePosition();
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

// Function #2 - View All Employees By Department ✔️, but need to readjust list based on QUERY
const viewAllByDepartment = () => {
    connection.query(
        `SELECT id, name FROM department`,
        function(err, res) {
            // console.log(res)
            departmentList = res.map(({name}) => (name));

            // console.log(departmentList)
            inquirer.prompt({
                type: 'list',
                name: 'whichDepartment',
                message: 'Which department would you like to view?',
                choices: departmentList
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
            )
        }
    )});
};

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
        
        connection.query(
            `SELECT id, title FROM role`,
            function(err, res) {
                // console.log(res)
               
                rolesList = res.map(({title}) => (title));
                // console.log(rolesList)
                let employeeMap = [answer.firstName, answer.lastName]
                inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'empRole',
                        message: `What is the employee's role?`,
                        choices: rolesList
                    },
                ]).then((answer) => {
                    let toStringID = ""
                    // console.log(answer.empRole)
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
            }
        )
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

        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: `Which employee would you like to remove today?`,
                choices: employeeNames // Does not work.
            }
        ]).then((answer) => {
            const chosenName = answer.employee
            // console.log(chosenName)

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

            employeeToChange = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, id: id }));
            employeeList = res.map(({first_name, last_name}) => (`${first_name} ${last_name}`));

            connection.query(
                `SELECT id, title FROM role;`, // grabs a table of department codes (INT) and its written titles (e.g., 401 - "Lawyer") 

                function(err, res) {
                    let rolesMap = res.map((role) => ({title: role.title, role_code: role.id}));
                    let listOfRoles = res.map((role) => (role.title))

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
                            
                            if (element.name === name) {
                                managementID = parseInt(element.id)
                                queryArray.unshift(managementID)
                                return managementID
                            }
                        })
                    }

                findManagementID(answer.newManager)

                connection.query(
                    `UPDATE employee
                    SET manager_id = ?
                    WHERE id = ?;`, queryArray,
                    function(err, res) {
                        console.log(`${answer.chooseName} is now assigned ${answer.newManager} as a manager!`)
                        showEmployees()
                    }
                )  
            });
        }
    )
};

// Function #8 - View budgets
const viewBudgets = () => {
    connection.query(
        `SELECT id, name FROM department`,
        function(err, res) {
            codesObject = res.map(({id, name}) => ({id, name}));
            departmentList = res.map(({name}) => (name));
            // console.log(codesObject)
            // console.log(departmentList)
        
            inquirer.prompt({
                type: 'list',
                name: 'whichDepartment',
                message: 'Whose department would you like to view budgets?',
                choices: departmentList
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
                )
            })
        }
    )    
}

// Function #9 - Add Position (Role or Department)
function createPosition() {
    inquirer.prompt({
        type: 'list',
        name: 'roleOrDepartment',
        message: 'Would you like to create a role or a department?',
        choices: ['Create a new position (inside an existing department)', 'Create a new department', `Cancel the creation process (I'm here by mistake)`]
    }).then((data) => {
        // console.log(data.roleOrDepartment)
        switch (data.roleOrDepartment) {
            case 'Create a new position (inside an existing department)':
                console.log('View all employees')
                createRole();
                break;
            case 'Create a new department':
                createDepartment();
                break;
            case `Cancel the creation process (I'm here by mistake)`:
                console.log('No changes made')
                showEmployees();
                break;
            }
    })
}

function createRole() {
    connection.query(
        `SELECT id, name FROM department`,
        function(err, res) {
            codesObject = res.map(({id, name}) => ({id, name}));
            departmentList = res.map(({name}) => (name));
            // console.log(codesObject)
            // console.log(res)

            connection.query(
                `SELECT id, title FROM role`,
                function(err, res) {
                    titleList = res.map(({title}) => (title));
                    inquirer.prompt([{
                        type: 'name',
                        name: 'newRoleTitle',
                        message: 'What is the name of your new role?',
                        // validate: function(input) {
                        //     if (titleList.includes(input)) {
                        //         console.log("Cannot create job title with the same name as another job title. Try again.")
                        //         createRole()
                        //     }
                        // }
                    },
                    {
                        type: 'list',
                        name: 'newRoleDepartment',
                        message: 'What department is your new role?',
                        choices: departmentList
                    },
                    {
                        type: 'name',
                        name: 'newRoleSalary',
                        message: `What's the average salary of this role (number only - no commas or dollar signs; e.g. '140000')?`,
                        // validate: function(input) {
                        //     if (typeof input !== 'integer') {
                        //         console.log("Input must be an integer. Try again.")
                        //     }
                        // } 
                    }
                    ]).then((answers) => {
        
                        let queryArray = []
        
                        function findID(name) {
                            codesObject.forEach((element) => {                
                                if (element.name === name) {
                                    employeeID = parseInt(element.id)
                                    queryArray.push(employeeID)
                                    return employeeID
                                }
                            }
                        )}
                        findID(answers.newRoleDepartment)
                        
                        queryArray.push(answers.newRoleTitle, parseInt(answers.newRoleSalary))
                        // console.log(queryArray)
        
                        connection.query(
                            `SELECT id, title FROM role`,
                            function(err, res) {
                                codesArray = res.map(({id}) => (id))
                                // console.log(codesArray)
        
                                const departmentCode = queryArray[0]
                                let departmentCodeRange = codesArray.filter(id => id > departmentCode && id < (departmentCode +99))
        
                                let newRoleCode = queryArray[0]
                                let newRoleCreated = false
                                while (newRoleCreated === false) {
                                    newRoleCode++;
                                    if (departmentCodeRange.includes(newRoleCode)) {
                                    } else {
                                        queryArray.unshift(newRoleCode)
                                        newRoleCreated = true;
                                        console.log("role_id created: " + newRoleCode)
                                    }
                                }
                                connection.query(
                                    `INSERT INTO role (id, department_id, title, salary) VALUES (${queryArray[0]}, ${queryArray[1]}, "${queryArray[2]}", ${queryArray[3]})`,
                                    function(err, res) {
                                        if (err) throw err;
                                        showEmployees();
                                    }
                                )
                            }
                        )
                    });  
                }
            )
        }
    )
}

function createDepartment() {
    connection.query(
        `SELECT id, name FROM department`,
        function(err, res) {
            
            let codesObject = res.map(({id, name}) => ({id, name}));
            let departmentList = res.map(({id}) => (id));
            let namesList = res.map(({name}) => (name));
            // console.log(codesObject)
            // console.log(departmentList)
            // console.log(namesList)

            inquirer.prompt([{
                type: 'name',
                name: 'newDepartmentName',
                message: 'What is the name of your new department?',
                // validate: function(input) {
                //     if (namesList.includes(input)) {
                //         console.log("Cannot insert department of the same name as another department. Try again.")
                //     }
                // }
            }]).then((answers) => {

                let departmentCode = 100;
                let queryArray = []

                let newDepartmentCreated = false
                while (newDepartmentCreated === false) {
                    if (departmentList.includes(departmentCode)) {
                        departmentCode += 100
                    } else {
                        queryArray.unshift(departmentCode)
                        newDepartmentCreated = true;
                    }
                }

                queryArray.push(answers.newDepartmentName)

                connection.query(
                    `INSERT INTO department (id, name) VALUES (${queryArray[0]}, "${queryArray[1]}")`,
                    function(err, res) {
                        if (err) throw err;
                        showEmployees();
                    }
                )
            })
        }
    )
}

// Function #10 - Delete Position (Role or Department)
function deletePosition() {
    inquirer.prompt({
        type: 'list',
        name: 'roleOrDepartment',
        message: 'Would you like to delete a role or a department?',
        choices: ['Delete a role', 'Delete a department', `Cancel the deletion process (I'm here by mistake)`]
    }).then((data) => {
        switch (data.roleOrDepartment) {
            case 'Delete a role':
                console.log('View all employees')
                deleteRole()
                break;
            case 'Delete a department':
                deleteDepartment();
                break;
            case `Cancel the deletion process (I'm here by mistake)`:
                console.log('No changes made')
                showEmployees()
                break;
            }
    })
}

// Sub-function for function #10
function deleteRole() {
    connection.query(
        `SELECT id, title FROM role`,
        function(err, res) {
            rolesList = res.map(({title}) => (title));
            // console.log(rolesList)
            inquirer.prompt([{
                type: 'list',
                name: 'roleToDelete',
                message: 'Which role would you like to delete?',
                choices: rolesList
            },
            {
                type: 'list',
                name: 'confirm',
                message: 'Are you sure that you want to delete this role?',
                choices: ['Yes', 'No']
            }]
            ).then((data) => {
                if (data.confirm === 'No') {
                    console.log("No changes made.")
                    showEmployees()
                }
                if (data.confirm === 'Yes') {
                    connection.query(
                        `DELETE FROM role WHERE title = "${data.roleToDelete}"`,
                        function(err, res) {
                            if (err) throw err;
                            showEmployees()
                        }
                    )
                }
            })
        }
    )
}

// Sub-function for function #10
function deleteDepartment() {
    connection.query(
        `SELECT id, name FROM department`,
        function(err, res) {
            departmentList = res.map(({name}) => (name));
            // console.log(departmentList)
            
            inquirer.prompt([{
                type: 'list',
                name: 'departmentToDelete',
                message: 'Which department would you like to delete?',
                choices: departmentList,
            },
            {
                type: 'list',
                name: 'confirm',
                message: 'Are you sure that you want to delete this department?',
                choices: ['Yes', 'No']
            }]).then((data) => {
                if (data.confirm === 'No') {
                    console.log("No changes made.")
                    showEmployees()
                }
                if (data.confirm === 'Yes') {
                    connection.query(
                        `DELETE FROM department WHERE name = "${data.departmentToDelete}"`,
                        function(err, res) {
                            console.log(`${data.departmentToDelete} deleted.`)
                            showEmployees()
                        }
                    )
                }  
            })
        }
    )
}