import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type AuditCoreSceneProps = {
  score: number;
};

const AuditCoreScene = ({ score }: AuditCoreSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.35, 6.8);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const stage = new THREE.Group();
    scene.add(stage);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 2),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x312e81,
        emissiveIntensity: 1.4,
        roughness: 0.22,
        metalness: 0.7,
        wireframe: true,
      }),
    );
    stage.add(core);

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.22 }),
    );
    stage.add(nucleus);

    const ringConfigs: Array<{ radius: number; rotation: [number, number, number]; color: number }> = [
      { radius: 1.85, rotation: [0.9, 0.2, 0.2], color: 0x22d3ee },
      { radius: 2.2, rotation: [0.1, 0.9, 1.1], color: 0xf59e0b },
      { radius: 1.6, rotation: [1.5, 0.5, 0.7], color: 0xa78bfa },
    ];
    const rings = ringConfigs.map(({ radius, rotation, color }) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.012, 12, 96),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }),
      );
      ring.rotation.set(...rotation);
      stage.add(ring);
      return ring;
    });

    const particlePositions = new Float32Array(180 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      const angle = index * 0.37;
      const radius = 2.55 + (index % 7) * 0.08;
      particlePositions[index] = Math.cos(angle) * radius;
      particlePositions[index + 1] = Math.sin(angle * 1.7) * radius * 0.52;
      particlePositions[index + 2] = Math.sin(angle) * radius;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.025, transparent: true, opacity: 0.65 }),
    );
    stage.add(particles);

    const ambientLight = new THREE.AmbientLight(0x818cf8, 1.8);
    scene.add(ambientLight);
    const keyLight = new THREE.PointLight(0x5eead4, 8, 12);
    keyLight.position.set(3, 2, 4);
    scene.add(keyLight);

    const pointer = { x: 0, y: 0 };
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.5;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.35;
    };
    canvas.addEventListener('pointermove', handlePointerMove);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const safeHeight = Math.max(height, 1);
      renderer.setSize(Math.max(width, 1), safeHeight, false);
      camera.aspect = Math.max(width, 1) / safeHeight;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    let frame = 0;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      const elapsed = time * 0.00035;
      stage.rotation.y += (pointer.x - stage.rotation.y) * 0.025;
      stage.rotation.x += (-pointer.y - stage.rotation.x) * 0.025;
      core.rotation.y = elapsed * 2.4;
      core.rotation.z = elapsed * 1.3;
      nucleus.scale.setScalar(1 + Math.sin(elapsed * 8) * 0.06);
      rings.forEach((ring, index) => {
        ring.rotation.z += 0.0015 + index * 0.0007;
        ring.rotation.x += 0.0005;
      });
      particles.rotation.y = elapsed * 0.7;
      keyLight.intensity = 7 + Math.sin(elapsed * 5) * 1.5;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      core.geometry.dispose();
      core.material.dispose();
      nucleus.geometry.dispose();
      nucleus.material.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      particlesGeometry.dispose();
      particles.material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="audit-core-scene" aria-label={`Audit core score ${score} out of 100`}>
      <canvas ref={canvasRef} />
      <div className="audit-core-hud audit-core-hud-top">
        <span className="audit-core-dot" /> LIVE CORE
      </div>
      <div className="audit-core-score">
        <strong>{score}</strong>
        <span>QUALITY INDEX</span>
      </div>
      <div className="audit-core-hud audit-core-hud-bottom">SCAN / READY</div>
    </div>
  );
};

export default AuditCoreScene;
