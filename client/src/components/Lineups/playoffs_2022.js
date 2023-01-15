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
    const [allplayers, setAllPlayers] = useState({})
    const [week, setWeek] = useState('WC')


    const getPlayerScore = (player_breakdown, scoring_settings) => {
        console.log({
            player_breakdown: player_breakdown
        })
        const points = Object.keys(player_breakdown || {})
            .filter(x => Object.keys(scoring_settings).includes(x))
            .reduce((acc, cur) => acc + player_breakdown[cur] * scoring_settings[cur], 0)

        return points.toFixed(2) || '1'
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            const scores = await axios.get('/playoffscores')
            const league = await axios.get(`https://api.sleeper.app/v1/league/${params.league_id}`)
            const rosters = await axios.get(`https://api.sleeper.app/v1/league/${params.league_id}/rosters`)
            const users = await axios.get(`https://api.sleeper.app/v1/league/${params.league_id}/users`)


            setScoring(scores.data.scoring)
            setAllPlayers(scores.data.allplayers)

            setLeague({
                league: league.data,
                rosters: rosters.data,
                users: users.data
            })


            setIsLoading(false)
        }
        fetchData()
    }, [params.league_id])

    console.log(scoring)

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
            console.log(`key - ${key}`)
            points[key] = 5
        })

    console.log(points)

    const summary_body = league.rosters
        ?.sort((a, b) => b.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(scoring[week][cur], league.league.scoring_settings)), 0) - a.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(scoring[week][cur], league.league.scoring_settings)), 0))
        ?.map(roster => {
            const secondary_body = roster.players
                ?.sort((a, b) => parseFloat(getPlayerScore(scoring[week][b], league.league.scoring_settings)) - parseFloat(getPlayerScore(scoring[week][a], league.league.scoring_settings)))
                ?.map(player_id => {
                    return {
                        id: player_id,
                        list: [
                            {
                                text: allplayers[player_id]?.full_name,
                                colSpan: 5
                            },
                            {
                                text: getPlayerScore(scoring[week][player_id], league.league.scoring_settings),
                                colSpan: 2
                            }
                        ]
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
                        text: roster.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(scoring[week][cur], league.league.scoring_settings)), 0).toFixed(2) || '0.00',
                        colSpan: 2
                    }
                ],
                secondary_table: (
                    <>
                        <div className="secondary nav">
                            {
                                Object.keys(scoring)
                                    .sort((a, b) => scoring[a].index - scoring[b].index)
                                    .map((key, index) =>
                                        <button
                                            className={week === key ? 'active click' : 'click'}
                                            onClick={() => setWeek(key)}
                                        >
                                            {key.replace('_', ' ')}
                                        </button>
                                    )
                            }
                        </div>
                        <TableMain
                            type={'secondary'}
                            headers={secondary_headers}
                            body={secondary_body}
                        />
                    </>
                )
            }
        })


    return isLoading ? 'Loading' : <>

        <h1>{league.league?.name}</h1>
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