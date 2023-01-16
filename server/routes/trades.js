



const getTrades = async (app, user_id) => {
    const state = app.get('state')
    const trades_table = app.get('trades_table')
    let trades = await trades_table[state.league_season].findAll()


    return trades
}

module.exports = {
    getTrades: getTrades
}