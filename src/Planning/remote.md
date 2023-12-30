TO: CEOs of Q Game  
FROM: Ha Ngo and David O'Brien  
DATE: November 09 2023  
SUBJECT: Remote Protocol  

### Remote-Proxy Protocol Design

#### 1. Player Registration:    
A player registers for the Q Game by connecting to a remote proxy that it could communicate to. The player inoke `register()` on the game proxy, which will send a message with the below format, including the neccessary information to register for a game, to the player proxy on the server side. The player proxy receives the message and mimics the behavior of the actual player, by invoking `register()` on the actual server. Then, the server registers the player and (through the proxy) responses with a message indicating success or failure of the registration. Failure could be sent in the case no games available.    
   - **Request:**
     ```json
     {
       "action": "register",
       "player_name": "Player1",
       "player_age": "10"
     }
     ```
   - **Response:**
     ```json
     {
       "status": "success", // or failed if cannot register
       "message": "Player registered successfully"
     }
     ```

#### 2. Launching a Game:   
When the referee has enough players registered to run a Q game, the server sends a request to set up players, through player proxy, which communicate with game proxy on the client side. Then the game proxy will invoke `setup()` on players with appropriate information. The format of request messages are indicated below. Since setup is void() in players, we don't need a informative response from players, unless they raise an error. The game proxy could return a message containing an error message or an ack for the server to know that they received the message. The player proxy throws an error as a response to the ref if they receive an error message.    
   - **Request:**
     ```json
     {
       "action": "set_up",
       "game_id": "game123",
       "player_id": "peer1",
       "jState": "...JState information"
     }
     ```
  - **Response:**
     ```json
     {
       "type": "ack",
     }
     ```
    - or
    ```json
    {
      "type": "error",
      "message": "error message"
    }
     ```
#### 2. Running a Game:
This process has similar procedure as the above process. Once the game is setup and running, referee invokes `takeTurn()` on the current active player proxy, which then sends a request message to the game proxy. The game proxy invokes `taketurn()` on the real player, which either receives a turn action or an error back. It then reports the outcome to the player proxy and then the ref. The ref handles any abnormal behvaiors from the player, and shut down communication with them if necessary (which also happens in other phrases).

   - **Request:**
     ```json
     {
       "action": "take_turn",
       "game_id": "game123",
       "player_id": "peer1",
       "jState": "...JState information"
     }
     ```
  - **Response:**
     ```json
     {
       "type": "ack",
     }
     ```  
    - or

     ```json
    {
       "type": "error",
       "message": "error message"
     }
     ```

#### 3. Reporting Game Result:

   - **Request:**
     ```json
     {
       "action": "win",
       "game_id": "game123",
       "win": "true", // false if losers
     }
     ```
   - **Response:**
     ```json
     {
       "status": "success",
       "message": "Result reported successfully"
     }
     ```

      - or

     ```json
     {
       "type": "error",
       "message": "error message"
     }
     ```

   - After the game is completed, the players receive the result through the remote proxy.
   - The referee announces the results by invoking `win()` on the proxy player, which then sends message to the corresponding proxy on the client side. The game proxy could response with a message containing error, then the player proxy reports it to the ref and the ref moves them to misbehaved players.

This protocol provide a basic structure for managing players, launching games, and reporting results in a distributed gaming system. Peers can implement the remote proxy to facilitate communication with the referee, allowing for a more modular and scalable design.


