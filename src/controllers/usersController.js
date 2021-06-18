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
     * recieves userId => id of the user for logç
     * recieves password
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
                    name: row.usuario
                }
            });

            const userObject = users.find(user => user.id === request.body.userId);

            if (userObject === request.body.password) {
                return response.status(200).json({match: true});
            } else {
                return response.status(200).json({match: false});
            }

        } catch (error) {
            return response.status(400).json({error: "test password failed"});
        }
    }
};
