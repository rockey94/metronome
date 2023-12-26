import React, { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const [scale, setScale] = useState("major");
  const [rootNote, setRootNote] = useState(440); // A4
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const randomIndex = Math.floor(Math.random() * scale.length);
  const note = scale[randomIndex];

  const scales = {
    major: [0, 2, 4, 5, 7, 9, 11, 12],
    minor: [0, 2, 3, 5, 7, 8, 10, 12],
    wholeTone: [0, 2, 4, 6, 8, 10, 12],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],
    pentatonicMajor: [0, 2, 4, 7, 9, 12],
    pentatonicMinor: [0, 3, 5, 7, 10, 12],
    blues: [0, 3, 5, 6, 7, 10, 12],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    dorian: [0, 2, 3, 5, 7, 9, 10, 12],
    phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
    lydian: [0, 2, 4, 6, 7, 9, 11, 12],
    mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
    aeolian: [0, 2, 3, 5, 7, 8, 10, 12],
    locrian: [0, 1, 3, 5, 6, 8, 10, 12],
    diminished: [0, 2, 3, 5, 6, 8, 9, 11, 12],
    wholeHalfDiminished: [0, 2, 3, 5, 6, 8, 9, 11, 12],
    halfWholeDiminished: [0, 1, 3, 4, 6, 7, 9, 10, 12],
    augmented: [0, 3, 4, 7, 8, 11, 12],
    doubleHarmonic: [0, 1, 4, 5, 7, 8, 11, 12],
    enigmatic: [0, 1, 4, 6, 8, 10, 12],
  };

  const generateScale = (root, intervals) => {
    return intervals.map((interval) => root * Math.pow(2, interval / 12));
  };
  const play = (frequency) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(audioContext.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
    }, (60 / tempo) * 1000); // stop after one beat
  };
  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        setCount((prevCount) => (prevCount + 1) % beatsPerMeasure);
        const selectedScale = scales[scale];
        const frequencies = generateScale(rootNote, selectedScale);
        const randomIndex = Math.floor(Math.random() * frequencies.length);
        const frequency = frequencies[randomIndex];
        play(frequency);
      }, (60 / tempo) * 1000);
      return () => clearInterval(interval);
    }
  }, [playing, tempo, beatsPerMeasure, scale, rootNote, scales]);

  return (
    <div>
      <h1>Metronome</h1>
      <p>Current Beat: {count + 1}</p>
      <div>
        {[...Array(beatsPerMeasure)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "inline-block",
              margin: "0 5px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: i === count ? "black" : "white",
              border: "1px solid black",
              animation: i === count ? "beat 0.5s linear" : undefined,
            }}
          />
        ))}
      </div>
      <button
        onClick={() => {
          setPlaying((prevPlaying) => {
            const nextPlaying = !prevPlaying;
            setCount(nextPlaying ? 0 : -1);
            return nextPlaying;
          });
        }}
      >
        {playing ? "Stop" : "Start"}
      </button>
      <div>
        <label>Beats per Measure: </label>
        <input
          type="number"
          min="4"
          max="16"
          value={beatsPerMeasure}
          onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Tempo: </label>
        <input
          type="number"
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
        />
      </div>
      <div>
        <label>Root Note: </label>
        <input
          type="number"
          value={rootNote}
          onChange={(e) => setRootNote(e.target.value)}
        />
      </div>
      <div>
        <label>Scale: </label>
        <select value={scale} onChange={(e) => setScale(e.target.value)}>
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="wholeTone">Whole Tone</option>
          <option value="harmonicMinor">Harmonic Minor</option>
          <option value="pentatonicMajor">Pentatonic Major</option>
          <option value="pentatonicMinor">Pentatonic Minor</option>
          <option value="blues">Blues</option>
          <option value="chromatic">Chromatic</option>
          <option value="dorian">Dorian</option>
          <option value="phrygian">Phrygian</option>
          <option value="lydian">Lydian</option>
          <option value="mixolydian">Mixolydian</option>
          <option value="aeolian">Aeolian</option>
          <option value="locrian">Locrian</option>
          <option value="diminished">Diminished</option>
          <option value="wholeHalfDiminished">Whole Half Diminished</option>
          <option value="halfWholeDiminished">Half Whole Diminished</option>
          <option value="augmented">Augmented</option>
          <option value="doubleHarmonic">Double Harmonic</option>
          <option value="enigmatic">Enigmatic</option>
        </select>
      </div>
      <div style={{ marginTop: "20px", fontSize: "20px", fontWeight: "bold" }}>
        {" "}
        {/* New visual indicator for scale */}
        Current Scale: {scale.charAt(0).toUpperCase() + scale.slice(1)}
      </div>
    </div>
  );
};

export default App;
