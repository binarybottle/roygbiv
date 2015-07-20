$(function () {
          // here we'll put the Three.js stuff
          
           var scene = new THREE.Scene();
           var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1e10);
           
           var renderer = new THREE.WebGLRenderer();
           var controls = add_controls(camera)
           
           
           
           //renderer.setClearColorHex('0xEEEEEE');
           renderer.setSize(window.innerWidth, window.innerHeight);
           /*var axes = new THREE.AxisHelper( 20 );
           scene.add(axes);
           var planeGeometry = new THREE.PlaneGeometry(60,20,1,1);
           var planeMaterial = new THREE.MeshBasicMaterial(
                                             {color: 0xcccccc});
           var plane = new THREE.Mesh(planeGeometry,planeMaterial);
           plane.rotation.x=-0.5*Math.PI;
           
           plane.position.x = 15;
           plane.position.y = 0;
           plane.position.z = 0;
           scene.add(plane);
           var cubeGeometry = new THREE.CubeGeometry(4,4,4);
           var cubeMaterial = new THREE.MeshBasicMaterial(
                             {color: 0xff0000, wireframe: true});
           var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
           cube.position.x = -4;
           cube.position.y = 3;
           cube.position.z = 0;
           scene.add(cube);
           var sphereGeometry = new THREE.SphereGeometry(4,20,20);
           var sphereMaterial = new THREE.MeshBasicMaterial(
                                  {color: 0x7777ff, wireframe: true});
           var sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
           sphere.position.x = 20;
           sphere.position.y = 4;
           sphere.position.z = 2;
           scene.add(sphere);
           
           //camera.position.x = -30;
           //camera.position.y = 40;
           //camera.position.z = 30;
           //camera.lookAt(scene.position);
           */
           //camera.position.z = 200;
           camera.position.z = 0.2;
           
			var dirLight = new THREE.DirectionalLight( 0xffffff );
			dirLight.position.set( 200, 200, 1000 ).normalize();
			
			camera.add( dirLight );
			camera.add( dirLight.target );

           
           // Add to the DOM!
           
           
           // render the first!
           
           
		   // ANIMATION
           //AK: Why is it when I take this function outside, and pass in the variables as args, it doesn't work??
           // This is gross.
           function animate() {
				requestAnimationFrame( animate );
				//console.log(controls)
				controls.update();
				renderer.render( scene, camera );
				//stats.update();
				}
           
           //mesh = loadMesh("lh.pial.vtk",scene)
           //loadMesh("bunny.vtk",scene)
           //scene.add(mesh)
            var material = new THREE.MeshLambertMaterial( { color:0xffffff, side: THREE.DoubleSide } );
            var loader = new THREE.VTKLoader();
			loader.load( "bunny.vtk", function ( geometry ) {
			
				geometry.computeVertexNormals();
			
				var mesh = new THREE.Mesh( geometry, material );
				mesh.name = "bunners"
				mesh.position.setY( - 0.09 );
				scene.add( mesh );
				
				console.log("added bunners")
				var cube = addCube()
                scene.add(cube);
			
			} );
           
           
           $("#WebGL-output").append(renderer.domElement);
           renderer.render(scene, camera);
           window.addEventListener( 'resize', onWindowResize, false );
           animate()
           
    });
    
function add_controls(camera){
	var controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 2;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    //console.log(controls)
    return controls
}

        
function loadMesh(name,scene) {
      var oReq = new XMLHttpRequest();
      oReq.open("GET", name, true);
      oReq.onload = function(oEvent) {
        var buffergeometry=new THREE.VTKLoader().parse(this.response);
        
        geometry=new THREE.Geometry().fromBufferGeometry(buffergeometry);
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.__dirtyColors = true;
            
        material=new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors});
        var color = [Math.random(), Math.random(), Math.random()]
              
        for (i=0;i<geometry.faces.length;i++){
          var face = geometry.faces[i];
          //face.color.setHex( Math.random() * 0xffffff );
          face.color.setRGB(1,1,1)//(color[0],color[1],color[2]);
          
          //face.materials = [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ];
        }
        geometry.colorsNeedUpdate = true
        mesh=new THREE.Mesh(geometry,material);
        mesh.dynamic=true
        mesh.name = name
        
        mesh.rotation.y = Math.PI * 1.1;
        mesh.rotation.x = Math.PI * 0.5;
        mesh.rotation.z = Math.PI * 1.5;
        console.log(mesh)
        scene.add(mesh);
        console.log(scene)
        console.log("added mesh")
        
		var cube = addCube()
        scene.add(cube);

        
        //meshes.push(mesh)
        
      }
      oReq.send();
    }

function addCube(){
	var cubeGeometry = new THREE.CubeGeometry(4,4,4);
	var cubeMaterial = new THREE.MeshBasicMaterial(
	                 {color: 0xff0000, wireframe: true});
	var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	cube.position.x = -4;
	cube.position.y = 3;
	cube.position.z = 0;
	return cube
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	controls.handleResize();

}

