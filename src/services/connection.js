const Pool = require('pg').Pool

module.exports = new Pool({
    user: 'formsup_admin',
    host: 'localhost',
    database: 'redcom_formsup',
    password: 'seccoesmejorquemanaos',
    port: 5432,
});