import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Image-based lighting generated in-process (no HDR download) gives the metals real reflections;
// one shadow-casting key light and a cool rim light model the form.
export function SceneLighting({ shadowSize = 1024 }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);

  return (
    <>
      <hemisphereLight args={["#cfe8ff", "#0b0e13", 0.35]} />
      <directionalLight castShadow position={[5, 9, 6]} intensity={2.1} shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6}
        shadow-camera-near={1} shadow-camera-far={30} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 3, -4]} intensity={0.9} color="#3ad7ff" />
    </>
  );
}
