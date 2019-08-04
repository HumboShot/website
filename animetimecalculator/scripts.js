var tableData;

var searchButton = document.getElementById("searchButton")
searchButton.addEventListener("click", function()
{
    searchForAnime()
})

var searchField = document.getElementById("searchBar")
searchField.addEventListener("keydown", function(e)
{
    if(e.keyCode === 13)
    {
        searchForAnime()
    }
})

function searchForAnime()
{
    //Clear table
    $("tbody").children().remove()

    // Make url
    var url = new URL("https://api.jikan.moe/v3/search/anime")
    url.searchParams.append("q", searchField.value)
    console.log(url)

    //Make get request
    var xhr = new XMLHttpRequest()
    xhr.open("GET", url)
    xhr.responseType = "text"
    xhr.addEventListener("load", showSearchResults)
    xhr.send()
}

function showSearchResults()
{
    var searchResults = JSON.parse(this.responseText)
    console.log(searchResults)
    console.log(searchResults.results)
    tableData = searchResults
    for(var i = 0; i < searchResults.results.length; i++)
    {
        var element = document.getElementById("searchTableBody")
        var rowElement= document.createElement("tr")

        var imageCol = document.createElement("img")
        var titleCol = document.createElement("td")
        var episodeCol = document.createElement("td")
        var typeCol = document.createElement("td")
        var airingCol = document.createElement("td")

        imageCol.src = searchResults.results[i].image_url
        imageCol.classList.add("cover-img")

        var titleColText = document.createTextNode(searchResults.results[i].title)
        var episodeColText = document.createTextNode(searchResults.results[i].episodes)
        var typeColText = document.createTextNode(searchResults.results[i].type)
        var airingColText = document.createTextNode(searchResults.results[i].airing)

        rowElement.appendChild(imageCol)
        rowElement.appendChild(titleCol)
        rowElement.appendChild(episodeCol)
        rowElement.appendChild(typeCol)
        rowElement.appendChild(airingCol)
        
        titleCol.appendChild(titleColText)
        episodeCol.appendChild(episodeColText)
        typeCol.appendChild(typeColText)
        airingCol.appendChild(airingColText)

        rowElement.addEventListener('click', onRowClicked)

        element.appendChild(rowElement)
    }
}

function onRowClicked()
{
    console.log("Clicked row")
    getAnime(this.rowIndex)
}

function getAnime(rowPos)
{
    var url = "https://api.jikan.moe/v3/anime/"
    url += tableData.results[rowPos - 1].mal_id

    var xhr = new XMLHttpRequest()
    xhr.open("GET", url)
    xhr.responseType = "text"
    xhr.addEventListener("load", calculateTimeToWatch)
    xhr.send()
}

function calculateTimeToWatch()
{
    var fullAnime = JSON.parse(this.responseText)
    var rawDurations = fullAnime.duration.split(/\b\s+/)

    var timeInMintuesPerEpisode = 0
    for (let index = 0; index < rawDurations.length; index++) {
        const element = rawDurations[index];
        if(parseInt(element))
        {
            var nextElement = rawDurations[index + 1]
            var timeAsInt = parseInt(element)
            if(nextElement == "min")
                timeInMintuesPerEpisode = timeInMintuesPerEpisode + timeAsInt
            else if(nextElement == "hr")
                timeInMintuesPerEpisode = timeInMintuesPerEpisode + (timeAsInt * 60)
        }    
    }

    var timeCalSpan = document.getElementById("timeCal")
    timeCalSpan.textContent = formatTimeToWatchString(timeInMintuesPerEpisode, fullAnime.episodes, fullAnime.title)
}

function formatTimeToWatchString(timeInMintuesPerEpisode, amountOfEpisodes, animeTitle)
{
    var fullTime = (timeInMintuesPerEpisode * amountOfEpisodes)

    var formattedTime = formatTime(fullTime)

    var fullString = "It would take " + formattedTime;

    if(amountOfEpisodes > 1)
    {
        fullString += " to watch " + amountOfEpisodes + " episodes of " + animeTitle
    }
    else if (amountOfEpisodes == 1)
    {
        fullString += " to watch " + animeTitle
    }
    else
    {
        fullString = "No episodes found for " + animeTitle +", maybe it's because there no confirmed amount of episodes on MyAnimeList"
    }

    return fullString 
}

function formatTime(fullTime)
{
    var hours = Math.floor(fullTime/60)
    var minutes = Math.floor(fullTime - (hours * 60))

    var returnString = ""
    if(hours > 0)
    {
        returnString += hours + " hours"
        if(minutes > 0)
        {
            returnString += " and "
        }
    }

    if(minutes > 0)
    {
        returnString += minutes + " mintues"
    }

    return returnString
}