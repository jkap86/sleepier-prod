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



    const getPlayerScore = (player_breakdown, scoring_settings) => {

        const points = Object.keys(player_breakdown || {})
            .filter(x => Object.keys(scoring_settings).includes(x))
            .reduce((acc, cur) => acc + player_breakdown[cur] * scoring_settings[cur], 0)

        return points.toFixed(2) || '0'
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
            console.log(scores.data)
            setLeague({
                league: league.data,
                rosters: rosters.data
                    .map(roster => {
                        return {
                            ...roster,
                            points: roster.players
                                .reduce((acc, cur) => acc + parseInt(getPlayerScore(scores.data.scoring[cur], league.data.scoring_settings) || 0), 0)
                                .toFixed(2)
                        }
                    }),
                users: users.data
            })

            console.log({
                league: league.data,
                rosters: rosters.data,
                users: users.data
            })
            setIsLoading(false)
        }
        fetchData()
    }, [params.league_id])

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

    const summary_body = league.rosters
        ?.sort((a, b) => b.points - a.points)
        ?.map(roster => {
            const secondary_body = roster.players
                ?.sort((a, b) => getPlayerScore(scoring[b], league.league.scoring_settings) - getPlayerScore(scoring[a], league.league.scoring_settings))
                ?.map(player_id => {
                    return {
                        id: player_id,
                        list: [
                            {
                                text: allplayers[player_id]?.full_name,
                                colSpan: 5
                            },
                            {
                                text: getPlayerScore(scoring[player_id], league.league.scoring_settings),
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
                        text: roster.points,
                        colSpan: 2
                    }
                ],
                secondary_table: (
                    <>
                        <div className="secondary nav">
                            <button>
                                Week 18
                            </button>
                            <button
                                className={'active click'}
                            >
                                WC
                            </button>
                            <button>
                                Div
                            </button>
                            <button>
                                Conf
                            </button>
                            <button>
                                SB
                            </button>
                            <button>
                                Total
                            </button>
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