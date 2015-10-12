function rnum(min, max) {
	return Math.random() * (max - min) + min;
}

var Brain = function(kwargs) {
	//divID, fnPlot, manifest_url

	var _this = this;
	this.selectedLabel = null;
	this.fnPlot = kwargs.callback || null;
	this.divID = kwargs.divID || 'brain';
	this.manifest_url = kwargs.manifest || "files_to_load.json";

	// Just to declare the parts up front...
	this.camera = null;
	this.container = null;
	this.controls = null;
	this.renderer = null;
	this.scene = null;

	this.init = function() {

		this.container = $('#' + this.divID)[0];
		var sz = this.container.getBoundingClientRect();

		//Some important variables
		this.meshes = []

		/*info = document.body.appendChild( document.createElement( 'div' ) );
		info.style.cssText = 'left: 0; margin: auto; position: absolute; right: 70%; width: 25%; text-align: center; ';
		info.innerHTML = info.txt = '<h1>ROYGBIV</h1>' //+*/

			//'<p>Show one hand and five fingers to start</p>' +
			//'<div id=data ></div>' +
		//'</p>';

		// The Camera
		// Params: x,y,z starting position
		this.camera = new THREE.PerspectiveCamera(
			60, // fov,
			sz.height / sz.width, // aspect ratio
			0.1,  // near
			1e10 );  // far
		this.camera.position.z = 200;

		// The Renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( sz.width, sz.height );

		// The Controls
		// Params: None. Just add the camera to controls
		this.controls = this.addControls(this.camera);

		// The Scene
		// Params: None. Just add the camera to the scene
		this.scene = new THREE.Scene();
		this.scene.add( this.camera );

		// The Lights!
		// Params: None for now... add to camera
		this.addLights(this.camera)

		// The Mesh
		// Params: None for now... add to scene
		//loadMesh("lh.pial.vtk",scene,meshes)
		//loadVTK("lh.pial.vtk",scene,meshes)
	
		$.ajax({dataType: "json",
			url: this.manifest_url,
			data: function(data) {},
			success: function(data, textStatus, jqXHR) {
				for (var key in data["filename"]) {
					var color = ("colors" in data) ? data["colors"][key] : null;
					var name = ("names" in data) ? data["names"][key] : null; 
					var mesh_url = data["filename"][key];

					if (mesh_url[0] != '/') {  // relative path is relative to manifest
						mesh_url = _this.manifest_url + "/../" + mesh_url;
					}

					_this.loadMesh(mesh_url, {
						name: name || key,
						color: color || [rnum(0.25, 1.), rnum(0.25, 1.), rnum(0.25, 1.)]
					});
				}
			}
		});
	
		// The spot in the HTML
		this.container.appendChild( this.renderer.domElement );

		// Interactive things - resizing windows, animate to rotate/zoom
		window.addEventListener( 'resize', function(){ _this.onWindowResize(); }, false );
		this.animate();
	
		this.container.addEventListener('click', function(e) {
			if (e.shiftKey) {
				mesh = _this.selectMeshByMouse(e);
				_this.objectPick(mesh);
			}
			return true;
		});
	};

	// resizing function
	this.onWindowResize = function() {
		var sz = this.container.getBoundingClientRect();
		this.camera.aspect = sz.height / sz.width;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( sz.width, sz.height );

		this.controls.handleResize();
	}

	//animation
	this.animate = function() {
		requestAnimationFrame( function() { _this.animate(); });

		this.controls.update();
		this.renderer.render( this.scene, this.camera );
	}

	// lights
	this.addLights = function(camera) {
		var dirLight = new THREE.DirectionalLight( 0xffffff );
		dirLight.position.set( 200, 200, 1000 ).normalize();

		camera.add( dirLight );
		camera.add( dirLight.target );
	}

	//controls
	this.addControls = function(camera){
		controls = new THREE.TrackballControls( camera, this.container );

		controls.rotateSpeed = 5.0;
		controls.zoomSpeed = 5;
		controls.panSpeed = 2;

		controls.noZoom = false;
		controls.noPan = false;

		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
		return controls
	}

	this.loadMesh = function(url, mesh_props) {
		var oReq = new XMLHttpRequest();
		oReq.open("GET", url, true);
		oReq.onload = function(oEvent) {
			var buffergeometry = new THREE.VTKLoader().parse(this.response);
			geometry=new THREE.Geometry().fromBufferGeometry(buffergeometry);
			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			geometry.__dirtyColors = true;

			material=new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors});

		  	var color = mesh_props.color || [rnum(0.25, 1.), rnum(0.25, 1.), rnum(0.25, 1.)]
			for (var i=0;i<geometry.faces.length;i++){
			  var face = geometry.faces[i];
			  face.color.setHex( Math.random() * 0xffffff );
			  face.color.setRGB(color[0], color[1], color[2]);

			  //face.materials = [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ];
			}
			geometry.colorsNeedUpdate = true;

			var mesh = new THREE.Mesh(geometry, material);
			mesh.dynamic = true;
			mesh.rotation.y = Math.PI * 1.1;
			mesh.rotation.x = Math.PI * 0.5;
			mesh.rotation.z = Math.PI * 1.5;

			var mesh_name = mesh_props.name;
			if (mesh_name) {
				mesh.name = mesh_name;
			} else {
				var tmp = url.split("_")
				mesh.name = tmp[tmp.length-1].split(".vtk")[0]
			}

			_this.scene.add(mesh);
			_this.meshes.push(mesh)

		}
		oReq.send();
	}

	this.selectMeshByMouse = function(e) {
		/* Returns a mesh from a mouse click. */
		/* Defines what to do on shift-click . */
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		var cpos = this.renderer.domElement.getBoundingClientRect();  // [top, left, right, bottom]

		// First, figure out if a parcel was clicked.
		mouse.x = ( 2 * (e.clientX - cpos.left) / (cpos.width) ) - 1;
		mouse.y = ( 2 * (cpos.top - e.clientY) / (cpos.height) ) + 1;

		raycaster.setFromCamera(mouse, this.camera);
		var intersects = raycaster.intersectObjects( this.scene.children );

		if (intersects.length == 0) {
			return null;
		} else {
			return intersects[0].object;  // select the first
		}
	}

	this.selectMeshByName = function(mesh_name) {
		/* Returns a mesh from a name. */
		for (i=0;i<this.meshes.length;i++) {
			if (this.meshes[i].name == mesh_name) {
				return this.meshes[i];
			}
		}
		return null;
	}

	this.objectPick = function(picked_mesh) {
		if (picked_mesh === null) {
			// No object was chosen; reset all parcels to fully visible.
			for (i=0;i<this.meshes.length;i++) {
				this.meshes[i].material.transparent = true;
				this.meshes[i].material.opacity = 1;
			}
		} else {
			picked_mesh.material.transparent = true;
			picked_mesh.material.opacity = 1;

			// Decrease opacity for all other parcels
			for (i=0;i<this.meshes.length;i++){
				if (this.meshes[i].name != picked_mesh.name){
					this.meshes[i].material.transparent = true;
					this.meshes[i].material.opacity = 0.4;
				}
			}
		}

		if (this.fnPlot) {
			this.fnPlot(picked_mesh);
		}
	}

	this.init();
	return this;
}
