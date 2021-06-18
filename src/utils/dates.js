const moment = require('moment-timezone')

module.exports = {
    getDate() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = dd + '/' + mm + '/' + yyyy;
        return today;
    },

    getTime() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const currentTime = moment().tz('America/Argentina/Cordoba').format('hh:mm');

        return currentTime;
    }
}