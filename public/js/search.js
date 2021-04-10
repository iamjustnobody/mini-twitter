var timer; //global scope so previous timer can be accessed

$(searchBox).keydown((event)=>{
    clearTimeout();//reset previous timer
    var textbox=$(event.target)
    var value=textbox.val()
    var searchType=textbox.data().search //data-search in searchPage.pug//selectedTab from searchRoutes
    console.log('searchbox:',value,searchType)

    timer=setTimeout(() => {
        value=textbox.val().trim();
        if(value==''){
            $(".resultsContainer").html('')
        }
        else{
            console.log(value)
            search(value,searchType)
            
        }
    }, 1000);
})

function search(searchTerm,searchType){
    var url=searchType=="users"?"/api/users":"api/posts" 
    //selectedTab from searchRoutes: 'search/:selectedTab' so if '/search/bacon' directly goes to Posts tab with '/search/bacon' url
    //since selectedTab!='users' in searchPage.pug & router.get('/') in searchRoutes.js
    //so not `api/${}` to avoid fire api call /api/bacon
    $.get(url,{search:searchTerm},(searchRes)=>{ //req.query.search in api routes // '/?&'
        console.log('search results ',searchRes) //populated (as defined in getPosts in posts.js) searchRes

        if(searchType=='users'){

        }else{
            outputPosts(searchRes,$('.resultsContainer'))
        }
    })
}