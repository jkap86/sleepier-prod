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
        ?.sort((a, b) => b.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(cur)), 0) - a.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(cur)), 0))
        ?.map(roster => {
            const secondary_body = roster.players
                ?.sort((a, b) => parseFloat(getPlayerScore(b)) - parseFloat(getPlayerScore(a)))
                ?.map(player_id => {
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
                        text: roster.players.reduce((acc, cur) => acc + parseFloat(getPlayerScore(cur)), 0).toFixed(2) || '0.00',
                        colSpan: 2
                    }
                ],
                secondary_table: (
                    <>
                        <div className="secondary nav">
                            <button className="active">Players Left:</button>
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
        <div className="primary nav">
            {
                Object.keys(scoring)
                    .sort((a, b) => scoring[a].index - scoring[b].index)
                    .map((key, index) =>
                        <button
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