# List of current commands in Islander:

## Key:

{R} -> Required option.

{C} -> Choiced option. (Input is limited to predetermined options)

## Commands:

### Root commands (without subcommands):

/ping - Details about the bot's ping through both the client and the websocket. Options: [websocket - boolean]

/begin_vote - Creates a vote for the next game in a tournament. Options: [title - string {R}, duration - integer {R}, ending - string {R}, role - role]

### /generate_team - main command of subcommands:

/generate_team with_discord - Generates a team image using Discord avatars. Options: [team - string {C + R}, user_one - user {R}, user_two - user {R}, user_three - user {R}, user_four - user {R}, event_number - integer, emblem - attachment]

/generate_team with_minecraft - Generates a team image using Minecraft skin faces. Options: [team - string {C + R}, player_one - string {R}, player_two - string {R}, player_three - string {R}, player_four - string {R}, event_number - integer, emblem - attachment]

/generate_team with_custom - Generates a team image using custom images and text. Options: [team - attachment {R}, image_one - attachment {R}, image_two - attachment {R}, image_three - attachment {R}, image_four - attachment {R}, name_one - string {R}, name_two - string {R}, name_three - string {R}, name_four - string {R}, event_number - integer, emblem - attachment]

### /retrieve_icon - main command of subcommands:
#### /retrieve_icon minecraft - main command of subcommands: 
/retrieve_icon minecraft single -  Returns a single downloadable Minecraft face. Options: [player - string {R}]

/retrieve_icon minecraft quad -  Returns a 4 downloadable Minecraft faces. Options: [player_one - string {R}, player_two - string {R}, player_three - string {R}, player_four - string {R}]
#### /retrieve_icon discord - main command of subcommands: 
/retrieve_icon discord single -  Returns a single downloadable Discord avatar. Options: [user - user {R}]

/retrieve_icon discord quad -  Returns a 4 downloadable Discord avatars. Options: [user_one - user {R}, user_two - user {R}, user_three - user {R}, user_four - user {R}]

### /tournament_commands - main command of subcommands:
/tournament_commands substitute - Gives a player the tournament roles another player has and removes the original person's roles. Options: [original_player - user {R}, new_player - user {R}, tournament_role - role {R}, extra_tournament_role - role]

/tournament_commands team_role_give - [player_one - user {R}, player_two - user {R}, player_three - user {R}, player_four - user {R}, tournament_role - role {R}, extra_tournament_role - role]
