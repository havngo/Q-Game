# Player Componenet

This folder holds implementations relevant for running a local and synchronous player. The implementation of a ProxyPlayer is located in Q/Server. This ProxyPlayer implements the same IPlayer interface from this folder.

# IPlayer

This represents a player which a referee will communicate with in a Q game. The referee will request moves from the player and will send it updates.

# IStrategy

This represents a strategy to find moves for a Q game. This is used by the Player class implementations in order to decide what moves should be made based on certain strategies.

# CheatFunction

This represnts a function which will attempt a certain cheat, returning an optional which will be empty if the type of cheat is not possible. This is only used by the FilthyCheater class.
