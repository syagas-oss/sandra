import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Html, Stars as DreiStars } from '@react-three/drei';
import * as THREE from 'three';
import { MESSAGES, MessageData } from '../constants';

// Math to generate heart shape positions
const getHeartPosition = (index: number, total: number, scale = 1): THREE.Vector3 => {
  // Distribute points along the heart curve/volume
  // Parametric heart equation
  // t goes from 0 to 2PI
  const t = (index / total) * Math.PI * 2;
  
  // Basic Heart Shape
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  
  // Lift the heart up to avoid bottom corners/UI overlap
  y += 2.0;

  // Add volume/jitter so they don't overlap perfectly
  // This creates a "cloud" of stars in the shape of a heart rather than a thin line
  const jitter = 2.5;
  x += (Math.random() - 0.5) * jitter;
  y += (Math.random() - 0.5) * jitter;
  
  // Deepen the cloud significantly so stars aren't stacked on Z-axis relative to camera
  const z = (Math.random() - 0.5) * 15; 

  return new THREE.Vector3(x * scale, y * scale, z * scale);
};

// Math to generate random sphere positions
const getRandomPosition = (scale = 30): THREE.Vector3 => {
  const v = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  );
  v.normalize().multiplyScalar(scale * (0.8 + Math.random() * 0.5));
  return v;
};

interface StarProps {
  data: MessageData;
  isFormed: boolean;
  onSelect: (data: MessageData) => void;
  index: number;
  total: number;
  isSelected: boolean;
}

const Star: React.FC<StarProps> = ({ data, isFormed, onSelect, index, total, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate target positions once
  const randomPos = useMemo(() => getRandomPosition(35), []);
  const heartPos = useMemo(() => getHeartPosition(index, total, 0.5), [index, total]);
  
  // Animation state
  const currentPos = useRef(randomPos.clone());
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Determine target based on state
    const target = isFormed ? heartPos : randomPos;
    
    // Smooth interpolation (Lerp)
    // We start slow and speed up slightly
    const speed = isFormed ? 2.5 : 1.5;
    currentPos.current.lerp(target, delta * speed);

    meshRef.current.position.copy(currentPos.current);

    // Look at camera (Billboard effect)
    meshRef.current.lookAt(state.camera.position);

    // Hover effect - scale up
    // If selected, scale up more significantly
    const targetScale = isSelected ? 2.0 : (hovered ? 1.5 : 1);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    
    // Rotation for sparkle effect
    meshRef.current.rotation.z += delta * 0.5;
  });

  // Color based on tone
  const color = useMemo(() => {
    let c = new THREE.Color('white');
    switch(data.tone) {
      case 'love': c = new THREE.Color('#f472b6'); break; // pink-400
      case 'strength': c = new THREE.Color('#fbbf24'); break; // amber-400
      case 'hope': c = new THREE.Color('#60a5fa'); break; // blue-400
    }
    
    // If selected, boost intensity to create bloom effect
    if (isSelected) {
      c = c.clone().multiplyScalar(4);
    }
    
    return c;
  }, [data.tone, isSelected]);

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data);
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
        setHovered(false);
      }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.9} 
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false} 
      />
      
      {/* Glow Halo */}
      <mesh position={[0,0,-0.1]}>
         <planeGeometry args={[2.5, 2.5]} />
         <meshBasicMaterial 
           color={color} 
           transparent 
           opacity={isSelected ? 0.4 : 0.15} 
           blending={THREE.AdditiveBlending} 
           depthWrite={false} 
           toneMapped={false}
         />
      </mesh>
    </mesh>
  );
};

interface ConstellationProps {
  isFormed: boolean;
  onMessageSelect: (msg: MessageData) => void;
  selectedId?: number;
}

export const Constellation: React.FC<ConstellationProps> = ({ isFormed, onMessageSelect, selectedId }) => {
  return (
    <group>
      {/* Background ambient stars */}
      <DreiStars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Interactive Message Stars */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group>
          {MESSAGES.map((msg, idx) => (
            <Star 
              key={msg.id} 
              data={msg} 
              index={idx} 
              total={MESSAGES.length} 
              isFormed={isFormed} 
              onSelect={onMessageSelect}
              isSelected={selectedId === msg.id}
            />
          ))}
        </group>
      </Float>
    </group>
  );
};