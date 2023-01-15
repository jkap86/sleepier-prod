import { Link, useNavigate, redirect, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { loadingIcon } from '../Functions/misc';
import View from "./view";
import { getLeagueData } from '../Functions/loadData';

const Main = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [seasons_options, setSeasons_options] = useState([]);
    const [stateState, setStateState] = useState({})
    const [stateAllPlayers, setStateAllPlayers] = useState({});
    const [state_user, setState_User] = useState(false);
    const [stateLeagues, setStateLeagues] = useState([]);
    const [stateLeaguemates, setStateLeaguemates] = useState([]);
    const [statePlayerShares, setStatePlayerShares] = useState([]);
    const [stateMatchups, setStateMatchups] = useState([]);


    useEffect(() => {

        const fetchData = async () => {
            setIsLoading(true)

            let user;
            try {
                user = await axios.get('/user', {
                    params: {
                        username: params.username,
                        season: params.season
                    }
                })
            } catch (error) {
                console.log(error)
            }

            if (user.data?.leagues) {
                let allplayers;
                try {
                    allplayers = await axios.get('/allplayers', {
                        timeout: 5000
                    })
                } catch (error) {
                    console.log(error)
                }
                setSeasons_options(user.data.seasons)
                setStateState({
                    ...user.data.state,
                    seasons: user.data.seasons
                })
                setStateAllPlayers(allplayers.data)
                setState_User({
                    username: user.data.username,
                    user_id: user.data.user_id,
                    avatar: user.data.avatar
                })

                const data = getLeagueData(user.data.leagues, user.data.user_id, stateState, params.season)
                console.log({
                    leagues: user.data.leagues,
                    players: data.players,
                    leaguemates: data.leaguemates,
                    matchups: data.matchups,
                    state: stateState
                })
                setStateLeagues(user.data.leagues)
                setStatePlayerShares(data.players)
                setStateLeaguemates(data.leaguemates)
                setStateMatchups(data.matchups)

            } else {
                setState_User({
                    error: user.data
                })
            }
            setIsLoading(false)

        }
        fetchData()
    }, [params.username, params.season])


    return <>
        {
            isLoading ?
                <div className="loading">
                    <h1 className="loading">
                        {isLoading && loadingIcon}
                    </h1>
                </div>
                :
                state_user.error ||
                <React.Suspense fallback={loadingIcon}>
                    <View
                        stateState={stateState}
                        stateAllPlayers={stateAllPlayers}
                        state_user={state_user}
                        stateLeagues={stateLeagues}
                        stateLeaguemates={stateLeaguemates}
                        statePlayerShares={statePlayerShares}
                        stateMatchups={stateMatchups}
                    />
                </React.Suspense>
        }
    </>
}

export default Main;