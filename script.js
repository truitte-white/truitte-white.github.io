//technical challenge number 1, searching by team name returns very limited information(but is the best search to use due to the variations of names that it returns)
// to return more advanced stats the team id needs to be mapped to the teamname to return the data. I got around this by returning the team ID from the original search,
//sticking the ID in a variable and then inserting the variable into the URL where the ID goes. I know if can be done with a function, will fix if I have time.
//technical challenge number 2, the API's are like a spiderweb of data, navigating through it all with clean concise code was tough, 
//then I started figuring out $ref's a little more so I was able to re-write code to make it a little more cleaner
//technical challenge number 3, getting the map on the screen, with the satdium names in to correct location, I would like the click to be associated
//with the team info, trying to figure that part out. Tried MapBox, and Google Maps and couldn't get a map to show, dug around and found leaflet, really great documentation
//and I had a map on the screen pretty quickly
//technical challenge number 4, after getting the team stadium map showing on the bottom of the page, I had to figure out a way to not show that area on the screen before searching
//I had to set the div as hidden and when the search was clicked set it to display then I wasn't able to search for another team, I kept getting an initialization error becasue of the map
//I had to read through the leaflet documentation about how to handle and finally found a way to make it work

const button = document.querySelector("#searchButton")
const teamLogoDisplay = document.querySelector("#teamLogos")
const teamName = document.querySelector("#teamName")
const teamRecord = document.querySelector("#teamRecord")
const venueAllImages = document.querySelector("#venueImages")
const venueInfo = document.querySelector("#venueData")
const venueInfoTitle = document.querySelector("#venueDataTitle")
const teamStats = document.querySelector("#teamStats")
const playerStats = document.querySelector("#playerStats")
const recordsWinLoss = document.querySelector("#recordsWinLoss")
const playerStatsTitle = document.querySelector("#playerStatsTitle")
const teamStatsTitle = document.querySelector("#teamStatsTitle")
const teamLocationMap = document.querySelector('#teamMap')
const WeatherData = document.querySelector('#weatherInfo')
const WeatherDataTitle = document.querySelector('#weatherInfoTitle')
let map2 = null //needed in order to remove the map when searching without refreshing the page
const apiKey = '3b93936521db4d49921220323230504'

let map = L.map('map').setView([37.8, -96], 4) //these next few lines creates the map at the top of the page, leaflet has some great documentation

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
}).addTo(map)

//get transparent NFL logo
//this is the array of objects that is used by the maps to put the markers in the proper location, display information on the markers
//had to edit stadium name in this array to match ESPN data so that it would map correctly, the EXPN data is not up-to-date like the data in the array was so some info is not correct
let stadiums = [
  {name: "State Farm Stadium", team: `<a href="https://www.azcardinals.com/" target="_blank">Arizona Cardinals</a>`, city: `Glendale, Arizona`, abbrev: `ARI`, location: {lat: 33.5276, lng: -112.2626}},
  {name: "Mercedes-Benz Stadium", team: `<a href="https://www.atlantafalcons.com/" target="_blank">Atlanta Falcons</a>`, city: `Atlanta, Georgia`, abbrev: `ATL`, location: {lat: 33.7550, lng: -84.4008}},
  {name: "M&T Bank Stadium", team: `<a href="https://www.baltimoreravens.com/" target="_blank">Baltimore Ravens</a>`, city: `Baltimore, Maryland`, abbrev: `BAL`, location: {lat: 39.2779, lng: -76.6228}},
  {name: "Highmark Stadium", team: `<a href="https://www.buffalobills.com/" target="_blank">Buffalo Bills</a>`, city: `Orchard Park, New York`, abbrev: `BUF`, location: {lat: 42.7740, lng: -78.7870}},
  {name: "Bank of America Stadium", team: `<a href="https://www.panthers.com/" target="_blank">Carolina Panthers</a>`, city: `Charlotte, North Carolina`, abbrev: `CAR`, location: {lat: 35.2258, lng: -80.8528}},
  {name: "Soldier Field", team: `<a href="https://www.chicagobears.com/" target="_blank">Chicago Bears</a>`, city: `Chicago, Illinois`, abbrev: `CHI`, location: {lat: 41.8623, lng: -87.6167}},
  {name: "Paycor Stadium", team: `<a href="https://www.bengals.com/" target="_blank">Cincinnati Bengals</a>`, city: `Cincinnati, Ohio`, abbrev: `CIN`, location: {lat: 39.0955, lng: -84.5161}},
  {name: "Cleveland Browns Stadium", team: `<a href="https://www.clevelandbrowns.com/" target="_blank">Cleveland Browns</a>`, city: `Cleveland, Ohio`, abbrev: `CLE`, location: {lat: 41.5061, lng: -81.6997}},
  {name: "AT&T Stadium", team: `<a href="https://www.dallascowboys.com/" target="_blank">Dallas Cowboys</a>`, city: `Arlington, Texas`, abbrev: `DAL`, location: {lat: 32.7473, lng: -97.0945}},
  {name: "Empower Field at Mile High", team: `<a href="https://www.denverbroncos.com/" target="_blank">Denver Broncos</a>`, city: `Denver, Colorado`, abbrev: `DEN`, location: {lat: 39.7439, lng: -105.0201}},
  {name: "Ford Field", team: `<a href="https://www.detroitlions.com/" target="_blank">Detroit Lions</a>`, city: `Detroit, Michigan`, abbrev: `DET`, location: {lat: 42.3400, lng: -83.0456}},
  {name: "Lambeau Field", team: `<a href="https://www.packers.com/" target="_blank">Green Bay Packers</a>`, city: `Green Bay, Wisconsin`, abbrev: `GB`, location: {lat: 44.5013, lng: -88.062}},
  {name: "NRG Stadium", team: `<a href="https://www.houstontexans.com/" target="_blank">Houston Texans</a>`, city: `Houston, Texas`, abbrev: `HOU`, location: {lat: 29.6847, lng: -95.4107}},
  {name: "Lucas Oil Stadium", team: `<a href="https://www.colts.com/" target="_blank">Indianapolis Colts</a>`, city: `Indianapolis, Indiana`, abbrev: `IND`, location: {lat: 39.7601, lng: -86.1639}},
  {name: "TIAA Bank Field", team: `<a href="https://www.jaguars.com/" target="_blank">Jacksonville Jaguars</a>`, city: `Jacksonville, Florida`, abbrev: `JAX`, location: {lat: 30.3239, lng: -81.6373}},
  {name: "GEHA Field at Arrowhead Stadium", team: `<a href="https://www.chiefs.com/" target="_blank">Kansas City Chiefs</a>`, city: `Kansas City, Missouri`, abbrev: `KC`, location: {lat: 39.0489, lng: -94.4839}},
  {name: "Allegiant Stadium", team: `<a href="https://www.raiders.com/" target="_blank">Las Vegas Raiders</a>`, city: `Paradise, Nevada`, abbrev: `LV`, location: {lat: 36.0908, lng: -115.1831}},
  {name: "Dignity Health Sports Park", team: `<a href="https://www.chargers.com/" target="_blank">Los Angeles Chargers</a>`, city: `Inglewood, California`, abbrev: `LAC`, location: {lat: 33.9535, lng: -118.3396}},
  {name: "Los Angeles Memorial Coliseum", team: `<a href="https://www.therams.com/" target="_blank">Los Angeles Rams</a>`, city: `Inglewood, California`, abbrev: `LAR`, location: {lat: 33.9535, lng: -118.3396}},
  {name: "Hard Rock Stadium", team: `<a href="https://www.miamidolphins.com/" target="_blank">Miami Dolphins</a>`, city: `Miami Gardens, Florida`, abbrev: `MIA`, location: {lat: 25.9580, lng: -80.2388}},
  {name: "U.S. Bank Stadium", team: `<a href="https://www.vikings.com/" target="_blank">Minnesota Vikings</a>`, city: `Minneapolis, Minnesota`, abbrev: `MIN`, location: {lat: 44.9740, lng: -93.2596}},
  {name: "Gillette Stadium", team: `<a href="https://www.patriots.com/" target="_blank">New England Patriots</a>`, city: `Foxborough, Massachusetts`, abbrev: `NE`, location: {lat: 42.0909, lng: -71.2643}},
  {name: "Caesars Superdome", team: `<a href="https://www.neworleanssaints.com/" target="_blank">New Orleans Saints</a>`, city: `New Orleans, Louisiana`, abbrev: `NO`, location: {lat: 29.9511, lng: -90.0822}},
  {name: "MetLife Stadium", team: `<a href="https://www.giants.com/" target="_blank">New York Giants</a>`, city: `East Rutherford, New Jersey`, abbrev: `NYG`, location: {lat: 40.8136, lng: -74.0743}},
  {name: "MetLife Stadium", team: `<a href="https://www.newyorkjets.com/" target="_blank">New York Jets</a>`, city: `East Rutherford, New Jersey`, abbrev: `NYJ`, location: {lat: 40.8136, lng: -74.0743}},
  {name: "Lincoln Financial Field", team: `<a href="https://www.philadelphiaeagles.com/" target="_blank">Philadelphia Eagles</a>`, city: `Philadelphia, Pennsylvania`, abbrev: `PHI`, location: {lat: 39.9008, lng: -75.1675}},
  {name: "Acrisure Stadium", team: `<a href="https://www.steelers.com/" target="_blank">Pittsburgh Steelers</a>`, city: `Pittsburgh, Pennsylvania`, abbrev: `PIT`, location: {lat: 40.4468, lng: -80.0158}},
  {name: "Levi's Stadium", team: `<a href="https://www.49ers.com/" target="_blank">San Francisco 49ers</a>`, city: `Santa Clara, California`, abbrev: `SF`, location: {lat: 37.4030, lng: -121.9702}},
  {name: "Lumen Field", team: `<a href="https://www.seahawks.com/" target="_blank">Seattle Seahawks</a>`, city: `Seattle, Washington`, abbrev: `SEA`, location: {lat: 47.5952, lng: -122.3316}},
  {name: "Raymond James Stadium", team: `<a href="https://www.buccaneers.com/" target="_blank">Tampa Bay Buccaneers</a>`, city: `Tampa, Florida`, abbrev: `TB`, location: {lat: 27.9759, lng: -82.5033}},
  {name: "Nissan Stadium", team: `<a href="https://www.tennesseetitans.com/" target="_blank">Tennessee Titans</a>`, city: `Nashville, Tennessee`, abbrev: `TEN`, location: {lat: 36.1664, lng: -86.7713}},
  {name: "FedExField", team: `<a href="https://www.commanders.com/" target="_blank">Washington Commanders</a>`, city: `Landover, Maryland`, abbrev: `WAS`, location: {lat: 38.9077, lng: -76.8644}}
  ]
//these next few lines creates the markers in the maps, stores the data in the markers array and searches the array to know what data, to put where
let markers = []

for (let i = 0; i < stadiums.length; i++) {
  let marker = L.marker([stadiums[i].location.lat, stadiums[i].location.lng]).addTo(map)
  marker.bindPopup(`${stadiums[i].name} - ${stadiums[i].city}<br>${stadiums[i].team} - Abbreviation for search ${stadiums[i].abbrev}`)
  markers.push(marker)
}

//the event listener for my button click
button.addEventListener('click', async (event) => {
    try {
    event.preventDefault()//still don't know why I need this but my browser tries to refresh on a button click without it
    document.getElementById("teamMap").style.display = ""//code to display the teamMap element that was turned off in the HTML
    
    const teamSearch = document.querySelector("#teamInput").value //https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams get abbreviation from here
    let teamResponse  = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamSearch}`)//this is the first API for the search
    let teamInfo = teamResponse.data.team //use this to grab the venue info below
    let teamLogo = teamInfo.logos[0].href //use this to grab the team logos
    let teamLink = teamInfo.links[0].href //use this to grab the hyperlink to ESPN site for the team, since all of the data is from ESPN, except from the map
    let teamLocation = teamInfo.location

    //had to prove to myself that I was able to pull information from unrelated API's using info from other API's
    let response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${teamLocation}&aqi=yes2`)
    let cityTemp = response.data.current.temp_f
    let feelTemp = response.data.current.feelslike_f
    let condition = response.data.current.condition.text
    let icon = response.data.current.condition.icon
    let wind = response.data.current.wind_mph
    let windDir = response.data.current.wind_dir
    let visibility = response.data.current.vis_miles
    let sun = response.data.current.uv
    let humid = response.data.current.humidity

    let teamId = teamInfo.id//grabbing the ID of the team from the API above to use on the API below
    let allTeamInfo = await axios.get(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2022/teams/${teamId}`)
    let venueCapacity = allTeamInfo.data.venue.capacity
    let venueName = allTeamInfo.data.venue.fullName
    let venueImages = allTeamInfo.data.venue.images

    //this data is like a bunch of spiderwebs of links so I had to learn about how I could use the $ref to help shorten this data up
    //the data below is for the team stats    
    const responseStatistic = await axios.get(allTeamInfo.data.statistics.$ref)
    const statisticValue = responseStatistic.data.splits
    const compPercent = statisticValue.categories[1].stats[1].displayValue
    const passYards = statisticValue.categories[1].stats[19].displayValue
    const passTDs = statisticValue.categories[1].stats[18].displayValue
    const rushAttempts = statisticValue.categories[2].stats[6].displayValue
    const rushYards = statisticValue.categories[2].stats[12].displayValue
    const rushTDs = statisticValue.categories[2].stats[11].displayValue
    const receptions = statisticValue.categories[3].stats[16].displayValue
    const recYards = statisticValue.categories[3].stats[12].displayValue
    const recTDs = statisticValue.categories[3].stats[11].displayValue
    const tackles = statisticValue.categories[4].stats[22].displayValue
    const sacks = statisticValue.categories[4].stats[14].displayValue
    const defensiveTDs = statisticValue.categories[4].stats[6].displayValue
    const ints = statisticValue.categories[5].stats[0].displayValue
    const fieldGoalsMade = statisticValue.categories[6].stats[21].displayValue
    const fieldGoalLong = statisticValue.categories[6].stats[37].displayValue
    const kickingPoints = statisticValue.categories[6].stats[40].displayValue
    const puntAVG = statisticValue.categories[8].stats[4].displayValue
    const puntLong = statisticValue.categories[8].stats[3].displayValue
    const puntBlock = statisticValue.categories[8].stats[8].displayValue
    const kickReturnYards = statisticValue.categories[7].stats[10].displayValue
    const puntReturnYards = statisticValue.categories[7].stats[27].displayValue
    const yardsPerReturn = statisticValue.categories[7].stats[33].displayValue
    const twoPointConv = statisticValue.categories[9].stats[11].displayValue
    const totalTDs = statisticValue.categories[9].stats[10].displayValue
    const totalPoints = statisticValue.categories[9].stats[8].displayValue
    const avgPointsGame = statisticValue.categories[9].stats[9].displayValue
    //the data below is used to show to team win-loss records
    const responseRecord = await axios.get(allTeamInfo.data.record.$ref)
    const recordValue = responseRecord.data
    const recordOverall = recordValue.items[0].displayValue
    const recordHome = recordValue.items[1].displayValue
    const recordAway = recordValue.items[2].displayValue
    const recordConf = recordValue.items[3].displayValue
    //the data below is used to show the player stats leaders
    const responseLeader = await axios.get(allTeamInfo.data.leaders.$ref)
    const leaderValue = responseLeader.data
    const passingLeader = leaderValue.categories[0].displayName
    const passingStats = leaderValue.categories[0].leaders[0].displayValue
    const rushingLeader = leaderValue.categories[1].displayName
    const rushingStats = leaderValue.categories[1].leaders[0].displayValue
    const receiving1Leader = leaderValue.categories[2].displayName
    const receiving1Stats = leaderValue.categories[2].leaders[0].displayValue
    const receiving2Leader = leaderValue.categories[2].displayName
    const receiving2Stats = leaderValue.categories[2].leaders[1].displayValue
    const tacklesLeader = leaderValue.categories[6].displayName
    const tacklesStats = leaderValue.categories[6].leaders[0].displayValue
    const sackLeader = leaderValue.categories[7].displayName
    const sackStats = leaderValue.categories[7].leaders[0].displayValue
    const int1Leader = leaderValue.categories[8].displayName
    const int1Stats = leaderValue.categories[8].leaders[0].displayValue
    const int2Leader = leaderValue.categories[8].displayName
    const int2Stats = leaderValue.categories[8].leaders[1].displayValue
    //since the acutal player names was only attached to their stats through a URL, had to use this way to grab their names to put with their stats
    const responsePassingAthlete = await axios.get(leaderValue.categories[0].leaders[0].athlete.$ref)
    const athletePassing = responsePassingAthlete.data.fullName
    const responseRushingAthlete = await axios.get(leaderValue.categories[1].leaders[0].athlete.$ref)
    const athleteRushing = responseRushingAthlete.data.fullName
    const responseReceiving1Athlete = await axios.get(leaderValue.categories[2].leaders[0].athlete.$ref)
    const athleteReceiving1 = responseReceiving1Athlete.data.fullName
    const responseReceiving2Athlete = await axios.get(leaderValue.categories[2].leaders[1].athlete.$ref)
    const athleteReceiving2 = responseReceiving2Athlete.data.fullName
    const responseTacklesAthlete = await axios.get(leaderValue.categories[6].leaders[0].athlete.$ref)
    const athleteTackles = responseTacklesAthlete.data.fullName
    const responseSacksAthlete = await axios.get(leaderValue.categories[7].leaders[0].athlete.$ref)
    const athleteSacks = responseSacksAthlete.data.fullName
    const responseInt1Athlete = await axios.get(leaderValue.categories[8].leaders[0].athlete.$ref)
    const athleteInt1 = responseInt1Athlete.data.fullName
    const responseInt2Athlete = await axios.get(leaderValue.categories[8].leaders[1].athlete.$ref)
    const athleteInt2 = responseInt2Athlete.data.fullName
    //using this to clear the data when I want to search again, set all the data as empty, except the two maps
    teamName.innerHTML = ''
    teamLogoDisplay.innerHTML = ''
    venueInfo.innerHTML = ''
    venueAllImages.innerHTML = ''
    recordsWinLoss.innerHTML = ''
    playerStatsTitle.innerHTML = ''
    playerStats.innerHTML = ''
    teamStatsTitle.innerHTML = ''
    teamStats.innerHTML = ''
    //this is for all of the actual text on the page
    teamName.innerHTML = `${teamInfo.displayName}`

    venueInfoTitle.innerHTML = `Stadium Information`
    venueInfo.innerHTML = `The ${allTeamInfo.data.name} play football at ${venueName}, which has a capacity of ${venueCapacity} people.`
    teamLogoDisplay.innerHTML = `<a href=${teamLink} target="_blank"><img src=${teamLogo}>` 

    recordsWinLoss.innerHTML = `The ${allTeamInfo.data.name} had an overall win-loss record of ${recordOverall}, with a record of ${recordHome} at home <br>
    and a record of ${recordAway} on the road. They had a division record of ${recordConf}.` 
    
    playerStatsTitle.innerHTML = 'Leading Player Stats'
    playerStats.innerHTML = `The ${passingLeader} is ${athletePassing}. His passing stats are ${passingStats}<br>
    The ${rushingLeader} is ${athleteRushing}. His rushing stats are ${rushingStats}<br>
    A ${receiving1Leader} is ${athleteReceiving1}. His receiving stats are ${receiving1Stats}<br>
    A ${receiving2Leader} is ${athleteReceiving2}. His receiving stats are ${receiving2Stats}<br>
    The ${tacklesLeader} Leader is ${athleteTackles}. He has ${tacklesStats} tackles<br>
    The ${sackLeader} Leader is ${athleteSacks}. He had ${sackStats} sacks<br>
    An ${int1Leader} Leader is ${athleteInt1}. He snagged ${int1Stats} interceptions<br>
    An ${int2Leader} Leader is ${athleteInt2}. He snagged ${int2Stats} interceptions<br>`
    
    teamStatsTitle.innerHTML = `Team Stats`
    teamStats.innerHTML = `Passing stats: ${compPercent}% completions, ${passYards} passing yards, and ${passTDs} passing touchdowns<br>
    Rushing stats: ${rushAttempts} rushing attempts, ${rushYards} rushing yards, and ${rushTDs} rushing touchdowns<br>
    Receiving stats: ${receptions} receptions, ${recYards} receiving yards, and ${recTDs} receiving touchdowns<br>
    Defensive stats: ${tackles} tackles, ${sacks} sacks, ${defensiveTDs} touchdowns for the defense, and ${ints} interceptions<br>
    Kicking stats: ${fieldGoalsMade} field goals made, ${fieldGoalLong} yards was the longest field goal, and kickers scored ${kickingPoints} points<br>
    Punting stats: ${puntAVG} yards was the net average punt, ${puntLong} yards was the longest punt, and had ${puntBlock} punts blocked<br>
    Return stats: ${kickReturnYards} total kickoff return yards, ${puntReturnYards} total punt return yards, and ${yardsPerReturn} average yards per return<br>
    Scoring stats: ${twoPointConv} two point conversions, ${totalTDs} total touchdowns, ${totalPoints} total points, and ${avgPointsGame} average points per game<br> <br>`

    WeatherDataTitle.innerHTML = `Current Weather Conditions for ${teamLocation}`
    WeatherData.innerHTML = `<img src=${icon}><br>It is currently ${condition}, with a temperature of ${cityTemp}\u00B0F and a RealFeel temp of ${feelTemp}\u00B0F.<br>
    Humidity is at ${humid}% and the sun has a UV index of ${sun}. Visibility of ${visibility} miles. Wind speed ${wind}MPH from a ${windDir} direction.<br>`
    //this is how I was able to get the image of the venue and display without worrying about how many image were there, it just grabs them all and displays
    for (let i = 0; i < venueImages.length; i++) {
        let venueImage = venueImages[i].href
        let venueImageElement = document.createElement("img")
        venueImageElement.src = venueImage;
        document.querySelector("#venueImages").appendChild(venueImageElement)
      }
    //this is how I have to remove the map at the bottom, if it is there
    if (map2 !== undefined && map2 !== null) {
      map2.remove()
    }
    //this code looks through the stadium name from the array and matches with the venuName from the API, then generates the mapping data and create the markers and zooms
    //to the stadium for the team that was searched for
    let stadium = stadiums.find((stadium) => stadium.name === venueName)
    if (stadium) {
      map2 = L.map('teamMap').setView([stadium.location.lat, stadium.location.lng], 500)
      for (let i = 0; i < stadiums.length; i++) {
        let marker = L.marker([stadiums[i].location.lat, stadiums[i].location.lng]).addTo(map2)
        marker.bindPopup(`${stadiums[i].name} - ${stadiums[i].team}`)
        markers.push(marker)
      }
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 17,
      }).addTo(map2)
    }
  }
  catch(error){
    alert("Error: " + error.message + "\n\nPlease enter an NFL team abbreviation from below:\nARI - Arizona Cardinals,  ATL - Atlanta Falcons\nBAL - Baltimore Ravens,  BUF - Buffalo Bills\nCAR - Carolina Panthers, CHI - Chicago Bears\nCIN - Cincinnati Bengals,  CLE - Cleveland Browns\nDAL - Dallas Cowboys, DEN - Denver Broncos\nDET - Detroit Lions, GB - Green Bay Packers\nHOU - Houston Texans, IND - Indianapolis Colts\nJAX - Jacksonville Jaguars, KC - Kansas City Chiefs\nLV - Las Vegas Raiders, LAC - Los Angeles Chargers\nLAR - Los Angeles Rams, MIA - Miami Dolphins\nMIN - Minnesota Vikings, NE - New England Patriots\nNO - New Orleans Saints, NYG - New York Giants\nNYJ - New York Jets, PHI - Philadelphia Eagles\nPIT - Pittsburgh Steelers, SF - San Francisco 49ers\nSEA - Seattle Seahawks, TB - Tampa Bay Buccaneers\nTEN - Tennessee Titans, WAS - Washington Football Team")
  }

})
