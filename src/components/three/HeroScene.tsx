// "Coin Drift" — the three.js hero: a field of instanced metallic coins
// drifting around the mascot. Research-informed build (see design brief):
//   • one cylinder geometry, ~54 instances, 3 palette color groups
//   • fog EXACTLY matching the page bg so geometry melts into the page
//   • zero-network Environment built from Lightformers (metal needs env)
//   • damped pointer parallax (frame-rate independent), never raw binding
//   • staggered per-instance entrance, synced feel with the DOM reveal
//   • dpr capped, no shadows, no postprocessing — fake bloom via
//     toneMapped={false} + lifted colors on a few "hot" coins
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Instance, Instances, Lightformer, Sparkles } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

const BG = "#0B0A0F";
const PALETTE = ["#FF4D8D", "#B6FF3C", "#8E67FF"];
const COUNT = 54;

// deterministic rng so the field is identical every load
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CoinSeed {
  pos: [number, number, number];
  scale: number;
  phase: number;
  speed: number;
  tumble: [number, number];
  color: string;
}

function makeSeeds(): CoinSeed[] {
  const r = rng(0xc01f);
  return Array.from({ length: COUNT }, (_, i) => ({
    // keep the field forward of the deep-fog zone so coins stay lit & colorful
    pos: [(r() - 0.5) * 18, (r() - 0.5) * 9.5, -0.5 - r() * 7],
    scale: 0.2 + r() * 0.5,
    phase: r() * Math.PI * 2,
    speed: 0.25 + r() * 0.6,
    tumble: [(r() - 0.5) * 0.8, (r() - 0.5) * 0.8],
    color: PALETTE[i % PALETTE.length],
  }));
}

const damp = THREE.MathUtils.damp;

function CoinField({ animate }: { animate: boolean }) {
  const seeds = useMemo(makeSeeds, []);
  const group = useRef<THREE.Group>(null);
  const refs = useRef<(THREE.Object3D | null)[]>([]);
  const born = useRef(-1);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (born.current < 0) born.current = t;
    const age = t - born.current;

    // damped parallax on the whole field
    if (group.current) {
      group.current.rotation.y = damp(group.current.rotation.y, state.pointer.x * 0.12, 3, delta);
      group.current.rotation.x = damp(group.current.rotation.x, -state.pointer.y * 0.08, 3, delta);
    }

    if (!animate && age > 2.5) return; // reduced motion: settle after entrance

    seeds.forEach((s, i) => {
      const o = refs.current[i];
      if (!o) return;
      // staggered entrance: scale 0 → target with per-instance delay
      const enter = THREE.MathUtils.clamp((age - i * 0.035) * 1.6, 0, 1);
      const eased = 1 - Math.pow(1 - enter, 3);
      o.scale.setScalar(s.scale * eased);
      // gentle bob + tumble
      o.position.set(s.pos[0], s.pos[1] + Math.sin(t * s.speed + s.phase) * 0.45, s.pos[2]);
      o.rotation.x += delta * s.tumble[0];
      o.rotation.z += delta * s.tumble[1];
    });
  });

  return (
    <group ref={group}>
      <Instances limit={COUNT} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 0.14, 48]} />
        {/* metalness kept moderate so each coin's palette color reads under the
            colored lights — pure metal reflects only the near-black bg and goes
            black. A touch of emissive keeps them alive in shadow. */}
        <meshStandardMaterial
          metalness={0.7}
          roughness={0.22}
          emissive="#B15CFF"
          emissiveIntensity={0.4}
          envMapIntensity={2.2}
        />
        {seeds.map((s, i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => {
              refs.current[i] = el;
            }}
            color={s.color}
            scale={0}
            position={s.pos}
            rotation={[Math.PI / 2 + s.phase, 0, s.phase]}
          />
        ))}
      </Instances>

      {/* "hot" accent coins — fake bloom: unclamped color, no tone mapping */}
      {[
        [4.6, 1.6, -3.2, 0.32],
        [-5.2, -1.8, -4.5, 0.26],
        [1.8, -2.6, -2.8, 0.2],
      ].map(([x, y, z, sc], i) => (
        <mesh key={i} position={[x, y, z]} scale={sc} rotation={[Math.PI / 2.3, 0, i]}>
          <cylinderGeometry args={[1, 1, 0.14, 48]} />
          <meshBasicMaterial
            color={new THREE.Color(i === 1 ? "#B6FF3C" : "#FF4D8D").multiplyScalar(1.5)}
            toneMapped={false}
          />
        </mesh>
      ))}

      <Sparkles count={70} scale={[18, 9, 8]} size={2.2} speed={animate ? 0.35 : 0} color="#B6FF3C" opacity={0.5} />
    </group>
  );
}

function Rig() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 4, 6]} intensity={120} color="#FF4D8D" />
      <pointLight position={[-7, -3, -1]} intensity={90} color="#B6FF3C" />
      <pointLight position={[0, 5, -4]} intensity={70} color="#8E67FF" />
      <pointLight position={[0, 0, 8]} intensity={40} color="#FFE3F0" />
      {/* zero-network environment: bright colored lightformers so the metal
          reflects vivid brand color instead of the black page. */}
      <Environment resolution={128} background={false}>
        <color attach="background" args={["#2a2140"]} />
        <Lightformer intensity={12} color="#FF4D8D" position={[5, 3, 4]} scale={[12, 7, 1]} />
        <Lightformer intensity={10} color="#B6FF3C" position={[-6, -2, -1]} scale={[11, 6, 1]} />
        <Lightformer intensity={9} color="#8E67FF" position={[0, 6, -2]} scale={[14, 6, 1]} />
        <Lightformer intensity={7} color="#FFFFFF" position={[0, -5, 5]} scale={[8, 4, 1]} />
      </Environment>
    </>
  );
}

/** Full-bleed hero canvas. Mount inside a relatively-positioned section. */
export default function HeroScene() {
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onMq);

    // stop rendering entirely when the hero scrolls out of view
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.02 });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      mq.removeEventListener?.("change", onMq);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 11], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible ? "always" : "never"}
        performance={{ min: 0.5 }}
        style={{ pointerEvents: "none" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <fog attach="fog" args={[BG, 9, 20]} />
        <Rig />
        <CoinField animate={!reduced} />
      </Canvas>
    </div>
  );
}
