### To: Dot Game Employees

### From: Nicolas Araujo and Nikhil Goel

### CC: Dot Game Employees Group

### Date: September 13, 2023

### Subject: Planning of first three sprints

#

Each of these sprints should produce a (set of) component(s) of manageable size in about two days (16 hours) of work.

# Sprint One:

<font size="3">
The first task will be to create the data representation and the referee in that order. The referee depends on the data representation, so we will start with implementing the pieces and other game components/state. Then we will make the referee logic to implement the rules of the game.
</font>

# Sprint Two:

<font size="3">
Once we have built a referee and data representations, we have a better understanding of the "truth", or how the game will be stored. Therefore, in sprint 2 we decided we are going to build the player-referee interface and the communication logic. Since we have built the referee logic, we are able to better craft messages that show how to take a turn and other game resources. To use this interface, we need to be setup the communication logic, which is why we are also doing it in this sprint.
</font>

# Sprint Three:

<font size="3">
For our last sprint, we are tackling the rest of the required components, which include the players, observers, and miscellaneous stuff like setting up player registration. Since we already have a referee and a means of communicating with them setting up a player should be easier as we know what data players will get and what their output should be. We also set up the observers and other miscellaneous stuff at the end when we have a better understanding of the system and how each piece fits in.
</font>
