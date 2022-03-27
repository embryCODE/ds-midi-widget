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
      soundfontUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
      instrument: 'acoustic_guitar_steel',
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
    MIDI.programChange(0, MIDI.GM.byName['acoustic_guitar_steel'].program);
  }

  setBpmAndLoadFile(bpm) {
    const midiFileSrc = this.getAttribute('midi-file-src');

    this.bpmInput.value = bpm;
    this.player.BPM = bpm;

    this.player.loadFile(
      midiFileSrc,
      () => {
        this.removeDuplicateNoteEvents(this.player);
      }, // onsuccess
      () => {}, // onprogress
      (err) => {
        console.error(err);
      } // onerror
    );
  }

  removeDuplicateNoteEvents(player) {
    let prevNoteEvent;

    player.replayer.temporal = player.replayer.temporal.reduce((acc, curr) => {
      const [midiEvent] = curr;

      // If this midiEvent is not a note event, allow it and move on
      if (!this.isNoteEvent(midiEvent)) {
        acc.push(curr);
        return acc;
      }

      // If it is a note event
      const noteEvent = midiEvent.event;

      // ... only allow it if it is not a duplicate
      if (!this.isDuplicateNoteEvent(prevNoteEvent, noteEvent)) {
        acc.push(curr);
      }

      // Cache the current noteEvent for comparison in the next loop
      prevNoteEvent = noteEvent;

      return acc;
    }, []);
  }

  isNoteEvent(midiEvent) {
    return (
      midiEvent.event.subtype !== 'noteOn' ||
      midiEvent.event.subtype !== 'noteOff'
    );
  }

  isDuplicateNoteEvent(prevNote, currNote) {
    if (!prevNote) return false;

    return (
      prevNote.channel === currNote.channel &&
      prevNote.noteNumber === currNote.noteNumber &&
      prevNote.subtype === currNote.subtype &&
      prevNote.type === currNote.type &&
      prevNote.velocity === currNote.velocity &&
      currNote.deltaTime === 0
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
