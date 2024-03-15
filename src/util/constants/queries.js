const MAINQUERY = `
query {
  player(uuid: "*") {
    username
    collections {
      currency {
        coins
        gems
        silver
        materialDust
        royalReputation
      }
    }
    ranks
    social {
      party {
        active
        leader {
          username
        }
        members {
          username
        }
      }
    }
    status {
      online
      firstJoin
      lastJoin
      server {
        associatedGame
        category
        subType
      }
    }
    statistics {
      games: value(statisticKey: "games_played") {
        value
      }
      bb_games: value(statisticKey: "battle_box_quads_games_played") {
        value
      }
      bb_kills: value(statisticKey: "battle_box_quads_players_killed") {
        value
      }
      bb_wins: value(statisticKey: "battle_box_quads_team_first_place") {
        value
      }
      dyb_games: value(statisticKey: "dynaball_games_played") {
        value
      }
      dyb_kills: value(statisticKey: "dynaball_players_eliminated") {
        value
      }
      dyb_wins: value(statisticKey: "dynaball_wins") {
        value
      }
      hitw_games: value(statisticKey: "hole_in_the_wall_games_played") {
        value
      }
      hitw_wins: value(statisticKey: "hole_in_the_wall_first_place") {
        value
      }
      hitw_walls: value(statisticKey: "hole_in_the_wall_walls_dodged") {
        value
      }
      sb_games: value(statisticKey: "sky_battle_quads_games_played") {
        value
      }
      sb_kills: value(statisticKey: "sky_battle_quads_players_killed") {
        value
      }
      sb_wins: value(statisticKey: "sky_battle_quads_team_placement_1") {
        value
      }
      tgttos_games: value(statisticKey: "tgttos_games_played") {
        value
      }
      tgttos_wins: value(statisticKey: "tgttos_first_place") {
        value
      }
      tgttos_round_wins: value(statisticKey: "tgttos_round_first_place") {
        value
      }
    }
  }
}
`
const CURRENCYQUERY = `
query {
  player(uuid: "*") {
    username
    collections {
      currency {
        coins
        gems
        silver
        materialDust
        royalReputation
      }
    }
  }
}
`
const BADGESQUERY = `
query {
    player(uuid: "*") {
    username
    statistics {
        
    }
  }
}  
`
const BBQUERY = `

`
const DYBQUERY = `

`
const HITWQUERY = `

`
const SBQUERY = `

`
const TGTTOSQUERY = `

`
module.exports(MAINQUERY, CURRENCYQUERY, BADGESQUERY, BBQUERY, DYBQUERY, HITWQUERY, SBQUERY, TGTTOSQUERY)