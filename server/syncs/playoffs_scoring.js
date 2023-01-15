

const Playoffs_Scoring = async (axios, app) => {
    const state = app.get('state')

    const rounds = ['Week_18', 'WC', 'DIV', 'CONF', 'SB']

    let player_scores = {}

    await Promise.all(Array.from(Array(4).keys())
        .slice(0, state.week + 1)
        .map(async key => {
            let scores_dict_week = {};
            let scores_week;
            if (key === 0) {
                scores_week = await axios.get(`https://api.sleeper.com/stats/nfl/2022/18?season_type=regular`)
            } else {
                scores_week = await axios.get(`https://api.sleeper.com/stats/nfl/2022/${key}?season_type=post`)
            }

            scores_week.data.map(player => {
                return scores_dict_week[player.player_id] = {
                    id: player.player_id,
                    ...player.stats
                }
            })

            player_scores[rounds[key]] = {
                index: key,
                ...scores_dict_week
            }
        }))

    app.set('playoffs_scoring', player_scores)

    return player_scores
}

module.exports = {
    Playoffs_Scoring: Playoffs_Scoring
}