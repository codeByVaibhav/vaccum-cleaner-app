import React, { useEffect, useRef } from "react";
import RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import botpath from "./botpath";
import { BotStatus, useVaccumCleanerStatus, useVaccumCleanerMode, useVaccumCleanerPower } from "../stores/BotStatus";


const ThreeDRoom = () => {
  const mountRef = useRef(null);
  const robotRef = useRef(null);

  const status = useVaccumCleanerStatus((state) => state.status);
  const updateVaccumStatus = useVaccumCleanerStatus((state) => state.updateStatus);

  const mode = useVaccumCleanerMode((state) => state.mode);
  const updateMode = useVaccumCleanerMode((state) => state.updateMode);

  const power = useVaccumCleanerPower((state) => state.power);
  const updatePower = useVaccumCleanerPower((state) => state.updatePower);

  let jmode, jpower, jstatus;

  useEffect(() => {
    jmode = mode;
    jpower = power;
    jstatus = status;
  }, [mode, power, status]);


  let botpathindex = 0;
  let frameno = 0;

  useEffect(() => {
    // Variables that need to be accessible for cleanup.
    let renderer;
    let animationFrameId;
    let handleResize;
    let handleKeyDown;
    let physicsWorld;
    let robotPhysicsBody;
    let canceled = false; // To cancel async init if the effect unmounts early.

    // Our asynchronous initialization function.
    async function init() {
      // Wait for Rapier WASM module initialization.
      await RAPIER.init();
      if (canceled) return; // Stop if unmounted before initialization.

      // === THREE.JS SETUP ===
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      renderer = new THREE.WebGLRenderer({ antialias: false });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.appendChild(renderer.domElement);

      const lightColor = 0x929cad;
      const ambientLight = new THREE.AmbientLight(lightColor, 1);
      scene.add(ambientLight);

      // Multiple directional lights
      const directionalLightLEFT = new THREE.DirectionalLight(lightColor, 1);
      directionalLightLEFT.position.set(-1, 0, 0);
      const directionalLightRIGHT = new THREE.DirectionalLight(lightColor, 1);
      directionalLightRIGHT.position.set(1, 0, 0);
      const directionalLightLEFT2 = new THREE.DirectionalLight(lightColor, 1);
      directionalLightLEFT2.position.set(0, 0, -1);
      const directionalLightRIGHT2 = new THREE.DirectionalLight(lightColor, 1);
      directionalLightRIGHT2.position.set(0, 0, 1);
      const directionalLightTOP = new THREE.DirectionalLight(lightColor, 1);
      directionalLightTOP.position.set(-1, 8, 0);
      scene.add(directionalLightLEFT);
      scene.add(directionalLightRIGHT);
      scene.add(directionalLightLEFT2);
      scene.add(directionalLightRIGHT2);
      scene.add(directionalLightTOP);

      const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      camera.position.set(0, 8, 0);

      const controls = new OrbitControls(camera, renderer.domElement);

      // === RAPIER PHYSICS SETUP ===
      const gravity = { x: 0, y: -9.81, z: 0 };
      physicsWorld = new RAPIER.World(gravity);

      // Create a static ground collider
      const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
      const groundBody = physicsWorld.createRigidBody(groundBodyDesc);
      const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10, 0.1, 10);
      physicsWorld.createCollider(groundColliderDesc, groundBody);

      // Create wall colliders to bound the room
      const roomSize = 10;
      const wallThickness = 0.1;
      const wallHeight = 2;
      // Left Wall
      const leftWallBody = physicsWorld.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(-roomSize / 2, wallHeight / 2, 0));
      physicsWorld.createCollider(RAPIER.ColliderDesc.cuboid(wallThickness / 2, wallHeight / 2, roomSize / 2), leftWallBody);
      // Right Wall
      const rightWallBody = physicsWorld.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(roomSize / 2, wallHeight / 2, 0));
      physicsWorld.createCollider(RAPIER.ColliderDesc.cuboid(wallThickness / 2, wallHeight / 2, roomSize / 2), rightWallBody);
      // Front Wall
      const frontWallBody = physicsWorld.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, wallHeight / 2, -roomSize / 2));
      physicsWorld.createCollider(RAPIER.ColliderDesc.cuboid(roomSize / 2, wallHeight / 2, wallThickness / 2), frontWallBody);
      // Back Wall
      const backWallBody = physicsWorld.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, wallHeight / 2, roomSize / 2));
      physicsWorld.createCollider(RAPIER.ColliderDesc.cuboid(roomSize / 2, wallHeight / 2, wallThickness / 2), backWallBody);

      // === LOAD THE ROOM MODEL ===
      new MTLLoader().load(
        "good_room.mtl",
        (materials) => {
          materials.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(
            "good_room.obj",
            (object) => {
              object.position.set(0, 0, 0);
              object.scale.set(1, 1, 1);
              scene.add(object);
            },
            (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
            (error) => console.error("Error loading OBJ:", error)
          );
        },
        (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
        (error) => console.error("Error loading MTL:", error)
      );

      // === LOAD THE BB-8 ROBOT MODEL AND SET UP COLLISION ===
      new MTLLoader().load(
        "BB-8.mtl",
        (materials) => {
          materials.preload();
          const objLoader = new OBJLoader();
          // Uncomment to apply BB-8 materials:
          // objLoader.setMaterials(materials);
          objLoader.load(
            "BB-8.obj",
            (object) => {
              const startX = -1;
              const startY = 0.5; // Slightly above the ground
              const startZ = 0;
              object.position.set(startX, startY, startZ);
              object.rotateY(Math.PI / 2);
              object.scale.set(0.1, 0.1, 0.1);

              // (Optional) Attach debug rays
              const rayLength = 5;
              const numRays = 20;
              for (let i = 0; i < numRays; i++) {
                const angle = (i / numRays) * Math.PI * 2;
                const start = new THREE.Vector3(0, 4, 0);
                const end = new THREE.Vector3(Math.cos(angle) * rayLength, 4, Math.sin(angle) * rayLength);
                const points = [start, end];
                const rayGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const rayMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
                const rayLine = new THREE.Line(rayGeometry, rayMaterial);
                object.add(rayLine);
              }

              // Create a dynamic physics body for BB-8
              const robotBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(startX, startY, startZ);
              robotPhysicsBody = physicsWorld.createRigidBody(robotBodyDesc);
              const robotColliderDesc = RAPIER.ColliderDesc.ball(0.02);
              physicsWorld.createCollider(robotColliderDesc, robotPhysicsBody);

              robotRef.current = object;
              scene.add(object);
            },
            (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
            (error) => console.error("Error loading OBJ:", error)
          );
        },
        (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
        (error) => console.error("Error loading MTL:", error)
      );

      // === ANIMATION & PHYSICS LOOP ===
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        physicsWorld.step();

        if (robotPhysicsBody && robotRef.current) {
          if (frameno % 25 === 0 && (jmode === BotStatus.MODE.ECO || jmode === BotStatus.MODE.POWER)) {
            robotPhysicsBody.setTranslation(botpath[botpathindex], true);
            botpathindex++;
            if (botpathindex >= botpath.length) botpathindex = 0;
          }
          const translation = robotPhysicsBody.translation();
          robotRef.current.position.set(translation.x, translation.y, translation.z);
        }
        renderer.render(scene, camera);
        frameno++;
        if (frameno > 1000) frameno = 0;
      };
      animate();

      // === HANDLE ARROW KEY EVENTS VIA PHYSICS ===
      const moveStep = 0.05;
      handleKeyDown = (event) => {
        // Get the current translation from the physics body
        console.log(jmode)
        if (jmode !== BotStatus.MODE.MANUAL) return;
        botpathindex = 0;
        const currentPos = robotPhysicsBody.translation();
        let newX = currentPos.x;
        let newZ = currentPos.z;

        switch (event.key) {
          case "ArrowUp":
            newZ -= moveStep;
            break;
          case "ArrowDown":
            newZ += moveStep;
            break;
          case "ArrowLeft":
            newX -= moveStep;
            break;
          case "ArrowRight":
            newX += moveStep;
            break;
          case "Backspace":
            break;
          default:
            return; // Ignore other keys
        }

        // Directly update the robot's position
        robotPhysicsBody.setTranslation({ x: newX, y: currentPos.y, z: newZ }, true);
      };
      window.addEventListener("keydown", handleKeyDown);

      // Handle resize events.
      handleResize = () => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", handleResize);
    }

    init();

    // Cleanup function returned synchronously.
    return () => {
      canceled = true;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer && renderer.domElement) {
        if (mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      if (renderer) renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "calc(100vh - 4rem)" }} />;
};

export default ThreeDRoom;
