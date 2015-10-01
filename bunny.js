//$(function () {

var BunnyController = function(fnPlot) {
	var ggg = this;
	angular.module('visApp',[]).controller('visAppController', function($scope) {
		ggg.selectedLabel = null;
		ggg.$scope = $scope;
		ggg.$scope.fnPlot = fnPlot;
		ggg.init();
	});
}

BunnyController.prototype.init = function() {
	var ggg = this;  // hack to deal with embedded 'this' statements.

	//Some important variables
	var container, camera, controls, scene, renderer
	var meshes = []

	/*info = document.body.appendChild( document.createElement( 'div' ) );
	info.style.cssText = 'left: 0; margin: auto; position: absolute; right: 70%; width: 25%; text-align: center; ';
	info.innerHTML = info.txt = '<h1>ROYGBIV</h1>' //+*/

		//'<p>Show one hand and five fingers to start</p>' +
		//'<div id=data ></div>' +
	//'</p>';

	// The Camera
	// Params: x,y,z starting position
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1e10 );
	camera.position.z = 200;
	
	// The Controls
	// Params: None. Just add the camera to controls
	var controls = this.addControls(camera)

	// The Scene
	// Params: None. Just add the camera to the scene
	scene = new THREE.Scene();
	scene.add( camera );

	// The Lights!
	// Params: None for now... add to camera
	this.addLights(camera)

	// The Mesh
	// Params: None for now... add to scene
	//loadMesh("lh.pial.vtk",scene,meshes)
	//loadVTK("lh.pial.vtk",scene,meshes)
	
	$.ajax({dataType: "json",
	   url:"files_to_load.json",
	   data:function(data){},
	   success:function(data,textStatus,jqXHR){
		 //console.log(data)
		 N = Object.keys(data["filename"])
		 //console.log(N)
		 for (i=0;i<N.length;i++){
		   //loadMesh(data["filename"][i])
		   ggg.loadMesh(data["filename"][i],scene,meshes)
		 }  
	   }})
	
	// The Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	// The spot in the HTML
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );

	// Interactive things - resizing windows, animate to rotate/zoom
	window.addEventListener( 'resize', function(){ggg.onWindowResize(camera,renderer,controls)}, false );
	this.animate(controls,renderer,scene,camera);
	
	$(document).click(function(e) {
		if (e.shiftKey) {
			//alert("shift+click")
			ggg.objectPick(e,meshes,renderer,camera,scene)
		} 
	});
}

	
	// resizing function
BunnyController.prototype.onWindowResize = 	function(camera,renderer,controls) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	controls.handleResize();
}
	
//animation
BunnyController.prototype.animate = function(controls,renderer,scene,camera) {
	var ggg = this;
	requestAnimationFrame( function (){ggg.animate(controls,renderer,scene,camera)} );

	controls.update();
	renderer.render( scene, camera );

	//stats.update();
}
	
// lights
BunnyController.prototype.addLights = function(camera){
	var dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( 200, 200, 1000 ).normalize();

	camera.add( dirLight );
	camera.add( dirLight.target );
}
	
//controls
BunnyController.prototype.addControls = function(camera){
	controls = new THREE.TrackballControls( camera );

	controls.rotateSpeed = 5.0;
	controls.zoomSpeed = 5;
	controls.panSpeed = 2;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	return controls
}

BunnyController.prototype.loadVTK = function(name,scene,meshes){
	/* Loads VTK files
		
	 Inputs 
		 name: String, filename (relative path to VTK file)
		 scene: THREE.Scene, scene to add the mesh to
		 meshes: List, list of meshes to keep track of
	 Outputs:
		 None
	*/
	
	//material.vertexColors = THREE.FaceColors
	var loader = new THREE.VTKLoader();
	loader.load( name, function ( geometry ) {
		
		var material = new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors})  // {color:"#24AE19", side: THREE.DoubleSide} );

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		
		geometry.__dirtyColors = true;
		geometry.colorsNeedUpdate = true
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.setY( - 0.09 );
		mesh.dynamic=true
		
		
		for (i=0;i<geometry.faces.length;i++){
		  var face = geometry.faces[i];
		  face.color.setHex( Math.random() * 0xffffff );
		  //face.color.setRGB(0.5,0.5,0.5);
		  
		  //face.materials = [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ];
		}
		
		//TODO: Make these parameters!
		mesh.rotation.y = Math.PI * 1.1;
		mesh.rotation.x = Math.PI * 0.5;
		mesh.rotation.z = Math.PI * 1.5;
		
		scene.add( mesh );
		meshes.push(mesh)
		console.log("loaded mesh")
	});
}
	
//AK: WHY DOES THIS WORK BUT laodVTK DOESNT??
BunnyController.prototype.loadMesh = function(name,scene,meshes) {
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
		  face.color.setHex( Math.random() * 0xffffff );
		  face.color.setRGB(color[0],color[1],color[2]);
	  
		  //face.materials = [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ];
		}
		geometry.colorsNeedUpdate = true
		mesh=new THREE.Mesh(geometry,material);
		mesh.dynamic=true
		mesh.name = name
	
		mesh.rotation.y = Math.PI * 1.1;
		mesh.rotation.x = Math.PI * 0.5;
		mesh.rotation.z = Math.PI * 1.5;

		//console.log(mesh)
		scene.add(mesh);
		meshes.push(mesh)
	
	}
	oReq.send();
}

BunnyController.prototype.objectPick = function(e,meshes,renderer,camera,scene) {
	/* Defines what to do on shift-click . */
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	
	// First, figure out if a parcel was clicked.
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
	
	raycaster.setFromCamera(mouse,camera);	
	var intersects = raycaster.intersectObjects( scene.children );

	if (intersects.length == 0){
	  // No object was chosen; reset all parcels to fully visible.
	  for (i=0;i<meshes.length;i++){
		  meshes[i].material.transparent = true
		  meshes[i].material.opacity = 1
	  }
	  //info.innerHTML=info.txt 
	  this.$scope.selectedLabel = null
	  this.$scope.$apply()
	}
	else{
	  // At least one object was chosen; select the first.
	  var picked_mesh_name = intersects[0].object.name
	  var picked_mesh = intersects[0].object
	  picked_mesh.material.transparent = true
	  picked_mesh.material.opacity = 1
	  var tmp = picked_mesh_name.split("_")
	  var picked_label_id = tmp[tmp.length-1].split(".vtk")[0]

	  // Highlight and label the chosen parcel
	  this.$scope.selectedLabel = picked_label_id
	  this.$scope.$apply()
	  selected_color = [picked_mesh.geometry.faces[0].color["r"],
						picked_mesh.geometry.faces[0].color["g"],
						picked_mesh.geometry.faces[0].color["b"]]
	  if (this.$scope.fnPlot !== null) {
		this.$scope.fnPlot(picked_label_id, selected_color);
	  }

		// Decrease opacity for all other parcels			
	  for (i=0;i<meshes.length;i++){
		  if (meshes[i].name != picked_mesh_name){
			meshes[i].material.transparent = true
			meshes[i].material.opacity = 0.4
		  }
	  }
	}
}
