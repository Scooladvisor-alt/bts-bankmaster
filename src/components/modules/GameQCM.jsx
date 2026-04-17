import React, { useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Heart, RotateCcw } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import * as THREE from "three";

// ─── constants ────────────────────────────────────────────────────────────────
const ROAD_LENGTH = 80;
const ROAD_WIDTH = 9;
const SPLIT_Z = -28;      // Z where road splits
const LANE_SPREAD = 3.4;  // horizontal spread of lanes
const CAR_SPEED_NORMAL = 0.18;
const CAR_SPEED_SPLIT = 0.12;

// States
const STATE = { DRIVING: "driving", SPLIT: "split", CORRECT: "correct", EXPLODE: "explode", GAMEOVER: "gameover", WIN: "win" };

// ─── helpers ──────────────────────────────────────────────────────────────────
function buildRoad(scene) {
  const group = new THREE.Group();
  // Asphalt
  const geo = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH);
  const mat = new THREE.MeshLambertMaterial({ color: 0x444455 });
  const road = new THREE.Mesh(geo, mat);
  road.rotation.x = -Math.PI / 2;
  road.position.z = -ROAD_LENGTH / 2;
  group.add(road);

  // White dashes
  for (let z = -2; z > -ROAD_LENGTH; z -= 5) {
    const dGeo = new THREE.PlaneGeometry(0.18, 2.4);
    const dMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const dash = new THREE.Mesh(dGeo, dMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.01, z);
    group.add(dash);
  }

  // Side stripes
  [-ROAD_WIDTH / 2, ROAD_WIDTH / 2].forEach((x) => {
    const sGeo = new THREE.PlaneGeometry(0.25, ROAD_LENGTH);
    const sMat = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    const s = new THREE.Mesh(sGeo, sMat);
    s.rotation.x = -Math.PI / 2;
    s.position.set(x, 0.02, -ROAD_LENGTH / 2);
    group.add(s);
  });

  scene.add(group);
  return group;
}

function buildSplitRoads(scene, options) {
  const group = new THREE.Group();
  const positions = [-LANE_SPREAD, 0, LANE_SPREAD];
  const colors = [0xe879f9, 0x38bdf8, 0xfbbf24];
  const textCanvases = [];

  positions.forEach((x, i) => {
    // Lane surface
    const lGeo = new THREE.PlaneGeometry(ROAD_WIDTH / 3 - 0.2, 30);
    const lMat = new THREE.MeshLambertMaterial({ color: colors[i] });
    const lane = new THREE.Mesh(lGeo, lMat);
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(x, 0.005, SPLIT_Z - 14);
    group.add(lane);

    // Text sign
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 236, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const words = (options[i] || "").match(/.{1,22}/g) || [""];
    words.slice(0, 4).forEach((w, wi) => {
      ctx.fillText(w, 256, 100 + wi * 38);
    });

    const tex = new THREE.CanvasTexture(canvas);
    textCanvases.push(tex);
    const sGeo = new THREE.PlaneGeometry(2.6, 1.3);
    const sMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const sign = new THREE.Mesh(sGeo, sMat);
    sign.position.set(x, 1.5, SPLIT_Z - 8);
    group.add(sign);

    // Post
    const pGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.5);
    const pMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const post = new THREE.Mesh(pGeo, pMat);
    post.position.set(x, 0.75, SPLIT_Z - 8);
    group.add(post);
  });

  group.visible = false;
  scene.add(group);
  return { group, textCanvases };
}

function buildCar(scene) {
  const group = new THREE.Group();
  // Body
  const bodyGeo = new THREE.BoxGeometry(0.9, 0.45, 1.9);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.35;
  group.add(body);

  // Roof
  const roofGeo = new THREE.BoxGeometry(0.72, 0.35, 1.0);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 0.73, -0.1);
  group.add(roof);

  // Wheels
  [[0.55, 0.18, 0.6], [-0.55, 0.18, 0.6], [0.55, 0.18, -0.6], [-0.55, 0.18, -0.6]].forEach(([x, y, z]) => {
    const wGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12);
    const wMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const w = new THREE.Mesh(wGeo, wMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    group.add(w);
  });

  // Headlights
  [[0.3, 0.38, 0.97], [-0.3, 0.38, 0.97]].forEach(([x, y, z]) => {
    const hGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const hMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    const h = new THREE.Mesh(hGeo, hMat);
    h.position.set(x, y, z);
    group.add(h);
  });

  group.position.set(0, 0, 0);
  scene.add(group);
  return group;
}

function buildTrees(scene) {
  const group = new THREE.Group();
  for (let z = -5; z > -ROAD_LENGTH; z -= 7) {
    [-7, 7].forEach((x) => {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6),
        new THREE.MeshLambertMaterial({ color: 0x78350f })
      );
      trunk.position.set(x, 0.6, z);
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 2.2, 7),
        new THREE.MeshLambertMaterial({ color: 0x16a34a })
      );
      top.position.set(x, 2.3, z);
      group.add(trunk, top);
    });
  }
  scene.add(group);
  return group;
}

function buildExplosionParticles(scene, pos) {
  const particles = [];
  for (let i = 0; i < 30; i++) {
    const geo = new THREE.SphereGeometry(Math.random() * 0.22 + 0.06, 5, 5);
    const col = [0xff4500, 0xff8c00, 0xffd700, 0xff6347][Math.floor(Math.random() * 4)];
    const mat = new THREE.MeshBasicMaterial({ color: col });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(pos);
    p.userData.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.35 + 0.1,
      (Math.random() - 0.5) * 0.3
    );
    scene.add(p);
    particles.push(p);
  }
  return particles;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GameQCM({ subject }) {
  const mountRef = useRef(null);
  const stateRef = useRef(STATE.DRIVING);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const carRef = useRef(null);
  const splitRef = useRef(null);
  const roadRef = useRef(null);
  const treesRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const carZRef = useRef(0);
  const carXRef = useRef(0);
  const targetXRef = useRef(0);
  const splitVisibleRef = useRef(false);
  const correctLaneRef = useRef(0);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState(STATE.DRIVING);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  // Sync refs for animation loop
  const idxRef = useRef(0);
  const livesRef = useRef(3);
  const questionsRef = useRef([]);
  const scoreRef = useRef(0);

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

  // ── Build 3D scene ──
  useEffect(() => {
    if (loading || questions.length === 0 || !mountRef.current) return;

    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x87ceeb);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87ceeb, 20, 70);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3.5, 6);
    camera.lookAt(0, 0, -10);
    cameraRef.current = camera;

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshLambertMaterial({ color: 0x4ade80 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -ROAD_LENGTH / 2;
    scene.add(ground);

    // Sky gradient via background color — simple
    scene.background = new THREE.Color(0x87ceeb);

    // Road
    roadRef.current = buildRoad(scene);
    treesRef.current = buildTrees(scene);

    // Car
    carRef.current = buildCar(scene);
    carZRef.current = 0;
    carXRef.current = 0;
    targetXRef.current = 0;

    // Split roads (hidden initially)
    const q = questionsRef.current[0];
    const { group, textCanvases } = buildSplitRoads(scene, q ? q.options.slice(0, 3) : ["A", "B", "C"]);
    splitRef.current = { group, textCanvases };

    // Animation loop
    let t = 0;
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.016;

      const state = stateRef.current;
      const car = carRef.current;
      const road = roadRef.current;
      const trees = treesRef.current;

      if (state === STATE.DRIVING) {
        carZRef.current -= CAR_SPEED_NORMAL;
        car.position.z = carZRef.current;
        car.position.x = 0;
        // Wheel spin
        car.children.forEach((c, ci) => { if (ci >= 2 && ci <= 5) c.rotation.x += 0.1; });

        // Scroll road & trees
        road.position.z = ((carZRef.current % ROAD_LENGTH) + ROAD_LENGTH) % ROAD_LENGTH - ROAD_LENGTH / 2;
        trees.position.z = road.position.z;

        // Camera follow
        camera.position.set(0, 3.5, carZRef.current + 6);
        camera.lookAt(0, 1, carZRef.current - 10);

        // Show split when close
        if (carZRef.current < -18 && !splitVisibleRef.current) {
          splitVisibleRef.current = true;
          splitRef.current.group.visible = true;
          splitRef.current.group.position.z = carZRef.current - 10;
        }
      }

      if (state === STATE.SPLIT) {
        carZRef.current -= CAR_SPEED_SPLIT;
        // Lerp X toward target
        carXRef.current += (targetXRef.current - carXRef.current) * 0.07;
        car.position.z = carZRef.current;
        car.position.x = carXRef.current;
        car.children.forEach((c, ci) => { if (ci >= 2 && ci <= 5) c.rotation.x += 0.07; });
        camera.position.set(carXRef.current * 0.3, 3.5, carZRef.current + 6);
        camera.lookAt(carXRef.current * 0.5, 1, carZRef.current - 10);
      }

      if (state === STATE.EXPLODE) {
        particlesRef.current.forEach((p) => {
          p.position.add(p.userData.vel);
          p.userData.vel.y -= 0.012;
          p.scale.multiplyScalar(0.97);
        });
      }

      if (state === STATE.CORRECT) {
        // Brief drive forward animation
        carZRef.current -= CAR_SPEED_NORMAL * 1.5;
        car.position.z = carZRef.current;
        camera.position.set(carXRef.current * 0.3, 3.5, carZRef.current + 6);
        camera.lookAt(carXRef.current * 0.5, 1, carZRef.current - 10);
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize
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
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [loading, questions.length]);

  // ── Transition to split state ──
  const triggerSplit = useCallback(() => {
    stateRef.current = STATE.SPLIT;
    setUiState(STATE.SPLIT);
  }, []);

  // Auto-trigger split after 2.5s of driving
  useEffect(() => {
    if (uiState === STATE.DRIVING && questions.length > 0) {
      const t = setTimeout(triggerSplit, 2500);
      return () => clearTimeout(t);
    }
  }, [uiState, idx, questions.length, triggerSplit]);

  // ── Handle lane choice ──
  const chooseLane = useCallback((laneIdx) => {
    if (stateRef.current !== STATE.SPLIT) return;
    const positions = [-LANE_SPREAD, 0, LANE_SPREAD];
    targetXRef.current = positions[laneIdx];

    const q = questionsRef.current[idxRef.current];
    const isCorrect = laneIdx === q.correct_index;

    setTimeout(() => {
      if (isCorrect) {
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

          // Reset split road
          const newQ = questionsRef.current[nextIdx];
          const scene = sceneRef.current;
          if (scene && splitRef.current) {
            scene.remove(splitRef.current.group);
            const { group, textCanvases } = buildSplitRoads(scene, newQ.options.slice(0, 3));
            splitRef.current = { group, textCanvases };
          }
          splitVisibleRef.current = false;
          carXRef.current = 0;
          targetXRef.current = 0;
          stateRef.current = STATE.DRIVING;
          setUiState(STATE.DRIVING);
        }, 1400);
      } else {
        // Explosion
        stateRef.current = STATE.EXPLODE;
        setUiState(STATE.EXPLODE);
        const car = carRef.current;
        if (car && sceneRef.current) {
          particlesRef.current = buildExplosionParticles(sceneRef.current, car.position.clone());
          car.visible = false;
        }
        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);

        setTimeout(() => {
          if (newLives <= 0) {
            stateRef.current = STATE.GAMEOVER;
            setUiState(STATE.GAMEOVER);
          } else {
            // Cleanup particles
            particlesRef.current.forEach((p) => sceneRef.current.remove(p));
            particlesRef.current = [];
            if (carRef.current) carRef.current.visible = true;

            // Reset split road with same question
            const scene = sceneRef.current;
            const q2 = questionsRef.current[idxRef.current];
            if (scene && splitRef.current) {
              scene.remove(splitRef.current.group);
              const { group, textCanvases } = buildSplitRoads(scene, q2.options.slice(0, 3));
              splitRef.current = { group, textCanvases };
            }
            splitVisibleRef.current = false;
            carXRef.current = 0;
            targetXRef.current = 0;
            stateRef.current = STATE.DRIVING;
            setUiState(STATE.DRIVING);
          }
        }, 2000);
      }
    }, 400);
  }, []);

  const restart = useCallback(() => {
    // Cleanup particles
    particlesRef.current.forEach((p) => sceneRef.current?.remove(p));
    particlesRef.current = [];

    idxRef.current = 0;
    livesRef.current = 3;
    scoreRef.current = 0;
    carZRef.current = 0;
    carXRef.current = 0;
    targetXRef.current = 0;
    splitVisibleRef.current = false;

    const shuffled = [...questionsRef.current].sort(() => Math.random() - 0.5);
    questionsRef.current = shuffled;

    if (carRef.current) carRef.current.visible = true;
    if (carRef.current) { carRef.current.position.set(0, 0, 0); }

    // Rebuild split
    const q = shuffled[0];
    const scene = sceneRef.current;
    if (scene && splitRef.current) {
      scene.remove(splitRef.current.group);
      const { group, textCanvases } = buildSplitRoads(scene, q.options.slice(0, 3));
      splitRef.current = { group, textCanvases };
    }

    setIdx(0);
    setLives(3);
    setScore(0);
    setQuestions(shuffled);
    stateRef.current = STATE.DRIVING;
    setUiState(STATE.DRIVING);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500 p-10">
        <Loader2 className="w-5 h-5 animate-spin" /> Chargement des questions…
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="bg-white rounded-2xl p-8 text-center text-stone-600">Pas encore de questions en mode jeu.</div>;
  }

  const current = questions[idx];
  const laneLabels = ["Gauche", "Centre", "Droite"];
  const laneColors = ["from-fuchsia-500 to-purple-600", "from-sky-400 to-blue-600", "from-yellow-400 to-orange-500"];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-duo-lg" style={{ height: "min(600px, 80vh)" }}>
      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* HUD – top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? "fill-red-500 text-red-500 drop-shadow" : "text-stone-400"}`} />
          ))}
        </div>
        <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1 text-sm font-bold text-pink-600 shadow">
          🏆 {score} pts
        </div>
      </div>

      {/* Question banner */}
      {(uiState === STATE.DRIVING || uiState === STATE.SPLIT || uiState === STATE.CORRECT) && current && (
        <div className="absolute top-12 left-3 right-3 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg text-center border-b-4 border-pink-300">
            {current.chapter && (
              <div className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-0.5">{current.chapter}</div>
            )}
            <div className="font-display font-bold text-base leading-snug">{current.question}</div>
          </div>
        </div>
      )}

      {/* Correct feedback */}
      {uiState === STATE.CORRECT && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500/90 backdrop-blur text-white rounded-3xl px-8 py-5 text-center shadow-xl">
            <div className="text-4xl mb-1">✅</div>
            <div className="font-display text-2xl font-bold">Bonne route !</div>
            {current.explanation && <div className="text-sm opacity-90 mt-1 max-w-xs">{current.explanation}</div>}
          </div>
        </div>
      )}

      {/* Explosion feedback */}
      {uiState === STATE.EXPLODE && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-red-600/90 backdrop-blur text-white rounded-3xl px-8 py-5 text-center shadow-xl">
            <div className="text-4xl mb-1">💥</div>
            <div className="font-display text-2xl font-bold">Mauvais chemin !</div>
            <div className="text-sm mt-1 opacity-90">Bonne réponse : <span className="font-bold">{current.options[current.correct_index]}</span></div>
          </div>
        </div>
      )}

      {/* Lane choice buttons */}
      {uiState === STATE.SPLIT && (
        <div className="absolute bottom-4 left-3 right-3 z-10 grid grid-cols-3 gap-2">
          {current.options.slice(0, 3).map((opt, i) => (
            <button
              key={i}
              onClick={() => chooseLane(i)}
              className={`bg-gradient-to-b ${laneColors[i]} text-white rounded-2xl px-2 py-3 font-bold text-xs shadow-lg border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all text-center leading-tight`}
            >
              <div className="text-[10px] uppercase tracking-widest opacity-80 mb-0.5">{laneLabels[i]}</div>
              <div className="line-clamp-3">{opt}</div>
            </button>
          ))}
        </div>
      )}

      {/* Driving hint */}
      {uiState === STATE.DRIVING && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
          <div className="bg-black/50 backdrop-blur text-white text-xs px-4 py-2 rounded-full font-bold animate-pulse">
            🚗 La route se divise… choisis la bonne réponse !
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {uiState === STATE.GAMEOVER && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <div className="text-6xl mb-3">💀</div>
            <h2 className="font-display text-3xl font-bold">Game Over !</h2>
            <p className="text-stone-600 mt-2">Score final : <span className="text-pink-600 font-bold text-2xl">{score}</span></p>
            <DuoButton variant="primary" className="mt-5" onClick={restart}>
              <RotateCcw className="w-4 h-4 inline mr-2" /> Rejouer
            </DuoButton>
          </div>
        </div>
      )}

      {/* Win overlay */}
      {uiState === STATE.WIN && (
        <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
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