// we will parse the xml of the gpx and add its contents to the Leaflet map
// defined in the Geomap window.

// we need an xml parser, load it if it has not been loaded yet
if (typeof parser === 'undefined') {
  document.getElementsByTagName('head')[0].appendChild(document.createElement('script')).src = 'https://cdnjs.cloudflare.com/ajax/libs/fast-xml-parser/3.21.1/parser.min.js';
}

// these are the colors that the leaflet-color markers package has 
// (https://github.com/pointhi/leaflet-color-markers) with the relevant route
// colors
const gpxColors = {
  blue: '#2A81CB',
  gold: '#FFD326',
  red: '#CB2B3E',
  green: '#2AAD27',
  orange: '#CB8427',
  yellow: '#CAC428',
  violet: '#9C2BCB',
  grey: '#7B7B7B',
  black: '#3D3D3D',
}

// set timeout to wait for parser to be loaded
setTimeout(() => {
  // open a prompt to select a gpx file
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('accept', '.gpx,.GPX');
  fileSelector.click();

  fileSelector.addEventListener(
    'change', // when a file is loaded
    function () {
      if (fileSelector.files.length == 1) {
        const theFile = fileSelector.files[0]
        // let the user pick a color from the list (this is a string input, so 
        // ther might be a typo, but there is a default just in case
        let color = prompt("Válassz színt az alábbiak közül/Select one of these colors: 'blue', 'gold', 'red', 'green', 'orange', 'yellow', 'violet', 'grey', 'black'", "violet");
        if (!color in gpxColors) { color = 'violet' }

        const reader = new FileReader()
        reader.readAsText(theFile, 'UTF-8')
        reader.onload = (e) => {
          const parsedGPX = parser.parse(e.target.result, {
            attributeNamePrefix: '',
            // this is very important as lat and lon won't be loaded otherwise:
            ignoreAttributes: false,
            parseNodeValue: true,
            parseAttributeValue: true,
            arrayMode: /^trk/,
          })

          const tracks = parsedGPX.gpx.trk
          const points = parsedGPX.gpx.wpt
          console.log(tracks)

          if (points) {
            // if we have waypoints, add them as it is customary in Leaflet
            points.forEach((wpt) => {
              var marker = L.marker([wpt.lat, wpt.lon], {
                icon: L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + color + '.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                })
              });
              // we add a popup with the name and description of the waypoint
              // (opened when clicked)
              marker.bindPopup('<b>' + wpt.name + ':</b> ' + wpt.desc);
              marker.addTo(map);
            })
          }

          tracks.forEach((trk) => {
            // add each track -- n.b. the trk and trkseg objects are part of 
            // the gpx specification
            trk.trkseg.forEach((trkseg => {
              const latLons = trkseg.trkpt.map((p) => [p.lat, p.lon])
              const pL = L.polyline(latLons, { color: gpxColors[color], weight: 8, opacity: 0.4 })
              // highlight the track on mouseover for better visibility
              pL.on('mouseover', function (e) {
                e.target.setStyle({ opacity: 0.8, color: 'white' });
              });
              pL.on('mouseout', function (e) {
                e.target.setStyle({ opacity: 0.4, color: gpxColors[color] });
              });
              pL.bindPopup(trk.name + '');
              pL.addTo(map);
            }))
          })
        }
      }
      // destroy the fileSelector element as we don't need it anymore
      fileSelector.remove()
    },
  );
}, 500);