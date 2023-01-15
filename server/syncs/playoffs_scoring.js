

const Playoffs_Scoring = async (axios, app) => {
    const player_scores = await axios.get(`https://api.sleeper.com/stats/nfl/2022/1?season_type=post`)

    let players = {}

    player_scores.data.map(player => {
        players[player.player_id] = {
            id: player.player_id,
            ...player.stats
        }
    })

    app.set('playoffs_scoring', players)

    return players
}

module.exports = {
    Playoffs_Scoring: Playoffs_Scoring
}