//##########################################################################################################################################################
//1. Initialisation de la carte

// Définition du territoire Suisse
const switzerlandBounds = [[45.817993, 5.955911], [47.808455, 10.49205]];

// Initialisation de la carte
const map = L.map("map", {
    maxBounds: switzerlandBounds,
    maxBoundsViscosity: 1.0
}).setView([46.8182, 8.2275], 8);
const pathsLayer = L.layerGroup().addTo(map);
const cheminsPath = './data/chemins.geojson'; // Percorso del file GeoJSON per spostamenti
const geojsonPath = './data/spot_all.geojson'; // Percorso del file GeoJSON per marker

// Ajouter le layer Tile
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, // Zoom maximale
    minZoom: 8, // Zoom minimum sur la Suisse uniquement
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

//##########################################################################################################################################################
//2. Clusters

// Définition icones des cluster des loups
const wolfIconHtmlCluster = `
<svg height="80px" width="65px" version="1.1" id="_x34_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512 512"  xml:space="preserve">
	<g>
		<path style="fill:#C0B495;" d="M343.736,404.417c0,31.472-25.509,56.984-56.981,56.984h-61.511
		c-31.465,0-56.981-25.512-56.981-56.984l0,0c0-31.472,25.516-56.984,56.981-56.984h61.511
		C318.227,347.433,343.736,372.945,343.736,404.417L343.736,404.417z"/>
		<path style="fill:#92959D;" d="M300.341,72.46c0,0,43.416-54.272,54.276-65.126C365.47-3.52,384.46-3.52,389.89,15.472
		c5.423,18.996,37.992,116.687,37.992,116.687L512,320.295h-45.516v45.227l-38.898-8.142l-13.566,38.895l-36.179-16.281
		l-18.09,34.374l-58.898-33.924l-47.834,23.07h5.963l-47.835-23.07l-58.898,33.924l-18.09-34.374l-36.18,16.281L84.414,357.38
		l-38.898,8.142v-45.227H0l84.118-188.136c0,0,32.568-97.691,37.992-116.687c5.43-18.992,24.426-18.992,35.28-8.138
		c10.853,10.853,54.269,65.126,54.269,65.126H300.341z"/>
	<g>
	<g>
		<polygon style="fill:#FEFFFF;" points="182.728,100.5 147.455,54.37 133.89,100.5 "/>
	</g>
	<g>
		<polygon style="fill:#FEFFFF;" points="329.272,100.5 364.544,54.37 378.11,100.5 "/>
	</g>
	</g>
		<path style="fill:#FEFFFF;" d="M256,403.514h32.562c0,0,27.328,1.084,48.307-19.898c25.326-25.326,35.135-78.019,35.135-78.019
		c22.384-3.391,64.322-66.567,18.313-108.314c-48.839-44.321-127.534,3.165-118.486,79.145v74.584l14.38,39.84L256,394.469v1.806
		l-30.217-3.615l14.386-39.84v-74.585c9.041-75.983-69.647-123.469-118.492-79.145c-46.002,41.747-4.071,104.924,18.313,108.315
		c0,0,9.816,52.69,35.135,78.015c20.985,20.985,48.307,19.899,48.307,19.899H256V403.514z"/>
	<g>
	<g>
		<path style="fill:#564236;" d="M180.614,252.88h-18.609l6.021,8.162c-0.781,1.733-1.228,3.628-1.228,5.636
		c0,7.63,6.178,13.819,13.815,13.819c7.617,0,13.802-6.189,13.802-13.819C194.416,259.062,188.231,252.88,180.614,252.88z"/>
	</g>
	<g>
		<path style="fill:#564236;" d="M331.386,252.88h18.609l-6.014,8.162c0.775,1.733,1.221,3.628,1.221,5.636
		c0,7.63-6.179,13.819-13.815,13.819c-7.617,0-13.802-6.189-13.802-13.819C317.584,259.062,323.769,252.88,331.386,252.88z"/>
	</g>
	</g>
		<path style="fill:#71605B;" d="M283.046,383.839c-5.759,0-27.046,0-27.046,0s-21.294,0-27.046,0
		c-16.113,0-26.461,19.56-13.802,35.673c15.779,20.092,30.487,20.713,40.848,20.713c10.354,0,25.063-0.621,40.848-20.713
		C309.514,403.399,299.159,383.839,283.046,383.839z"/>
	</g>
	    <path style="opacity:0.23;fill:#71605B;" d="M427.882,132.159c0,0-32.568-97.691-37.992-116.687
		C384.46-3.52,365.47-3.52,354.617,7.334c-10.86,10.853-54.276,65.126-54.276,65.126h-49.659v388.941h36.074
		c31.228,0,56.561-25.135,56.948-56.275l16.048,9.242l18.09-34.374l36.179,16.281l13.566-38.895l38.898,8.142v-45.227H512
		L427.882,132.159z"/>
    </g>
</svg>`;

// Configuration des clusters avec des icônes personnalisées
const markers = L.markerClusterGroup({
    iconCreateFunction: (cluster) => {
        // Nombre de marqueurs dans le cluster
        const count = cluster.getChildCount();

        // HTML pour l'icône du cluster
        return L.divIcon({
            html: `
                <div style="position: relative; text-align: center; width: 60px; height: 60px;">
                    <div style="position: absolute; top: 10px; left: 10px; width: 40px; height: 40px;">
                        ${wolfIconHtmlCluster} 
                    </div>
                    <div style="position: absolute; top: 0; left: 0; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                        <div style="background: white; border: 2px solid black; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                            ${count} <!-- Affiche le nombre de marqueurs dans le cluster -->
                        </div>
                    </div>
                </div>`,
            className: '', // Pas de classe prédéfinie
            iconSize: [60, 60], // Dimension de l'icône du cluster
        });
    }
});

// Ajout du calque des clusters à la carte
map.addLayer(markers);

//##########################################################################################################################################################
//3. Chargement des données et variables globales

// Variables globales
let pathsByWolf = {}; // Chemin des individus 
let data = []; // Données des marqueurs
let filteredData = []; // Données filtrés
let animatedLayer = null; // Couche des chemin avec animation

// Graphiques à l'ouverture de la page
fetch(geojsonPath)
    .then(response => response.json())
    .then(geojsonData => {

        // Transforme les données GeoJSON
        data = geojsonData.features.map(feature => ({
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            wolfID: feature.properties.joint_wolf_id,
            year: feature.properties.joint_date.split("-")[0],
            canton: feature.properties.joint_nom_canton,
            gender: feature.properties.joint_sexe,
            commune: feature.properties.name,
            date: feature.properties.joint_date
        }));

        // Afficher les graphiques par défaut avec toutes les données
        createYearChart(data); // Histogramme observations-temps
        createCantonChartStatic(data); // Graphique "cake" pour la distribution entre cantons
        createScatterPlotStatic(data); // Scatterplot temps-latitude

        // Montrer tous les marqueurs par defaut
        addAllMarkers(data);
    })


// Charger les données des déplacements
fetch(cheminsPath)
    .then(response => response.json())
    .then(cheminsData => {
        console.log("Données des déplacements chargées :", cheminsData);

        // Organiser les parcours par ID de loup
        cheminsData.features.forEach(feature => {
            const wolfID = feature.properties.joint_wolf_id; // Récupérer l'ID du loup
            if (!pathsByWolf[wolfID]) {
                pathsByWolf[wolfID] = []; // Initialiser un tableau pour cet ID s'il n'existe pas
            }
            pathsByWolf[wolfID].push(feature); // Ajouter le segment de parcours pour cet ID
        });


    })

//####################################################################################################################################################
//4. Fonctions d'animations, interactivité

//4.1 Animations pour les intinéraires ###############################################################################################################

// Fonction pour montrer les chemins avec animation
function showWolfPaths(wolfID) {
    const paths = pathsByWolf[wolfID];

    if (!paths || paths.length === 0) {
        console.warn(`Nessun percorso trovato per ${wolfID}`);
        pathsLayer.clearLayers();
        return;
    }

    // Ordre chronologique
    const sortedPaths = paths.sort((a, b) => {
        const dateA = new Date(a.properties.joint_date);
        const dateB = new Date(b.properties.joint_date);
        return dateA - dateB;
    });

    // Supprimer les chemins existants
    pathsLayer.clearLayers();

    // Definition coordonnées
    const coordinates = [];

    // Extraction de toutes les coordonnées dans l'ordre et ajout de marqueurs pour les points
    sortedPaths.forEach(path => {
        const coords = path.geometry.coordinates;

        if (!coords || coords.length === 0) {
            console.warn("Segmento senza coordinate, saltato.");
            return;
        }

        coords.forEach(coord => {
            const latLng = [coord[1], coord[0]]; 
            coordinates.push(latLng);

            // Ajouter un point à chaque point d'observation
            L.circleMarker(latLng, {
                radius: 5, // Rayon
                color: 'red', // Couleur exterieur
                weight: 1,
                fillColor: 'white', // Couleur interne
                fillOpacity: 0.7 // Opacité/transaprence
            })
            .bindPopup(`Osservazione: ${JSON.stringify(path.properties)}`) // Popup avec info
            .addTo(pathsLayer); // Ajoute du layer
        });
    });

    // Création ligne du chemin
    const line = L.polyline(coordinates, { color: 'black', weight: 2 }).addTo(pathsLayer);


    // Zoom auto sur le chemin
    const bounds = line.getBounds(); // Limite du chemin
    map.fitBounds(bounds, { padding: [20, 20] }); // Ajuster la vue à la ligne avec un padding

    // Démarrer l'animation 
    animatePath(coordinates);
    }


    function animatePath(coordinates) {
        let index = 0;

    // Supprimer toutes les animations précédentes
    if (animatedLayer) {
        map.removeLayer(animatedLayer);
    }

    // Crée un nouveau calque d'animation
    animatedLayer = L.layerGroup().addTo(map);

    // Charger une icône SVG 
    const wolfIconHtml = `
    <svg height="40px" width="40px" version="1.1" id="_x34_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	viewBox="0 0 512 512"  xml:space="preserve">
        <g>
	    <g>
		    <path style="fill:#C0B495;" d="M343.736,404.417c0,31.472-25.509,56.984-56.981,56.984h-61.511
			c-31.465,0-56.981-25.512-56.981-56.984l0,0c0-31.472,25.516-56.984,56.981-56.984h61.511
			C318.227,347.433,343.736,372.945,343.736,404.417L343.736,404.417z"/>
		    <path style="fill:#92959D;" d="M300.341,72.46c0,0,43.416-54.272,54.276-65.126C365.47-3.52,384.46-3.52,389.89,15.472
			c5.423,18.996,37.992,116.687,37.992,116.687L512,320.295h-45.516v45.227l-38.898-8.142l-13.566,38.895l-36.179-16.281
			l-18.09,34.374l-58.898-33.924l-47.834,23.07h5.963l-47.835-23.07l-58.898,33.924l-18.09-34.374l-36.18,16.281L84.414,357.38
			l-38.898,8.142v-45.227H0l84.118-188.136c0,0,32.568-97.691,37.992-116.687c5.43-18.992,24.426-18.992,35.28-8.138
			c10.853,10.853,54.269,65.126,54.269,65.126H300.341z"/>
		<g>
		<g>
			<polygon style="fill:#FEFFFF;" points="182.728,100.5 147.455,54.37 133.89,100.5 				"/>
		</g>
		<g>
			<polygon style="fill:#FEFFFF;" points="329.272,100.5 364.544,54.37 378.11,100.5 				"/>
		</g>
		</g>
		    <path style="fill:#FEFFFF;" d="M256,403.514h32.562c0,0,27.328,1.084,48.307-19.898c25.326-25.326,35.135-78.019,35.135-78.019
			c22.384-3.391,64.322-66.567,18.313-108.314c-48.839-44.321-127.534,3.165-118.486,79.145v74.584l14.38,39.84L256,394.469v1.806
			l-30.217-3.615l14.386-39.84v-74.585c9.041-75.983-69.647-123.469-118.492-79.145c-46.002,41.747-4.071,104.924,18.313,108.315
			c0,0,9.816,52.69,35.135,78.015c20.985,20.985,48.307,19.899,48.307,19.899H256V403.514z"/>
		<g>
		<g>
			<path style="fill:#564236;" d="M180.614,252.88h-18.609l6.021,8.162c-0.781,1.733-1.228,3.628-1.228,5.636
			c0,7.63,6.178,13.819,13.815,13.819c7.617,0,13.802-6.189,13.802-13.819C194.416,259.062,188.231,252.88,180.614,252.88z"/>
		</g>
		<g>
			<path style="fill:#564236;" d="M331.386,252.88h18.609l-6.014,8.162c0.775,1.733,1.221,3.628,1.221,5.636
			c0,7.63-6.179,13.819-13.815,13.819c-7.617,0-13.802-6.189-13.802-13.819C317.584,259.062,323.769,252.88,331.386,252.88z"/>
		</g>
		</g>
		    <path style="fill:#71605B;" d="M283.046,383.839c-5.759,0-27.046,0-27.046,0s-21.294,0-27.046,0
			c-16.113,0-26.461,19.56-13.802,35.673c15.779,20.092,30.487,20.713,40.848,20.713c10.354,0,25.063-0.621,40.848-20.713
			C309.514,403.399,299.159,383.839,283.046,383.839z"/>
	    </g>
	        <path style="opacity:0.23;fill:#71605B;" d="M427.882,132.159c0,0-32.568-97.691-37.992-116.687
		    C384.46-3.52,365.47-3.52,354.617,7.334c-10.86,10.853-54.276,65.126-54.276,65.126h-49.659v388.941h36.074
		    c31.228,0,56.561-25.135,56.948-56.275l16.048,9.242l18.09-34.374l36.179,16.281l13.566-38.895l38.898,8.142v-45.227H512
		    L427.882,132.159z"/>
        </g>
    </svg>`;

    // Création d'un marqueur avec l'icône SVG
    const animatedMarker = L.divIcon({
        html: wolfIconHtml,
        className: '' // Rimuove classi predefinite
    });

    // Ajoute du marqueur
    const marker = L.marker(coordinates[0], { icon: animatedMarker }).addTo(animatedLayer);

    // Fonction pour mettre à jour le marqueur 
    function updateMarker() {
        if (index < coordinates.length - 1) {
            index++;
            marker.setLatLng(coordinates[index]); // Aggiorna la posizione del marker
        } else {
            index = 0; // Riparte dall'inizio
            marker.setLatLng(coordinates[index]); // Reset della posizione del marker
        }
    }

    // Vitesse animation
    const animationInterval = setInterval(updateMarker, 800);
    animatedLayer.animationInterval = animationInterval;
}

//4.2 Marquers #####################################################################################################################################

// Chargements des données pour les marquers
fetch(geojsonPath)
    .then(response => response.json())
    .then(geojsonData => {
        console.log("Dati GeoJSON caricati:", geojsonData);

        // Transforme les données GeoJSON
        data = geojsonData.features.map(feature => ({
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            wolfID: feature.properties.joint_wolf_id,
            year: feature.properties.joint_date.split("-")[0],
            canton: feature.properties.joint_nom_canton,
            gender: feature.properties.joint_sexe,
            commune: feature.properties.name,
            date: feature.properties.joint_date
        }));

        console.log("Dati trasformati per i marker:", data);

        // Montrer tous les marquers par défaut
        addAllMarkers(data);
    })
    .catch(error => console.error("Errore nel caricamento dei marker:", error));

// Définition de l'icone SVG
const wolfIconHtml = `
    <svg height="40px" width="40px" version="1.1" id="_x34_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    viewBox="0 0 512 512"  xml:space="preserve">
        <g>
        <g>
            <path style="fill:#C0B495;" d="M343.736,404.417c0,31.472-25.509,56.984-56.981,56.984h-61.511
            c-31.465,0-56.981-25.512-56.981-56.984l0,0c0-31.472,25.516-56.984,56.981-56.984h61.511
            C318.227,347.433,343.736,372.945,343.736,404.417L343.736,404.417z"/>
            <path style="fill:#92959D;" d="M300.341,72.46c0,0,43.416-54.272,54.276-65.126C365.47-3.52,384.46-3.52,389.89,15.472
            c5.423,18.996,37.992,116.687,37.992,116.687L512,320.295h-45.516v45.227l-38.898-8.142l-13.566,38.895l-36.179-16.281
            l-18.09,34.374l-58.898-33.924l-47.834,23.07h5.963l-47.835-23.07l-58.898,33.924l-18.09-34.374l-36.18,16.281L84.414,357.38
            l-38.898,8.142v-45.227H0l84.118-188.136c0,0,32.568-97.691,37.992-116.687c5.43-18.992,24.426-18.992,35.28-8.138
            c10.853,10.853,54.269,65.126,54.269,65.126H300.341z"/>
        <g>
        <g>
            <polygon style="fill:#FEFFFF;" points="182.728,100.5 147.455,54.37 133.89,100.5 "/>
        </g>
        <g>
            <polygon style="fill:#FEFFFF;" points="329.272,100.5 364.544,54.37 378.11,100.5 "/>
        </g>
        </g>
            <path style="fill:#FEFFFF;" d="M256,403.514h32.562c0,0,27.328,1.084,48.307-19.898c25.326-25.326,35.135-78.019,35.135-78.019
            c22.384-3.391,64.322-66.567,18.313-108.314c-48.839-44.321-127.534,3.165-118.486,79.145v74.584l14.38,39.84L256,394.469v1.806
            l-30.217-3.615l14.386-39.84v-74.585c9.041-75.983-69.647-123.469-118.492-79.145c-46.002,41.747-4.071,104.924,18.313,108.315
            c0,0,9.816,52.69,35.135,78.015c20.985,20.985,48.307,19.899,48.307,19.899H256V403.514z"/>
        <g>
        <g>
            <path style="fill:#564236;" d="M180.614,252.88h-18.609l6.021,8.162c-0.781,1.733-1.228,3.628-1.228,5.636
            c0,7.63,6.178,13.819,13.815,13.819c7.617,0,13.802-6.189,13.802-13.819C194.416,259.062,188.231,252.88,180.614,252.88z"/>
        </g>
        <g>
            <path style="fill:#564236;" d="M331.386,252.88h18.609l-6.014,8.162c0.775,1.733,1.221,3.628,1.221,5.636
            c0,7.63-6.179,13.819-13.815,13.819c-7.617,0-13.802-6.189-13.802-13.819C317.584,259.062,323.769,252.88,331.386,252.88z"/>
        </g>
        </g>
            <path style="fill:#71605B;" d="M283.046,383.839c-5.759,0-27.046,0-27.046,0s-21.294,0-27.046,0
            c-16.113,0-26.461,19.56-13.802,35.673c15.779,20.092,30.487,20.713,40.848,20.713c10.354,0,25.063-0.621,40.848-20.713
            C309.514,403.399,299.159,383.839,283.046,383.839z"/>
        </g>
            <path style="opacity:0.23;fill:#71605B;" d="M427.882,132.159c0,0-32.568-97.691-37.992-116.687
            C384.46-3.52,365.47-3.52,354.617,7.334c-10.86,10.853-54.276,65.126-54.276,65.126h-49.659v388.941h36.074
            c31.228,0,56.561-25.135,56.948-56.275l16.048,9.242l18.09-34.374l36.179,16.281l13.566-38.895l38.898,8.142v-45.227H512
            L427.882,132.159z"/>
        </g>
    </svg>`;

// Fonction de création icône 
function createWolfIcon() {
    return L.divIcon({
        className: '', 
        html: wolfIconHtml,
        iconSize: [30, 30], 
        iconAnchor: [15, 15] 
    });
}

// Fonction pour l'ajoute des marqueurs 
function addAllMarkers(markerData) {
    markers.clearLayers();
    markerData.forEach(item => {
        const wolfData = markerData.filter(data => data.wolfID === item.wolfID);
        const uniqueCommunes = new Set(wolfData.map(data => data.commune));
        const totalDistance = calculateTotalDistance(wolfData);

        const marker = L.marker([item.lat, item.lon], {
            icon: createWolfIcon() 
        }).bindPopup(`
            <b>Commune:</b> ${item.commune}<br>
            <b>Idéntifiant:</b> ${item.wolfID}<br>
            <b>Date:</b> ${item.date}<br>
            <b>Distance parcourue à vol d'oiseau:</b> ${totalDistance} km<br>
            <b>Nb. de municipalités avec observations:</b> ${uniqueCommunes.size}
        `);
        markers.addLayer(marker);
    });
    map.addLayer(markers);
}

//4.3 Fonctions pour l'infobox #####################################################################################################################################

// Fonction pour calculer la distance totale parcourue par un loup
function calculateTotalDistance(wolfData) {
    let totalDistance = 0;
    for (let i = 1; i < wolfData.length; i++) {
        const prev = wolfData[i - 1];
        const curr = wolfData[i];
        const distance = turf.distance([prev.lon, prev.lat], [curr.lon, curr.lat], { units: 'kilometers' });
        totalDistance += distance;
    }
    return totalDistance.toFixed(2); // 2 ddcimales
}


// Fonction de mise à jour de l'infobox
function updateWolfAnalysisPanel(wolfID, totalDistance, uniqueCommunes) {
    const panel = document.getElementById("wolf-analysis-panel");
    panel.innerHTML = `
        <h3>Analisi del Lupo: ${wolfID}</h3>
        <p><b>Distanza totale percorsa:</b> ${totalDistance} km</p>
        <p><b>Numero di comuni visitati:</b> ${uniqueCommunes}</p>
    `;
}

//4.4 Fonctions pour le filtres #####################################################################################################################################

// Fonction d'application de filtres
function applyFilters() {
    const gender = document.getElementById("filter-gender").value;
    const year = document.getElementById("filter-year").value;
    const canton = document.getElementById("filter-canton").value;
    const wolfID = document.getElementById("filter-wolf-id").value;

    // Filtrer les données
    filteredData = data.filter(item => {
        return (!gender || item.gender === gender) &&
               (!year || item.year === year) &&
               (!canton || item.canton === canton) &&
               (!wolfID || item.wolfID === wolfID);
    });

    // Supprimer toutes les animations précédentes
    if (animatedLayer) {
        map.removeLayer(animatedLayer);
        animatedLayer = null;
    }

    // Supprimer tous les marqueurs si un loup est sélectionné
    if (wolfID) {
        markers.clearLayers(); // Efface les marker
        showWolfPaths(wolfID); // Montre que le chemin selectionné
    } else {
        // Si aucun ID n'est sélectionné, afficher les marqueurs filtrés
        addAllMarkers(filteredData);
        pathsLayer.clearLayers(); // Supprime tous les chemins précédents
    }

    // Mise à jour des graphiques
    updateCharts(wolfID);
}

//4.5 Fonctions pour les graphiques #####################################################################################################################################

// 4.5.a Fonction pour l'histogramme observations par année ###########################################################################################
function createYearChart(data, filterType = null, filterValue = null) {
    const margin = { top: 40, right: 30, bottom: 40, left: 50 }; 
    const width = 300 - margin.left - margin.right;
    const height = 225 - margin.top - margin.bottom;

    const svg = d3.select("#year-chart").html("").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let groupedData = d3.rollups(data, v => v.length, d => d.year);
    let xLabel = "Année";
    let title = "Distribution des observations";

    if (filterType === "year") {
        groupedData = d3.rollups(data, v => v.length, d => new Date(d.date).getMonth() + 1);
        xLabel = "Mese";
        title = `Distribution des observations ${filterValue}`;
    }

    groupedData = groupedData.sort((a, b) => a[0] - b[0]);

    const x = d3.scaleBand().domain(groupedData.map(d => d[0])).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(groupedData, d => d[1])]).range([height, 0]);

    // Axe des X avec seulement la première et la dernière valeur
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues([x.domain()[0], x.domain()[x.domain().length - 1]]))
        .selectAll("text")
        .style("font-family", "Trebuchet MS") // Font per l'asse
        .style("font-weight", "bold")
        .style("font-size", "9px"); // Font size ridotto

    // Axe des Y avec seulement la première et la dernière valeur
    svg.append("g")
        .call(d3.axisLeft(y).ticks(2)) // Mostra solo due tick
        .selectAll("text")
        .style("font-family", "Trebuchet MS") // Font per l'asse
        .style("font-size", "9px"); // Font size ridotto

    // Bars
    svg.selectAll("rect")
        .data(groupedData)
        .enter().append("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[1]))
        .attr("fill", "#8B4513"); 

    // Etiquettes
    svg.selectAll("text.bar-label")
        .data(groupedData)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d[0]) + x.bandwidth() / 2)
        .attr("y", d => y(d[1]) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "8px") 
        .style("font-family", "Trebuchet MS") 
        .text(d => d[1]);

    // Etiquette X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "9px") // Font più piccolo
        .style("font-family", "Trebuchet MS") // Font Trebuchet MS
        .text(xLabel);

    // Etiquette Y
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "9px") // Font più piccolo
        .style("font-family", "Trebuchet MS") // Font Trebuchet MS
        .style("font-weight", "bold")
        .text("Nb. d'observations");

    // Titre
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top + 20) // Più distante dal grafico
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "Trebuchet MS") // Font Trebuchet MS
        .text(title);
}

// 4.5.b Diagramme circulaire de la répartition entre les cantons ###########################################################################################
function createCantonChartStatic(data) {
    const width = 500; // Largeur totale du graphique
    const height = 350; // Hauteur totale du graphique
    const radius = Math.min(width, height) / 2 - 30; // Rayon

    // Creazione del contenitore SVG
    const svg = d3.select("#canton-chart").html("").append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2 + 50}, ${height / 2})`); 

    const cantonCounts = d3.rollups(data, v => v.length, d => d.canton).sort((a, b) => b[1] - a[1]);
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Style
    svg.selectAll("path")
        .data(pie(cantonCounts))
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0]))
        .append("title")
        .text(d => `${d.data[0]}: ${d.data[1]}`);

    // Titre
    svg.append("text")
        .attr("x", 0) // Centrato rispetto alla torta
        .attr("y", -height / 2 + 20) // Posizionato sopra il grafico
        .attr("text-anchor", "middle")
        .style("font-size", "16px") // Font più grande
        .style("font-family", "Trebuchet MS")
        .style("font-weight", "bold")
        .text("Répartition par Canton");

    // Légende
    const legend = svg.append("g")
        .attr("transform", `translate(${-(width / 2 - 45)}, ${-height / 2 + 40})`); // Spostato 5px verso destra (da 50 a 45)

        cantonCounts.forEach((d, i) => {
            // Rectangle contenant légende
            legend.append("rect")
                .attr("x", -85)
                .attr("y", i * 16) 
                .attr("width", 12) 
                .attr("height", 12)
                .attr("fill", color(d[0])); 
        
            // Texte légende
            legend.append("text") 
                .attr("x", -65) 
                .attr("y", i * 16 + 10) 
                .style("font-size", "12px") 
                .style("font-family", "Trebuchet MS")
                .text(`${d[0]} (${d[1]})`); 
        });
}


// 4.5.c diagramme de dispersion spatio-temporel ###########################################################################################
function createScatterPlotStatic(data) {
    const margin = { top: 40, right: 20, bottom: 50, left: 60 }; 
    const width = 400 - margin.left - margin.right; 
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#scatter-plot").html("").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => parseFloat(d.lat)))
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["M", "F"])
        .range(["blue", "pink"]);

    // Axes avec valeurs min et max
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickValues([x.domain()[0], x.domain()[1]]) // Seulement le minimum et le maximum
            .tickFormat(d3.timeFormat("%Y")))
        .style("font-family", "Trebuchet MS")
        .style("font-weight", "bold"); 

    svg.append("g")
        .call(d3.axisLeft(y)
            .tickValues([y.domain()[0], y.domain()[1]]) // Seulement le minimum et le maximum
        )
        .style("font-family", "Trebuchet MS")
        .style("font-weight", "bold"); 

    // Titre axes
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Année")
        .style("font-family", "Trebuchet MS")
        .style("font-size", "12px")
        .style("font-weight", "bold"); 

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("transform", "rotate(-90)")
        .text("Latitude")
        .style("font-family", "Trebuchet MS")
        .style("font-size", "12px")
        .style("font-weight", "bold"); 

    // Points du graph
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(new Date(d.date)))
        .attr("cy", d => y(d.lat))
        .attr("r", 4)
        .attr("fill", d => color(d.gender));

    // Titre du graph
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "Trebuchet MS")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Distribution spatio-temporelle");

    // Légende dans le coin supérieur gauche du graphique
    const legend = svg.append("g")
        .attr("transform", `translate(10, 10)`); 

    legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 5).attr("fill", "blue");
    legend.append("text")
        .attr("x", 10)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .text("Mâles")
        .style("font-family", "Trebuchet MS")
        .style("font-size", "10px")
        .style("font-weight", "bold"); 

    legend.append("circle").attr("cx", 0).attr("cy", 15).attr("r", 5).attr("fill", "pink");
    legend.append("text")
        .attr("x", 10)
        .attr("y", 15)
        .attr("dy", "0.35em")
        .text("Femelles")
        .style("font-family", "Trebuchet MS")
        .style("font-size", "10px")
        .style("font-weight", "bold"); // Grassetto
}

//4.5.d Fonction de mise à jour des graphiques ##################################################################################################
function updateCharts(filteredData, wolfID = null) {
    // Mise à jour de l'histogramme sur la base des données filtrées
    if (filteredData && filteredData.length > 0) {
        createYearChart(filteredData); // Version mise à jour
    } else {
        console.warn("Nessun dato filtrato disponibile per l'aggiornamento dei grafici.");
    }
}


