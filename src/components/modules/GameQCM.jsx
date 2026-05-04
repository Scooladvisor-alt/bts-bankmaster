import React, { useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Heart, RotateCcw, Pause, Play, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import DuoButton from "@/components/ui-duo/DuoButton";
import { saveGameKmRecord, getGameKmRecord } from "@/lib/scoreStorage";
import { saveGameKmRecordDB, loadGameKmRecordDB } from "@/lib/recordStorage";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROAD_W = 9;
const TILE_LEN = 30;
const NUM_TILES = 6;
const LANE_SPREAD = 3.2;
const SPEED_MODES = {
  facile:  { label: "🐢 Facile",  multiplier: 0.60, color: "bg-green-500" },
  moyen:   { label: "🚗 Moyen",   multiplier: 1.00, color: "bg-yellow-500" },
  difficile: { label: "🔥 Difficile", multiplier: 1.40, color: "bg-red-500" },
};
const BASE_SPEED = 0.20;
// How far ahead (world units) to spawn split signs
const SPLIT_AHEAD = 55;
// How far past signs before auto-fail
const FAIL_PAST = 18;

const STATE = {
  DRIVING: "driving",   // normal forward motion, signs visible ahead
  EXPLODE: "explode",   // wrong lane or missed → explosion
  GAMEOVER: "gameover",
  WIN: "win",
  PAUSED: "paused",
};

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function makeTile() {
  const g = new THREE.Group();
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_W, TILE_LEN),
    new THREE.MeshLambertMaterial({ color: 0x3a3a4a })
  );
  road.rotation.x = -Math.PI / 2;
  g.add(road);

  for (let dz = -2; dz > -TILE_LEN; dz -= 6) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 2.8),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.01, dz);
    g.add(dash);
  }

  [-ROAD_W / 2, ROAD_W / 2].forEach((x) => {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, TILE_LEN),
      new THREE.MeshLambertMaterial({ color: 0xffd700 })
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.015, -TILE_LEN / 2);
    g.add(stripe);
  });
  return g;
}

function makeSplitSection() {
  const g = new THREE.Group();
  const lanePositions = [-LANE_SPREAD, 0, LANE_SPREAD];
  const laneColors = [0xb845f5, 0x2dd4f0, 0xf59e0b];
  const LANE_LEN = 50;

  lanePositions.forEach((x, i) => {
    const lane = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_W / 3 - 0.3, LANE_LEN),
      new THREE.MeshLambertMaterial({ color: laneColors[i] })
    );
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(x, 0.01, -LANE_LEN / 2);
    g.add(lane);

    // Separator walls only
    if (i < 2) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.7, LANE_LEN),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      wall.position.set(x + LANE_SPREAD / 2, 0.35, -LANE_LEN / 2);
      g.add(wall);
    }
  });

  return g;
}

function makeCar() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 2.1), new THREE.MeshLambertMaterial({ color: 0xef4444 }));
  body.position.y = 0.38;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.38, 1.1), new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
  roof.position.set(0, 0.82, -0.08);
  g.add(roof);
  const dark = new THREE.MeshLambertMaterial({ color: 0x1e293b });
  [[0.58, 0.18, 0.65], [-0.58, 0.18, 0.65], [0.58, 0.18, -0.65], [-0.58, 0.18, -0.65]].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 14), dark);
    w.rotation.z = Math.PI / 2; w.position.set(x, y, z); g.add(w);
  });
  [[0.32, 0.42, 1.06], [-0.32, 0.42, 1.06]].forEach(([x, y, z]) => {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    h.position.set(x, y, z); g.add(h);
  });
  return g;
}

function makeExplosion(scene, pos) {
  const pts = [];
  for (let i = 0; i < 35; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(Math.random() * 0.25 + 0.07, 5, 5),
      new THREE.MeshBasicMaterial({ color: [0xff4500, 0xff8c00, 0xffd700, 0xff6347][i % 4] })
    );
    p.position.copy(pos);
    p.userData.v = new THREE.Vector3((Math.random() - 0.5) * 0.35, Math.random() * 0.4 + 0.1, (Math.random() - 0.5) * 0.35);
    scene.add(p); pts.push(p);
  }
  return pts;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GameQCM({ subject }) {
  const mountRef = useRef(null);
  const animRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camRef = useRef(null);
  const carRef = useRef(null);
  const tilesRef = useRef([]);
  const treeGroupsRef = useRef([]);
  const particlesRef = useRef([]);

  // Current split section in the world (persists between questions)
  const splitRef = useRef(null);

  // Game state refs (read inside rAF loop)
  const stateRef = useRef(STATE.DRIVING);
  const pausedRef = useRef(false);
  const carZRef = useRef(0);
  const carXRef = useRef(0);
  const targetXRef = useRef(0);
  const choosingRef = useRef(false);  // true while a lane choice is being processed
  const splitWorldZRef = useRef(0);   // world Z of the split section origin

  const idxRef = useRef(0);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const questionsRef = useRef([]);
  const wheelAngleRef = useRef(0);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState(STATE.DRIVING);
  const [paused, setPaused] = useState(false);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [km, setKm] = useState(0);
  const [kmRecord, setKmRecord] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const [speedMode, setSpeedMode] = useState("moyen");
  const [gameStarted, setGameStarted] = useState(false);
  const speedModeRef = useRef("moyen");
  const kmRef = useRef(0);
  const kmIntervalRef = useRef(null);

  useEffect(() => {
    // Charger le record km depuis BDD (fusionne avec localStorage)
    loadGameKmRecordDB(subject).then(record => setKmRecord(record));
  }, [subject]);

  // ── Km counter ──
  useEffect(() => {
    if (uiState === STATE.GAMEOVER || uiState === STATE.WIN) return;
    if (paused) { clearInterval(kmIntervalRef.current); return; }
    kmIntervalRef.current = setInterval(() => {
      kmRef.current += 0.1;
      const newKm = Math.round(kmRef.current * 10) / 10;
      setKm(newKm);
      if (newKm > kmRecord) setKmRecord(newKm);
    }, 300);
    return () => clearInterval(kmIntervalRef.current);
  }, [uiState, paused, kmRecord]);

  // ── Load questions ──
  useEffect(() => {
    (async () => {
      let all = await base44.entities.Question.filter({ subject, mode: "jeu" });
      if (all.length === 0) all = await base44.entities.Question.filter({ subject, mode: "pareto" });
      const mapped = all.map((q) => {
        const correct = q.options[q.correct_index];
        const others = q.options.filter((_, i) => i !== q.correct_index).slice(0, 2);
        while (others.length < 2) others.push("—");
        const opts = [correct, ...others].sort(() => Math.random() - 0.5);
        return { ...q, options: opts, correct_index: opts.indexOf(correct) };
      });
      const shuffled = mapped.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      questionsRef.current = shuffled;
      setLoading(false);
    })();
  }, [subject]);

  // ── Helper: spawn next split section ahead of car ──
  const spawnSplit = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (splitRef.current) scene.remove(splitRef.current);
    const worldZ = carZRef.current - SPLIT_AHEAD;
    splitWorldZRef.current = worldZ;
    const sec = makeSplitSection();
    sec.position.z = worldZ;
    scene.add(sec);
    splitRef.current = sec;
  }, []);

  // ── Helper: trigger fail (wrong or missed) ──
  const triggerFail = useCallback(() => {
    if (stateRef.current !== STATE.DRIVING) return;
    stateRef.current = STATE.EXPLODE;
    setUiState(STATE.EXPLODE);
    setFeedback("wrong");

    const car = carRef.current;
    const scene = sceneRef.current;
    if (car && scene) {
      particlesRef.current = makeExplosion(scene, car.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
      car.visible = false;
    }
    const newLives = livesRef.current - 1;
    livesRef.current = newLives;
    setLives(newLives);

    setTimeout(() => {
      setFeedback(null);
      particlesRef.current.forEach((p) => scene?.remove(p));
      particlesRef.current = [];
      if (carRef.current) carRef.current.visible = true;
      targetXRef.current = 0;
      choosingRef.current = false;

      if (newLives <= 0) {
        stateRef.current = STATE.GAMEOVER;
        setUiState(STATE.GAMEOVER);
        return;
      }
      // Respawn split for same question further ahead
      spawnSplit();
      stateRef.current = STATE.DRIVING;
      setUiState(STATE.DRIVING);
    }, 2000);
  }, [spawnSplit]);

  // ── Helper: trigger correct ──
  const triggerCorrect = useCallback(() => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setFeedback("correct");

    setTimeout(() => {
      setFeedback(null);
      choosingRef.current = false;
      targetXRef.current = 0; // re-centre

      const nextIdx = idxRef.current + 1;
      if (nextIdx >= questionsRef.current.length) {
        stateRef.current = STATE.WIN;
        setUiState(STATE.WIN);
        return;
      }
      idxRef.current = nextIdx;
      setIdx(nextIdx);
      spawnSplit();
      // state stays DRIVING — no interruption!
    }, 1800);
  }, [spawnSplit]);

  // ── Choose lane ──
  const chooseLane = useCallback((laneIdx) => {
    if (stateRef.current !== STATE.DRIVING || choosingRef.current) return;
    choosingRef.current = true;

    const xPositions = [-LANE_SPREAD, 0, LANE_SPREAD];
    targetXRef.current = xPositions[laneIdx];

    const q = questionsRef.current[idxRef.current];
    const correct = laneIdx === q.correct_index;

    setTimeout(() => {
      if (correct) triggerCorrect();
      else triggerFail();
    }, 400);
  }, [triggerCorrect, triggerFail]);

  const chooseLaneRef = useRef(chooseLane);
  useEffect(() => { chooseLaneRef.current = chooseLane; }, [chooseLane]);

  // ── Build Three.js scene ──
  useEffect(() => {
    if (loading || questions.length === 0 || !mountRef.current) return;

    const W = mountRef.current.clientWidth || 400;
    const H = mountRef.current.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    // Empêche Three.js de bloquer les touch events en dehors du canvas
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.userSelect = "none";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.016);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 300);
    camRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.1);
    sun.position.set(8, 20, 10);
    scene.add(sun);

    // Ground
    const gnd = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshLambertMaterial({ color: 0x4ade80 })
    );
    gnd.rotation.x = -Math.PI / 2;
    gnd.position.y = -0.01;
    gnd.name = "ground";
    scene.add(gnd);

    // Road tiles pool
    const tiles = [];
    for (let i = 0; i < NUM_TILES; i++) {
      const t = makeTile();
      t.position.z = -i * TILE_LEN - TILE_LEN / 2;
      scene.add(t); tiles.push(t);
    }
    tilesRef.current = tiles;

    // Tree pool
    const treeGroups = [];
    for (let i = 0; i < 20; i++) {
      const side = i % 2 === 0 ? -8 : 8;
      const z = -Math.floor(i / 2) * 10;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.2, 1.4, 6),
        new THREE.MeshLambertMaterial({ color: 0x78350f })
      );
      trunk.position.set(side, 0.7, z);
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(1.0, 2.6, 7),
        new THREE.MeshLambertMaterial({ color: 0x15803d })
      );
      top.position.set(side, 2.6, z);
      const tg = new THREE.Group();
      tg.add(trunk, top);
      scene.add(tg);
      treeGroups.push({ mesh: tg, side });
    }
    treeGroupsRef.current = treeGroups;

    // Car
    const car = makeCar();
    car.position.set(0, 0, 0);
    scene.add(car);
    carRef.current = car;

    // Spawn first split
    spawnSplit();

    // Keyboard arrow controls
    const onKey = (e) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowLeft") chooseLaneRef.current(0);
        else if (e.key === "ArrowUp") chooseLaneRef.current(1);
        else if (e.key === "ArrowRight") chooseLaneRef.current(2);
      }
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
      }
    };
    window.addEventListener("keydown", onKey);

    // ── Animation loop ──
    function animate() {
      animRef.current = requestAnimationFrame(animate);
      if (pausedRef.current) { renderer.render(scene, camera); return; }

      const state = stateRef.current;
      const car = carRef.current;

      if (state === STATE.DRIVING) {
        const carSpeed = BASE_SPEED * SPEED_MODES[speedModeRef.current].multiplier;
        carZRef.current -= carSpeed;
        // Lerp X toward target lane (0 = center normally)
        carXRef.current += (targetXRef.current - carXRef.current) * 0.06;
        car.position.z = carZRef.current;
        car.position.x = carXRef.current;
        const carSpeed2 = BASE_SPEED * SPEED_MODES[speedModeRef.current].multiplier;
        wheelAngleRef.current += carSpeed2 * 0.55;
        [3, 4, 5, 6].forEach((ci) => { if (car.children[ci]) car.children[ci].rotation.x = wheelAngleRef.current; });

        // Auto-fail: if car passes split signs without choosing
        const signZ = splitWorldZRef.current - 8; // sign is at -8 within group
        if (!choosingRef.current && carZRef.current < signZ - FAIL_PAST) {
          choosingRef.current = true;
          triggerFail();
        }
      }

      if (state === STATE.EXPLODE) {
        particlesRef.current.forEach((p) => {
          p.position.add(p.userData.v);
          p.userData.v.y -= 0.013;
          p.scale.multiplyScalar(0.96);
        });
      }

      // Recycle tiles
      const cz = carZRef.current;
      tiles.forEach((tile) => {
        if (tile.position.z - TILE_LEN / 2 > cz + TILE_LEN) {
          let minZ = Infinity;
          tiles.forEach((t) => { if (t.position.z < minZ) minZ = t.position.z; });
          tile.position.z = minZ - TILE_LEN;
        }
      });

      // Recycle trees
      treeGroups.forEach((tg) => {
        if (tg.mesh.position.z > cz + 14) {
          tg.mesh.position.z -= (treeGroups.length / 2) * 10;
        }
      });

      // Move ground with camera
      const gnd = scene.getObjectByName("ground");
      if (gnd) gnd.position.z = cz;

      // Camera follow
      const camX = camera.position.x + (carXRef.current * 0.25 - camera.position.x) * 0.08;
      camera.position.set(camX, 3.6, cz + 6.5);
      camera.lookAt(carXRef.current * 0.4, 0.8, cz - 12);

      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth, h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [loading, questions.length, spawnSplit, triggerFail]);

  // ── Toggle pause ──
  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  // ── Restart ──
  const restart = useCallback(() => {
    particlesRef.current.forEach((p) => sceneRef.current?.remove(p));
    particlesRef.current = [];
    if (carRef.current) carRef.current.visible = true;
    if (splitRef.current) sceneRef.current?.remove(splitRef.current);

    const shuffled = [...questionsRef.current].sort(() => Math.random() - 0.5);
    questionsRef.current = shuffled;
    idxRef.current = 0; livesRef.current = 3; scoreRef.current = 0;
    targetXRef.current = 0; choosingRef.current = false;
    pausedRef.current = false;

    kmRef.current = 0;
    setKm(0); setIdx(0); setLives(3); setScore(0); setFeedback(null);
    setPaused(false); setQuestions(shuffled);

    spawnSplit();
    stateRef.current = STATE.DRIVING;
    setUiState(STATE.DRIVING);
    setGameStarted(true);
  }, [spawnSplit]);

  // Save km record on game over/win
  useEffect(() => {
    if (uiState === STATE.GAMEOVER || uiState === STATE.WIN) {
      if (km > 0) {
        const prev = getGameKmRecord(subject);
        saveGameKmRecord(subject, km);
        saveGameKmRecordDB(subject, km, prev);
      }
    }
  }, [uiState, km, subject]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return <div className="flex items-center gap-2 text-stone-500 p-10"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>;
  if (questions.length === 0) return <div className="bg-white rounded-2xl p-8 text-center text-stone-600">Pas encore de questions en mode jeu.</div>;

  // Écran de sélection de vitesse avant de démarrer
  if (!gameStarted) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-6 select-none">
        <div className="text-center">
          <div className="text-5xl mb-3">🏎️</div>
          <h2 className="font-display text-3xl font-bold text-stone-800">Choisis ta vitesse</h2>
          <p className="text-stone-500 text-sm mt-1">Tu pourras toujours recommencer dans un autre mode</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg px-4">
          {Object.entries(SPEED_MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => {
                setSpeedMode(key);
                speedModeRef.current = key;
                setGameStarted(true);
              }}
              className={`flex-1 ${mode.color} text-white font-display font-bold text-lg py-5 rounded-2xl shadow-duo border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all hover:opacity-90`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <Link to={`/${subject.toLowerCase()}`} className="text-sm text-stone-400 hover:text-stone-600 underline">
          ← Retour
        </Link>
      </div>
    );
  }

  const current = questions[idx];
  const laneColors = [
    "border-purple-300 bg-purple-50 hover:bg-purple-100",
    "border-sky-300 bg-sky-50 hover:bg-sky-100",
    "border-orange-300 bg-orange-50 hover:bg-orange-100",
  ];
  const isPlaying = uiState === STATE.DRIVING || uiState === STATE.EXPLODE;
  const currentMode = SPEED_MODES[speedMode];

  return (
    <div className="w-full select-none flex flex-col gap-2">

      {/* ── Barre du haut : retour + infos + pause ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          to={`/${subject.toLowerCase()}`}
          className="flex items-center gap-0.5 bg-white border border-stone-200 text-stone-600 font-bold text-xs px-2 py-1.5 rounded-xl shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Retour
        </Link>

        {/* Mode vitesse actuel */}
        <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${currentMode.color}`}>
          {currentMode.label}
        </span>

        {/* Cœurs */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-4 h-4 drop-shadow ${i < lives ? "fill-red-400 text-red-400" : "text-stone-300"}`} />
          ))}
        </div>

        {/* Score */}
        <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded-full">
          ✅ {score}
        </span>

        {/* Km */}
        <div className="bg-black/80 text-green-300 font-bold text-xs px-2 py-1 rounded-full">
          🛣️ {km.toFixed(1)} km
        </div>
        {kmRecord > 0 && (
          <div className="bg-stone-800 text-yellow-300 font-bold text-xs px-2 py-1 rounded-full">
            🏆 {kmRecord}
          </div>
        )}

        {/* Pause */}
        {isPlaying && (
          <button onClick={togglePause} className="ml-auto bg-stone-200 rounded-full p-1.5 text-stone-700 shrink-0">
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* ── Canvas GRAND ÉCRAN (16:6 ratio = très large, peu haut) ── */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-duo-lg" style={{ aspectRatio: "16/6" }}>
        <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ touchAction: "none" }} />

        {/* Question banner en haut du canvas */}
        {isPlaying && current && (
          <div className="absolute top-2 left-3 right-3 z-10">
            <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-lg text-center border-b-2 border-pink-300">
              {current.chapter && <div className="text-[8px] font-bold uppercase tracking-widest text-pink-400 opacity-70">{current.chapter}</div>}
              <div className="font-fredoka text-sm md:text-base leading-snug">{current.question}</div>
            </div>
          </div>
        )}

        {/* Feedback overlays */}
        {feedback === "correct" && current && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500/90 backdrop-blur-sm text-white rounded-3xl px-6 py-4 text-center shadow-2xl">
              <div className="text-3xl mb-1">✅</div>
              <div className="font-display text-xl font-bold">Bonne voie !</div>
              {current.explanation && <div className="text-xs opacity-90 mt-1 max-w-[260px]">{current.explanation}</div>}
            </div>
          </div>
        )}
        {feedback === "wrong" && current && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600/90 backdrop-blur-sm text-white rounded-3xl px-6 py-4 text-center shadow-2xl">
              <div className="text-3xl mb-1">💥</div>
              <div className="font-display text-xl font-bold">Mauvais chemin !</div>
              <div className="text-xs mt-1 opacity-90">Réponse : <span className="font-bold">{current.options[current.correct_index]}</span></div>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {paused && (
          <div className="absolute inset-0 z-25 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-6 text-center shadow-2xl">
              <div className="text-4xl mb-2">⏸️</div>
              <h2 className="font-display text-2xl font-bold mb-2">Pause</h2>
              <DuoButton variant="primary" onClick={togglePause}>
                <Play className="w-4 h-4 inline mr-2" /> Reprendre
              </DuoButton>
            </div>
          </div>
        )}

        {/* Game Over */}
        {uiState === STATE.GAMEOVER && (
          <div className="absolute inset-0 z-30 bg-black/75 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-sm mx-4">
              <div className="text-5xl mb-2">💀</div>
              <h2 className="font-display text-2xl font-bold">Game Over !</h2>
              <p className="text-stone-600 mt-1">Score : <span className="text-pink-600 font-bold text-2xl">{score}</span></p>
              <div className="flex gap-2 mt-4 justify-center">
                <DuoButton variant="primary" onClick={restart}>
                  <RotateCcw className="w-4 h-4 inline mr-1" /> Rejouer
                </DuoButton>
                <DuoButton variant="ghost" onClick={() => { restart(); setGameStarted(false); }}>
                  Changer vitesse
                </DuoButton>
              </div>
            </div>
          </div>
        )}

        {/* Win */}
        {uiState === STATE.WIN && (
          <div className="absolute inset-0 z-30 bg-black/65 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-sm mx-4">
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="font-display text-2xl font-bold">Parcours terminé !</h2>
              <p className="text-stone-600 mt-1">Score : <span className="text-green-600 font-bold text-2xl">{score} / {questions.length}</span></p>
              <div className="flex gap-2 mt-4 justify-center">
                <DuoButton variant="primary" onClick={restart}>
                  <RotateCcw className="w-4 h-4 inline mr-1" /> Rejouer
                </DuoButton>
                <DuoButton variant="ghost" onClick={() => { restart(); setGameStarted(false); }}>
                  Changer vitesse
                </DuoButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Boutons de réponse — GRANDS, hors canvas ── */}
      {uiState === STATE.DRIVING && !paused && current && (
        <div className="grid grid-cols-3 gap-3">
          {current.options.slice(0, 3).map((opt, i) => {
            const letters = ["A", "B", "C"];
            const letterColors = ["text-purple-600 bg-purple-100", "text-sky-600 bg-sky-100", "text-orange-600 bg-orange-100"];
            return (
              <button
                key={i}
                onClick={() => chooseLane(i)}
                className={`rounded-2xl px-3 py-4 text-left transition-all shadow-sm hover:shadow-md active:scale-95 border-2 ${laneColors[i]}`}
              >
                <div className={`inline-block w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center mb-1.5 ${letterColors[i]}`}>
                  {letters[i]}
                </div>
                <div className="font-fredoka text-sm md:text-base text-stone-800 leading-snug">{opt}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}