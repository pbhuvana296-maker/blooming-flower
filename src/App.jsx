
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import "./App.css";

const greenLeaves = [
  { d: "M400 545 Q335 450 255 315 Q300 445 390 545 Z" },
  { d: "M390 545 Q300 430 220 245 Q260 420 380 545 Z" },
  { d: "M380 545 Q275 390 195 170 Q225 395 370 545 Z" },
  { d: "M370 545 Q260 365 155 95 Q195 390 360 545 Z" },
  { d: "M360 545 Q275 430 115 320 Q220 435 350 545 Z" },
  { d: "M410 545 Q465 450 545 315 Q500 445 420 545 Z" },
  { d: "M410 545 Q500 430 580 245 Q540 420 420 545 Z" },
  { d: "M420 545 Q525 390 605 170 Q575 395 430 545 Z" },
  { d: "M430 545 Q540 365 645 95 Q605 390 440 545 Z" },
  { d: "M440 545 Q525 430 685 320 Q580 435 450 545 Z" },
  { d: "M395 545 Q350 460 330 390 Q365 465 400 545 Z" },
  { d: "M405 545 Q450 460 470 390 Q435 465 400 545 Z" },
];

const coloredStems = [
  { d: "M400 540 Q315 390 235 270", color: "#9560ff" },
  { d: "M400 540 Q345 350 305 190", color: "#a76bff" },
  { d: "M400 540 Q400 325 400 105", color: "#43dfff" },
  { d: "M400 540 Q455 350 495 190", color: "#ff438c" },
  { d: "M400 540 Q485 390 565 270", color: "#ff55bd" },
];

const flowers = [
  { x: 235, y: 270, color: "#55eaff", scale: 0.82, rotate: -15 },
  { x: 305, y: 190, color: "#8f73ff", scale: 0.86, rotate: -8 },
  { x: 400, y: 105, color: "#6ceeff", scale: 1, rotate: 0 },
  { x: 495, y: 190, color: "#ff75b5", scale: 0.86, rotate: 8 },
  { x: 565, y: 270, color: "#5deaff", scale: 0.82, rotate: 15 },
];

function Flower({ flower, index }) {
  return (
    <g
      className={`flower flower-${index}`}
      transform={`translate(${flower.x} ${flower.y}) rotate(${flower.rotate}) scale(${flower.scale})`}
    >
      {/* Individual flower petals */}
      <g className="petals">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            className="petal"
            cx="0"
            cy="-23"
            rx="9"
            ry="24"
            transform={`rotate(${i * 45})`}
            fill={`url(#petalGradient${index})`}
          />
        ))}
      </g>

      {/* Small glowing stamens above the flower */}
      <g className="stamens">
        {[-24, -12, 0, 12, 24].map((offset, i) => (
          <g key={i} transform={`translate(${offset} -14)`}>
            <path
              d={`M0 0 Q${offset * 0.15} -17 0 -31`}
              fill="none"
              stroke="#a9fbff"
              strokeWidth="1.5"
            />
            <ellipse
              cx="0"
              cy="-32"
              rx="3.2"
              ry="5"
              fill={i % 2 === 0 ? "#ff8ecf" : "#d6ffff"}
              stroke="#6af3ff"
              strokeWidth="1"
            />
          </g>
        ))}
      </g>

      {/* Glow stays around this flower only */}
      <circle className="flower-glow" r="37" fill={flower.color} />
      <circle className="flower-core-glow" r="11" fill="#55eaff" />
      <circle className="flower-core" r="4.2" fill="#ffffff" />
    </g>
  );
}

function BaseCircles() {
  const leftCircles = Array.from({ length: 11 }, (_, i) => ({
    x: 302 + i * 8,
    y: 432 + i * 9,
    r: 4.3 + (i % 3) * 0.4,
  }));

  const rightCircles = Array.from({ length: 11 }, (_, i) => ({
    x: 498 - i * 8,
    y: 432 + i * 9,
    r: 4.3 + (i % 3) * 0.4,
  }));

  return (
    <g className="base-circles">
      {leftCircles.map((c, i) => (
        <g key={`l${i}`}>
          <ellipse
            className="circle-decoration circle-cyan"
            cx={c.x}
            cy={c.y}
            rx={c.r}
            ry={c.r * 0.78}
            transform={`rotate(38 ${c.x} ${c.y})`}
          />
          <circle
            className="circle-center"
            cx={c.x}
            cy={c.y}
            r="1.2"
          />
        </g>
      ))}

      {rightCircles.map((c, i) => (
        <g key={`r${i}`}>
          <ellipse
            className="circle-decoration circle-pink"
            cx={c.x}
            cy={c.y}
            rx={c.r}
            ry={c.r * 0.78}
            transform={`rotate(-38 ${c.x} ${c.y})`}
          />
          <circle
            className="circle-center"
            cx={c.x}
            cy={c.y}
            r="1.2"
          />
        </g>
      ))}
    </g>
  );
}

export default function App() {
  const gardenRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    let renderer;
    let frameId;
    let observer;
    let timeline;
    let starGeometry;
    let starMaterial;
    let disposed = false;

    // THREE.JS STAR BACKGROUND
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 12;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = "star-canvas";
      gardenRef.current?.prepend(renderer.domElement);
    } catch (error) {
      console.warn("WebGL background could not start:", error);
    }

    const starPositions = new Float32Array(220 * 3);

    for (let i = 0; i < 220; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 19;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );

    starMaterial = new THREE.PointsMaterial({
      color: 0xa8f5ff,
      size: 0.035,
      transparent: true,
      opacity: 0.82,
      sizeAttenuation: true,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    function resize() {
      if (!renderer || !gardenRef.current) return;

      const width = gardenRef.current.clientWidth;
      const height = gardenRef.current.clientHeight;

      if (!width || !height) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    if (gardenRef.current) {
      observer = new ResizeObserver(resize);
      observer.observe(gardenRef.current);
      resize();
    }

    function animateStars() {
      if (disposed) return;

      starField.rotation.y += 0.00015;

      if (renderer) {
        renderer.render(scene, camera);
      }

      frameId = requestAnimationFrame(animateStars);
    }

    animateStars();

    // GSAP ANIMATION SEQUENCE
    const svg = svgRef.current;

    if (svg) {
      const leaves = svg.querySelectorAll(".green-leaf");
      const stems = svg.querySelectorAll(".colored-stem");
      const circles = svg.querySelectorAll(".circle-decoration");
      const flowerGroups = svg.querySelectorAll(".flower");

      gsap.set(leaves, {
        scaleY: 0,
        transformOrigin: "50% 100%",
        opacity: 1,
      });

      gsap.set(stems, {
        strokeDasharray: (i, element) => element.getTotalLength(),
        strokeDashoffset: (i, element) => element.getTotalLength(),
      });

      gsap.set(circles, {
        strokeDasharray: (i, element) => element.getTotalLength(),
        strokeDashoffset: (i, element) => element.getTotalLength(),
      });

      gsap.set(".petals", {
        scale: 0.08,
        transformOrigin: "center center",
      });

      gsap.set(".stamens", {
        opacity: 0,
        scale: 0.5,
        transformOrigin: "center center",
      });

      gsap.set(".flower-glow", {
        opacity: 0,
        scale: 0.5,
        transformOrigin: "center center",
      });

      gsap.set(".flower-core-glow", {
        opacity: 0,
        scale: 0.4,
        transformOrigin: "center center",
      });

      timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.5,
      });

      // 1. Green curved leaves grow one by one
      timeline.to(leaves, {
        scaleY: 1,
        duration: 0.85,
        stagger: 0.095,
        ease: "power2.out",
      });

      // 2. Five colorful stems draw upward
      timeline.to(
        stems,
        {
          strokeDashoffset: 0,
          duration: 1.15,
          stagger: 0.16,
          ease: "power2.out",
        },
        "-=0.15"
      );

      // 3. Decorative base circles draw one by one
      timeline.to(
        circles,
        {
          strokeDashoffset: 0,
          duration: 0.22,
          stagger: 0.035,
          ease: "power1.out",
        },
        "-=0.05"
      );

      // 4. Each flower blooms in sequence
      flowerGroups.forEach((flower, index) => {
        const position = index === 0 ? undefined : "-=0.25";

        timeline.to(
          flower.querySelector(".petals"),
          {
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.7)",
          },
          position
        );

        timeline.to(
          flower.querySelector(".stamens"),
          {
            opacity: 1,
            scale: 1,
            duration: 0.38,
            ease: "power2.out",
          },
          "<0.15"
        );
      });

      // 5. Bright glow appears around each flower, not the whole screen
      flowerGroups.forEach((flower, index) => {
        timeline.to(
          flower.querySelector(".flower-glow"),
          {
            opacity: 0.55,
            scale: 1.15,
            duration: 0.4,
            ease: "power2.out",
          },
          index === 0 ? undefined : "-=0.23"
        );

        timeline.to(
          flower.querySelector(".flower-core-glow"),
          {
            opacity: 0.95,
            scale: 1.35,
            duration: 0.35,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          "<"
        );
      });

      // Keep the completed garden visible before replay
      timeline.to({}, { duration: 2 });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      timeline?.kill();

      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }

      starGeometry?.dispose();
      starMaterial?.dispose();
    };
  }, []);

  return (
    <main className="flower-page">
      <section className="garden" ref={gardenRef}>
        <div className="background-glow" />

        <svg
          ref={svgRef}
          className="flower-svg"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMax meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="greenGradient"
              x1="0"
              y1="1"
              x2="0.25"
              y2="0"
            >
              <stop offset="0%" stopColor="#168a3c" />
              <stop offset="45%" stopColor="#25d85b" />
              <stop offset="100%" stopColor="#55ff85" />
            </linearGradient>

            {flowers.map((flower, index) => (
              <radialGradient
                key={index}
                id={`petalGradient${index}`}
                cx="45%"
                cy="35%"
                r="75%"
              >
                <stop offset="0%" stopColor="#d6ffff" />
                <stop offset="28%" stopColor="#54edff" />
                <stop offset="65%" stopColor="#6686ff" />
                <stop offset="100%" stopColor="#b16cff" />
              </radialGradient>
            ))}

            <filter
              id="greenGlow"
              x="-80%"
              y="-30%"
              width="260%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter
              id="flowerGlow"
              x="-150%"
              y="-150%"
              width="400%"
              height="400%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* GREEN CURVED LEAVES */}
          <g className="green-leaves" filter="url(#greenGlow)">
            {greenLeaves.map((leaf, index) => (
              <path
                key={index}
                className="green-leaf"
                d={leaf.d}
                fill="url(#greenGradient)"
              />
            ))}
          </g>

          {/* COLORED STEMS */}
          <g className="colored-stems">
            {coloredStems.map((stem, index) => (
              <path
                key={index}
                className="colored-stem"
                d={stem.d}
                stroke={stem.color}
              />
            ))}
          </g>

          {/* CYAN AND PINK BASE CIRCLES */}
          <g className="circle-layer">
            <BaseCircles />
          </g>

          {/* FIVE FLOWERS */}
          <g className="flowers-layer">
            {flowers.map((flower, index) => (
              <Flower
                key={index}
                flower={flower}
                index={index}
              />
            ))}
          </g>

          {/* SUBTLE GROUND LIGHT */}
          <ellipse
            className="ground-glow"
            cx="400"
            cy="557"
            rx="220"
            ry="16"
          />
        </svg>
      </section>
    </main>
  );
}
