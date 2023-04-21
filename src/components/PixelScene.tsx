import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  useTexture,
  OrbitControls,
  OrthographicCamera,
  Effects,
} from "@react-three/drei";
import { RenderPixelatedPass } from "three-stdlib";
// import MainLoop from "mainloop.js";

extend({ RenderPixelatedPass });

// MainLoop

const DEG45 = Math.PI / 4;
const DEG90 = Math.PI / 2;
const ASPECTRATIO = window.innerWidth / window.innerHeight;

const Boxes = (props: THREE.Texture) => {
  const sideLength = 0.4;
  const { pixelTexture } = props;

  return (
    <>
      <mesh
        position={[0, sideLength / 2 + 0.0001, 0]}
        rotation={[0, DEG45, 0]}
        castShadow={true}
        receiveShadow={true}
      >
        <boxGeometry args={[sideLength, sideLength, sideLength]} />
        <meshPhongMaterial map={pixelTexture} />
      </mesh>
      <mesh
        position={[-0.5, sideLength / 2 + 0.05, -0.5]}
        rotation={[0, DEG45, 0]}
        castShadow={true}
        receiveShadow={true}
      >
        <boxGeometry
          args={[sideLength + 0.1, sideLength + 0.1, sideLength + 0.1]}
        />
        <meshPhongMaterial map={pixelTexture} />
      </mesh>
    </>
  );
};

const Crystal = () => {
  const isohedronRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    isohedronRef.current.material.emissiveIntensity =
      Math.sin(t * 3) * 0.5 + 0.5;
    isohedronRef.current.position.y = 0.7 + Math.sin(t * 2) * 0.05;
    isohedronRef.current.rotation.y = stopGoEased(t, 2, 4) * 2 * Math.PI;
  });

  const easeInOutCubic = (x: number) => {
    return x ** 2 * 3 - x ** 3 * 2;
  };
  const linearStep = (x: number, edge0: number, edge1: number) => {
    const w = edge1 - edge0;
    const m = 1 / w;
    const y0 = -m * edge0;
    return THREE.MathUtils.clamp(y0 + m * x, 0, 1);
  };

  const stopGoEased = (x: number, downtime: number, period: number) => {
    const cycle = (x / period) | 0;
    const tween = x - cycle * period;
    const linStep = easeInOutCubic(linearStep(tween, downtime, period));
    return cycle + linStep;
  };
  return (
    <mesh
      position={[0, 1, 0]}
      receiveShadow={true}
      castShadow={true}
      ref={isohedronRef}
    >
      <icosahedronGeometry args={[0.2]} />
      <meshPhongMaterial
        // color="#2379cf"
        color="#00ffcf"
        emissive="#143542"
        shininess={10}
        specular="#ffffff"
      />
    </mesh>
  );
};

const Floor = (props: THREE.Texture) => {
  const { pixelTexture } = props;

  return (
    <mesh rotation={[-DEG90, 0, 0]} position={[0, 0, 0]} receiveShadow={true}>
      <planeGeometry args={[2, 2]} />
      <meshPhongMaterial map={pixelTexture} />
    </mesh>
  );
};

function Scene() {
  const { size, scene, camera } = useThree();
  const resolution = useMemo(
    () => new THREE.Vector2(size.width, size.height),
    [size]
  );

  const [boxPixelTexture, floorPixelTexture] = useTexture(
    ["/checker.png", "/checker.png"],
    ([texture, texture2]) => {
      texture.minFilter = texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat = new THREE.Vector2(1.5, 1.5);

      texture2.minFilter = texture2.magFilter = THREE.NearestFilter;
      texture2.generateMipmaps = false;
      texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
      texture2.repeat = new THREE.Vector2(3, 3);
    }
  );

  return (
    <>
      <Boxes pixelTexture={boxPixelTexture} />
      <Floor pixelTexture={floorPixelTexture} />
      <Crystal />

      <Effects>
        <renderPixelatedPass args={[resolution, 6, scene, camera]} />
      </Effects>
    </>
  );
}

export default function App() {
  return (
    <Canvas shadows gl={{ antialias: false }}>
      <color attach="background" args={["#151729"]} />
      <ambientLight color={"#2d3645"} intensity={1.5} />
      <directionalLight
        color={"#fffc9c"}
        intensity={0.5}
        position={[100, 100, 100]}
        castShadow
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <spotLight
        args={["#ff8800", 1, 10, Math.PI / 16, 0.02, 2]}
        position={[2, 2, 0]}
        castShadow
      />
      <pointLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, 10, -5]} intensity={0.5} />
      <Scene />
      <OrbitControls />
      <OrthographicCamera
        makeDefault
        left={-ASPECTRATIO}
        right={ASPECTRATIO}
        top={1}
        bottom={-1}
        near={0.1}
        far={10}
        zoom={420}
        position={[0, 2 * Math.tan(Math.PI / 6), 2]}
      ></OrthographicCamera>
    </Canvas>
  );
}
