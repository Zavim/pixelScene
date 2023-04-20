import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  StrictMode,
  useMemo,
  Suspense,
} from "react";
import {
  Canvas,
  extend,
  useThree,
  useFrame,
  useLoader,
  ThreeElements,
} from "@react-three/fiber";
import {
  useTexture,
  Effects,
  KeyboardControls,
  OrthographicCamera,
  OrbitControls,
  KeyboardControlsEntry,
  useKeyboardControls,
} from "@react-three/drei";
import * as THREE from "three";
import { Perf } from "r3f-perf";
// import * as RC from "render-composer";
import { useEntities } from "miniplex/react";
import { ECS, Box } from "../state";
import { RenderableEntity } from "./RenderableEntity";
// import { Physics, Debug, useBox, usePlane } from "@react-three/cannon";
import { Physics, RigidBody, Debug } from "@react-three/rapier";
import { RenderPixelatedPass } from "three-stdlib";
// import { RenderPixelatedPass } from "src/components/RenderPixelatedPass.js";

extend({ RenderPixelatedPass });

// THREE.ColorManagement.legacyMode = false;

const DEG45 = Math.PI / 4;
const DEG90 = Math.PI / 2;
const SQRT2 = Math.sqrt(2);

const aspectRatio = window.innerWidth / window.innerHeight;

enum Controls {
  up = "up",
  left = "left",
  down = "down",
  right = "right",
}

//REMEMBER TO TURN OFF STRICT MODE

const Boxes = () => {
  useLayoutEffect(() => {
    for (let i = 0; i < 5; i++) {
      let position = new THREE.Vector3(i, i, 2);
      spawnBoxes(position);
    }
  }, []);

  const entities = useEntities(ECS.world.with("isBox"));

  return <ECS.Entities in={entities} children={RenderableEntity} />;
};

const spawnBoxes = (position: THREE.Vector3) => {
  let entity = ECS.world.add({
    isBox: true,
    render: (
      <ECS.Component name="rigidBody">
        <RigidBody>
          <ECS.Component name="three">
            <mesh position={position} scale={1}>
              <boxGeometry />
              <meshStandardMaterial color="skyblue" />
            </mesh>
          </ECS.Component>
        </RigidBody>
      </ECS.Component>
    ),
  });
  return entity as Box;
};

const Floor = (props) => {
  const { pixelTexture } = props;

  return (
    // <RigidBody>
    //   <mesh rotation={[-DEG45, 0, 0]} position={[0, 0, 0]}>
    //     <planeGeometry args={[50, 50]} />
    //     {/* <meshPhongMaterial color="orange" /> */}
    //     <meshPhongMaterial color="#151729" />
    //   </mesh>
    // </RigidBody>
    <mesh rotation={[-DEG90, 0, 0]} position={[0, 0, 0]} receiveShadow={true}>
      <planeGeometry args={[2, 2]} />
      {/* <meshPhongMaterial color="orange" /> */}
      <meshPhongMaterial map={pixelTexture} />
    </mesh>
  );
};

const Crystal = () => {
  const isohedronRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    isohedronRef.current.material.emissiveIntensity =
      Math.sin(t * 3) * 0.5 + 0.5;
    // isohedronRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.25;
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
    // <RigidBody>
    <mesh
      position={[0, 1, 0]}
      receiveShadow={true}
      castShadow={true}
      ref={isohedronRef}
    >
      <icosahedronGeometry args={[0.2]} />
      <meshPhongMaterial
        color="#2379cf"
        emissive="#143542"
        shininess={10}
        specular="#ffffff"
      />
    </mesh>
    // </RigidBody>
  );
};

const Wall = () => {
  return (
    <mesh rotation={[DEG45, 0, 0]} position={[0, 0, 5 * SQRT2]}>
      <planeGeometry args={[5, 5]} />
      <meshPhongMaterial color="teal" />
    </mesh>
  );
};

const MOVESPEED = 5;
const direction = new THREE.Vector3();
const rotation = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

const Player = () => {
  // const { size, scene, camera } = useThree();

  // const playerModel = useRef<THREE.Mesh>(null!);
  // const rapier = useRapier();
  // const [, get] = useKeyboardControls();
  // const ref = useRef<React.MutableRefObject<undefined>>(null!);
  // const ref = useRef(null!);
  // const moveSpeedY = 26;
  // const moveSpeedX = moveSpeedY / 1.28;
  // useFrame((state) => {
  //   const { up, left, down, right } = get();
  //   const velocity = ref.current.linvel();

  //   frontVector.set(0, 0, +up - +down);
  //   sideVector.set(+left - +right, 0, 0);
  //   direction
  //     .subVectors(frontVector, sideVector)
  //     .normalize()
  //     .multiplyScalar(MOVESPEED);
  //   ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z });
  // });
  // const [ref] = useBox(() => ({ mass: 1 }));

  return (
    <mesh rotation={[DEG45, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={"hotpink"} />
    </mesh>
  );
};

const Scene = () => {
  const { size, scene, camera } = useThree();
  const resolution = useMemo(
    () => new THREE.Vector2(size.width, size.height),
    [size]
  );
  const [boxPixelTexture, floorPixelTexture] = useTexture(
    ["textures/checker.png", "textures/checker.png"],
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

  // return (
  //   <>
  //     <Floor />
  //     <Wall />
  //     {/* <Boxes /> */}
  //     <Player />
  //   </>
  // );
  return (
    <>
      <Box pixelTexture={boxPixelTexture} />
      <Floor pixelTexture={floorPixelTexture} />
      <Crystal />

      <Effects disableRenderPass={false} disableRender={false}>
        <renderPixelatedPass
          args={[
            resolution,
            6,
            scene,
            camera,
            { normalEdgeStrength: 0.1, depthEdgeStrength: 0.1 },
          ]}
        />
      </Effects>
    </>
  );
};

const Box = (props) => {
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

export default function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.up, keys: ["KeyW"] },
      { name: Controls.left, keys: ["KeyA"] },
      { name: Controls.down, keys: ["KeyS"] },
      { name: Controls.right, keys: ["KeyD"] },
    ],
    []
  );
  // const spotLightRef = useRef();
  // useFrame(() => {
  //   spotLightRef.current.target.position.set(0, 0, 0);
  // });

  return (
    <KeyboardControls map={map}>
      <StrictMode>
        <Canvas shadows gl={{ antialias: false }}>
          {/* <Suspense fallback={null}> */}
          <color attach="background" args={["#151729"]} />
          <Perf />
          {/* <OrthographicCamera
            makeDefault
            position={[0, 0, 10]}
            zoom={40}
          ></OrthographicCamera> */}
          <OrthographicCamera
            makeDefault
            left={-aspectRatio}
            right={aspectRatio}
            top={1}
            bottom={-1}
            near={0.1}
            far={10}
            zoom={420}
            position={[0, 2 * Math.tan(Math.PI / 6), 2]}
          ></OrthographicCamera>
          <OrbitControls />
          <ambientLight args={["#2d3645", 0.5]} />
          <directionalLight
            args={["#fffc9c", 0.5]}
            position={[100, 100, 100]}
            castShadow
            shadow-mapSize-height={2048}
            shadow-mapSize-width={2048}
          />
          {/* <spotLight
            args={["#ff8800", 1, 10, Math.PI / 16, 0.02, 2]}
            position={[2, 2, 0]}
            castShadow={true}
            target={[0, 0, 0]}
            // ref={spotLightRef}
          /> */}

          <Physics>
            {/* <RC.RenderPipeline> */}
            {/* <ambientLight />
            <pointLight position={[10, 10, 10]} /> */}
            <Scene />
            {/* <Box /> */}
            {/* </RC.RenderPipeline> */}
            {/* <Debug /> */}
          </Physics>
          {/* </Suspense> */}
        </Canvas>
      </StrictMode>
    </KeyboardControls>
  );
}
