import React, { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const [scale, setScale] = useState("major");
  const [rootNote, setRootNote] = useState(440); // A4
  const beatsPerMeasure = 8;

  const scales = {
    major: [0, 2, 4, 5, 7, 9, 11, 12],
    minor: [0, 2, 3, 5, 7, 8, 10, 12],
    wholeTone: [0, 2, 4, 6, 8, 10, 12],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],
  };

  const generateScale = (root, intervals) => {
    return intervals.map((interval) => root * Math.pow(2, interval / 12));
  };

  useEffect(() => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    let oscillator = null;

    const interval = setInterval(() => {
      if (playing) {
        setCount((prevCount) => {
          const nextCount = (prevCount + 1) % beatsPerMeasure;
          const currentScale = generateScale(rootNote, scales[scale]);
          oscillator = audioContext.createOscillator();
          oscillator.frequency.value = currentScale[nextCount];
          oscillator.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          return nextCount;
        });
      }
    }, (60 / tempo) * 1000);

    return () => {
      clearInterval(interval);
      if (oscillator) {
        oscillator.stop();
      }
    };
  }, [playing, tempo, scale, rootNote]);

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
