import React, { useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Heart, RotateCcw } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import * as THREE from "three";

// ─── Game constants ───────────────────────────────────────────────────────────
const ROAD_W = 9;
const TILE_LEN = 30;          // length of each road tile
const NUM_TILES = 5;          // tiles in the pool
const LANE_SPREAD = 3.2;
const CAR_SPEED = 0.22;
const SPLIT_TRIGGER_DIST = 50; // world-units ahead of car to place split
const SPLIT_LANE_LEN = 40;

const STATE = {
  DRIVING: "driving",
  SPLIT: "split",
  CORRECT: "correct",
  EXPLODE: "explode",
  GAMEOVER: "gameover",
  WIN: "win",
};

// ─── Geometry builders ────────────────────────────────────────────────────────

function makeTile() {
  const g = new THREE.Group();
  // Asphalt surface
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_W, TILE_LEN),
    new THREE.MeshLambertMaterial({ color: 0x3a3a4a })
  );
  road.rotation.x = -Math.PI / 2;
  g.add(road);

  // Center dashes
  for (let dz = -2; dz > -TILE_LEN; dz -= 6) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 2.8),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.01, dz);
    g.add(dash);
  }

  // Yellow edges
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

function makeSplitSection(options) {
  const g = new THREE.Group();
  const lanePositions = [-LANE_SPREAD, 0, LANE_SPREAD];
  const laneColors = [0xb845f5, 0x2dd4f0, 0xf59e0b];

  lanePositions.forEach((x, i) => {
    // Lane ground
    const lane = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_W / 3 - 0.3, SPLIT_LANE_LEN),
      new THREE.MeshLambertMaterial({ color: laneColors[i] })
    );
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(x, 0.01, -SPLIT_LANE_LEN / 2);
    g.add(lane);

    // Separator walls
    if (i < 2) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.6, SPLIT_LANE_LEN),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      wall.position.set(x + LANE_SPREAD / 2, 0.3, -SPLIT_LANE_LEN / 2);
      g.add(wall);
    }

    // Sign board
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.roundRect(8, 8, 496, 240, 22); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const text = options[i] || "";
    // Word wrap
    const words = text.split(" ");
    const lines = [];
    let line = "";
    words.forEach((w) => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > 470) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    const totalH = lines.length * 44;
    const startY = 128 - totalH / 2 + 22;
    lines.forEach((l, li) => ctx.fillText(l, 256, startY + li * 44));

    const tex = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.4),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    sign.position.set(x, 1.6, -6);
    g.add(sign);

    // Post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8),
      new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
    );
    post.position.set(x, 0.8, -6);
    g.add(post);
  });

  g.visible = false;
  return g;
}

function makeCar() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 2.1), bodyMat);
  body.position.y = 0.38;
  g.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.38, 1.1), new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
  roof.position.set(0, 0.82, -0.08);
  g.add(roof);

  // Windshield (dark)
  const wind = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.3), new THREE.MeshLambertMaterial({ color: 0x7dd3fc, side: THREE.DoubleSide }));
  wind.rotation.y = Math.PI;
  wind.position.set(0, 0.9, 0.48);
  g.add(wind);

  // Wheels (indices 3-6 in children)
  [[0.58, 0.18, 0.65], [-0.58, 0.18, 0.65], [0.58, 0.18, -0.65], [-0.58, 0.18, -0.65]].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 14), darkMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    g.add(w);
  });

  // Headlights
  [[0.32, 0.42, 1.06], [-0.32, 0.42, 1.06]].forEach(([x, y, z]) => {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    h.position.set(x, y, z);
    g.add(h);
  });

  return g;
}

function makeTree(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.2, 1.4, 6),
    new THREE.MeshLambertMaterial({ color: 0x78350f })
  );
  trunk.position.set(x, 0.7, z);
  const top = new THREE.Mesh(
    new THREE.ConeGeometry(1.0, 2.6, 7),
    new THREE.MeshLambertMaterial({ color: 0x15803d })
  );
  top.position.set(x, 2.6, z);
  g.add(trunk, top);
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
    p.userData.v = new THREE.Vector3(
      (Math.random() - 0.5) * 0.35,
      Math.random() * 0.4 + 0.1,
      (Math.random() - 0.5) * 0.35
    );
    scene.add(p);
    pts.push(p);
  }
  return pts;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GameQCM({ subject }) {
  const mountRef = useRef(null);
  const animRef = useRef(null);

  // Three.js objects kept outside React state
  const sceneRef = useRef(null);
  const camRef = useRef(null);
  const rendererRef = useRef(null);
  const carRef = useRef(null);
  const tilesRef = useRef([]);      // road tile pool
  const splitRef = useRef(null);    // current split section mesh
  const treeGroupsRef = useRef([]); // tree groups pool
  const particlesRef = useRef([]);

  // Game state as refs (read inside animation loop)
  const stateRef = useRef(STATE.DRIVING);
  const carZRef = useRef(0);        // absolute Z of car (grows negative = forward)
  const carXRef = useRef(0);
  const targetXRef = useRef(0);
  const splitPlacedRef = useRef(false);
  const splitZRef = useRef(0);     // world Z where split section starts

  const idxRef = useRef(0);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const questionsRef = useRef([]);

  // React UI state
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState(STATE.DRIVING);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

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

  // ── Init Three.js scene ──
  useEffect(() => {
    if (loading || questions.length === 0 || !mountRef.current) return;

    const W = mountRef.current.clientWidth || 400;
    const H = mountRef.current.clientHeight || 500;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = false;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.018);
    sceneRef.current = scene;

    // Camera — slightly behind and above car
    const camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 300);
    camRef.current = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.1);
    sun.position.set(8, 20, 10);
    scene.add(sun);

    // Infinite green ground — very large plane, moves with car
    const gnd = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshLambertMaterial({ color: 0x4ade80 })
    );
    gnd.rotation.x = -Math.PI / 2;
    gnd.position.y = -0.01;
    gnd.name = "ground";
    scene.add(gnd);

    // ── Road tile pool (recycled) ──
    // Place NUM_TILES tiles stretching ahead of z=0
    const tiles = [];
    for (let i = 0; i < NUM_TILES; i++) {
      const tile = makeTile();
      tile.position.z = -i * TILE_LEN - TILE_LEN / 2;
      scene.add(tile);
      tiles.push(tile);
    }
    tilesRef.current = tiles;

    // ── Tree pool — two rows of trees, recycled ──
    const treeGroups = [];
    for (let i = 0; i < 16; i++) {
      const side = i % 2 === 0 ? -7.5 : 7.5;
      const zOffset = Math.floor(i / 2) * 10;
      const tg = makeTree(side, 0);
      tg.position.z = -zOffset;
      scene.add(tg);
      treeGroups.push({ mesh: tg, side, relZ: -zOffset });
    }
    treeGroupsRef.current = treeGroups;

    // ── Car ──
    const car = makeCar();
    car.position.set(0, 0, 0);
    scene.add(car);
    carRef.current = car;

    carZRef.current = 0;
    carXRef.current = 0;
    targetXRef.current = 0;
    splitPlacedRef.current = false;
    splitZRef.current = -SPLIT_TRIGGER_DIST;

    // ── First split section ──
    const q0 = questionsRef.current[0];
    const split0 = makeSplitSection(q0.options.slice(0, 3));
    split0.position.z = splitZRef.current;
    scene.add(split0);
    splitRef.current = split0;

    // ── Animation loop ──
    let wheelAngle = 0;

    function animate() {
      animRef.current = requestAnimationFrame(animate);

      const state = stateRef.current;
      const car = carRef.current;
      const carZ = carZRef.current;

      // ── Move car forward ──
      if (state === STATE.DRIVING || state === STATE.CORRECT) {
        const speed = state === STATE.CORRECT ? CAR_SPEED * 1.6 : CAR_SPEED;
        carZRef.current -= speed;
        car.position.z = carZRef.current;
        car.position.x += (0 - car.position.x) * 0.05; // re-center after split
        carXRef.current = car.position.x;
        wheelAngle += speed * 0.55;
      }

      if (state === STATE.SPLIT) {
        carZRef.current -= CAR_SPEED * 0.7;
        carXRef.current += (targetXRef.current - carXRef.current) * 0.055;
        car.position.z = carZRef.current;
        car.position.x = carXRef.current;
        wheelAngle += CAR_SPEED * 0.4;
      }

      // Wheel spin
      [3, 4, 5, 6].forEach((ci) => {
        if (car.children[ci]) car.children[ci].rotation.x = wheelAngle;
      });

      // ── Recycle road tiles ──
      const cz = carZRef.current;
      tilesRef.current.forEach((tile) => {
        // If tile is more than TILE_LEN behind the car, move it to the front
        if (tile.position.z - TILE_LEN / 2 > cz + TILE_LEN) {
          // Find the furthest tile ahead and place this one beyond it
          let minZ = Infinity;
          tilesRef.current.forEach((t) => { if (t.position.z < minZ) minZ = t.position.z; });
          tile.position.z = minZ - TILE_LEN;
        }
      });

      // ── Recycle trees ──
      treeGroupsRef.current.forEach((tg) => {
        if (tg.mesh.position.z > cz + 12) {
          tg.mesh.position.z -= 16 * 10;
        }
      });

      // ── Move ground with car ──
      const gnd = scene.getObjectByName("ground");
      if (gnd) { gnd.position.z = cz; }

      // ── Show split section when car is close ──
      const split = splitRef.current;
      if (split && !split.visible && cz < splitZRef.current + 25) {
        split.visible = true;
      }

      // ── Explosion particles ──
      if (state === STATE.EXPLODE) {
        particlesRef.current.forEach((p) => {
          p.position.add(p.userData.v);
          p.userData.v.y -= 0.013;
          p.scale.multiplyScalar(0.96);
        });
      }

      // ── Camera ──
      const camTargetX = carXRef.current * 0.25;
      const camX = camera.position.x + (camTargetX - camera.position.x) * 0.08;
      camera.position.set(camX, 3.6, carZRef.current + 6.5);
      camera.lookAt(carXRef.current * 0.4, 0.8, carZRef.current - 12);

      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [loading, questions.length]);

  // ── Show split after 2.8s driving ──
  useEffect(() => {
    if (uiState !== STATE.DRIVING || questions.length === 0) return;
    const t = setTimeout(() => {
      stateRef.current = STATE.SPLIT;
      setUiState(STATE.SPLIT);
    }, 2800);
    return () => clearTimeout(t);
  }, [uiState, idx, questions.length]);

  // ── Choose a lane ──
  const chooseLane = useCallback((laneIdx) => {
    if (stateRef.current !== STATE.SPLIT) return;
    const xPositions = [-LANE_SPREAD, 0, LANE_SPREAD];
    targetXRef.current = xPositions[laneIdx];

    const q = questionsRef.current[idxRef.current];
    const correct = laneIdx === q.correct_index;

    setTimeout(() => {
      if (correct) {
        stateRef.current = STATE.CORRECT;
        setUiState(STATE.CORRECT);
        scoreRef.current += 1;
        setScore(scoreRef.current);

        setTimeout(() => {
          const nextIdx = idxRef.current + 1;
          if (nextIdx >= questionsRef.current.length) {
            stateRef.current = STATE.WIN;
            setUiState(STATE.WIN);
            return;
          }

          idxRef.current = nextIdx;
          setIdx(nextIdx);

          // ── Place new split far ahead, seamlessly ──
          const scene = sceneRef.current;
          if (scene && splitRef.current) {
            scene.remove(splitRef.current);
          }
          const newQ = questionsRef.current[nextIdx];
          const newSplitZ = carZRef.current - SPLIT_TRIGGER_DIST;
          splitZRef.current = newSplitZ;
          const newSplit = makeSplitSection(newQ.options.slice(0, 3));
          newSplit.position.z = newSplitZ;
          scene.add(newSplit);
          splitRef.current = newSplit;

          targetXRef.current = 0;
          stateRef.current = STATE.DRIVING;
          setUiState(STATE.DRIVING);
        }, 1600);
      } else {
        // Wrong lane → explosion
        stateRef.current = STATE.EXPLODE;
        setUiState(STATE.EXPLODE);

        const car = carRef.current;
        if (car && sceneRef.current) {
          particlesRef.current = makeExplosion(sceneRef.current, car.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
          car.visible = false;
        }

        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);

        setTimeout(() => {
          if (newLives <= 0) {
            stateRef.current = STATE.GAMEOVER;
            setUiState(STATE.GAMEOVER);
            return;
          }

          // Cleanup particles, respawn
          particlesRef.current.forEach((p) => sceneRef.current?.remove(p));
          particlesRef.current = [];
          if (carRef.current) { carRef.current.visible = true; }

          // Rebuild split at same question, placed ahead
          const scene = sceneRef.current;
          if (scene && splitRef.current) scene.remove(splitRef.current);
          const q2 = questionsRef.current[idxRef.current];
          const newSplitZ = carZRef.current - SPLIT_TRIGGER_DIST;
          splitZRef.current = newSplitZ;
          const newSplit = makeSplitSection(q2.options.slice(0, 3));
          newSplit.position.z = newSplitZ;
          scene.add(newSplit);
          splitRef.current = newSplit;

          targetXRef.current = 0;
          stateRef.current = STATE.DRIVING;
          setUiState(STATE.DRIVING);
        }, 2200);
      }
    }, 350);
  }, []);

  const restart = useCallback(() => {
    particlesRef.current.forEach((p) => sceneRef.current?.remove(p));
    particlesRef.current = [];
    if (carRef.current) { carRef.current.visible = true; }

    const shuffled = [...questionsRef.current].sort(() => Math.random() - 0.5);
    questionsRef.current = shuffled;

    idxRef.current = 0;
    livesRef.current = 3;
    scoreRef.current = 0;

    // Reset car position to current carZ (it's already somewhere, just re-center X)
    targetXRef.current = 0;

    // New split far ahead
    const scene = sceneRef.current;
    if (scene && splitRef.current) scene.remove(splitRef.current);
    const q = shuffled[0];
    const newSplitZ = carZRef.current - SPLIT_TRIGGER_DIST;
    splitZRef.current = newSplitZ;
    const newSplit = makeSplitSection(q.options.slice(0, 3));
    newSplit.position.z = newSplitZ;
    scene.add(newSplit);
    splitRef.current = newSplit;

    setIdx(0); setLives(3); setScore(0); setQuestions(shuffled);
    stateRef.current = STATE.DRIVING;
    setUiState(STATE.DRIVING);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500 p-10">
        <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
      </div>
    );
  }
  if (questions.length === 0) {
    return <div className="bg-white rounded-2xl p-8 text-center text-stone-600">Pas encore de questions en mode jeu.</div>;
  }

  const current = questions[idx];
  const laneLabels = ["◀ Gauche", "▲ Centre", "Droite ▶"];
  const laneColors = ["from-fuchsia-500 to-purple-700", "from-sky-400 to-blue-600", "from-amber-400 to-orange-500"];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-duo-lg select-none"
      style={{ height: "min(600px, 82vh)" }}
    >
      {/* Three.js mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* HUD top */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-1 bg-gradient-to-b from-black/30 to-transparent">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 drop-shadow ${i < lives ? "fill-red-400 text-red-400" : "text-white/30"}`} />
          ))}
        </div>
        <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 text-sm font-bold text-yellow-300">
          🏆 {score} pts
        </div>
      </div>

      {/* Question banner */}
      {(uiState === STATE.DRIVING || uiState === STATE.SPLIT || uiState === STATE.CORRECT) && current && (
        <div className="absolute top-12 left-3 right-3 z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg text-center border-b-4 border-pink-300">
            {current.chapter && (
              <div className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-0.5">{current.chapter}</div>
            )}
            <div className="font-display font-bold text-base leading-snug">{current.question}</div>
          </div>
        </div>
      )}

      {/* Driving hint */}
      {uiState === STATE.DRIVING && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
          <div className="bg-black/55 backdrop-blur text-white text-xs px-5 py-2 rounded-full font-bold animate-pulse">
            🚗 La route va se diviser… choisis la bonne voie !
          </div>
        </div>
      )}

      {/* Lane buttons */}
      {uiState === STATE.SPLIT && (
        <div className="absolute bottom-4 left-2 right-2 z-10 grid grid-cols-3 gap-2">
          {current.options.slice(0, 3).map((opt, i) => (
            <button
              key={i}
              onClick={() => chooseLane(i)}
              className={`bg-gradient-to-b ${laneColors[i]} text-white rounded-2xl px-2 py-3 font-bold text-xs shadow-lg border-b-4 border-black/25 active:border-b-0 active:translate-y-1 transition-all text-center leading-tight`}
            >
              <div className="text-[9px] uppercase tracking-wider opacity-80 mb-0.5">{laneLabels[i]}</div>
              <div className="line-clamp-3 text-[11px]">{opt}</div>
            </button>
          ))}
        </div>
      )}

      {/* Correct flash */}
      {uiState === STATE.CORRECT && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500/90 backdrop-blur-sm text-white rounded-3xl px-8 py-5 text-center shadow-2xl">
            <div className="text-4xl mb-1">✅</div>
            <div className="font-display text-2xl font-bold">Bonne voie !</div>
            {current.explanation && <div className="text-sm opacity-90 mt-1 max-w-[280px]">{current.explanation}</div>}
          </div>
        </div>
      )}

      {/* Explosion flash */}
      {uiState === STATE.EXPLODE && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-red-600/90 backdrop-blur-sm text-white rounded-3xl px-8 py-5 text-center shadow-2xl">
            <div className="text-4xl mb-1">💥</div>
            <div className="font-display text-2xl font-bold">Mauvais chemin !</div>
            <div className="text-sm mt-1 opacity-90">
              Réponse : <span className="font-bold">{current.options[current.correct_index]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {uiState === STATE.GAMEOVER && (
        <div className="absolute inset-0 z-30 bg-black/75 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <div className="text-6xl mb-3">💀</div>
            <h2 className="font-display text-3xl font-bold">Game Over !</h2>
            <p className="text-stone-600 mt-2">Score : <span className="text-pink-600 font-bold text-2xl">{score}</span></p>
            <DuoButton variant="primary" className="mt-5" onClick={restart}>
              <RotateCcw className="w-4 h-4 inline mr-2" /> Rejouer
            </DuoButton>
          </div>
        </div>
      )}

      {/* Win */}
      {uiState === STATE.WIN && (
        <div className="absolute inset-0 z-30 bg-black/65 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="font-display text-3xl font-bold">Parcours terminé !</h2>
            <p className="text-stone-600 mt-2">Score : <span className="text-green-600 font-bold text-2xl">{score} / {questions.length}</span></p>
            <DuoButton variant="primary" className="mt-5" onClick={restart}>
              <RotateCcw className="w-4 h-4 inline mr-2" /> Rejouer
            </DuoButton>
          </div>
        </div>
      )}
    </div>
  );
}