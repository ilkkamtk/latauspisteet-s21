'use strict';
const baseURL = 'https://api.openchargemap.io/v3';
const endpoint = '/poi';
const key = 'af18334a-87ce-4c57-b805-97ff3685c22d';
const distance = 10;
const distanceunit = 'km';
const map = L.map('map').setView([60.22, 24], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// lisätiedot kuvan alle
const nimi = document.querySelector('#nimi');
const osoite = document.querySelector('#osoite');
const kaupunki = document.querySelector('#kaupunki');
const lisatiedot = document.querySelector('#lisatiedot');

const navigoi = document.querySelector('#navigoi a');

// kustom markkerit
const vihreaikoni = L.divIcon({className: 'vihrea-ikoni'});
const punainenikoni = L.divIcon({className: 'punainen-ikoni'});

// Asetukset paikkatiedon hakua varten (valinnainen)
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// funktio markerien tekoon
function lisaaMarker(latitude, longitude, teksti, ikoni, info, origin) {
  teksti = `<h3>${teksti}</h3>`;
  if(origin) {
    const googleOsoite = 'https://www.google.com/maps/dir/?api=1';
    const parametrit = `&origin=${origin.latitude},${origin.longitude}&destination=${latitude},${longitude}&travelmode=driving`;
    teksti += `<div>
                <a href="${googleOsoite + parametrit}" target="_blank">Navigoi</a>
            </div>`
  }
  L.marker([latitude, longitude], {icon: ikoni}).
      addTo(map).
      bindPopup(teksti).
      on('click', function() {
        nimi.innerHTML = info?.nimi || 'Olet tässä';
        osoite.innerHTML = info?.osoite || '';
        kaupunki.innerHTML = info?.kaupunki || '';
        lisatiedot.innerHTML = info?.lisatiedot || '';
      });
}

// Funktio, joka ajetaan, kun paikkatiedot on haettu
function success(pos) {
  const crd = pos.coords;
  haeLatauspisteet(crd.latitude, crd.longitude);
  map.setView([crd.latitude, crd.longitude], 12);
  // lisätään markkeri omaan lokaatioon
  lisaaMarker(crd.latitude, crd.longitude, 'Olen tässä', punainenikoni);
}

// Funktio, joka ajetaan, jos paikkatietojen hakemisessa tapahtuu virhe
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Käynnistetään paikkatietojen haku
navigator.geolocation.getCurrentPosition(success, error, options);

function haeLatauspisteet(latitude, longitude) {
  const query = `?key=${key}&latitude=${latitude}&longitude=${longitude}&distance=${distance}&distancunit=${distanceunit}`;
  const osoite = baseURL + endpoint + query;

  fetch(osoite).then(function(vastaus) {
    return vastaus.json();
  }).then(function(latauspisteet) {
    console.log(latauspisteet);
    for (let i = 0; i < latauspisteet.length; i++) {
      /*
      const latitude = latauspisteet[i].AddressInfo.Latitude;
      const longitude = latauspisteet[i].AddressInfo.Longitude;
      const teksti = latauspisteet[i].AddressInfo.Title;
       */
      const {
        Latitude,
        Longitude,
        Title,
        AddressLine1,
        Town,
        AccessComments,
      } = latauspisteet[i].AddressInfo;
      const info = {
        nimi: Title,
        osoite: AddressLine1,
        kaupunki: Town,
        lisatiedot: AccessComments,
      };
      lisaaMarker(Latitude, Longitude, Title, vihreaikoni, info, {latitude, longitude});
    }
  });
}
