/**
 * Creates a new PlayerCharacter object ready to add to the scene.
 * @constructor
 * @classdesc A wrapper for the various mesh objects that comprise the player
 *     character model and its associated logic. Extends {@link external THREE:Object3D}.
 */
var PlayerCharacter = function (lives) {
  THREE.Object3D.call(this);
  this.level = 0;
  this.score = 0;
  this.layers = [];
  this.lives = lives || 5;
  this.baseRing = glowifyMesh(new THREE.Mesh(new THREE.RingGeometry3D(15, 13, 3, 56, 8, 8), randomMaterial('r')));
  this.baseRingSplit = glowifyMesh(new THREE.Mesh(new THREE.RingGeometry3D(15, 13, 3, 36, 2, 3, 0, 16*Math.PI/9), this.baseRing.material));
  this.layers[0] = new THREE.Object3D();
  this.layers[0].add(this.baseRing);
  this.layers[1] = glowifyMesh(new THREE.Mesh(new THREE.RingGeometry3D(20, 18, 6, 36, 2, 3, 0, 14*Math.PI/9), new randomMaterial('r')));
  this.layers[2] = glowifyMesh(new THREE.Mesh(new THREE.RingGeometry3D(25, 23, 4, 42, 2, 3, 0, 4*Math.PI/9), new randomMaterial('r')));
  this.layers[3] = glowifyMesh(new THREE.Mesh(new THREE.RingGeometry3D(30, 28, 8, 56, 2, 3, 0, 10*Math.PI/9), new randomMaterial('r')));
  this.layers[4] = glowifyMesh(new THREE.Mesh(new THREE.RingGeometry3D(35, 33, 5, 62, 2, 3, 0, 8*Math.PI/9), new randomMaterial('r')));
  this.layers[5] = new THREE.RingArray(38);
  this.layers[6] = new THREE.RingArray(45);
  this.add(this.layers[0]);
};

PlayerCharacter.prototype = Object.create(THREE.Object3D.prototype);
PlayerCharacter.prototype.constructor = PlayerCharacter;


/**
 * Increase level by one. Adds new geometry representing the new level.
 * @returns {number} The new player level
 */
PlayerCharacter.prototype.levelUp = function(){
  this.level++;
  if (this.level === 1){
    this.layers[0].remove(this.baseRing);
    this.layers[0].add(this.baseRingSplit);
    this.add(this.layers[1]);
    return this.level;
  }
  if (this.level < 5){
    this.add(this.layers[this.level]);
    return this.level;
  }
  if (this.level === 5){
    this.add(this.layers[5]);
    this.layers[5].add(glowifyMesh(new THREE.Mesh(new THREE.BoxGeometry(2,2,2,2,2,2), randomMaterial('g'))));
    return this.level;
  }
  if (this.level < 25){
    this.layers[5].add(glowifyMesh(new THREE.Mesh(new THREE.BoxGeometry(2,2,2,2,2,2), randomMaterial('g'))));
    return this.level;
  }
  if (this.level === 25){
    this.add(this.layers[6]);
    this.layers[6].add(glowifyMesh(new THREE.Mesh(new THREE.BoxGeometry(8,2,4,4,2,3), randomMaterial('b'))));
    return this.level;
  }
  if (this.level < 38){
    this.layers[6].add(glowifyMesh(new THREE.Mesh(new THREE.BoxGeometry(8,2,4,4,2,3), randomMaterial('b'))));
    return this.level
  }
};
/**
 * Decrease level by one. Removes relevant geometry.
 * @returns {number} The new player level
 */
PlayerCharacter.prototype.levelDown = function(){
  this.level--;
  this.lives--;
  if (this.lives < 0) {
    localStorage.setItem('playerScore', JSON.stringify(this.score));
    window.location = 'gameover.html';
  }
  if (this.level > 24){
    this.layers[6].remove(this.layers[6].children[this.layers[6].children.length - 1]);
    return this.level;
  }
  if (this.level === 24){
    this.layers[6].remove(this.layers[6].children[this.layers[6].children.length - 1]);
    this.remove(this.layers[6]);
    return this.level;
  }
  if (this.level > 4){
    this.layers[5].remove(this.layers[5].children[this.layers[5].children.length - 1]);
    return this.level;
  }
  if (this.level === 4){
    this.layers[5].remove(this.layers[5].children[this.layers[5].children.length - 1]);
    this.remove(this.layers[5]);
    return this.level;
  }
  if (this.level > 0){
    this.remove(this.layers[this.level + 1]);
    return this.level
  }
  if (this.level === 0){
    this.layers[0].remove(this.baseRingSplit);
    this.layers[0].add(this.baseRing);
    this.remove(this.layers[1]);
    return this.level;
  }
  if (this.level < 0){
    this.level = 0;
  }
};

/**
 * Animation cycle for the player model. Must be invoked during the game's main animation cycle.
 * Rotates various layers by varying degrees per cycle.
 */
PlayerCharacter.prototype.animate = function(){
  this.layers[0].rotation.z -= 0.01;
  this.layers[1].rotation.z += 0.03;
  this.layers[2].rotation.z -= 0.02;
  this.layers[3].rotation.z += 0.015;
  this.layers[4].rotation.z -= 0.04;
  this.layers[5].rotation.z += 0.05;
  this.layers[6].rotation.z -= 0.005;
};

/**
 * Gets the effective radius of the player model. This is the radius of the outermost
 * active layer of geometry. Used for simple collision detection.
 * @returns {number} The effective radius of the player model.
 */
PlayerCharacter.prototype.effectiveRadius = function(){
  if (this.level === 0) return 15;
  if (this.level === 1) return 20;
  if (this.level === 2) return 25;
  if (this.level === 3) return 30;
  if (this.level === 4) return 35;
  if (this.level < 25) return this.layers[5].radius + 1;
  if (this.level < 38) return this.layers[6].radius + 4;
};

/**
 * Helper function for generating a random colored material from lists of predefined colors.
 * @param {string} color The base color, 'r', 'g', or 'b'
 * @returns {THREE.MeshLambertMaterial}
 */
var randomMaterial = function(color){
  var r = [0xFF4911, 0xE8260C, 0xFF0000, 0xE80C63, 0xFF0DCE];
  var g = [0x11FF7E, 0x0CE83E, 0x00FF00, 0x49E80C, 0x95FF0D];
  var b = [0x7911FF, 0x3C0CE8, 0x0000FF, 0x0C3BE8, 0x0D74FF];
  if (color === 'r'){
    color = r[Math.floor(Math.random() * r.length)];
  } else if (color === 'g'){
    color = g[Math.floor(Math.random() * g.length)];
  } else if (color === 'b'){
    color = b[Math.floor(Math.random() * b.length)];
  } else {
    color = [r,g,b][Math.floor(Math.random() * 3)][Math.floor(Math.random() * 5)];
  }
  var mat = new THREE.MeshLambertMaterial({color: color});
  mat.castShadow = true;
  return mat;
};

/**
 * Helper function for adding glow to a mesh. Glow will take its color from the
 * material already on the mesh, but decreases saturation and increases lightness.
 *
 * This method modifies the mesh in place. It returns the glowified mesh only
 * to allow convenient method chaining. You do not need to assign the return from
 * this method to anything. If the mesh is already in the scene, there is no need
 * to re-add it to the scene.
 * @param {THREE.Mesh} mesh The mesh to glowify
 * @returns {THREE.Mesh} The glowified mesh, to allow chaining
 */
var glowifyMesh = function(mesh){
  var gMesh = new THREEx.GeometricGlowMesh(mesh);
  var glowColor = mesh.material.color.clone();
  var hsl = glowColor.getHSL();
  hsl.s *= 0.5;
  hsl.l *= 1.5;
  glowColor.setHSL(hsl.h, hsl.s, hsl.l);
  gMesh.insideMesh.material.uniforms.glowColor.value.set(glowColor);
  gMesh.outsideMesh.material.uniforms.glowColor.value.set(glowColor);
  mesh.add(gMesh.object3d);
  return mesh;
};

