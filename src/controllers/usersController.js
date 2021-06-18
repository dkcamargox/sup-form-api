const createConnection = require('../services/sheetsConnection');
const { getDate, getTime } = require('../utils/dates');
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
     * writes in the sheet the information about the login
     */
    async logIn(request, response) {
        try {
            const doc = await createConnection();

            const usersSheet = doc.sheetsByTitle['usuarios'];

            const usersSheetRows = await usersSheet.getRows();

            const usersList = usersSheetRows.map(user => {
                return {
                    id: user.id,
                    name: user.usuario,
                    password: user.password
                }
            });

            const logInUser = usersList.find(user => user.id === String(request.body.userId));
            if (logInUser.password === request.body.password) {
                try {
                    /**
                     * add a login log into the sheet
                     * usuario	data 	hora	coordenada y	coordenada x
                     */
                    const loginSheet = doc.sheetsByTitle['logueos de supervisor']

                    loginSheet.addRow({
                        'usuario': logInUser.name,
                        'data': getDate(),
                        'hora': getTime(),
                        'latitud': request.body.cordy,
                        'longitud': request.body.cordx
                    })
                } catch (error) {
                    console.log(error);
                    return response.status(502).json({error: "register login failed"})
                }
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
