

const dailySync = async (app, axios) => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
    app.set('state', state.data)

    const allplayers = await getAllPlayers(axios, state.data)
    app.set('allplayers', allplayers)

    const schedule = await axios.get(`https://api.myfantasyleague.com/${state.data.season}/export?TYPE=nflSchedule&JSON=1`)
    app.set('schedule', schedule.data)
}

module.exports = {
    dailySync: dailySync
}