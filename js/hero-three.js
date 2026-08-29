/**
 * HERO THREE.JS — Kinetic Industrial Stage Visualization
 * 3D perspective grid with interactive DMX moving light beams
 * Optimized for 60 FPS with IntersectionObserver rendering gate
 */

class HeroThreeScene {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;

    this.isVisible = false;
    this.animationFrameId = null;
    this.mouseLerp = { x: 0, y: 0 };
    this.mouseTarget = { x: 0, y: 0 };

    this.initThree();
    this.initLights();
    this.initGeometry();
    this.setupIntersectionObserver();
    this.attachEventListeners();
  }

  /**
   * Initialize Three.js Scene, Camera, Renderer
   */
  initThree() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0B0C0E, 0.003);

    // Camera setup
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 20, 40);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0B0C0E, 0);
    this.renderer.shadowMap.enabled = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Initialize Lights
   */
  initLights() {
    // Ambient light — subtle overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    this.scene.add(ambientLight);

    // Directional light — stage key light
    const directionalLight = new THREE.DirectionalLight(0xFF9500, 0.6);
    directionalLight.position.set(30, 50, 30);
    this.scene.add(directionalLight);

    // Point lights — DMX beam simulation (will be updated)
    this.beamLights = [];
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(0x00E5FF, 0.8, 100);
      light.position.set(
        Math.sin(i * Math.PI / 2) * 20,
        25,
        Math.cos(i * Math.PI / 2) * 20
      );
      this.scene.add(light);
      this.beamLights.push(light);
    }
  }

  /**
   * Initialize Geometry — Industrial Grid Plane & Beams
   */
  initGeometry() {
    // Grid plane using line segments
    const gridSize = 80;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      0xFF9500,
      0x1C1F26
    );
    gridHelper.position.y = 0;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.5;
    this.scene.add(gridHelper);

    // Perspective grid using custom line geometry
    this.perspectiveGrid = this.createPerspectiveGrid();
    this.scene.add(this.perspectiveGrid);

    // DMX beam cylinders
    this.beams = [];
    for (let i = 0; i < 4; i++) {
      const beam = this.createLightBeam(i);
      this.scene.add(beam);
      this.beams.push(beam);
    }

    // Horizon plane for depth
    const horizonGeometry = new THREE.PlaneGeometry(200, 100);
    const horizonMaterial = new THREE.MeshPhongMaterial({
      color: 0x14161A,
      emissive: 0x0B0C0E,
      wireframe: false,
      side: THREE.DoubleSide
    });
    const horizonMesh = new THREE.Mesh(horizonGeometry, horizonMaterial);
    horizonMesh.position.z = -50;
    horizonMesh.position.y = -1;
    this.scene.add(horizonMesh);
  }

  /**
   * Create Perspective Grid using Line segments
   */
  createPerspectiveGrid() {
    const group = new THREE.Group();
    const gridSize = 80;
    const lines = 10;

    // Horizontal lines receding into depth
    for (let i = -lines; i <= lines; i++) {
      const points = [
        new THREE.Vector3(-gridSize, 0, i * 8),
        new THREE.Vector3(gridSize, 0, i * 8)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: i === 0 ? 0xFF9500 : 0x1C1F26,
        linewidth: 1,
        transparent: true,
        opacity: i === 0 ? 0.8 : 0.3
      });
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    // Vertical lines left-right
    for (let i = -lines; i <= lines; i++) {
      const points = [
        new THREE.Vector3(i * 8, 0, -gridSize),
        new THREE.Vector3(i * 8, 0, gridSize)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: i === 0 ? 0xFF9500 : 0x1C1F26,
        linewidth: 1,
        transparent: true,
        opacity: i === 0 ? 0.8 : 0.3
      });
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    return group;
  }

  /**
   * Create Light Beam (Cone/Cylinder with transparency)
   */
  createLightBeam(index) {
    const group = new THREE.Group();

    // Cone geometry for beam shape
    const coneGeometry = new THREE.ConeGeometry(8, 30, 16);
    const beamColor = index % 2 === 0 ? 0x00E5FF : 0xFF9500;
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: beamColor,
      emissive: beamColor,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.15,
      wireframe: false
    });

    const cone = new THREE.Mesh(coneGeometry, beamMaterial);
    cone.position.y = 25;
    cone.castShadow = true;
    cone.receiveShadow = false;
    group.add(cone);

    // Additional beam line for intensity
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 25, 0),
      new THREE.Vector3(0, -5, 20)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: beamColor,
      linewidth: 2,
      transparent: true,
      opacity: 0.5
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    group.add(line);

    group.userData.index = index;
    group.userData.baseRotationY = (index * Math.PI / 2);

    return group;
  }

  /**
   * Setup IntersectionObserver for Rendering Gate
   */
  setupIntersectionObserver() {
    const heroElement = this.canvas.closest('#hero');
    if (!heroElement) {
      this.isVisible = true;
      this.startRenderLoop();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            if (!this.animationFrameId) {
              this.startRenderLoop();
            }
          } else {
            this.isVisible = false;
            if (this.animationFrameId) {
              cancelAnimationFrame(this.animationFrameId);
              this.animationFrameId = null;
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(heroElement);
  }

  /**
   * Attach Event Listeners
   */
  attachEventListeners() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  /**
   * Mouse Move Handler — Update camera and beam directions
   */
  onMouseMove(event) {
    // Normalize mouse position to -1 to 1 range
    this.mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  /**
   * Start Render Loop
   */
  startRenderLoop() {
    const animate = () => {
      if (!this.isVisible) {
        this.animationFrameId = null;
        return;
      }

      this.animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse lerp for camera perspective
      this.mouseLerp.x += (this.mouseTarget.x - this.mouseLerp.x) * 0.05;
      this.mouseLerp.y += (this.mouseTarget.y - this.mouseLerp.y) * 0.05;

      // Update camera perspective based on mouse
      this.camera.position.x = this.mouseLerp.x * 15;
      this.camera.position.y = 20 + this.mouseLerp.y * 10;
      this.camera.lookAt(0, 0, 0);

      // Update perspective grid rotation
      if (this.perspectiveGrid) {
        this.perspectiveGrid.rotation.x = this.mouseLerp.y * 0.2;
        this.perspectiveGrid.rotation.z = this.mouseLerp.x * 0.1;
      }

      // Update light beams — scanning animation
      this.beams.forEach((beam, index) => {
        const time = Date.now() * 0.001;
        const scanSpeed = 0.5;

        // Base rotation + mouse influence + time-based animation
        const baseRotation = beam.userData.baseRotationY;
        beam.rotation.y = baseRotation + Math.sin(time * scanSpeed + index) * 0.4 + this.mouseLerp.x * 0.3;
        beam.rotation.x = Math.cos(time * scanSpeed * 1.3 + index) * 0.3 + this.mouseLerp.y * 0.2;

        // Pulsing intensity
        const intensity = 0.3 + Math.sin(time * 2 + index * Math.PI / 2) * 0.2;
        beam.children[0].material.opacity = intensity;
        if (beam.children[1]) {
          beam.children[1].material.opacity = intensity * 1.5;
        }

        // Update beam light position and direction
        if (this.beamLights[index]) {
          const beamWorldPos = new THREE.Vector3();
          beam.getWorldPosition(beamWorldPos);
          this.beamLights[index].position.copy(beamWorldPos);

          // Subtle light intensity pulse
          this.beamLights[index].intensity = 0.4 + Math.sin(time + index) * 0.3;
        }
      });

      // Render scene
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Window Resize Handler
   */
  onWindowResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.dispose();
    this.scene.clear();
  }
}

/**
 * Initialize Three.js scene when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.heroThreeScene = new HeroThreeScene();
  });
} else {
  window.heroThreeScene = new HeroThreeScene();
}
