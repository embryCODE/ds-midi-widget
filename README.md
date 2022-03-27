# Dan Shields MIDI Widget

This is a simple MIDI player web component with bpm functionality and some under-the-hood duplicate note filtering. Note that it is hardcoded to an acoustic guitar sound.

## Widget use

- Set the tempo with the number input. 
  - Each change of tempo will reload the MIDI file, so sadly no changing during playback.
- Click Play button to start, pause, and resume.
- Click Reset to stop and reset playback to start.

## Installation

Simply add this script tag to the end of the `body` element on your site:

```html
<script src="https://ds-midi-widget.s3.us-east-2.amazonaws.com/ds-midi-player.js"></script>
```

Then, use the web component like this:

```html
<ds-midi-player
    midi-file-src="relative-path-to-your-midi-file"
>
</ds-midi-player>
```

You can style the web component however you like. It is a `span` element under the hood.


