import { useCallback, useMemo, useState, memo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./ParticlesBackground.scss";

const ParticlesBackground = memo(function ParticlesBackground() {
  const [init, setInit] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
    setInit(true);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: false,
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 30, // Reduced from 60 for better performance
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "grab",
          },
          resize: true,
        },
        modes: {
          push: {
            quantity: 2,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          grab: {
            distance: 180,
            links: {
              opacity: 0.6,
              color: "#f0f8ff",
            },
          },
        },
      },
      particles: {
        color: {
          value: ["#f0f8ff", "#b0d4f1", "#87ceeb"],
        },
        links: {
          color: "#f0f8ff",
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: true,
          speed: 1, // Reduced from 1.5
          straight: false,
          attract: {
            enable: false, // Disabled for performance
          },
        },
        number: {
          density: {
            enable: true,
            area: 1200, // Increased area = fewer particles per screen
          },
          value: 35, // Reduced from 60
        },
        opacity: {
          value: { min: 0.2, max: 0.5 },
          random: true,
          animation: {
            enable: false, // Disabled for performance
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
          random: true,
          animation: {
            enable: false, // Disabled for performance
          },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <Particles
      id="tsparticles"
      className="particles-background"
      init={particlesInit}
      options={options}
    />
  );
});

export default ParticlesBackground;
