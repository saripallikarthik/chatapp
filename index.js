wsocket = require("ws");
url = require("url");

repository = require("./repository.js");

wsServer = new wsocket.Server({port : 8000});

let chatRoomList = [];
let oneOnOneMembers = [];
let chatRoomMembers = [];


wsServer.on('connection', async(wsClient, req) => {
	const parameters = url.parse(req.url, true);
	wsClient.id = parameters.query.id;
	wsClient.userName = parameters.query.username;
	wsClient.toUserName = parameters.query.tousername;
	wsClient.chatRoomId = parseInt(parameters.query.chatroomid);
		
	if(!wsClient.chatRoomId){
		
		//to be moved to DB initialization
		let nextRoomId = -1
		const nextRoomIdDoc = await repository.Find("nextRoomIdDoc", {"toFind" : 1});
		if(!nextRoomIdDoc){
			repository.Insert("nextRoomIdDoc", {"toFind" : 1, "nextRoomId" : -1});		
		}
		else{
			nextRoomId = nextRoomIdDoc.nextRoomId;
		}
		
		const oneOnOneChat = await repository.Find("oneOnOneMembers", {$and: [{"users": wsClient.toUserName}, {"users": wsClient.userName}]});
		
		if(oneOnOneChat){
			wsClient.chatRoomId = oneOnOneChat.chatRoomId;
		}
		else{
		
			repository.Insert("oneOnOneMembers", {"chatRoomId" : nextRoomId, "users" : [wsClient.userName, wsClient.toUserName]});
			wsClient.chatRoomId = nextRoomId;
			
			repository.Update("nextRoomIdDoc", {"toFind" : 1}, {$set:{"nextRoomId" : nextRoomId - 1}});
		}
	}
	
	const chatRoom = await repository.Find("chatRooms", {"chatRoomId" : wsClient.chatRoomId});		
	if(chatRoom && chatRoom.messageQueue) {chatRoom.messageQueue.forEach(msg => wsClient.send(msg));}
		
	
	wsClient.on('message', async(message) => {
				
		const chatRoomUsers =  await repository.Find("chatRoomUsers", {"chatRoomId" : wsClient.chatRoomId});
		if(chatRoomUsers){
			
			const userFound = chatRoomUsers.userNames.some(el => el === wsClient.userName);
			if(!userFound){
				repository.Update("chatRoomUsers", {"chatRoomId" : chatRoomUsers.chatRoomId}, {$push:{"userNames" : wsClient.userName}})
			}

			const chatRoom = await repository.Find("chatRooms", {"chatRoomId" : wsClient.chatRoomId});
			repository.Update("chatRooms", {"chatRoomId" : chatRoom.chatRoomId}, {$push:{"messageQueue" : wsClient.userName + ' : ' + message}});
		}
		else {			
			repository.Insert("chatRooms", {"chatRoomId" : wsClient.chatRoomId, "messageQueue" : [wsClient.userName + ' : ' + message]});
			repository.Insert("chatRoomUsers", {"chatRoomId" : wsClient.chatRoomId, "userNames" : [wsClient.userName]});
		}
				
		wsServer.clients.forEach( client => {
			if(client.userName != wsClient.userName && client.chatRoomId == wsClient.chatRoomId) client.send(wsClient.userName + ' : ' + message);
		});
	});	
});

