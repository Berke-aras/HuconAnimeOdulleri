/**
 * Performance Optimization Engine
 * Low-end device detection & automatic quality adjustment
 */

const PerformanceOptimizer = {
  isLowPerf: false,

  init() {
    this.detectPerformance();
    this.applyOptimizations();
    this.observeMotionPreference();
  },

  detectPerformance() {
    // 1. Check Hardware (Memory/Cores)
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    const isLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    
    // 2. Network Check (Slow connection might imply low-end device/environment)
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && (connection.saveData || /2g|3g/.test(connection.effectiveType));

    if (isLowMemory || isLowCores || isSlowConnection) {
      this.isLowPerf = true;
    }
  },

  applyOptimizations() {
    if (this.isLowPerf) {
      document.body.classList.add('low-perf-device');
      console.log('Performance Optimizer: Low-end device detected. Applying Eco-Mode.');
    }
  },

  observeMotionPreference() {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotion = (e) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    };
    
    motionQuery.addEventListener('change', handleMotion);
    handleMotion(motionQuery);
  }
};

document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());
