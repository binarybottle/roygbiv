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
	this.view = kwargs.view || {};  // allow overriding fov, near, far, etc

	// Just to declare the parts up front...
	this.camera = null;
	this.container = null;
	this.controls = null;
	this.renderer = null;
	this.scene = null;

	// state variables
	this.cur_picked = null;

	this.init = function() {

		this.container = $('#' + this.divID)[0];
		var sz = this.container.getBoundingClientRect();

		//Some important variables
		this.meshes = {}

		/*info = document.body.appendChild( document.createElement( 'div' ) );
		info.style.cssText = 'left: 0; margin: auto; position: absolute; right: 70%; width: 25%; text-align: center; ';
		info.innerHTML = info.txt = '<h1>ROYGBIV</h1>' //+*/

			//'<p>Show one hand and five fingers to start</p>' +
			//'<div id=data ></div>' +
		//'</p>';

		// The Camera
		// Params: x,y,z starting position
		this.camera = new THREE.PerspectiveCamera(
			this.view.fov || 50, // fov,
			this.view.aspect_ratio || sz.width/sz.height, // aspect ratio
			this.view.near || 0.1,  // near
			this.view.far || 1e10 );  // far
		this.camera.position.z = this.view.zpos || 200;

		// The Renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
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
		this.loadBrain();

		// The spot in the HTML
		this.container.appendChild( this.renderer.domElement );
		this.animate();

		// Interactive things - resizing windows, animate to rotate/zoom
		window.addEventListener( 'resize', function(){ _this.onWindowResize(); }, false );
		this.container.addEventListener('click', function(e) {
			if (!e.shiftKey)
				return false;

			mesh = _this.selectMeshByMouse(e);
			_this.objectPick(mesh);
			return true;
		});
		this.container.addEventListener('mousemove', function(e) {
			if (!e.shiftKey)
				return false;

			mesh = _this.selectMeshByMouse(e);
			_this.objectPick(mesh);
		})
	};

	this.removeMesh = function(mesh) {
		_this.scene.children.pop(_this.scene.children.indexOf(mesh));
		delete _this.meshes[mesh.name]
	}

	this.clearBrain = function(keeper_keys) {
		console.log('clearing brain but keeping', keeper_keys);
		for (var mi in _this.meshes) {
			if (keeper_keys.indexOf(mi) != -1)
				continue;
			var mesh = _this.meshes[mi]
			_this.removeMesh(mesh);
		}
	}

	this.loadBrain = function(manifest_url) {
		_this.manifest_url = manifest_url || _this.manifest_url

		$.ajax({dataType: "json",
			url: this.manifest_url,
			data: function(data) {},
			success: function(data, textStatus, jqXHR) {
				var new_names = Object.keys(data["names"]).map(function(k) { return data["names"][k]; });
				_this.clearBrain(new_names);

				var base_url = _this.manifest_url.split('/').reverse().slice(1).reverse().join('/')
				console.log('loading brain');
				for (var key in data["filename"]) {
					var color = ("colors" in data) ? data["colors"][key] : null;
					var name = ("names" in data) ? data["names"][key] : null;
					var value = ("values" in data) ? data["values"][key] : null;
					var mesh_url = data["filename"][key];

					if (mesh_url[0] != '/') {  // relative path is relative to manifest
						mesh_url = base_url + "/" + mesh_url;
					}

					_this.loadMesh(mesh_url, {
						name: name || key,
						color: color || [rnum(0.25, 1.), rnum(0.25, 1.), rnum(0.25, 1.)],
						value: value
					});
				}
			},
			error: function(err) { console.error('Load error'); }
		});
	};

	// resizing function
	this.onWindowResize = function() {
		var sz = this.container.getBoundingClientRect();
		this.camera.aspect = sz.width / sz.height;
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
		function set_mesh_color(mesh, color) {
			var geometry = mesh.geometry;
			for (var i=geometry.faces.length - 1; i>=0; --i) {
				var face = geometry.faces[i];
			 	if (color) {
					face.color.setHex( Math.random() * 0xffffff );
					face.color.setRGB(color[0], color[1], color[2]);
				} else {
					var before_faces = geometry.faces.slice(0, i);
					var after_faces = geometry.faces.slice(i + 1, geometry.faces.length);
					geometry.faces = before_faces.concat(after_faces);
				}
			  //face.materials = [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ];
			}
			geometry.colorsNeedUpdate = true;
			return mesh;
		}

		var name_found = Object.keys(_this.meshes).reduce(function(c, k) {
			return c || _this.meshes[k].name == mesh_props.name;
		}, false);
		if (name_found && url == _this.meshes[mesh_props.name].filename) {
			var mesh = _this.meshes[mesh_props.name];
		  	set_mesh_color(mesh, mesh_props.color);
		  	console.log('redo ' + mesh_props.name);
		}
		else {
			if (name_found) {
			  	console.log('just removed mesh; different filename! ', url, _this.meshes[mesh_props.name]);
				_this.removeMesh(_this.meshes[mesh_props.name]);
			}
			var oReq = new XMLHttpRequest();
			oReq.open("GET", url, true);
			oReq.onload = function(oEvent) {
				var buffergeometry = new THREE.VTKLoader().parse(this.response);
				geometry=new THREE.Geometry().fromBufferGeometry(buffergeometry);
				geometry.computeFaceNormals();
				geometry.computeVertexNormals();
				geometry.__dirtyColors = true;

				material = new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors});

				mesh = new THREE.Mesh(geometry, material);
				mesh.filename = url;
				mesh.dynamic = true;
			  	set_mesh_color(mesh, mesh_props.color);

				mesh.material.transparent = true;
				mesh.material.opacity = 1;
				mesh.rotation.y = Math.PI * 1.01;
				mesh.rotation.x = Math.PI * 0.5;
				mesh.rotation.z = Math.PI * 1.5 * (url.indexOf('rh_') == -1 ? 1 : -1);

				var mesh_name = mesh_props.name;
				for (var k in mesh_props) {
					mesh[k] = mesh_props[k];
				}
				if (mesh_name) {
					mesh.name = mesh_name;
				} else {
					var tmp = url.split("_")
					mesh.name = tmp[tmp.length-1].split(".vtk")[0]
				}

				_this.scene.add(mesh);
				_this.meshes[mesh.name] = mesh
			}
			oReq.send();
		}
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
		// Decrease opacity for all other parcels
		for (i=0; i<this.meshes.length; i++)
			_this.meshes[i].material.opacity = picked_mesh ? 0.4 : 1;

		if (picked_mesh)
			picked_mesh.material.opacity = 1;

		if (_this.cur_picked != picked_mesh && t) {
			_this.cur_picked = picked_mesh;
			if (_this.fnPlot)
				_this.fnPlot(picked_mesh);
		}
	}

	this.init();
	return this;
}
