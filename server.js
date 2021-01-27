const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
let deptArr = [];
let roleArr = [];
let emplArr = [];
let managerArr = ["null"];

// create the db information for the sql database
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234",
  database: "employee_manager_db",
});

const mainMenu = [{
  type: "list",
  name: "choice",
  message: "What would you like to do?",
  choices: [
    "Add Employee",
    "Add Role",
    "Add Department",
    "View All Employees",
    "View All Employees By Role",
    "View All Employees By Department",
    "View All Roles",
    "View All Departments",
    "Update An Employee Role",
    "Exit Program",
  ],
}, ];

// connect to the mysql server and sql database and start the program
db.connect(function (err) {
  if (err) throw err;
  console.log("   _____________________________\n\n -- WELCOME TO EMPLOYEE TRACKER -- \n   _____________________________\n");
  startProgram();
});

// Offer main menu then prompt next function based on response
function startProgram() {
  inquirer.prompt(mainMenu).then((response) => {
    switch (response.choice) {
      case "Add Employee":
        addEmployee();
        break;
      case "Add Role":
        addRole();
        break;
      case "Add Department":
        addDept();
        break;
      case "View All Employees":
        viewAllEmployees();
        break;
      case "View All Employees By Role":
        viewByRole();
        break;
      case "View All Employees By Department":
        viewByDepartment();
        break;
      case "View All Roles":
        viewAllRoles();
        break;
      case "View All Departments":
        viewAllDepartments();
        break;
      case "Update An Employee Role":
        updateEmployee();
        break;
      case "Exit Program":
        db.end();
        break;
      default:
        db.end();
    }
  });
  // update arrays each time the startProgram function is called
  // getDepts();
  // getRoles();
  // getManagers();
}

const returnArrayOfStrings = (result) => {
  const list = []
  result.forEach(object => {
      const element = Object.values(object).join(" ");
      list.push(element);
  });
  return list;
}
// Get all departments
function getDepts() {
  db.query(`SELECT * FROM department`, function (
    err,
    departments
  ) {
    if (err) throw err;
    deptArr = [];
    for (i = 0; i < departments.length; i++) {
      deptArr.push(departments[i].department_name);
    }
  });
}
// Get all roles
function getRoles() {
  db.query(`SELECT * FROM role`, function (err, roles) {
    if (err) throw err;
    roleArr = [];
    for (i = 0; i < roles.length; i++) {
      roleArr.push(roles[i].title);
    }
  });
}
// Get all employees
const getEmployees = async () => {
  let listOfEmployees = [];
  try {
      const result = await query("SELECT id, first_name, last_name FROM employee");
      listOfEmployees = returnArrayOfStrings(result);
  } catch (error) {
      throw error;
  }
  return listOfEmployees;
}

// Functions to execute main menu selections

// Add Employee
function addEmployee() {
  db.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    db.query("SELECT * FROM employee", function (err, res2) {
      if (err) throw err;
      inquirer
        .prompt([{
            name: "first_name",
            type: "input",
            message: "What is the employee's first name?",
          },
          {
            name: "last_name",
            type: "input",
            message: "What is the employee's last name?",
          },
          {
            name: "roleName",
            type: "list",
            message: "What is the employee's role?",
            choices: roleArr,
          },
          {
            name: "managerName",
            type: "list",
            message: "Who is this employee's Manager?",
            choices: managerArr,
          },
        ])
        .then(function (answer) {
          let roleID;
          for (let r = 0; r < res.length; r++) {
            if (res[r].Title == answer.roleName) {
              roleID = res[r].id;
            }
          }
          let managerID;
          for (let m = 0; m < res2.length; m++) {
            if (res2[m].Last_name == answer.managerName) {
              managerID = res2[m].id;
            }
          }

          db.query(
            "INSERT INTO employee SET ?", {
              first_name: answer.First_name,
              last_name: answer.Last_name,
              role_id: roleID,
              manager_id: managerID,
            },
            function (err) {
              if (err) throw err;
            }
          );
          viewAllEmployees();
        });
    });
  });
}
// Add Role
function addRole() {
  db.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([{
          name: "title",
          type: "input",
          message: "What is your role title?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this role?",
        },
        {
          name: "departmentName",
          type: "list",
          message: "What department is this role in?",
          choices: deptArr,
        },
      ])
      .then(function (answer) {

        let deptID;
        for (let d = 0; d < res.length; d++) {
          if (res[d].department_name == answer.departmentName) {
            deptID = res[d].department_id;
          }
        }

        db(
          "INSERT INTO role SET ?", {
            title: answer.title,
            salary: answer.salary,
            department_id: deptID,
          },
          function (err) {
            if (err) throw err;
          }
        );
        startProgram();
      });
  });
}
// Add Department
function addDept() {
  inquirer
    .prompt([{
      name: "department",
      type: "input",
      message: "What is your department name?",
    }, ])
    .then(function (answer) {
      // when finished prompting, insert a new item into the db with that info
      db(
        "INSERT INTO department SET ?", {
          name: answer.department,
        },
        function (err) {
          if (err) throw err;
        }
      );
      viewAllDepartments();
    });
}
// View all employees by department
function viewByDepartment() {
  let query =  `SELECT employee.id, employee.first_name, 
  employee.last_name, department.name FROM employee 
  LEFT JOIN role ON employee.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id 
  ORDER BY department.name`;
  const rows =  db.query(query)
  console.table(rows)
  startProgram();
}
// View all employees by role
function viewByRole() {
  let query = `SELECT * title FROM role`;
  const rows =  db.query(query)
  console.table(rows)
  startProgram();
}
// View all roles
function viewAllRoles() {
  let query = `SELECT * FROM role`;
  const rows =  db.query(query)
  console.table(rows)
  startProgram();
}
// View all departments
function viewAllDepartments() {
  let query = `SELECT * FROM department`;
  const rows =  db.query(query)
  console.table(rows)
  startProgram();
}

// View all employees
function viewAllEmployees() {
  let query = `SELECT * FROM employee`;
  const rows =  db.query(query)
  console.table(rows)
  return startProgram();
}

// Update an employee
function updateEmployee() {
  db.query(
    `SELECT concat(employee.first_name, ' ' ,  employee.last_name) AS Name FROM employee`,
    function (err, employees) {
      if (err) throw err;
      emplArr = [];
      for (i = 0; i < employees.length; i++) {
        emplArr.push(employees[i].Name);
      }
      db.query("SELECT * FROM role", function (err, res2) {
        if (err) throw err;
        inquirer
          .prompt([{
              name: "employeeChoice",
              type: "list",
              message: "Which employee would you like to update?",
              choices: emplArr,
            },
            {
              name: "roleChoice",
              type: "list",
              message: "What is the employee's new role?",
              choices: roleArr,
            },
          ])
          .then(function (answer) {
            let roleID;
            for (let r = 0; r < res2.length; r++) {
              if (res2[r].title == answer.roleChoice) {
                roleID = res2[r].role_id;
              }
            }

            db.query(
              `UPDATE employee SET role_id = ? WHERE id = (SELECT id FROM(SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = ?)AS NAME)`,
              [roleID, answer.employeeChoice],
              function (err) {
                if (err) throw err;
              }
            );
            startProgram();
          });
      });
    }
  );
}