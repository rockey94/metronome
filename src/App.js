import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const App = () => {
  const [currentBeat, setCurrentBeat] = useState(0); // Define setCurrentBeat function

  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const [scale, setScale] = useState("major");
  const [rootNote, setRootNote] = useState(440); // A4
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentNote, setCurrentNote] = useState(null);
  const [randomizedNotes, setRandomizedNotes] = useState([]);
  const audioContextRef = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const currentOscillatorRef = useRef(null);
  const currentOscillator = useRef(null);

  const frequencyToMidiNoteNumber = (frequency) => {
    return Math.round(69 + 12 * Math.log2(frequency / 440));
  };

  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const midiNoteNumberToNoteName = (midiNoteNumber) => {
    return noteNames[midiNoteNumber % 12] + Math.floor(midiNoteNumber / 12);
  };

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

  const generateRandomizedNotes = () => {
    const selectedScale = scales[scale];
    const frequencies = generateScale(rootNote, selectedScale);
    let randomized = [...frequencies].sort(() => Math.random() - 0.5);

    while (randomized.length < beatsPerMeasure) {
      randomized = randomized.concat(
        [...frequencies].sort(() => Math.random() - 0.5)
      );
    }

    if (randomized.length > beatsPerMeasure) {
      randomized = randomized.slice(0, beatsPerMeasure);
    }

    setRandomizedNotes(randomized);
    setCount(-1);
  };

  const generateScale = (root, intervals) => {
    return intervals.map((interval) => root * Math.pow(2, interval / 12));
  };

  const countRef = useRef(-1);

  const play = (frequency) => {
    if (!isFinite(frequency)) {
      console.error(`Invalid frequency: ${frequency}`);
      return;
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(audioContext.destination);

    const time = audioContext.currentTime;
    const duration = 60 / tempo;

    oscillator.start(time);
    oscillator.stop(time + duration);

    currentOscillator.current = oscillator;
  };

  const incrementBeatsPerMeasure = () => {
    if (beatsPerMeasure < 16) {
      setBeatsPerMeasure(beatsPerMeasure + 1);
    }
  };

  const decrementBeatsPerMeasure = () => {
    if (beatsPerMeasure > 4) {
      setBeatsPerMeasure(beatsPerMeasure - 1);
    }
  };

  // Replace the useEffect hook with this one
  useEffect(() => {
    let intervalId;

    if (playing && randomizedNotes.length > 0) {
      intervalId = setInterval(() => {
        setCount((prevCount) => {
          const nextCount = (prevCount + 1) % beatsPerMeasure;
          countRef.current = nextCount;
          const note = randomizedNotes[nextCount];
          if (note) {
            play(note);
            setCurrentNote(
              midiNoteNumberToNoteName(frequencyToMidiNoteNumber(note))
            );
          }

          // Increment currentBeat
          setCurrentBeat((prevBeat) => (prevBeat + 1) % beatsPerMeasure);
          return nextCount;
        });
      }, (60 / tempo) * 1000); // convert tempo to milliseconds
    }

    return () => {
      if (currentOscillator.current) {
        currentOscillator.current.stop();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    playing,
    tempo,
    beatsPerMeasure,
    scale,
    rootNote,
    scales,
    randomizedNotes,
    midiNoteNumberToNoteName,
    play,
  ]);
  useEffect(() => {
    generateRandomizedNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, rootNote, beatsPerMeasure]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <h1>Metronome</h1>
      <p>Current Beat: {count + 1}</p>
      <p>Current Note: {currentNote}</p>
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
      <button onClick={generateRandomizedNotes}>Shuffle</button>
      <div>
        {beatsPerMeasure > 4 && (
          <button onClick={decrementBeatsPerMeasure}>-</button>
        )}
        <span>{beatsPerMeasure}</span>
        {beatsPerMeasure < 16 && (
          <button onClick={incrementBeatsPerMeasure}>+</button>
        )}
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
          {/* ... map your scales here */}
        </select>
      </div>
      <div style={{ marginTop: "20px", fontSize: "20px", fontWeight: "bold" }}>
        Current Scale: {scale.charAt(0).toUpperCase() + scale.slice(1)}
      </div>
    </div>
  );
};

export default App;
