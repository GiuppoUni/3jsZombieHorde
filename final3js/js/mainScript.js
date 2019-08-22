var world, mass, body, shape, timeStep = 1 / 60, geometry, material, mesh;
var scene, camera, renderer, controls;
var meshFloor, ambientLight, light;
var weapon;
var sphereShape, balls = [], ballMeshes = [];
var newmaterial;
var ballmaterial;
var noZombie=true;
var playerSphereBody ;
var crate, crateTexture, crateNormalMap, crateBumpMap;
var zombieWave=1;
//Zombie mesh global vars
var zombieAnimated, wallsArray = [];
var zombieAnimatedArray = [];
//var zombieROOT = [];
//var flagHit=false;
//var counterDrop=0;

var keyboard = {};
var player = { height: 1.8, speed: 0.2, turnSpeed: Math.PI * 0.02 };
var USE_WIREFRAME = false;

var objects = [];
//var boxBody;
//var boxMesh;
var boxShape, boxGeometry;
var collisionboxes = [];
var collisionboxMeshes = [];


var raycaster;
initCannon();

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();

var SUOtime = Date.now()
function htmlInit(){


var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
console.log(instructions)
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

	var element = document.body;

	var pointerlockchange = function ( event ) {

		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

			controls.enabled = true;

			blocker.style.display = 'none';

		} else {

			controls.enabled = false;

			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';

		}

	}

	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	}

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

	instructions.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {

			var fullscreenchange = function ( event ) {

				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

					element.requestPointerLock();
				}

			}

			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();

		} else {

			element.requestPointerLock();

		}

	}, false );

} else {

	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}
}

function initCannon() {
	// Setup our world
	world = new CANNON.World();
	world.quatNormalizeSkip = 0;
	world.quatNormalizeFast = false;

	var solver = new CANNON.GSSolver();

	world.defaultContactMaterial.contactEquationStiffness = 1e9;
	world.defaultContactMaterial.contactEquationRelaxation = 4;

	solver.iterations = 7;
	solver.tolerance = 0.1;
	var split = true;
	if (split)
		world.solver = new CANNON.SplitSolver(solver);
	else
		world.solver = solver;

	world.gravity.set(0, -20, 0);
	world.broadphase = new CANNON.NaiveBroadphase();

	// Create a slippery material (friction coefficient = 0.0)
	physicsMaterial = new CANNON.Material("slipperyMaterial");
	var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
		physicsMaterial,
		0.0, // friction coefficient
		0.3  // restitution
	);
	// We must add the contact materials to the world
	world.addContactMaterial(physicsContactMaterial);

	// Create a sphere
	var mass = 5, radius = 1.3;
	sphereShape = new CANNON.Sphere(radius);


	// Create a plane
	var groundShape = new CANNON.Plane();
	var groundBody = new CANNON.Body({ mass: 0 });
	groundBody.addShape(groundShape);
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
	world.addBody(groundBody);
}

function init() {
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	geometry = new THREE.PlaneGeometry(300, 300, 50, 50);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));

	material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
	ballmaterial = new THREE.MeshLambertMaterial({ color: 0xddffff });
	mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add(mesh);

	createPlayer();
	  // Create a sphere
	  var mass = 5, radius = 1.3;
//	  var boxShape = new CANNON.Box( new CANNON.Vec3(0.5, 0.8 ,0.5)  );
	  sphereShape = new CANNON.Sphere(radius  );
	//   var slipperyMaterial = new CANNON.Material();
	// 	slipperyMaterial.friction = 0;
	// 	sphereShape.material=slipperyMaterial
	  playerSphereBody = new CANNON.Body({ mass: mass });
	  playerSphereBody.addShape(sphereShape);
	  playerSphereBody.position.set(0,5,0);
	  playerSphereBody.linearDamping = 0.98;
	  //playerSphereBody.angularDamping = 1;
	  
	  world.addBody(playerSphereBody);

	controls = new PointerLockControls(camera,playerSphereBody);
	scene.add(controls.getObject());


	ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3, 6, -3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);


	// camera.position.set(0, player.height, -5);
	// camera.lookAt(new THREE.Vector3(0, player.height, 0));

	


	renderer = new THREE.WebGLRenderer({ antialias: false });
	//renderer.setSize(1280, 720);
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;



	htmlInit();



	//  instructions.addEventListener('click', function () {

	//  	controls.enabled=true;

	//  }, false);

	// controls.addEventListener('lock', function () {

	// 	instructions.style.display = 'none';
	// 	//		blocker.style.display = 'none';

	// });

	// controls.addEventListener('unlock', function () {

	// 	//		blocker.style.display = 'block';
	// 	instructions.style.display = '';

	// });

	
	// var onKeyDown = function (event) {

	// 	if (controls.isLocked === false && event.keyCode != 13)
	// 		return;	//STOP KEYS
	// 	switch (event.keyCode) {

	// 		case 38: // up
	// 		case 87: // w
	// 			moveForward = true;
	// 			break;

	// 		case 37: // left
	// 		case 65: // a
	// 			moveLeft = true;
	// 			break;

	// 		case 40: // down
	// 		case 83: // s
	// 			moveBackward = true;
	// 			break;

	// 		case 39: // right
	// 		case 68: // d
	// 			moveRight = true;
	// 			break;

	// 		case 32: // space
	// 			if (canJump === true) velocity.y += 100;
	// 			canJump = false;
	// 			break;
	// 		case 13:	//Enter
	// 			resume = true;
	// 			break;

		
	// 		case 73: //left
	// 			boxLeft = true;
	// 			break;
	// 		case 74:  //up
	// 			boxForward = true;
	// 			break;
	// 		case 75:  //right
	// 			boxRight = true;
	// 			break;
	// 		case 76:  //down
	// 			boxBackward = true;
	// 			break;

	// 	}

	//	}

	// var onKeyUp = function (event) {

	// 	switch (event.keyCode) {

	// 		case 38: // up
	// 		case 87: // w
	// 			moveForward = false;
	// 			break;

	// 		case 37: // left
	// 		case 65: // a
	// 			moveLeft = false;
	// 			break;

	// 		case 40: // down
	// 		case 83: // s
	// 			moveBackward = false;
	// 			break;

	// 		case 39: // right
	// 		case 68: // d
	// 			moveRight = false;
	// 			break;
	// 		case 13:
	// 			resume = false;
	// 			break;

	// 		case 73: //left
	// 			boxLeft = false;
	// 			break;
	// 		case 74:  //up
	// 			boxForward = false;
	// 			break;
	// 		case 75:  //right
	// 			boxRight = false;
	// 			break;
	// 		case 76:  //down
	// 			boxBackward = false;
	// 			break;

	// 	}

	// };

	// document.addEventListener('keydown', onKeyDown, false);
	// document.addEventListener('keyup', onKeyUp, false);


	//Meshes imports

	initLoading();


	//importScenario();






	raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);


	document.body.appendChild(renderer.domElement);

	animate();

	window.addEventListener('resize', onWindowResize, false);
							
}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}



var projector = new THREE.Projector();
function getShootDir(targetVec) {
	var vector = targetVec;
	targetVec.set(0, 0, 1);
	vector.unproject(camera);
	var ray = new THREE.Ray(playerSphereBody.position, vector.sub(playerSphereBody.position).normalize() );
	targetVec.copy(ray.direction);
	console.log(targetVec);

	
}
function fireBullet() {

	var ballShape = new CANNON.Sphere(0.2);
	var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
	var shootDirection = new THREE.Vector3();
	var shootVelo = 20;
	var x = playerSphereBody.position.x;
	var y = playerSphereBody.position.y;
	var z = playerSphereBody.position.z;
	var ballBody = new CANNON.Body({ mass: 1 });
	ballBody.name = "bullet"
	ballBody.addShape(ballShape);

	var ballMesh = new THREE.Mesh(ballGeometry, ballmaterial);
	ballBody.myMesh = ballMesh;
	ballMesh.castShadow = true;
	ballMesh.receiveShadow = true;
	balls.push(ballBody);
	ballMeshes.push(ballMesh);


	getShootDir(shootDirection);

	ballBody.velocity.set(shootDirection.x * shootVelo,
		shootDirection.y * shootVelo,
		shootDirection.z * shootVelo);

	// Move the ball outside the player sphere
	x += shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius);
	y += shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius);
	z += shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius);

	ballBody.position.set(x, y, z);
	ballMesh.position.set(x, y, z);
	ballBody.life = 0;
	ballBody.postStep = () => {
		ballBody.life++
		if (ballBody.life > 200) {
			byeMeshBody(ballBody)
		}
	}

	world.addBody(ballBody);
	scene.add(ballMesh);
}

window.addEventListener("click", function (e) {

	fireBullet();
});




function removeUselessBodies() {
	uselessBodies.forEach(e => world.remove(e))
}
function removeUselessMeshes() {
	uselessMeshes.forEach(e => scene.remove(e))
}


function updatePositions(delta) {


	// Update ball positions
	for (var i = 0; i < balls.length; i++) {
		ballMeshes[i].position.copy(balls[i].position);
		ballMeshes[i].quaternion.copy(balls[i].quaternion);
	}

	for (var i = 0; i < collisionboxes.length && collisionboxMeshes.length; i++) {
		collisionboxMeshes[i].position.copy(collisionboxes[i].position);
		collisionboxMeshes[i].quaternion.copy(collisionboxes[i].quaternion);
	}

	if (zombieROOT.length == collisionboxes.length) {
		for (var i = 0; i < zombieROOT.length; i++) {
			zombieFollowsCharacter(i, delta);


			zombieROOT[i].position.copy(collisionboxes[i].position);
			zombieROOT[i].quaternion.copy(collisionboxes[i].quaternion);
			if (collisionboxes[i].barGui) {
				collisionboxes[i].barGui.position.copy(collisionboxes[i].position)
				collisionboxes[i].barGui.position.y += 1;
			}

		}
	}
	for (var i = 0; i < collisionboxes1.length; i++) {
		meshesArray[i].position.copy(collisionboxes1[i].position);
		meshesArray[i].quaternion.copy(collisionboxes1[i].quaternion);
	}
	for (var i = 0; i < collisionboxes1.length; i++) {
		collisionboxMeshes1[i].position.copy(collisionboxes1[i].position);
		collisionboxMeshes1[i].quaternion.copy(collisionboxes1[i].quaternion);


	}

	playerBox.position.copy(playerBoxBody.position)
	playerBox.quaternion.copy(playerBoxBody.quaternion);
	//if(playerBoxBody)
	//	camera.position.copy(playerBoxBody.position)

}

//var clock = new THREE.Clock();

const walkSpeed = 1.0

let then = 0;
var dt = 1 / 60;

///////////////////////////////////////// RENDER LOOP ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

function animate(now) {

	now *= 0.001;  // make it seconds
	const myDelta = now - then;
	then = now;


	// Play the loading screen until resources are loaded.
	if (RESOURCES_LOADED == false) {
		requestAnimationFrame(animate);

		loadingScreen.box.position.x -= 0.05;
		if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	//GENERATE THE ZOMBIE WAAAAVE
	if (noZombie==true) {
		console.log("INCOMING WAVE NUMBER ", zombieWave);
		for (var i = 0; i < zombieMap.length; i++) {
				for (var j = 0; j < zombieMap[i].length; j++) {
					if (zombieMap[i][j]>0 && zombieMap[i][j]<=zombieWave) {
						importZombie(i,j);
						zombieAlive++;
					}
				}
			}
			zombieWave++;
			noZombie=false;
	}


	requestAnimationFrame(animate);

	if (controls.enabled) {
		updatePositions(myDelta);
		world.step(dt);
	}
	removeUselessBodies();
	removeUselessMeshes();




	//camera.position.copy(playerBoxBody.position)



	/*
	if (zombieROOT.scene && flagHit && counterDrop<50) {
		zombieROOT.scene.rotation.x-=0.05;
		counterDrop+=1;
		//console.log(counterDrop);
	}

	if (counterDrop>=300) {
		flagHit=false;
		counterDrop=0;
	}
	*/

	// raycaster.ray.origin.copy(controls.getObject().position);
	// raycaster.ray.origin.y -= 10;

	// var intersections = raycaster.intersectObjects(objects);

	// var onObject = intersections.length > 0;

	var time = performance.now();
	var delta = (time - prevTime) / 1000.0;
	prevTime = time;


	// velocity.x -= velocity.x * 10.0 * delta;
	// velocity.z -= velocity.z * 10.0 * delta;

	// velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

	// direction.z = Number(moveForward) - Number(moveBackward);
	// direction.x = Number(moveLeft) - Number(moveRight);
	// direction.normalize(); // this ensures consistent movements in all directions

	// if (moveForward || moveBackward) velocity.z = - direction.z * 400.0 * delta;
	// if (moveLeft || moveRight) velocity.x = - direction.x * 400.0 * delta;

	//	playerBoxBody.position.x += velocity.x * delta ;
	//playerBoxBody.position.y += velocity.y * delta; // new behavior
	//	playerBoxBody.position.z += velocity.z * delta;

	//if (moveForward || moveBackward) velocity.z = direction.z * 400.0 * delta;
	//if (moveLeft || moveRight) velocity.x = direction.x * 400.0 * delta;

	// if (wallsArray.length > 0)
	// 	//rayCollisionsCheck();

	// if (moveForward)
	// playerBoxBody.position.z += 0.1
	// if (moveBackward)
	// playerBoxBody.position.z += - 0.1
	// if (moveRight)
	// playerBoxBody.position.x += - 0.1
	// if (moveLeft)
	// playerBoxBody.position.x += 0.1

	//distance = 10;
	//playerBoxBody.position add direction.multiplyScalar(distance) );

	// if (onObject === true) {
	// 	// console.log("wall collision")
	// 	// velocity.x = Math.max(0, velocity.x);
	// 	// velocity.z = Math.max(0, velocity.z);

	// 	velocity.y = Math.max(0, velocity.y);
	// 	canJump = true;

	// }

	
	//  controls.getObject().translateX(velocity.x * delta);
	//  controls.getObject().position.y += (velocity.y * delta); // new behavior
	//  controls.getObject().translateZ(velocity.z * delta);

	//   rotationPoint.position.x = playerBoxBody.position.x;
	//   rotationPoint.position.y = playerBoxBody.position.y;
	//   rotationPoint.position.z = playerBoxBody.position.z;



	// if (controls.getObject().position.y < 1.5) {

	// 	velocity.y = 0;
	// 	controls.getObject().position.y = 1.5;

	// 	canJump = true;

	// }


	for (var i = 0; i < zombieAnimatedArray.length; i++) {
		zombieAnimatedArray[i].walkingAnimate(myDelta, walkSpeed)

	}

	// // Detect collisions.
	// if (collisions.length > 0) {
	// 	detectCollisions();
	// }
	controls.update( Date.now() - SUOtime );
	
//	controls.update(myDelta);
	SUOtime = Date.now()
	renderer.render(scene, camera);
}




//////////////////////////////////////	END	/////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


window.onload = initCannon;
window.onload = init;
