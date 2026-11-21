import * as THREE from 'three';

export class ModelBuilder {
  // Shared materials for high performance and batching
  private static whiteFurMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.05
  });

  private static goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.25,
    metalness: 0.7,
    emissive: 0xca8a04,
    emissiveIntensity: 0.2
  });

  private static skinMat = new THREE.MeshStandardMaterial({
    color: 0xfed7aa,
    roughness: 0.6
  });

  private static tunicMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.5
  });

  private static hairMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.7
  });

  private static darkEyeMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.2,
    metalness: 0.1
  });

  private static pinkCheekMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.8
  });

  /**
   * Creates the 3D Little Shepherd character
   */
  public static createShepherd(): {
    root: THREE.Group;
    bodyGroup: THREE.Group;
    legs: { left: THREE.Group; right: THREE.Group };
    crook: THREE.Group;
    animateRun: (time: number, speed: number) => void;
  } {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    // 1. Tunic (Blue cone/cylinder)
    const tunicGeo = new THREE.CylinderGeometry(0.24, 0.42, 0.7, 16);
    const tunicMesh = new THREE.Mesh(tunicGeo, this.tunicMat);
    tunicMesh.position.y = 0.65;
    tunicMesh.castShadow = true;
    bodyGroup.add(tunicMesh);

    // Golden Belt
    const beltGeo = new THREE.CylinderGeometry(0.33, 0.35, 0.12, 16);
    const beltMesh = new THREE.Mesh(beltGeo, this.goldMat);
    beltMesh.position.y = 0.58;
    beltMesh.castShadow = true;
    bodyGroup.add(beltMesh);

    // 2. Head
    const headGeo = new THREE.SphereGeometry(0.32, 20, 20);
    const headMesh = new THREE.Mesh(headGeo, this.skinMat);
    headMesh.position.y = 1.18;
    headMesh.castShadow = true;
    bodyGroup.add(headMesh);

    // Cute Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const leftCheek = new THREE.Mesh(cheekGeo, this.pinkCheekMat);
    leftCheek.position.set(-0.16, 1.12, 0.25);
    const rightCheek = leftCheek.clone();
    rightCheek.position.x = 0.16;
    bodyGroup.add(leftCheek, rightCheek);

    // Big Shiny Cartoon Eyes
    const eyeGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const leftEye = new THREE.Mesh(eyeGeo, this.darkEyeMat);
    leftEye.position.set(-0.11, 1.22, 0.28);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.11;

    // Eye catchlights (tiny white sparkles)
    const catchlightGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cl1 = new THREE.Mesh(catchlightGeo, catchlightMat);
    cl1.position.set(-0.1, 1.24, 0.33);
    const cl2 = cl1.clone();
    cl2.position.x = 0.12;
    bodyGroup.add(leftEye, rightEye, cl1, cl2);

    // Curly Hair (clusters of brown rounded spheres)
    const curlGeo = new THREE.SphereGeometry(0.13, 12, 12);
    const curlOffsets = [
      [0, 1.45, 0], [0.18, 1.42, 0.05], [-0.18, 1.42, 0.05],
      [0.26, 1.3, -0.05], [-0.26, 1.3, -0.05],
      [0.2, 1.25, -0.18], [-0.2, 1.25, -0.18], [0, 1.35, -0.25],
      [-0.14, 1.43, -0.14], [0.14, 1.43, -0.14],
      [-0.22, 1.15, -0.12], [0.22, 1.15, -0.12]
    ];
    curlOffsets.forEach(([x, y, z]) => {
      const curl = new THREE.Mesh(curlGeo, this.hairMat);
      curl.position.set(x, y, z);
      curl.castShadow = true;
      bodyGroup.add(curl);
    });

    // 3. Shepherd's Crook (Golden Wooden Staff)
    const crook = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.1, 12);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
    const shaftMesh = new THREE.Mesh(shaftGeo, woodMat);
    shaftMesh.position.y = 0.55;
    shaftMesh.castShadow = true;
    crook.add(shaftMesh);

    // Curved hook at the top
    const hookGeo = new THREE.TorusGeometry(0.12, 0.032, 12, 16, Math.PI * 1.35);
    const hookMesh = new THREE.Mesh(hookGeo, woodMat);
    hookMesh.position.set(-0.09, 1.1, 0);
    hookMesh.rotation.z = Math.PI * 0.15;
    hookMesh.castShadow = true;
    crook.add(hookMesh);

    crook.position.set(0.38, 0.2, 0.05);
    bodyGroup.add(crook);

    // 4. Legs and Boots
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);
    const bootGeo = new THREE.BoxGeometry(0.16, 0.14, 0.26);
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });

    const createLeg = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      const legMesh = new THREE.Mesh(legGeo, this.skinMat);
      legMesh.position.y = -0.12;
      legMesh.castShadow = true;
      legGroup.add(legMesh);

      const bootMesh = new THREE.Mesh(bootGeo, bootMat);
      bootMesh.position.set(0, -0.28, 0.04);
      bootMesh.castShadow = true;
      legGroup.add(bootMesh);

      legGroup.position.set(isLeft ? -0.16 : 0.16, 0.35, 0);
      root.add(legGroup);
      return legGroup;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);

    const animateRun = (time: number, speed: number) => {
      const freq = speed * 0.5;
      const angle = Math.sin(time * freq) * 0.6;
      leftLeg.rotation.x = angle;
      rightLeg.rotation.x = -angle;

      // Slight cheerful bobbing
      bodyGroup.position.y = Math.abs(Math.sin(time * freq)) * 0.08;
      // Crook gentle sway
      crook.rotation.x = Math.sin(time * freq * 0.5) * 0.2;
    };

    return {
      root,
      bodyGroup,
      legs: { left: leftLeg, right: rightLeg },
      crook,
      animateRun
    };
  }

  /**
   * Creates an adorable fluffy 3D Cloud Sheep
   */
  public static createSheep(): THREE.Group {
    const sheep = new THREE.Group();

    // Cloud fluffy body (12 intersecting white spheres)
    const sphereOffsets = [
      [0, 0.5, 0, 0.38],
      [0.22, 0.52, 0.1, 0.28],
      [-0.22, 0.52, 0.1, 0.28],
      [0.18, 0.52, -0.2, 0.28],
      [-0.18, 0.52, -0.2, 0.28],
      [0, 0.68, -0.05, 0.3],
      [0, 0.42, 0.22, 0.25],
      [0.24, 0.45, -0.05, 0.26],
      [-0.24, 0.45, -0.05, 0.26],
      [0, 0.42, -0.22, 0.26]
    ];

    sphereOffsets.forEach(([x, y, z, r]) => {
      const geo = new THREE.SphereGeometry(r, 14, 14);
      const mesh = new THREE.Mesh(geo, this.whiteFurMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sheep.add(mesh);
    });

    // Cute Head
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfdf2f8, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.62, 0.36);
    head.castShadow = true;
    sheep.add(head);

    // Pink Ears
    const earGeo = new THREE.ConeGeometry(0.08, 0.2, 12);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.8 });
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.24, 0.65, 0.32);
    leftEar.rotation.set(0, 0, Math.PI * 0.4);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.24;
    rightEar.rotation.z = -Math.PI * 0.4;
    sheep.add(leftEar, rightEar);

    // Happy closed eyes (^ ^)
    const eyeGeo = new THREE.TorusGeometry(0.04, 0.015, 8, 12, Math.PI);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.09, 0.66, 0.57);
    leftEye.rotation.x = Math.PI;

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.09;
    sheep.add(leftEye, rightEye);

    // Rosy Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const leftCheek = new THREE.Mesh(cheekGeo, this.pinkCheekMat);
    leftCheek.position.set(-0.14, 0.58, 0.52);
    const rightCheek = leftCheek.clone();
    rightCheek.position.x = 0.14;
    sheep.add(leftCheek, rightCheek);

    // 4 cute black hooves
    const hoofGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 10);
    const hoofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const hoofPositions = [
      [-0.15, 0.12, 0.16],
      [0.15, 0.12, 0.16],
      [-0.15, 0.12, -0.16],
      [0.15, 0.12, -0.16]
    ];
    hoofPositions.forEach(([hx, hy, hz]) => {
      const hoof = new THREE.Mesh(hoofGeo, hoofMat);
      hoof.position.set(hx, hy, hz);
      hoof.castShadow = true;
      sheep.add(hoof);
    });

    return sheep;
  }

  /**
   * Creates a 3D Golden Star with bevels and shine
   */
  public static createStar(): THREE.Group {
    const group = new THREE.Group();

    // 5-Pointed Star Shape
    const shape = new THREE.Shape();
    const spikes = 5;
    const outerRadius = 0.35;
    const innerRadius = 0.16;

    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    shape.moveTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
    for (let i = 0; i < spikes; i++) {
      rot += step;
      shape.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
      rot += step;
      shape.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
    }

    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04
    };

    const starGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    starGeo.center();

    const starMesh = new THREE.Mesh(starGeo, this.goldMat);
    starMesh.castShadow = true;
    group.add(starMesh);

    return group;
  }

  /**
   * Creates a 3D Surprise Box (?) with glossy yellow finish
   */
  public static createSurpriseBox(): THREE.Group {
    const group = new THREE.Group();

    // Yellow Box
    const boxGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0xb45309,
      emissiveIntensity: 0.15
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    group.add(boxMesh);

    // Corner Rivet studs
    const studGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const studMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
    const offsets = [
      [-0.38, 0.38, 0.43], [0.38, 0.38, 0.43],
      [-0.38, -0.38, 0.43], [0.38, -0.38, 0.43]
    ];
    offsets.forEach(([sx, sy, sz]) => {
      const stud = new THREE.Mesh(studGeo, studMat);
      stud.position.set(sx, sy, sz);
      group.add(stud);
    });

    // Create '?' canvas texture for front and sides
    const cvs = document.createElement('canvas');
    cvs.width = 128;
    cvs.height = 128;
    const ctx = cvs.getContext('2d')!;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 128, 128);
    ctx.font = 'bold 84px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 10;
    ctx.strokeText('?', 64, 68);
    ctx.fillText('?', 64, 68);

    const qTex = new THREE.CanvasTexture(cvs);
    const qMat = new THREE.MeshBasicMaterial({ map: qTex });
    const qPlane = new THREE.PlaneGeometry(0.65, 0.65);
    const qMesh = new THREE.Mesh(qPlane, qMat);
    qMesh.position.z = 0.43;
    group.add(qMesh);

    return group;
  }

  /**
   * Creates a 3D Rainbow Turbo Ramp
   */
  public static createTurboRamp(): THREE.Group {
    const group = new THREE.Group();
    const colors = [0xef4444, 0xf97316, 0xeab308, 0x22c55e, 0x3b82f6, 0x8b5cf6];
    const width = 1.8;
    const length = 2.4;
    const height = 0.45;

    // Wedge ramp
    const shape = new THREE.Shape();
    shape.moveTo(-length / 2, 0);
    shape.lineTo(length / 2, height);
    shape.lineTo(length / 2, 0);
    shape.closePath();

    const rampMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3
    });

    // Rainbow stripes
    const stripeWidth = width / colors.length;
    colors.forEach((c, idx) => {
      const stripeGeo = new THREE.BoxGeometry(length, 0.08, stripeWidth);
      const stripeMat = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.3,
        emissive: c,
        emissiveIntensity: 0.3
      });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, height * 0.48, -width / 2 + (idx + 0.5) * stripeWidth);
      stripe.rotation.z = Math.atan2(height, length);
      stripe.castShadow = true;
      stripe.receiveShadow = true;
      group.add(stripe);
    });

    return group;
  }

  /**
   * Creates a 3D Cartoon Rock
   */
  public static createRock(): THREE.Group {
    const group = new THREE.Group();
    const rockGeo = new THREE.DodecahedronGeometry(0.38, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.scale.set(1.2, 0.8, 1);
    rock.position.y = 0.25;
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);

    // Moss tuft on top
    const mossGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 });
    const moss = new THREE.Mesh(mossGeo, mossMat);
    moss.position.set(0.08, 0.5, 0.05);
    group.add(moss);

    return group;
  }

  /**
   * Creates a 3D Berry Bush
   */
  public static createBush(): THREE.Group {
    const group = new THREE.Group();
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.5 });

    const spheres = [
      [0, 0.32, 0, 0.34],
      [-0.2, 0.26, 0.1, 0.26],
      [0.2, 0.26, 0.1, 0.26],
      [0, 0.3, -0.18, 0.24]
    ];
    spheres.forEach(([x, y, z, r]) => {
      const geo = new THREE.SphereGeometry(r, 12, 12);
      const mesh = new THREE.Mesh(geo, leafMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });

    // Berries
    const berryGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const b1 = new THREE.Mesh(berryGeo, berryMat);
    b1.position.set(-0.12, 0.35, 0.25);
    const b2 = new THREE.Mesh(berryGeo, berryMat);
    b2.position.set(0.14, 0.38, 0.22);
    group.add(b1, b2);

    return group;
  }

  /**
   * Creates a 3D Shiny Water Puddle
   */
  public static createPuddle(): THREE.Group {
    const group = new THREE.Group();
    const puddleGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.02, 24);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85
    });
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.position.y = 0.01;
    puddle.scale.set(1.4, 1, 0.9);
    puddle.receiveShadow = true;
    group.add(puddle);

    return group;
  }

  /**
   * Creates the Giant Smiling 3D Sun
   */
  public static createSun(): THREE.Group {
    const sunGroup = new THREE.Group();

    // Central sphere
    const sunGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // 8 Rotating Spherical Rays
    const rayGeo = new THREE.SphereGeometry(0.38, 12, 12);
    const rayMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 0);
      sunGroup.add(ray);
    }

    // Cute Eyes & Smile
    const eyeGeo = new THREE.SphereGeometry(0.14, 10, 10);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.55, 0.2, 1.45);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.55;
    sunGroup.add(leftEye, rightEye);

    // Smile
    const smileGeo = new THREE.TorusGeometry(0.5, 0.08, 10, 16, Math.PI * 0.7);
    const smileMesh = new THREE.Mesh(smileGeo, eyeMat);
    smileMesh.position.set(0, -0.15, 1.45);
    smileMesh.rotation.z = Math.PI * 1.15;
    sunGroup.add(smileMesh);

    return sunGroup;
  }

  /**
   * Creates the 3D Rainbow Arch
   */
  public static createRainbow(): THREE.Group {
    const rainbowGroup = new THREE.Group();
    const colors = [0xf43f5e, 0xfb923c, 0xfacc15, 0x4ade80, 0x38bdf8, 0xa855f7];
    const baseRadius = 24;
    const bandWidth = 0.45;

    colors.forEach((c, idx) => {
      const tubeGeo = new THREE.TorusGeometry(baseRadius - idx * bandWidth, bandWidth * 0.45, 12, 48, Math.PI);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: 0.85
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.rotation.x = Math.PI * 0.5;
      rainbowGroup.add(tube);
    });

    return rainbowGroup;
  }

  /**
   * Creates a 3D Cloud
   */
  public static createCloud(): THREE.Group {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.9
    });

    const puffs = [
      [0, 0, 0, 1.0],
      [0.9, -0.1, 0, 0.75],
      [-0.9, -0.1, 0, 0.75],
      [0.5, 0.35, 0.2, 0.7],
      [-0.5, 0.35, -0.2, 0.7]
    ];
    puffs.forEach(([x, y, z, r]) => {
      const geo = new THREE.SphereGeometry(r, 14, 14);
      const mesh = new THREE.Mesh(geo, cloudMat);
      mesh.position.set(x, y, z);
      group.add(mesh);
    });

    return group;
  }
}
