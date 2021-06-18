const createConnection = require('../services/sheetsConnection');

module.exports = {
    /**
     * return a list of users object => { id, name }
     */
    async getUsers(request, response) {
        try {
            const doc = await createConnection();

            const sheet = doc.sheetsByTitle['usuarios'];

            const rows = await sheet.getRows();

            const users = rows.map(row => {
                return {
                    id: row.id,
                    name: row.usuario
                }
            });

            return response.status(200).json(users);
        } catch (error) {
            return response.status(400).json({error: "get users failed"});
        }
    },
    /**
     * recieves userId<string> => id of the user for log
     * recieves password<string> => password to test
     * return true of false for the password match { match: true/false }
     */
    async logIn(request, response) {
        try {
            const doc = await createConnection();

            const sheet = doc.sheetsByTitle['usuarios'];

            const rows = await sheet.getRows();

            const users = rows.map(row => {
                return {
                    id: row.id,
                    name: row.usuario,
                    password: row.password
                }
            });

            const userObject = users.find(user => user.id === String(request.body.userId));
            if (userObject.password === request.body.password) {
                return response.status(200).json({match: true});
            } else {
                return response.status(200).json({match: false});
            }

        } catch (error) {
            console.log(error);
            return response.status(502).json({error: "test password failed"});
        }
    }
};
