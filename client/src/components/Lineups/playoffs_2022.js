import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import TableMain from "../Home/tableMain";


const Playoffs = () => {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [league, setLeague] = useState({})
    const [scoring, setScoring] = useState({})
    const [itemActive, setItemActive] = useState('');
    const [playerActive, setPlayerActive] = useState('')
    const [allplayers, setAllPlayers] = useState({})
    const [stateWeek, setStateWeek] = useState(['WC'])


    const getPlayerScore = (player_id) => {
        const scoring_settings = league.league.scoring_settings

        let total_points = 0;
        stateWeek.map(w => {
            const player_breakdown = scoring[w][player_id]
            const points_week = Object.keys(player_breakdown || {})
                .filter(x => Object.keys(scoring_settings).includes(x))
                .reduce((acc, cur) => acc + player_breakdown[cur] * scoring_settings[cur], 0)

            total_points += points_week
        })
        return total_points.toFixed(2) || '0.00'
    }

    const getPlayerBreakdown = (player_id) => {
        const scoring_settings = league.league.scoring_settings

        let breakdown = {}
        stateWeek.map(w => {
            const player_breakdown = scoring[w][player_id]
            Object.keys(player_breakdown || {})
                .filter(x => Object.keys(scoring_settings).includes(x))
                .map(key => {
                    return breakdown[key] = Object.keys(breakdown).includes(key) ? breakdown[key] + (player_breakdown[key] * scoring_settings[key]) : (player_breakdown[key] * scoring_settings[key])
                })


        })
        return breakdown
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            const scores = await axios.get('/playoffscores')
            setScoring(scores.data.scoring)
            setAllPlayers(scores.data.allplayers)

            const league_data = await axios.get('/playoffs/league', {
                params: {
                    league_id: params.league_id
                }
            })

            setLeague(league_data.data)

            setIsLoading(false)
        }
        fetchData()

        const getScoringUpdates = setInterval(async () => {
            const scores = await axios.get('/playoffscores')
            setScoring(scores.data.scoring)
        }, 60 * 1000)

        return () => {
            clearInterval(getScoringUpdates)
        }
    }, [params.league_id])

    const tertiary_headers = [
        [
            {
                text: 'Category',
                colSpan: 5
            },
            {
                text: 'Points',
                colSpan: 2
            }
        ]
    ]

    const secondary_headers = [
        [
            {
                text: 'Player',
                colSpan: 5
            },
            {
                text: 'Points',
                colSpan: 2
            }
        ]
    ]

    const summary_headers = [
        [
            {
                text: 'Manager',
                colSpan: 5
            },
            {
                text: 'Points',
                colSpan: 2
            }
        ]
    ]

    let points = {};
    Object.keys(scoring)
        .map(key => {

            points[key] = 5
        })


    const summary_body = league.rosters
        ?.sort((a, b) => b.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(cur)), 0) - a.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(cur)), 0))
        ?.map(roster => {
            const secondary_body = roster.players
                ?.sort((a, b) => parseFloat(getPlayerScore(b)) - parseFloat(getPlayerScore(a)))
                ?.map(player_id => {
                    const breakdown = getPlayerBreakdown(player_id) || {}
                    const tertiary_body = Object.keys(breakdown || {})
                        ?.map(key => {
                            return {
                                id: key,
                                list: [
                                    {
                                        text: key,
                                        colSpan: 5
                                    },
                                    {
                                        text: breakdown[key].toFixed(2),
                                        colSpan: 2
                                    }
                                ]
                            }
                        })
                    console.log(tertiary_body)
                    return {
                        id: player_id,
                        list: [
                            {
                                text: allplayers[player_id]?.full_name,
                                colSpan: 5
                            },
                            {
                                text: getPlayerScore(player_id),
                                colSpan: 2
                            }
                        ],
                        secondary_table: (
                            <TableMain
                                type={'tertiary'}
                                headers={tertiary_headers}
                                body={tertiary_body}
                            />
                        )
                    }
                })

            return {
                id: roster.roster_id,
                list: [
                    {
                        text: league.users.find(u => u.user_id === roster.owner_id)?.display_name || '-',
                        colSpan: 5
                    },
                    {
                        text: roster.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(cur)), 0).toFixed(2) || '0.00',
                        colSpan: 2
                    }
                ],
                secondary_table: (
                    <>
                        <div className="secondary nav">
                            {
                                Array.from(new Set(roster.players.map(player_id => allplayers[player_id]?.team)))
                                    .sort((a, b) => roster.players.filter(player_id => allplayers[player_id]?.team === b).length - roster.players.filter(player_id => allplayers[player_id]?.team === a).length)
                                    .map(team =>
                                        <button className="active small">
                                            {team}: {roster.players.filter(player_id => allplayers[player_id]?.team === team).length}
                                        </button>
                                    )
                            }
                        </div>
                        <TableMain
                            type={'secondary'}
                            headers={secondary_headers}
                            body={secondary_body}
                            itemActive={playerActive}
                            setItemActive={setPlayerActive}
                        />
                    </>
                )
            }
        })


    return isLoading ? 'Loading' : <>

        <h1>{league.league?.name}</h1>
        <div className="primary nav">
            {
                Object.keys(scoring)
                    .sort((a, b) => scoring[a].index - scoring[b].index)
                    .map((key, index) =>
                        <button
                            key={key}
                            className={stateWeek.includes(key) ? 'active click' : 'click'}
                            onClick={stateWeek.includes(key) ? () => setStateWeek(prevState => prevState.filter(x => x !== key)) : () => setStateWeek(prevState => [...prevState, key])}
                        >
                            {key.replace('_', ' ')}
                        </button>
                    )
            }
        </div>
        <TableMain
            type={'main'}
            headers={summary_headers}
            body={summary_body}
            itemActive={itemActive}
            setItemActive={setItemActive}
        />
    </>
}

export default Playoffs;