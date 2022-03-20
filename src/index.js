// noinspection JSUnusedGlobalSymbols

import * as midicube from 'midicube';
window.MIDI = midicube;

const template = document.createElement('template');

template.innerHTML = `
  <span>
     <button id="playPause">Play</button>
     <button id="reset">Reset</button>
  </span>
`;

class dsMidiPlayer extends HTMLElement {
  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['midi-file-src'];
  }

  connectedCallback() {
    this.initPlayer();
    this.registerElements();
    this.registerHandlers();
  }

  initPlayer() {
    const midiFileSrc = this.getAttribute('midi-file-src');

    MIDI.loadPlugin({
      soundfontUrl: './soundfont/',
      onerror: (e) => {
        console.error(e);
      },
      onsuccess: () => {
        this.player = new MIDI.Player();

        this.player.loadFile(
          midiFileSrc,
          () => {
            console.log('onsuccess');
          },
          (state, progress) => {
            console.log('onprogress:', state, progress);
          },
          (err) => {
            console.error('onerror:', err);
          }
        );
      },
    });
  }

  registerElements() {
    this.playPauseButton = this._shadowRoot.getElementById('playPause');
    this.resetButton = this._shadowRoot.getElementById('reset');
  }

  registerHandlers() {
    this.playPauseButton.onclick = this.handlePlayPauseClick;
    this.resetButton.onclick = this.handleStopClick;
  }

  handlePlayPauseClick = () => {
    this.pausePlayStop();
  };

  handleStopClick = () => {
    this.pausePlayStop(true);
  };

  pausePlayStop = (isStop) => {
    if (isStop) {
      this.player.stop();
      this.playPauseButton.innerText = 'Play';
      return;
    }

    if (this.player.playing) {
      this.player.pause(true);
      this.playPauseButton.innerText = 'Play';
      return;
    }

    this.player.resume();
    this.playPauseButton.innerText = 'Pause';
  };
}

window.customElements.define('ds-midi-player', dsMidiPlayer);
