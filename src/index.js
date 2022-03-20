// noinspection JSUnusedGlobalSymbols,JSUnresolvedFunction

import * as midicube from 'midicube';
window.MIDI = midicube;

const DEFAULT_BPM = 90;

const template = document.createElement('template');

template.innerHTML = `
  <span id="controls">
    <input id="bpm-input" name="tempo" type="number"/>
    <button id="play-pause">Play</button>
    <button id="reset">Reset</button>
  </span>
  
  <style>
    * {
      box-sizing: border-box;
    }
    
    #controls {
      border: solid 1px lightgray;
      border-radius: 8px;
      padding: 8px;
      
      display: inline-flex;
      align-items: center;
    }
    
    input {
      width: 70px;
      height: 30px;
      border: solid 1px lightgray;
      padding: 0 8px;
      border-radius: 4px
    }
    
    button {
      background: transparent;
      border: solid 1px lightgray;
      border-radius: 4px;
      width: 50px;
      height: 30px;
      cursor: pointer;
      margin-left: 4px;
    }
  </style>
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
    MIDI.loadPlugin({
      soundfontUrl: './soundfont/',
      onerror: (e) => {
        console.error(e);
      },
      onsuccess: () => {
        this.setPlayer();
        this.setBpmAndLoadFile(DEFAULT_BPM);
      },
    });
  }

  setPlayer() {
    this.player = new MIDI.Player();
  }

  setBpmAndLoadFile(bpm) {
    const midiFileSrc = this.getAttribute('midi-file-src');

    this.bpmInput.value = bpm;
    this.player.BPM = bpm;

    this.player.loadFile(
      midiFileSrc,
      () => {}, // onsuccess
      () => {}, // onprogress
      (err) => {
        console.error(err);
      } // onerror
    );
  }

  registerElements() {
    this.playPauseButton = this._shadowRoot.getElementById('play-pause');
    this.resetButton = this._shadowRoot.getElementById('reset');
    this.bpmInput = this._shadowRoot.getElementById('bpm-input');
  }

  registerHandlers() {
    this.playPauseButton.onclick = this.handlePlayPauseClick;
    this.resetButton.onclick = this.handleStopClick;
    this.bpmInput.onchange = this.handleBpmChange;
  }

  handlePlayPauseClick = () => {
    this.pausePlayStop();
  };

  handleStopClick = () => {
    this.pausePlayStop(true);
  };

  handleBpmChange = (e) => {
    this.pausePlayStop(true);
    this.setBpmAndLoadFile(e.target.value);
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
