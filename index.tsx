import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars as DreiStars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- CONSTANTS & DATA ---

export interface MessageData {
  id: number;
  name: string;
  message: string;
  tone: 'love' | 'strength' | 'hope';
}

export const APP_DATA = {
  title: "Un cielo lleno de vos",
  subtitle: "Mensajes del equipo para Sandra",
  finalPhrase: "Estamos con vos",
};

export const MESSAGES: MessageData[] = [
  { id: 1, name: "Javier González Castaño", message: "Hola Sandra! Te mandamos un abrazo fuerte y mucha fuerza desde Canarias! VAS A GANAR LA BATALLA!!", tone: "strength" },
  { id: 2, name: "Pere Sastre", message: "Estimada amiga tu pots amb això i molt mes, dona forta com poques he conegut. T'anyoram", tone: "strength" },
  { id: 3, name: "Vicky Hernández", message: "Nena, creo que ya nos lo hemos dicho todo pero por si hay dudas aún...... LO VAS A CONSEGUIR, ERES MUY FUERTE Y VALIENTE y recuerda, las navidades del 2027 estaremos recordando este momento. Contando los días para esa visita a BCN. Te quiero!!! A por todas!!!!!", tone: "love" },
  { id: 4, name: "Simon", message: "Sandra, estamos todos haciendo mucha fuerza por vos. Sabemos lo enorme que viene siendo esta batalla y lo admirable que es cómo la estás enfrentando. Ahora arranca una etapa nueva en Barcelona, y ojalá el trasplante sea ese empujón que te acerque cada vez más a estar bien.\n\nQuedate tranquila que no estás sola: todo el equipo te banca, te piensa y te acompaña desde acá. Tenés un montón de gente tirándote buena energía y esperando verte volver con toda la fuerza que te caracteriza.\n\nMucho ánimo, de verdad. Pasito a pasito, ya falta menos. Un abrazo enorme", tone: "hope" },
  { id: 5, name: "IVÁN OLIVER", message: "Desde el departamento de PRL, enviarte muchos ánimos y mucha fuerza en este camino. Deseamos que todo salga bien y que te vaya muy bonito. Un fuerte abrazo.", tone: "hope" },
  { id: 6, name: "Susana Planas", message: "Estiimada Sandra,\nEt desitjo una ràpida recuperació i molts ànims! Va ser genial veure't a l'aeroport l'altre dia!! Quan estiguis millor esper que ens podem ajuntar per dinar o colque cosa que te trob a faltar a l'oficina! FORÇAAAA!!!\nUna abraçada molt forta\nSusana", tone: "love" },
  { id: 7, name: "Gerardo Díaz", message: "Apoyo sincero para este reto. Te mando lindas energias.\nUn caluroso apoyo de un compañero de trabajo.", tone: "hope" },
  { id: 8, name: "Paula Bonnin", message: "Sandra mucha fuerza y ánimos para afrontar esta situación que tienes por delante.\n\nTe mando un fuerte abrazo.", tone: "strength" },
  { id: 9, name: "Daniel Armas", message: "Hola Sandra, quería darte mucha fuerza en esta etapa de tu vida que estás afrontando, estas batallas solo se las dan a las más fuertes, y no dudo de que tú lo seas, así que no dejes de luchar, que es la mejor herramienta para salir siempre adelante y más en estas situaciones. Yo sé como son en parte , ya que lo he vivido con familiares, y el ánimo y las ganas son las principales armas, así que te quiero ver arriba, que así seguro que lo superarás. Un abrazo fuerte desde Canarias.", tone: "strength" },
  { id: 10, name: "Marta Lopez", message: "Te mando un abrazo lleno de fuerza y cariño para acompañarte en esta nueva etapa.", tone: "love" },
  { id: 11, name: "Yaiza", message: "Cuento las horas para volver a reír contigo en la oficina, para tomar un café en la cantina, o simplemente para recordar nuestro pasado glorioso en aquellas empresas que nos prometieron un futuro prometedor con recursos invisibles, besugos uniformados, horas infinitas...pero que sin saberlo, hoy les podemos dar las GRACIAS por haberse convertido en ese nexo que ha permitido conocernos. Ya no queda nada...estás en la recta final. Eres una ganadora, una MUJERONA, toda mi fuerza para ti. Con mucho cariño Yaiza.", tone: "love" },
  { id: 12, name: "Rosana", message: "Muchísimo Ánimo! Estamos todos aquí apoyándote para darte toda la fuerza del mundo! Recupérate y vuelve pronto que te echamos de menos", tone: "strength" },
  { id: 13, name: "María Antonia Oliver", message: "Sandra, muchos ánimos. Tú puedes!!!! Todo irá bien. Nos vemos pronto! Un besote", tone: "hope" },
  { id: 14, name: "Daniela", message: "Sandra:\n\nHoy quiero enviarte mucha energía positiva y un abrazo enorme. Deseo que esto pase pronto para volver a verte por la oficina, tan radiante e iluminada como siempre. Te mando mucho ánimo y los mejores deseos para tu pronta recuperación.\n\nCuidate mucho y aquí estamos esperándote =)", tone: "love" },
  { id: 15, name: "Mercedes", message: "Sandrita, ¡ya queda menos para que estés a tope!\nTe echamos de menos INFINITO\nUn besote muy muy muy fuerte", tone: "love" },
  { id: 16, name: "Ander Aguirre", message: "Te mando toda la fuerza del mundo Sandra, muchos ánimos y seguro que esta etapa de la vida la superas como una campeona. Después de eso toda maratón será poco para ti.", tone: "strength" },
  { id: 17, name: "Neus", message: "Molts d'ànims Sandra, t'enviam tota la nostra energia i força, sabem que tot anirà bé. Una aferrada enorme i beso molt molt molt fort!", tone: "love" },
  { id: 18, name: "Leyre", message: "Un abrazo muy grande Sandra; estoy segura de que nos veremos muy prontito por la ofi :)", tone: "hope" },
  { id: 19, name: "Laura Lobo", message: "Sandra, este es el comienzo de un nuevo capítulo y para él, te envío mucha energía y fuerza!!\n\nEstoy segura de que nos veremos muuy pronto :)\n\nUn fuerte abrazo,\nLaura Lobo", tone: "hope" },
  { id: 20, name: "Antonia Fiol", message: "El proceso se convierte en un viaje difícil, donde cada día es un conflicto que se libra con amor y paciencia, aunque el camino sea incierto, la motivación nace del alma y cada paso, por pequeño que sea, es un canto a la vida, con cariño de Antonia Fiol", tone: "love" },
  { id: 21, name: "Loileth", message: "Amiga, mis mejores deseos para esta fase de tratamiento. Estamos seguros que estarás de vuelta pronto!!! Pon toda tu fuerza en tu recuperación!!!!! Un abrazo grande!!!", tone: "strength" },
  { id: 22, name: "Silvia Cazorla Reche", message: "Hola bonita! Te envío todo mi cariño y mucha energía positiva para que empieces el tratamiento en Barcelona cargada de buenas vibraciones. Será un camino duro, pero tienes que ser muy fuerte y enfocarte en el resultado. Estoy segura de que te va a ir fenomenal y que dentro de unos meses estaremos celebrando tu recuperación. ¡Mucho ánimo bombón! Te envío un fortísimo abrazo, Silvia Cazorla", tone: "love" },
  { id: 23, name: "Patricia Espín", message: "Sandra, eres una persona increíblemente fuerte y valiente, dos virtudes muy importantes para el camino que vas a empezar en Barcelona.\nTe mando todo mi amor y apoyo para esta etapa. Recuperarte tiene que ser tu única prioridad ahora mismo.\n\nUn abrazo enorme", tone: "strength" },
  { id: 24, name: "Marta Borrás", message: "Muchísimo ánimo Sandra!!! Todo irá bien, te esperamos en la ofi más fuerte que nunca!!! Un beso enorme :)", tone: "hope" },
  { id: 25, name: "Vero", message: "Vamos, campeona! Que si hay alguien que puede con esto eres tú! Te admiramos y te enviamos todas las fuerzas del universo para que estés pronto de vuelta.", tone: "strength" },
  { id: 26, name: "Mª Jesús", message: "Hola Sandra! Te mando toda mi energía positiva, estamos contigo en cada paso! Un abrazo fuerte", tone: "love" },
  { id: 27, name: "MAR VINENT", message: "No conec persona amb més força que TU! Cap endavant i amb més força que mai!!!! Vendrem molt prest a BCN a estar amb tu!!! T'estimam i t'enyoram cada dia.", tone: "love" },
  { id: 28, name: "Lorena Rizquez", message: "Sandra, que sepas que te tenemos muy presente cada día en la oficina, ¡tu ausencia se hace notar! Te mando mucha mucha mucha fuerza en esta nueva etapa en el camino de la recuperación y un abrazo enorme de Manacor hasta Barcelona ❤️ Nos vemos muy pronto🥰", tone: "love" },
  { id: 29, name: "Magda Flores", message: "Querida Sandrita, desde México, te mandamos mucha luz, mucha fuerza y nuestras oraciones, para que este procedimiento que vas a realizar, sea todo un éxito y pronto te reincorpores con nosotros. Por mi parte estás en mis oraciones y te deseo que todo vaya bien y seguiré rezando para Dios esté contigo y no te suelte de su mano. Un abrazo fuertísimo, te queremos mucho", tone: "love" },
  { id: 30, name: "Merian", message: "Querida Sandra 💛\n\nQuiero que sepas que estoy pensando mucho en ti en esta etapa tan importante. 💪✨ Sé que eres fuerte y valiente, y estoy segura de que vas a superar esta batalla.\nTe envío todo mi cariño, energía positiva y abrazos virtuales para que este trasplante sea un éxito y pronto estés recuperada. 💖🤗\n\n¡Mucho ánimo y espero verte pronto! 💛", tone: "love" },
  { id: 31, name: "Laura Orellana", message: "Aunque coincide muy poco tiempo, te deseo lo mejor de lo mejor durante todo el camino, un abrazo enorme!!!", tone: "hope" },
  { id: 32, name: "Patri", message: "Querida Sandra, ¡Te echo de menos! Todo mi amor y luz para este siguiente reto, volveremos a viajar juntas, comentar libros y reirnos. ¡¡Un abrazo gigante!!", tone: "love" },
  { id: 33, name: "Carmen Salmán", message: "Eres una persona increíblemente fuerte y estoy segura de que superarás esto pronto. Quiero que sepas que tienes todo mi apoyo y estoy aquí para lo que necesites: una llamada, o simplemente escuchar. ¡Te mando toda mi fuerza y animo!", tone: "strength" },
  { id: 34, name: "Lisa", message: "Sandra! A por ello! Mucho es lo recorrido y ahora el gran paso! Te mandamos todo el apoyo y la fuerza! Estás muy presente por aquí, te esperamos de vuelta! Un fuerte abrazo lleno de cariño!", tone: "strength" },
  { id: 35, name: "Eva Z.", message: "Querido Sandra, deseando que pronto te encuentres mucho mejor. Estaré pensando en ti, acompañándote desde la distancia y enviándote mucha energía de la buena.\n\n Un abrazo grande, lleno de fuerza y cariño ♥", tone: "love" }
];

// --- 3D COMPONENTS ---

// Math to generate heart shape positions
const getHeartPosition = (index: number, total: number, scale = 1): THREE.Vector3 => {
  const t = (index / total) * Math.PI * 2;
  
  // Basic Heart Shape
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  
  // Lift the heart up to avoid bottom corners/UI overlap
  y += 2.0;

  // Add volume/jitter
  const jitter = 2.5;
  x += (Math.random() - 0.5) * jitter;
  y += (Math.random() - 0.5) * jitter;
  
  // Deepen the cloud
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
  
  const randomPos = useMemo(() => getRandomPosition(35), []);
  const heartPos = useMemo(() => getHeartPosition(index, total, 0.5), [index, total]);
  
  const currentPos = useRef(randomPos.clone());
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = isFormed ? heartPos : randomPos;
    const speed = isFormed ? 2.5 : 1.5;
    currentPos.current.lerp(target, delta * speed);

    meshRef.current.position.copy(currentPos.current);
    meshRef.current.lookAt(state.camera.position);

    const targetScale = isSelected ? 2.0 : (hovered ? 1.5 : 1);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    
    meshRef.current.rotation.z += delta * 0.5;
  });

  const color = useMemo(() => {
    let c = new THREE.Color('white');
    switch(data.tone) {
      case 'love': c = new THREE.Color('#f472b6'); break;
      case 'strength': c = new THREE.Color('#fbbf24'); break;
      case 'hope': c = new THREE.Color('#60a5fa'); break;
    }
    
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

const Constellation: React.FC<ConstellationProps> = ({ isFormed, onMessageSelect, selectedId }) => {
  return (
    <group>
      <DreiStars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
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

// --- APP COMPONENT ---

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [viewedCount, setViewedCount] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  // Check if all messages viewed (or a significant portion) to show final phrase
  useEffect(() => {
    if (viewedCount > 0 && viewedCount === MESSAGES.length) {
      // Optional: trigger something when all read
    }
    // Show final phrase if formed and we want to just show it alongside
    if (started) {
      const timer = setTimeout(() => setShowFinal(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [started, viewedCount]);

  const handleStart = () => {
    setStarted(true);
  };

  const handleMessageSelect = (msg: MessageData) => {
    setSelectedMessage(msg);
    setViewedCount(prev => prev + 1);
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 text-white overflow-hidden selection:bg-pink-500 selection:text-white select-none">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Suspense fallback={null}>
            <Constellation 
              isFormed={started} 
              onMessageSelect={handleMessageSelect} 
              selectedId={selectedMessage?.id}
            />
          </Suspense>

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            {/* Reduced darkness to prevent black corners obscuring the heart tip */}
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        
        {/* Intro Screen */}
        {!started && (
          <div className="pointer-events-auto text-center px-6 animate-fade-in transition-opacity duration-1000">
            <h1 className="text-4xl md:text-6xl font-light tracking-widest mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 drop-shadow-lg">
              {APP_DATA.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light mb-12 tracking-wide">
              {APP_DATA.subtitle}
            </p>
            <button
              onClick={handleStart}
              className="group relative px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium tracking-wider hover:bg-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10">ABRIR EL CIELO</span>
            </button>
          </div>
        )}

        {/* Message Modal */}
        {selectedMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md pointer-events-auto animate-fade-in">
            <div 
              className="relative max-w-lg w-full bg-slate-800/80 border border-white/10 rounded-2xl p-8 shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeMessage}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-light text-pink-200 mb-1">{selectedMessage.name}</h3>
                <div className="h-0.5 w-12 bg-gradient-to-r from-pink-500 to-transparent"></div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                <p className="text-lg text-slate-100 leading-relaxed font-light whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-center">
                <button
                  onClick={closeMessage}
                  className="text-sm text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Seguir mirando
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer / Final Phrase */}
        {started && !selectedMessage && (
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none px-4">
             <div className={`transition-opacity duration-2000 ${showFinal ? 'opacity-100' : 'opacity-0'}`}>
               <p className="text-xl md:text-3xl font-light text-white/80 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                 {APP_DATA.finalPhrase}
               </p>
               <p className="text-xs text-white/30 mt-4 uppercase tracking-[0.3em]">
                 Haz clic en las estrellas
               </p>
             </div>
          </div>
        )}
      </div>

      {/* Basic Tailwind Animation Keyframes */}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

// --- MOUNTING ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
