
// --- BrainConfig ---
export class BrainConfig {
  static getDefault() {
    return {
      keepRatio: 0.20,
      accent: 0x26a269,
      baseOpacity: 0.035,
      fresnelPow: 2.1,
      edgeStrength: 0.10,
      showSurface: true,
      showEdges: true,
      rotSpeed: 0.0009,
      pause: false,
      labelBaseScale: 1.0,
      hoverScale: 1.10,
      particles: {
        enabled: true,
        count: 400,
        baseSize: 0.02,
        pulseAmp: 0.25,
        opacity: 0.8,
        linksPerNode: 3,
        linkDist: 3.0,
        rewireMs: 2000,
        firingRate: 0.02,
        firingDuration: 0.5
      },
      name: {
        text: '',
        offset: { x: 0, y: -0.9, z: 0 },
        visible: true
      },
      mobile: {
        particlesCount: 200,
        labelScale: 1.25
      },
      carousel: {
        speed: 0.5,       // interpreted as px per frame at 60 fps
        pauseOnHover: true,
        enabled: true
      }
    };
  }

  static merge(defaultConfig, userConfig) {
    return {
      ...defaultConfig,
      ...userConfig,
      particles: { ...defaultConfig.particles, ...(userConfig.particles || {}) },
      name: { ...defaultConfig.name, ...(userConfig.name || {}) },
      mobile: { ...defaultConfig.mobile, ...(userConfig.mobile || {}) },
      carousel: { ...defaultConfig.carousel, ...(userConfig.carousel || {}) }
    };
  }
}