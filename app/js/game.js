// global variables

var SCREEN_WIDTH, SCREEN_HEIGHT, DPR;
var renderer, scene, camera, composer, clock;
var player, cubes, enemies, particles;
var mouseX, mouseY, speed;



// maker functions


var makeCube = function(hexColor, edgeLength) {
  var x = .15*((Math.random() * SCREEN_WIDTH * DPR) - (SCREEN_WIDTH * DPR / 2));
  var y = .15*((Math.random() * SCREEN_HEIGHT * DPR) - (SCREEN_HEIGHT * DPR / 2));
  var z = Math.random() * camera.position.z - 1000;
  var e = edgeLength || Math.random()*2 + 1.5;
  var cube = new THREE.Mesh(new THREE.BoxGeometry(e, e, e), new THREE.MeshLambertMaterial({ color : hexColor || 0x2BF149 }) );
  cube.radius = e;
  cube.overdraw = true;
  cube.position.set(x, y, z);
  cube.castShadow = true;
  glowifyMesh(cube);
  scene.add( cube );
  return cube;
};

var makeCubes = function(cubeCount){
  var cubes = [];
  cubeCount = cubeCount || 15;
  for (var i = 0; i<cubeCount; i++){
    cubes.push(makeCube(0x2BF149)); // green
  }
  return cubes
};

var makeEnemies = function(enemyCount){
  var enemies = [];
  enemyCount = enemyCount || 10;
  for( var i = 0; i < enemyCount; i++ ){
    var x = makeCube(0x50D8F4, Math.random()*5+10); //blue
    enemies.push(x)
  }
  return enemies;
};

var makeParticle = function(particle){
  var px = (Math.random() * SCREEN_WIDTH * DPR) - (SCREEN_WIDTH * DPR / 2);
  var py = (Math.random() * SCREEN_HEIGHT * DPR) - (SCREEN_HEIGHT * DPR / 2);
  var pz = Math.random() * player.position.z * 1.7;
  var vx = Math.random();
  var vy = Math.random();
  if (particle){
    particle.x = px;
    particle.y = py;
    particle.z = 0;
    particle.velocity.x = vx;
    particle.velocity.y = vy;
    particle.velocity.z = speed;
  } else {
    particle = new THREE.Vector3(px, py, pz);
    particle.velocity = new THREE.Vector3(vx, vy, speed);
  }
  return particle;
};


// initialization functions

var initializeRenderer = function(){
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    precision: 'highp',
    preserveDrawingBuffer: true
  });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.shadowMapEnabled = true;
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  document.body.appendChild(renderer.domElement);
};

var initializeParticles = function(particleCount){
  var particleVertices = new THREE.Geometry();
  for (var p = 0; p < particleCount; p++){
    particleVertices.vertices.push(makeParticle());
  }
  var particleMaterial = new THREE.PointCloudMaterial({color: 0xffffff, size: 2, blending: THREE.AdditiveBlending, transparent: true});
  particles = new THREE.PointCloud(particleVertices, particleMaterial);
  particles.sortParticles = true;
  scene.add(particles);
};

var initializePlayer = function(){
  player = new PlayerCharacter();
  player.lives = 5;
  player.position.set(0,0,500);
  scene.add(player);
};

var initializeTargets = function(){
  cubes = makeCubes(15);
};

var initializeEnemies = function(){
  enemies = makeEnemies(10);
};

var initializeLights = function(){
  scene.add(new THREE.HemisphereLight(0xEC752A, 0x505AF4, 0.9));
  var floorLight = new THREE.SpotLight(0xF4F6B1); // bright yellow/white
  floorLight.castShadow = true;
  floorLight.shadowDarkness = 0.5;
  floorLight.shadowMapWidth = 1024;
  floorLight.shadowMapHeight = 1024;
  floorLight.shadowCameraNear = 1;
  floorLight.shadowCameraFar = 1000;
  floorLight.target = player;
  floorLight.position.set(0, 500, player.position.z);
  scene.add( floorLight );
};

var initializeScene = function(){
  scene = new THREE.Scene();
  speed = 2;
};

var initializeCamera = function(){
  camera = new THREE.PerspectiveCamera (35, (SCREEN_WIDTH * DPR) / (SCREEN_HEIGHT * DPR), 5, 5000);
  camera.position.set(player.position.x, player.position.y, player.position.z*1.7);
  camera.lookAt(scene.position);
};

var initializePostProcessing = function(){
  var renderModel = new THREE.RenderPass(scene, camera);
  var effectBloom = new THREE.BloomPass(1);
  var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
  var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
  composer = new THREE.EffectComposer(renderer);
  clock = new THREE.Clock();
  effectFXAA.uniforms['resolution'].value = new THREE.Vector2(1/(SCREEN_WIDTH * DPR), 1/(SCREEN_HEIGHT * DPR));
  effectBloom.renderTargetX.format = THREE.RGBAFormat;
  effectBloom.renderTargetY.format = THREE.RGBAFormat;
  effectCopy.renderToScreen = true;
  composer.setSize(SCREEN_WIDTH * DPR, SCREEN_HEIGHT * DPR);
  composer.addPass(renderModel);
  composer.addPass(effectBloom);
  composer.addPass(effectFXAA);
  composer.addPass(effectCopy);
};

var initializeControls = function(){
  document.onmousemove = function (e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
    player.position.set((mouseX - (SCREEN_WIDTH / 2)) * 0.25, (-(mouseY - (SCREEN_HEIGHT / 2))) * 0.25, player.position.z);
    return true;
  };

  document.onresize = function(e){
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    DPR = window.devicePixelRatio || 1;
    camera.aspect = (SCREEN_WIDTH * DPR) / (SCREEN_HEIGHT * DPR);
    camera.updateProjectionMatrix();
    renderer.setSize(SCREEN_WIDTH * DPR, SCREEN_HEIGHT * DPR);
  };
};

var init = function(){
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  DPR = window.devicePixelRatio || 1;
  initializeRenderer();
  initializeScene();
  initializePlayer();
  initializeCamera();
  initializeTargets();
  initializeEnemies();
  initializeParticles(300);
  initializeLights();
  initializePostProcessing();
  initializeControls();
};


// setting the floor
//var floor = new THREE.Mesh(new THREE.BoxGeometry(800, 3, 3000), new THREE.MeshLambertMaterial({ color : 0x91FF9E }) );
//floor.position.set(0, -150, -500);
//floor.receiveShadow = true;
//scene.add( floor );
//

// game logic

/**
* checkCollision accepts a target or enemy object and a string telling it 'enemy' or 'target'
* this function calculates the xy distance between the player and the object being passed
* if that distance is less than the combined radius of the player and the object, there is a collision, and the function returns true
*/
var checkCollision = function(obj, type) { // returns boolean
  var dx = player.position.x - obj.position.x;
  var dy = player.position.y - obj.position.y;
  var distance = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy, 2) );
  if(type === 'enemy'){
    if (distance < (obj.radius + player.effectiveRadius() ) && obj.active !== false) { //COLLISION with target *** REPLACE 12 WITH player.radius
      obj.active = false;
      return true;
    } else {
      return false
    }
  }
  if(type === 'target'){
    if (distance < (obj.radius + 12) && obj.active !== false) { //COLLISION with target
      obj.active = false;
      return true;
    } else {
      return false
    }
  }
};

/**
* Colliding with a target levels up the player. The cube is removed from the scene, and a new one is added by instantiating a Cube and pushing it to the cubes array
* The enemy's z speed is increased, and another enemy is added to the scene
*/
var targetCollision = function(obj){
  cubes.push(makeCube() );
  scene.remove(obj);
  player.levelUp();
  speed += 0.1 * player.level;
  player.score += player.level*100;

  enemies.push(makeCube(0x50D8F4, Math.random()*5+10));
  $('#level').html("Level " + player.level);

};

/**
* When a collision occurs with an enemy, the player levels down and loses 1000 points
*/
var enemyCollision = function(enemy){
  player.score -= 400;
  player.levelDown();
  speed -= 0.001 * player.level;
  $('#lives').html("Lives remaining: "+ player.lives);
  $('#level').html("Level " + player.level);
};

/**
* updateTargets is run for every frame.
* We iterate over the cubes array and see if any target is in range for a collision. If they are, we run checkCollision.
* If a target's z position is past the player, and it is no longer possible to collide, the target's position is updated with random x and y coordinates, as well as a z coordinate that pushes it back out of the camera's view. That target can advance forward normally.
* The remaining targets are advanced forward along the z axis
*/
var updateTargets = function(){
  for (var s = 0; s < cubes.length; s++) {
    if( cubes[s].position.z > (player.position.z - cubes[s].radius) && cubes[s].position.z < (player.position.z + cubes[s].radius)) {
      if( checkCollision( cubes[s], 'target') ){
        targetCollision(cubes[s]);
      }
    }
    if( cubes[s].position.z > player.position.z+(camera.position.z - player.position.z)/4) {
      cubes[s].position.z = -710;
      cubes[s].position.x = 0.15*((Math.random() * window.innerWidth) - (window.innerWidth / 2));
      cubes[s].position.y = 0.15*((Math.random() * window.innerWidth) - (window.innerWidth / 2));
    }
    cubes[s].position.z += Math.random()+2;
  }
};


/**
* updateTargets is run for every frame.
* We iterate over the cubes array and see if any target is in range for a collision. If they are, we run checkCollision.
* If a target's z position is past the player, and it is no longer possible to collide, the target's position is updated with random x and y coordinates, as well as a z coordinate that pushes it back out of the camera's view. That target can advance forward normally.
* The remaining targets are advanced forward along the z axis
*/
var updateEnemies = function(){
  for (var e = 0; e < enemies.length; e++){
    if( enemies[e].position.z > (player.position.z - enemies[e].radius) && enemies[e].position.z < (player.position.z + enemies[e].radius)) {
      if( checkCollision(enemies[e], 'enemy') ){
        enemyCollision( enemies[e] );
      }
    }
    if( enemies[e].position.z > player.position.z+(camera.position.z - player.position.z)/4) {
      enemies[e].position.z = -710;
      enemies[e].position.x = 0.2*((Math.random() * window.innerWidth) - (window.innerWidth / 2));
      enemies[e].position.y = 0.2*((Math.random() * window.innerWidth) - (window.innerWidth / 2));
      enemies[e].active = true;
    }
    enemies[e].position.z += speed;
    enemies[e].rotation.y += Math.random()*0.03*(player.level+1);
    enemies[e].rotation.x += Math.random()*0.02;
  }
};



var updateParticles = function(){
  var particlePoints = particles.geometry.vertices;
  for (var i = 0; i < particlePoints.length; i++){
    var particle = particlePoints[i];
    particle.velocity.z = speed;
    particle.add(particle.velocity);
    if (particle.z > camera.position.z){
      makeParticle(particle);
    }
  }
  particles.rotation.z += 0.001;
  particles.geometry.__dirtyVertices = true;
};



/**
* The update fuction generates a new animation frame.
* The background particle system is slowly rotated
* updateTargets() and updateEnemies() are invoked
* player.animate() is invoked
* score is updated
*/
var update = function(){
  updateParticles();
  updateTargets();
  updateEnemies();
  player.animate();
  player.score += player.level;
  $('#score').html(player.score);
  render();
  window.requestAnimationFrame(update);
};

var render = function(){
  var delta = clock.getDelta();
  renderer.autoClear = false;
  composer.render(delta);
};

init();
update();
