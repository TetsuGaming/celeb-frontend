import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import * as THREE from 'three/build/three.module.js';

@Component({
  selector: 'cg-character-animation',
  templateUrl: './character-animation.component.html',
  styleUrls: [ './character-animation.component.scss' ],
})
export class CharacterAnimationComponent implements OnInit {

  @Output() animationLoaded = new EventEmitter<boolean>();

  ngOnInit() {
    let scene, renderer, camera, stats;
    let model, skeleton, mixer, clock;

    let idleAction, walkAction, runAction;
    let idleWeight, walkWeight, runWeight;
    let actions;

    init.bind(this)();

    function init() {

      const container = document.getElementById('container');

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.set(1, 2, -3);
      camera.lookAt(0, 1, 0);

      clock = new THREE.Clock();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xa0a0a0);
      scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff);
      dirLight.position.set(-3, 10, -10);
      dirLight.castShadow = true;
      dirLight.shadow.camera.top = 2;
      dirLight.shadow.camera.bottom = -2;
      dirLight.shadow.camera.left = -2;
      dirLight.shadow.camera.right = 2;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 40;
      scene.add(dirLight);

      // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

      // ground

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({
        color: 0x999999,
        depthWrite: false
      }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const loader = new GLTFLoader();
      loader.load('assets/3dModel/Soldier.glb', (gltf) => {
        model = gltf.scene;
        scene.add(model);
        model.traverse(function (object) {
          if (object.isMesh) object.castShadow = true;
        });

        skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

        const animations = gltf.animations;
        mixer = new THREE.AnimationMixer(model);

        idleAction = mixer.clipAction(animations[0]);
        walkAction = mixer.clipAction(animations[3]);
        runAction = mixer.clipAction(animations[1]);

        actions = [ idleAction, walkAction, runAction ];

        activateAllActions();

        animate();
        this.animationLoaded.emit();

      });

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // @ts-ignore
      stats = new Stats();
      container.appendChild(stats.dom);

      window.addEventListener('resize', onWindowResize);

    }

    function activateAllActions() {
      setWeight(idleAction, 0.0);
      setWeight(walkAction,  1.0);
      setWeight(runAction, 0.0);
      actions.forEach((action) => action.play());
    }

    function setWeight(action, weight) {

      action.enabled = true;
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(weight);

    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {

      // Render loop

      requestAnimationFrame(animate);

      idleWeight = idleAction.getEffectiveWeight();
      walkWeight = walkAction.getEffectiveWeight();
      runWeight = runAction.getEffectiveWeight();

      let mixerUpdateDelta = clock.getDelta();

      // Update the animation mixer, the stats panel, and render this frame
      mixer.update(mixerUpdateDelta);
      stats.update();

      renderer.render(scene, camera);

    }
  }

}
