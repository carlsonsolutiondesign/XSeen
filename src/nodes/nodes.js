/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * portions extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

 // Node definition code (just stubs right now...)


xseen.node.core_NOOP = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.core_WorldInfo = {
	'init'	: function (e,p) {parsing('WorldInfo', e)},
	'fin'	: function (e,p) {}
};

function parsing (s, e) {
	xseen.debug.logInfo ('Parsing init details stub for ' + s);
}

xseen.node.unk_Camera = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints
		},
	'fin'	: function (e,p) {}
};

xseen.node.geometry3D_Box = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.BoxGeometry(e._xseen.fields.size[0], e._xseen.fields.size[1], e._xseen.fields.size[2]);
		},
	'fin'	: function (e,p) {}
};

xseen.node.geometry3D_Cone = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.ConeGeometry(e._xseen.fields.bottomradius, e._xseen.fields.height, 24, false, 0, 2*Math.PI);
		},
	'fin'	: function (e,p) {}
};
xseen.node.geometry3D_Sphere = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.SphereGeometry(e._xseen.fields.radius, 32, 32, 0, Math.PI*2, 0, Math.PI);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.geometry3D_Cylinder = {
	'init'	: function (e,p)
		{
			var noCaps = !(e._xseen.fields.bottom || e._xseen.fields.top);
			p._xseen.geometry = new THREE.CylinderGeometry(e._xseen.fields.radius, e._xseen.fields.radius, e._xseen.fields.height, 32, 1, noCaps, 0, Math.PI*2);
		},
	'fin'	: function (e,p) {}
};

xseen.node.appearance_Material = {
	'init'	: function (e,p)
		{
			var transparency  = e._xseen.fields.transparency - 0;
			var shininess  = e._xseen.fields.shininess - 0;
			var colorDiffuse = xseen.types.Color3toInt (e._xseen.fields.diffusecolor);
			var colorEmissive = xseen.types.Color3toInt (e._xseen.fields.emissivecolor);
			var colorSpecular = xseen.types.Color3toInt (e._xseen.fields.specularcolor);
			p._xseen.material = new THREE.MeshPhongMaterial( {
//			p._xseen.material = new THREE.MeshBasicMaterial( {
						'color'		: colorDiffuse,
						'emissive'	: colorEmissive,
						'specular'	: colorSpecular,
						'shininess'	: shininess,
						'opacity'	: 1.0-transparency,
						'transparent'	: (transparency > 0.0) ? true : false
						} );
		},
	'fin'	: function (e,p) {}
};
xseen.node.appearance_Appearance = {
	'init'	: function (e,p) {},

	'fin'	: function (e,p)
		{
			p._xseen.appearance = e._xseen.material;
		}
};
xseen.node.unk_Shape = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			var m = new THREE.Mesh (e._xseen.geometry, e._xseen.appearance);
			p._xseen.children.push(m);
			m = null;
		}
};

xseen.node.grouping_Transform = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
			// Apply transform to all objects in e._xseen.children
			var rotation = xseen.types.Rotation2Quat(e._xseen.fields.rotation);
			var group = new THREE.Group();
			group.name = 'Transform children [' + e.id + ']';
			group.position.x	= e._xseen.fields.translation[0];
			group.position.y	= e._xseen.fields.translation[1];
			group.position.z	= e._xseen.fields.translation[2];
			group.scale.x		= e._xseen.fields.scale[0];
			group.scale.y		= e._xseen.fields.scale[1];
			group.scale.z		= e._xseen.fields.scale[2];
			group.quaternion.x	= rotation.x;
			group.quaternion.y	= rotation.y;
			group.quaternion.z	= rotation.z;
			group.quaternion.w	= rotation.w;
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					group.add(child);
				});
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
			e._xseen.object = group;
		}
};

xseen.node.unk_Light = {
	'init'	: function (e,p) 
		{
			var color = xseen.types.Color3toInt (e._xseen.fields.color);
			var intensity = e._xseen.fields.intensity - 0;
			var l = new THREE.DirectionalLight (color, intensity);
			l.position.x = 0-e._xseen.fields.direction[0];
			l.position.y = 0-e._xseen.fields.direction[1];
			l.position.z = 0-e._xseen.fields.direction[2];
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(l);
			l = null;
		}
		,
	'fin'	: function (e,p)
		{
		}
};

xseen.node.networking_Inline = {
	'init'	: function (e,p) 
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Inline content [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				xseen.loadMgr.loadXml (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, {'e':e, 'p':p});
				e._xseen.requestedUrl = true;
			}
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e,p)
		{
		},

	'loadSuccess' :
				function (response, userdata, xhr) {
					userdata.e._xseen.processedUrl = true;
					userdata.e._xseen.loadText = response;
					console.log("download successful for "+userdata.e.id);
					var start = {'_xseen':0};
					var findSceneTag = function (response) {
						if (typeof(response._xseen) === 'undefined') {response._xseen = {'childCount': -1};}
						if (response.nodeName == 'scene') {
							start = response;
							return;
						} else if (response.children.length > 0) {
							for (response._xseen.childCount=0; response._xseen.childCount<response.children.length; response._xseen.childCount++) {
								findSceneTag(response.children[response._xseen.childCount]);
								if (start._xseen !== 0) {return;}
							}
						} else {
							return;
						}
					}
					findSceneTag (response);	// done this way because function is recursive
					if (start._xseen !== 0) {	// Found 'scene' tag. Need to parse and insert
						console.log("Found legal X3D file with 'scene' tag");
						while (start.children.length > 0) {
							userdata.e.appendChild(start.children[0]);
						}
						xseen.Parse(userdata.e, userdata.p, userdata.p._xseen.sceneInfo);
						userdata.e._xseen.children.forEach (function (child, ndx, wholeThing)
							{
								userdata.e._xseen.loadGroup.add(child);
console.log ('...Adding ' + child.type + ' (' + child.name + ') to Inline Group? with UUID ' + userdata.e._xseen.loadGroup.uuid + ' (' + userdata.e._xseen.loadGroup.name + ')');
							});
						userdata.p._xseen.sceneInfo.scene.updateMatrixWorld();
						//xseen.debug.logInfo("Complete work on Inline...");
					} else {
						console.log("Found illegal X3D file -- no 'scene' tag");
					}
					// Parse (start, userdata.p)...	
				}
};

xseen.node.core_Scene = {
	'init'	: function (e,p)
		{
			var width = e._xseen.sceneInfo.size.width;
			var height = e._xseen.sceneInfo.size.height;
			e._xseen.renderer = {
						'canvas' 	: e._xseen.sceneInfo.scene,
						'width'		: width,
						'height'	: height,
						'camera'	: e._xseen.sceneInfo.camera[0],
						'renderer'	: e._xseen.sceneInfo.renderer,
						};
			e._xseen.renderer.renderer.setSize (width, height);
			var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			camera.position.x = 0;		// hardwired for now...
			camera.position.y = 0;
			camera.position.z = 4;
			e._xseen.renderer.camera = camera;
		},

/*
 * This appears now to be working!!!
 *
 * Late loading content is not getting inserted into the scene graph for rendering. Need to read
 * THREE docs about how to do that.
 * Camera will need to be redone. Existing camera is treated as a special child. A separate camera
 * should be established and Viewpoint nodes define "photostops" rather than a camera. The camera is 
 * in effect, parented to the "photostop". This probably needs to list of Viewpoints discussed in the
 * X3D specification.
 */
	'fin'	: function (e,p)
		{
			// Render all Children
			//xseen.renderNewChildren (e._xseen.children, e._xseen.renderer.canvas);
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					console.log('Adding child of type ' + child.type + ' (' + child.name + ')');
					e._xseen.renderer.canvas.add(child);
				});
			xseen.dumpSceneGraph ();
			e._xseen.renderer.renderer.render( e._xseen.renderer.canvas, e._xseen.renderer.camera );
			xseen.debug.logInfo("Rendered all elements -- Starting animation");
			xseen.render();
		}
};
