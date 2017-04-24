var app = angular.module('spotifyApp', []);
app.controller('mainController', function($scope, $http) {
    var API = "https://api.spotify.com/v1/";
    $scope.searchType = "artist";

    function getSearchItems() {
        //slice reverse because most recent means we have to read the array backwards
        //because most recent beat is always pushed onto the back of the array
        if (localStorage.getItem("searches") != null)
            return angular.fromJson(localStorage.getItem("searches")).slice().reverse();
        else
            return null;
    }

    //acts as a wrapper for saving the users's searches/preferences
    //can be used to save in DB, throw data to endpoint etc
    //in this case will be used to save to local storage
    //but point is no matter how it's saved, the saveSearch() function will
    //act as the interface to save to the defined medium, therefore medium can be changed but
    //code is unaffected
    function saveSearch(searchType, query) {
        var searches = getSearchItems();

        var newSearch = { "searchType" : searchType, "query" : query };

        //no no searches have been saved yet
        if (searches == null)
            var searches = [];

        searches.push(newSearch);
        localStorage.setItem("searches", JSON.stringify(searches));

        //update DOM
        $scope.recentBeats = getSearchItems();
    }

    var ARTIST_SEARCH = 0;
    var ALBUM_SEARCH = 1;

    $scope.results = false;
    $scope.artistSearch = true; //default search
    $scope.albumSearch = false;
    $scope.recentBeats = getSearchItems();

    //toggles between the artist search and album search
    function switchSearch(searchType) {
        if (searchType == ARTIST_SEARCH) {
           $scope.albumSearch = false;
           $scope.artistSearch = true;

           document.getElementById("artist-tab").style.backgroundColor = "#373947";
           document.getElementById("album-tab").style.backgroundColor = "#323340";
        }

        if (searchType == ALBUM_SEARCH) {
            $scope.artistSearch = false;
            $scope.albumSearch = true;

            document.getElementById("artist-tab").style.backgroundColor = "#323340";
            document.getElementById("album-tab").style.backgroundColor = "#373947";
        }
    }

    //the catual search function that hits the spotify API
    $scope.search = function() {
        $http.get(API + "search?type=" + $scope.searchType + "&q=" + $scope.searchInput).success(function(data) {
            $scope.results = true;

            if ($scope.searchType == "artist") {
                switchSearch(ARTIST_SEARCH);
                $scope.artists = data;
            }

            else { //is an album search
                switchSearch(ALBUM_SEARCH);
                $scope.albums = data;
            }

            saveSearch($scope.searchType, $scope.searchInput);
        });
    };

    //when the user clicks on their most recent beats list, this will trigger the search for it
    $scope.searchBeat = function(searchType, query) {
        $scope.searchType = searchType;
        $scope.searchInput = query;
        $scope.search();
    }

    $scope.changeSearchType = function(searchType) {
        if (searchType == ARTIST_SEARCH) {
            $scope.searchType = "artist";
            document.getElementById("artist-tab").style.backgroundColor = "#373947";
            document.getElementById("album-tab").style.backgroundColor = "#323340";

            $scope.artistSearch = true;
            $scope.albumSearch = false;
        }

        if (searchType == ALBUM_SEARCH) {
            $scope.searchType = "album";
            document.getElementById("artist-tab").style.backgroundColor = "#323340";
            document.getElementById("album-tab").style.backgroundColor = "#373947";

            $scope.albumSearch = true;
            $scope.artistSearch = false;
        }
    }
});