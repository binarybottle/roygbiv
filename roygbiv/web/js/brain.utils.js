function rnum(min, max) {
    return Math.random() * (max - min) + min;
}

function isarr(v) {
    return v && (v.length !== undefined || Object.keys(v).length > 0);
}

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

function copy_mesh_props(src_mesh, dest_mesh) {
    set_mesh_color(dest_mesh, src_mesh.color);
    for (var k in src_mesh) {  // copy over mesh props
        dest_mesh[k] = src_mesh[k];
    }
    return dest_mesh
}
