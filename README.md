# chatapp
Simple chat application using websocket, node, mongo. It doesn't have an UI. A chrome extension 'Simple WebSocket Client' can be used.

Prerequisite: MongoDB

Check out repository
Run npm install

To start appliacation
Run npm start
open 'Simple WebSocket Client' a chrome extension.
provide url as below

for 1 on 1 chat
ws://localhost:8000?username=<your name>&tousername=<to name>
eg: ws://localhost:8000?username=user1&tousername=user2


for multiple users (provide a positive number in chatroomid)
ws://localhost:8000?chatroomid=<positive id>&username=<your name>
eg: ws://localhost:8000?chatroomid=1&username=user1
  
