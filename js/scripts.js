let planetRepository = (function () {
    let planetList = []; // An array to store the Planet data
    let apiUrl = 'https://swapi.dev/api/planets/';
    let totalPages;
    const $ = window.$; // Function to display the modal with Planet data
    function showModal(item) {
    console.log('Showing modal for:', item.name);
      let modalBody = $('.modal-body');
      let modalTitle = $('.modal-title');
      modalTitle.empty();
      modalBody.empty();
      let titleElement = $('<h1>' + item.name + '</h1>');
      let climateElement = $('<p><strong>Climate: </strong><span class="modal-element">' + item.climate + '</span></p>');
      let diameterElement = $('<p><strong>Diameter: </strong><span class="modal-element">' + item.diameter + '</span></p>');
      let gravityElement = $('<p><strong>Gravity: </strong><span class="modal-element">' + item.gravity + '</span></p>');
      let populationElement = $('<p><strong>Population: </strong><span class="modal-element">' + item.population + '</span></p>');
      let terrainElement = $('<p><strong>Terrain: </strong><span class="modal-element">' + item.terrain + '</span></p>');
      let residentsElement = $('<p><strong>Residents: </strong><span class="modal-element">' + item.residents.join(', ') + '</span></p>')
      

    modalTitle.append(titleElement);
    modalBody.append(climateElement);
    modalBody.append(diameterElement);
    modalBody.append(gravityElement);
    modalBody.append(populationElement);
    modalBody.append(terrainElement);
    modalBody.append(residentsElement)
}
    // Function to add a Planet to the list
    function add(planet) {
      if (
        typeof planet === 'object' &&
        'name' in planet &&
        typeof planet.name === 'string'
      ) {
        planetList.push(planet);
      } else {
        console.log('planet is not correct');
      }
    }
    // Function to get all the Planet in the list
    function getAll() {
      return planetList;
    }
    // Function to add a Planet to the list and display it as a list item
    function addListItem(planet) {
      let planetList = document.querySelector('.list-group');
      let listItem = document.createElement('li');
      let button = document.createElement('button');
      button.innerText = planet.name;
      button.classList.add('button-class');
      button.classList.add('btn-primary');
      button.setAttribute('data-toggle', 'modal');
      button.setAttribute('data-target', '#planet-modal');
      listItem.classList.add('list-group-item');
      listItem.appendChild(button);
      planetList.appendChild(listItem);
      // Add an event listener to show the modal when the button is clicked
      button.addEventListener('click', function () {
        showDetails(planet);
      });
    }
    // Function to reload the page when the navbar brand is clicked
    let navbarBrand = document.querySelector('.navbar-brand');
    navbarBrand.addEventListener('click', function () {
      location.reload();
    });
    // Function to show a loading message while the Planet data is being fetched
    function showLoadingMessage() {
      let planetList = document.querySelector('.planet-list');
      let loadingMessage = document.createElement('p');
      planetList.appendChild(loadingMessage);
    }
    // Function to hide the loading message after the Planet data is fetched
    function hideLoadingMessage() {
      let planetList = document.querySelector('.planet-list');
      planetList.innerHTML = '';
    }
    // Function to fetch the planet data from the SWAPI
    function loadList() {
        showLoadingMessage();
        return fetch(apiUrl)
          .then(function (response) {
            return response.json();
          })
          .then(function (json) {
              totalPages = Math.ceil(json.count / 10); // Update totalPages
              let promises = [];
              for (let page = 1; page <= totalPages; page++) {
                  promises.push(
                      fetch(apiUrl + `?page=${page}`)
                          .then(response => response.json())
                          .then(data => data.results)
                  );
              }
              return Promise.all(promises);
          })
          .then(function (results) {
            results.forEach(function (pageResults) {
                pageResults.forEach(function (item) {
                    let planet = {
                        name: item.name,
                        climate: item.climate,
                        diameter: item.diameter,
                        gravity: item.gravity,
                        population: item.population,
                        terrain: item.terrain,
                        detailsUrl: item.url,
                        residents: item.residents,
                    };
                    add(planet);
                });
            });
            hideLoadingMessage();
        })
        .catch(function (e) {
            console.error(e);
        });
}
        // This function takes an item as an argument, fetches its details from a given URL and updates the item with the details.
    function loadDetails(item) {
        let url = item.detailsUrl;
        return fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (details) {
            item.climate = details.climate;
            item.diameter = details.diameter;
            item.gravity = details.gravity;
            item.population = details.population;
            item.terrain = details.terrain;
    
            let residentPromises = details.residents.map(residentUrl =>
            fetch(residentUrl).then(response => response.json())
            );
            return Promise.all(residentPromises);
        })
        .then(function (residentDetails) {
            // Extract resident names from the fetched data
            item.residents = residentDetails.map(resident => resident.name);
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });
    }  
  
    $(document).ready(function () {
      $('.navbar-brand, .display-5').click(function () {
        location.reload();
      });
});
  
    // This function takes an item as an argument, loads its details using the loadDetails function and shows a modal with the item details.
    function showDetails(item) {
      planetRepository.loadDetails(item).then(function () {
        showModal(item);
      });
    }

    // This function searches for a planet based on the text entered in the search input and filters the displayed list accordingly.
    function searchPlanet() {
      let searchInput = document.getElementById('search-input');
      let searchText = searchInput.value.toLowerCase();
      let allPlanet = document.querySelectorAll('.list-group-item');
  
      allPlanet.forEach(function (planet) {
        let planetName = planet
          .querySelector('.button-class')
          .innerText.toLowerCase();
  
        if (planetName.includes(searchText)) {
            planet.style.display = 'block';
        } else {
          planet.style.display = 'none';
        }
      });
    }

    // Get the search input element and attach an event listener that triggers searchPlanet function on input.
    let searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function () {
      searchPlanet();
    });
    
    // This object returns public functions that can be accessed outside of the module.
    return {
      add: add,
      getAll: getAll,
      addListItem: addListItem,
      loadList: loadList,
      loadDetails: loadDetails,
      showDetails: showDetails,
      showModal: showModal,
      searchPlanet: searchPlanet,
    };
  })();

// This code block loads the list of planets using the loadList function and adds list items to the page for each planet.
planetRepository.loadList().then(function () {
    planetRepository.getAll().forEach(function (planet) {
        planetRepository.addListItem(planet);
    });

// Hide the loading spinner after the planet list has finished loading and displaying
let loadingContainer = document.querySelector('.loading-container');
    loadingContainer.style.display = 'none';
});