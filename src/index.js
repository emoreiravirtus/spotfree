import "../scss/style.scss";
import GenreBox from "./components/GenreBox";

import { render, renderList } from '../util/framework/helper'
import { 
  getLibraries, 
  getAuthorization, 
  getCode, 
  setTokens, 
  fetchAccessToken,
  getSongs,
  playTrack
} from "./network";
import { attachFunctionToElement } from "../util/actionsAttacher";

const genreBox = new GenreBox();
let genresList = [];

let isPlaying = false;

const initialize = async () => {

  if(window.location.search.length > 0) {

    setTokens();

    let code = await getCode();

    await fetchAccessToken(code)

    await setTokens();
    
    genresList = await getLibraries()
  
    const html = `
      <div class="main-view" data-app-id="mainView">
        <div class="container">
          <div class="row my- title">
            <div>Spot<span>FREE</span></div>
          </div>
          <div class="row my-xl">
            <div class="col-12"></div>
          </div>
          <div class="row">
            ${ renderList(genresList, genreBox, 'col-6 col-md-4') }
          </div>
        </div>
      </div>
      <div class="genres-modal">
        <div class="back-button" onclick="document.querySelector('.genres-modal').style.display = 'none'; 
        document.querySelector('body').classList.remove('stop-scrolling');
        document.querySelector('.tracks-container').innerHTML = ''"><span class="back"></span></div>
        <div class="tracks-container"></div>
      </div>
      <div class="player-modal">
      </div>
      `;

    render(html, document.body);


    if(localStorage.getItem('currentTrackId')) {
      const trackId = localStorage.getItem('currentTrackId');

      playTrack(trackId)
            .then(response => {

              const track = response;

              const player = document.querySelector('.player-modal');
              player.style.display = 'flex';

              player.innerHTML = `
              <div class="player-track my-m p-m">
                <div class="player-track-image ml-s">
                  <img src="${track.album.images[0].url}">
                </div>
                <div class="player-track-artist ml-s">
                  <p>${track.name}<p/>
                  <p>${track.artists[0].name}</p>
                </div>
                <div class="player-track-play-button">
                  <span class="play-icon">
                    <div></div><div></div>
                  </span>
                </div>
                <div class="waves">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
              `;

              setPlayerAction();
            })
    }
  }
  else {
    getAuthorization();
  }
}

initialize()
  .then(() => attachFunctionToElement('.genre-box', function() {

    const genreId = this.dataset.id;

    getSongs(genreId)
      .then(response => {
        const modal = document.querySelector('.genres-modal');
        modal.style.display = 'flex';

        document.querySelector('body').classList.add('stop-scrolling');
        window.scrollTo(0, 0);

        for (const item of response) {
          const track = item.track;

          modal.querySelector('.tracks-container'). innerHTML += `
            <div data-id="${item.track.id}" class="track my-m p-m">
              <div class="track-image ml-s">
                <img src="${track.album.images[0].url}">
              </div>
              <div class="track-artist ml-s">
                <p>${track.name}<p/>
                <p>${track.artists[0].name}</p>
              </div>
            </div>
          `
        }

        attachFunctionToElement('.track', function() {
          const trackId = this.dataset.id;
          
          playTrack(trackId)
            .then(response => {

              const track = response;

              const player = document.querySelector('.player-modal');
              player.style.display = 'flex';

              player.innerHTML = `
              <div class="player-track my-m p-m">
                <div class="player-track-image ml-s">
                  <img src="${track.album.images[0].url}">
                </div>
                <div class="player-track-artist ml-s">
                  <p>${track.name}<p/>
                  <p>${track.artists[0].name}</p>
                  </div>
                  <div class="player-track-play-button">
                    <span class="play-icon">
                      <div></div><div></div>
                    </span>
                  </div>
                  <div class="waves">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              `;
              
              setPlayerAction(true);
            })
        })
        
      })
  }));

const setPlayerAction = (modifier = false) => {
  
  if(modifier) {
    isPlaying = true;
    document.querySelector('.player-track-play-button span').classList.add('pause-icon');
    document.querySelector('.player-track-play-button span').classList.remove('play-icon');
    document.querySelector('.waves').classList.add('waves-animated');
  } 

  attachFunctionToElement('.player-track-play-button', function() {

    if (!isPlaying) {
      document.querySelector('.player-track-play-button span').classList.add('pause-icon');
      document.querySelector('.player-track-play-button span').classList.remove('play-icon');
      document.querySelector('.waves').classList.add('waves-animated');
    }
    else {
      document.querySelector('.player-track-play-button span').classList.remove('pause-icon');
      document.querySelector('.player-track-play-button span').classList.add('play-icon');
      document.querySelector('.waves').classList.remove('waves-animated');
    }

    isPlaying = !isPlaying;
  });
}
