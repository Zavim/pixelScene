import { ECS } from "../state";

export const Player = () => {
  return (
    <ECS.Entity>
      <ECS.Component name="position" data={{ x: 0, y: 0, z: 0 }} />
      <ECS.Component name="health" data={100} />
      <ECS.Component name="three">
        <mesh>
          <coneGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </ECS.Component>
    </ECS.Entity>
  );
};
