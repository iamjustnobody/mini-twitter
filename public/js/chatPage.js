/*
console.log(chatID1,typeof chatID1) //string
console.log(chatID2,typeof chatID2) //string
console.log(chatID3,typeof chatID3) //string
console.log(chatID4,typeof chatID4) //string
//console.log(chatID5,typeof chatID5)
//console.log(chatID6,typeof chatID6)
//console.log(chatID7,typeof chatID7)
//console.log(chatID8,typeof chatID8)
console.log(document.querySelector('.test').dataset.id1,typeof document.querySelector('.test').dataset.id1)//string
console.log(document.querySelector('.test').dataset.id2,typeof document.querySelector('.test').dataset.id2)//string
console.log(document.querySelector('.test').dataset.id3,typeof document.querySelector('.test').dataset.id3)//string
console.log(document.querySelector('.test').dataset.id4,typeof document.querySelector('.test').dataset.id4)//string
*/


$("document").ready(()=>{
    
    $.get(`/api/chats/${chatID}`,(chatData)=>{
        $("#chatName").text(chatData.chatName?chatData.chatName:getOtherChatUsersNamesString(chatData.users))
        //copied from inboxPage.Js
        //above helperfunctions in here chatPageJs (retuned data/argument from apiRoute chatsJs)
        //below:moving helper functions to apiRoute chatsJs '/api/chats/chatid'
        //$("#chatName").text(chatData.chat_name) // ok when get('/:chatid') from chatsJs return plainJsObj1     
        //$("#chatName").text(chatData.chatName) // ok when get('/:chatid') from chatsJs return plainJsObj2 or chat
        //$("#chatName").text(chatData.chat_name) //not ok newly created field on mongodbObj only works in backend;this field getting lost in frontendJs
    }) //ok
    
    //$("#chatName").text(chatJs.chatName?chatJs.chatName:getOtherChatUsersNamesString(chatJs.users)) //ok too no need to make ajax call 
    //just pass stringified chatObj from messagesRoutes GET '/messages/chatid' payload to chatPage.pug
    //helperfunctio in chatPageJs; no need for apiRoute chatsJs; data/argument from non-apiRoute messagesRouteJs

}) //can be replaced by defining default name or chat name in messagesRoute '/messages/chatid'(with helper functions in messagesRoutesJs)

$('#chatNameButton').click(()=>{
    var name=$('#chatNameTextbox').val().trim();
    //console.log(name)
    $.ajax({
        url:'/api/chats/'+ chatID, 
        type:'PUT',
        data:{
            chatname:name
        },
        success:(updatedData,status,xhr)=>{ //returned updatedChat from /api/chats/chatid PUT from chatsJs
            if(xhr.status!=204){
                //return alert('could not update')
            }
            location.reload();
            //$("#chatName").text(updatedData.chatName?updatedData.chatName:getOtherChatUsersNamesString(updatedData.users))
            //above needs returned updatedChat (populated) from api route '/api/chats/chatid" from chatsJs; also need to hide modal
            //ok as only has one input chatname field/bar on the chatPage.pug so with unique id (not using css class queryselector)
            //(so above html/text change wont apply to other with same classname like pin/unpin in commonJs) - list of post items
            //could solve by queryselector[index] (or specifying/adding another extra css class - but cannot do so for list of items which has same class but now diff classes just like ids)
        }
    })
})

//below two copied from inboxPage.js; or remove dup codes from both Js & move to commonJs instead
function getOtherChatUsersNamesString(users){
    var otherChatUsers=getOtherChatUsers(users);
    var namesArray=otherChatUsers.map(user=>{return user.fName+" "+user.lName})
    return namesArray.join(", ")
}

function getOtherChatUsers(users){
    if(users.length==1) return users
    return users.filter(user=>{
        return user._id!==userLoggedInJs._id
    })
}



//send Messages
$('.sendMessageButton').click(()=>{

})
$('.inputTextbox').keydown((event)=>{
    if(event.which===13 && !event.shiftKey){
        messageSubmitted() //enter key for submission
        return false //prevent entering new line
    }
})
function messageSubmitted(){

}
