const d = document;
const $pokemonsList = d.getElementById("pokemons-list");
const $pokemonsTemplate = d.getElementById("pokemons-template").content;
const $featuresTemplate = d.getElementById("features-template").content;
const $locationAreasTemplate = d.getElementById('location-areas-template').content;
const $loading = d.querySelector(".loading");
const $refresh = d.querySelector(".refresh")
const $prevLink = d.querySelector(".prev-link");
const $nextLink = d.querySelector(".next-link");
const $searchForm = d.getElementById("search-form");
const $errorMessage = d.querySelector(".error-message");
const $backButton = d.querySelector(".back-button");
const $fragment = d.createDocumentFragment();

const getPokemons = async (url) => {
    try {
        //Waiting response
        let res = await fetch(url);

        $loading.classList.remove("none");
        $nextLink.classList.add("none");
        $prevLink.classList.add("none");
        $refresh.classList.add("inactive")
        $refresh.classList.remove("none")
        
        //Validation of response for something error
        if (!res.ok) throw { status: res.status, statusText: res.statusText };
        
        //Convert response to json
        let json = await res.json();

        // FOR Loop to fetch each item of json.results
        $pokemonsList.innerHTML = "";
        for (pokemon of json.results) {
            try {
                let res = await fetch(pokemon.url);
                if (!res.ok)
                    throw { status: res.status, statusText: res.statusText };
                let json = await res.json();

                // Paint the HTMl
                $pokemonsTemplate.querySelector("img").setAttribute("data-id", json.name);
                $pokemonsTemplate.querySelector("figcaption").textContent =json.name;
                $pokemonsTemplate.querySelector("figcaption").setAttribute("data-id", json.name);
                $pokemonsTemplate.querySelector("img").src =json.sprites.front_default;
                $pokemonsTemplate.querySelector("img").alt =json.sprites.front_default;
                $pokemonsTemplate.querySelector(".pokemon-card").classList.add("inactive")
                
                const $clone = d.importNode($pokemonsTemplate, true)
                $fragment.append($clone);       
            } catch (err) {
                //Catching the error
                console.log(err);
                let message = err.statusText || "Ocurrio un error";
                $pokemonsList.insertAdjacentHTML(
                    "beforeend",
                    `Error ${err.status}: ${message}`
                );
            }
            $pokemonsList.append($fragment);
        }

        d.querySelectorAll(".pokemon-card").forEach(card => card.classList.remove("inactive"))
        $loading.classList.add("none");
        $nextLink.classList.remove("none");
        $prevLink.classList.remove("none");
        $refresh.classList.remove("inactive")
        // Previous Pagination
        if (json.previous === null) $prevLink.classList.add("none");
        if (!(json.previous === null)) {
            $prevLink.classList.remove("none");
            $prevLink.setAttribute("data-link", json.previous);
        }

        //Next Pagination
        if (json.next === null) $nextLink.classList.add("none");
        if (!(json.next === null)) {
            $nextLink.classList.remove("none");
            $nextLink.setAttribute("data-link", json.next);
        }
    } catch (err) {
        console.log(err);
        let message = err.statusText || "Ocurrio un error";
        $pokemonsList.insertAdjacentHTML(
            "beforeend",
            `Error ${err.status}: ${message}`
        );
    }
};

const searchPokemon = async (pokemonName) => {
    try {
        let res = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
        );

        $loading.classList.remove("none");
        $refresh.classList.add("none")

        if (!res.ok) throw { status: res.status, statusText: res.statusText };

        let json = await res.json();

        $loading.classList.add("none");

        $pokemonsList.innerHTML = "";
        $pokemonsTemplate.querySelector(".pokemon-card").classList.remove("inactive")
        $pokemonsTemplate.querySelector("img").src = json.sprites.front_default;
        $pokemonsTemplate.querySelector("img").alt = json.sprites.front_default;
        $pokemonsTemplate.querySelector("img").setAttribute("data-id", json.name);
        $pokemonsTemplate.querySelector("figcaption").textContent = json.name;
        $pokemonsTemplate.querySelector("figcaption").setAttribute("data-id", json.name);
        $nextLink.classList.add("none");
        $prevLink.classList.add("none")

        const $clone = d.importNode($pokemonsTemplate, true);

        $pokemonsList.append($clone);
        $backButton.classList.remove("none");
        $pokemonsList.insertAdjacentElement("beforeend", $backButton);
    } catch (err) {
        $loading.classList.add("none");
        console.error(`Error en la funcion searchPokemon: ${err}`);

        if (err.status === 404) return $errorMessage.classList.remove("none");

        let message = err.statusText || "Ocurrio un error";
        $searchForm.insertAdjacentHTML(
            "afterbegin",
            `Error ${err.status}: ${message}`
        );
    }
};

const pokemonFeatures = async (id) => {
    try {
        let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

        if (!res.ok) throw { status: res.status, statusText: res.statusText };

        let features = await res.json();

        $loading.classList.remove("none");
        $refresh.classList.add("none")

        $pokemonsList.innerHTML = "";
        $featuresTemplate.querySelector("img").src =features.sprites.front_default;
        $featuresTemplate.querySelector("img").alt = features.name;
        $featuresTemplate.querySelector(".name").innerHTML = `Name: <b>${features.name}</b>`;
        $featuresTemplate.querySelector(".hp").innerHTML = `HP: <b>${features.stats[0].base_stat}</b>`
        $featuresTemplate.querySelector(".attack").innerHTML = `Attack: <b>${features.stats[1].base_stat}</b>`
        $featuresTemplate.querySelector(".defense").innerHTML = `Defense: <b>${features.stats[2].base_stat}</b>`
        $featuresTemplate.querySelector(".base-experience").innerHTML = `Base Experience: <b>${features.base_experience}</b>`;
        $featuresTemplate.querySelector(".weight").innerHTML = `Weight: <b>${features.weight / 10}kg</b>`;
        $featuresTemplate.querySelector(".height").innerHTML = `Height: <b>${features.height * 10}cm</b>`;
        
        
        const $clone = d.importNode($featuresTemplate, true)
        
        $backButton.classList.remove("none")
        $pokemonsList.insertAdjacentElement("afterbegin", $backButton)
        $pokemonsList.append($clone)

        locationAreas(features.location_area_encounters)

        $loading.classList.add("none");
        $nextLink.classList.add("none");
    } catch (err) {
        console.log(err);
        let message = err.statusText || "Ocurrio un error";
        $pokemonsList.insertAdjacentHTML(
            "beforeend",
            `Error ${err.status}: ${message}`
        );
    }
};

const locationAreas = async url => {
    try {
        let res = await fetch(url)

        if(!res.ok) throw {status: res.status, statusText: res.statusText}

        let areas = await res.json()

        if(areas.length === 0) {
            d.querySelector(".location-areas").classList.add("none")
            return
        }

        areas.forEach((area, index) => {
            $locationAreasTemplate.querySelector(".areas").innerHTML = `<small>Area #${index + 1}:  <b>${deleteScripts(area.location_area.name)}</b></small>`
            const $clone = d.importNode($locationAreasTemplate, true)
            $fragment.append($clone)
        })

        d.querySelector(".location-areas").append($fragment)

    } catch (err) {
        console.log(err)
    }
}

const deleteScripts = item => {
    return `${item.replace(/-/g , " ")}`
}

d.addEventListener("DOMContentLoaded", (e) =>
    getPokemons("https://pokeapi.co/api/v2/pokemon")
);

d.addEventListener("click", (e) => {
    if (e.target.matches(".links-pagination *")) {
        $pokemonsList.innerHTML = "";
        getPokemons(e.target.getAttribute("data-link"));
    }

    if (e.target.matches(".help-button")) {
        $errorMessage.classList.add("none");
    }

    if (e.target === $backButton) {
        $backButton.classList.add("none");
        getPokemons("https://pokeapi.co/api/v2/pokemon");
    }

    if (
        e.target.matches(".pokemon-card") ||
        e.target.matches(".pokemon-card *")
    ) {
        pokemonFeatures(e.target.getAttribute("data-id"));
    }

    if(e.target.matches(".refresh *")){
        getPokemons("https://pokeapi.co/api/v2/pokemon")
    }
});

d.addEventListener("submit", (e) => {
    if (e.target === $searchForm) {
        e.preventDefault();
        let pokemonName = $searchForm.pokemon.value.toLowerCase();

        if ($searchForm.pokemon.value === "") {
            $errorMessage.classList.remove("none");
            d.querySelector(`.error-message p`).textContent =
                "Please enter the name";
            return;
        }

        $errorMessage.innerHTML = `
            <p>Pokémon not found  (._.)<br>
            Check that the name is spelled correctly
          </p>
          <div class="help-button">Got it :)</div>
        `;

        if (!($errorMessage.classList.value === "none"))
            $errorMessage.classList.add("none");

        searchPokemon(pokemonName);
    }
});