import { hasComponents,World,With } from "miniplex";
import createReactAPI from "miniplex/react";
import type { RigidBodyApi } from "@react-three/rapier"
import type { ReactNode } from "react"
import type { Object3D } from "three";

export type Entity = {
  isBox?: true;
  velocity?: { x: number; y: number; z: number };
  health?: number;
  three?: Object3D;
  rigidBody?: RigidBodyApi;
  paused?: true;
  render?: ReactNode
};

export type Box = With<Entity,| "isBox"|"three">

const world = new World<Entity>();
export const ECS = createReactAPI(world);

function isBox(entity: Entity): entity is Box {
return hasComponents(entity, "isBox")
}

export const archetypes = {
  boxes: world.where(isBox)
}