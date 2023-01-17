const { updateUser_Leagues } = require('../routes/user');

const updateNewUsers = async (axios, app) => {
    const new_users = app.get('new_users')
    app.set('new_users', [])
    Object.keys(new_users).map(async season => {
        if (new_users[season].length >= 1) {
            app.set('syncing', 'TRUE')
            console.log(`Updating ${new_users[season].length} Users...`)
            await updateUser_Leagues(axios, app, { season: season, leaguemate_ids: new_users[season] }, true)
            console.log('Updating Users Complete')
            app.set('syncing', 'FALSE')
        }
    })

    return []
}

module.exports = {
    updateNewUsers: updateNewUsers
}