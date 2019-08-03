var tableData;

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

function getAnime(rowPos)
{
    var url = "https://api.jikan.moe/v3/anime/"
    url += tableData.results[rowPos - 1].mal_id
    console.log(url)

    var xhr = new XMLHttpRequest()
    xhr.open("GET", url)
    xhr.responseType = "text"
    xhr.addEventListener("load", calculateTimeToWatch)
    xhr.send()
}

function calculateTimeToWatch()
{
    var fullAnime = JSON.parse(this.responseText)
    console.log(fullAnime.duration)
}

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
