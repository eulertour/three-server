THREE = require('three')
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
var packageDefinition = protoLoader.loadSync("service.proto", {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});
var testservice = grpc.loadPackageDefinition(packageDefinition).testservice;

const perspectiveCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
const orthographicCamera = new THREE.OrthographicCamera(-7.1, 7.1, 4, -4, 1, 21)
perspectiveCamera.position.z = 11;
orthographicCamera.position.z = 11;
const scene = new THREE.Scene()

function getServer() {
  var server = new grpc.Server();
  server.addService(testservice.GeometryService.service, {
    boxGeometry: boxGeometry,
    sphereGeometry: sphereGeometry,
    torusKnotGeometry: torusKnotGeometry,
    icosahedronGeometry: icosahedronGeometry,
    tetrahedronGeometry: tetrahedronGeometry,
    cylinderGeometry: cylinderGeometry,
    coneGeometry: coneGeometry,
    circleGeometry: circleGeometry,
    planeGeometry: planeGeometry,
  });
  server.addService(testservice.MaterialService.service, {
    basicMaterial: basicMaterial,
    phongMaterial: phongMaterial,
    standardMaterial: standardMaterial,
  });
  return server;
}

function standardMaterial(call, callback) {
	const scene = new THREE.Scene()
	const material = new THREE.MeshStandardMaterial({});
	const object = new THREE.Mesh(geo, material);
	scene.add(object);

	const pointLight = new THREE.PointLight(0xffffff, 5, 100);
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);

	const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
	scene.add(hemisphereLight);

	renderer.render(scene, orthographicCamera);

	// console.log(renderer.lastProgram)
	// console.log("Attributes:")
	// for (let k of Object.keys(renderer.lastProgram.getAttributes())) {
	// 	console.log(k, obj.geometry.attributes[k].array);
	// }
	// if (obj.geometry.index !== null) {
	// 	console.log('index', obj.geometry.index.array);
	// }
	// console.log("Uniforms:")
	// for (let k of Object.keys(renderer.lastProgram.getUniforms().map)) {
	// 	if (k !== 'pointLights') {
	// 		console.log(k, renderer.lastProgram.getUniforms().map[k].cache)
	// 	} else {
	// 		console.log('pointLightsMap');
	// 		let pointLightsMap = renderer.lastProgram.getUniforms().map['pointLights'].map
	// 		let mapLength = Object.keys(pointLightsMap).length;
	// 		for (let i = 0; i < mapLength; i++) {
	// 			console.log(' ', 'pointLightsMap[', i, ']');
	// 			for (let k of Object.keys(pointLightsMap[i].map)) {
	// 				console.log('  ', k, pointLightsMap[i].map[k].cache)
	// 			}
	// 		}
	// 	}
	// }

	callback(null, {
		vertex_shader: renderer.lastProgram.vertexGlsl,
		fragment_shader: renderer.lastProgram.fragmentGlsl,
	});
}

function phongMaterial(call, callback) {
	const scene = new THREE.Scene()
	const material = new THREE.MeshPhongMaterial({});
	const object = new THREE.Mesh(geo, material);
	scene.add(object);

	const pointLight = new THREE.PointLight(0xffffff, 5, 100);
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);

	const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
	scene.add(hemisphereLight);

	renderer.render(scene, orthographicCamera);

	// console.log(renderer.lastProgram)
	// console.log("Attributes:")
	// for (let k of Object.keys(renderer.lastProgram.getAttributes())) {
	// 	console.log(k, obj.geometry.attributes[k].array);
	// }
	// if (obj.geometry.index !== null) {
	// 	console.log('index', obj.geometry.index.array);
	// }
	// console.log("Uniforms:")
	// for (let k of Object.keys(renderer.lastProgram.getUniforms().map)) {
	// 	if (k !== 'pointLights') {
	// 		console.log(k, renderer.lastProgram.getUniforms().map[k].cache)
	// 	} else {
	// 		console.log('pointLightsMap');
	// 		let pointLightsMap = renderer.lastProgram.getUniforms().map['pointLights'].map
	// 		let mapLength = Object.keys(pointLightsMap).length;
	// 		for (let i = 0; i < mapLength; i++) {
	// 			console.log(' ', 'pointLightsMap[', i, ']');
	// 			for (let k of Object.keys(pointLightsMap[i].map)) {
	// 				console.log('  ', k, pointLightsMap[i].map[k].cache)
	// 			}
	// 		}
	// 	}
	// }

	callback(null, {
		vertex_shader: renderer.lastProgram.vertexGlsl,
		fragment_shader: renderer.lastProgram.fragmentGlsl,
	});
}

function basicMaterial(call, callback) {
	const scene = new THREE.Scene()
	const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	const object = new THREE.Mesh(geo, material);
	scene.add(object);
	renderer.render(scene, perspectiveCamera);
	callback(null, {
		vertex_shader: renderer.lastProgram.vertexGlsl,
		fragment_shader: renderer.lastProgram.fragmentGlsl,
	});
}

function icosahedronGeometry(call, callback) {
	const geometry = new THREE.IcosahedronGeometry(
		call.request.raius || 1,
		call.request.detail || 0,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function torusKnotGeometry(call, callback) {
	const geometry = new THREE.TorusKnotGeometry(
		call.request.torus_radius || 1,
		call.request.tube_radius || 0.4,
		call.request.tubular_segments || 64,
		call.request.radial_segments || 8,
		call.request.p || 2,
		call.request.q || 3,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function boxGeometry(call, callback) {
	const geometry = new THREE.BoxGeometry(
		call.request.width || 1,
		call.request.height || 1,
		call.request.depth || 1,
		call.request.width_segments || 1,
		call.request.height_segments || 1,
		call.request.depth_segments || 1,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function sphereGeometry(call, callback) {
	const geometry = new THREE.SphereGeometry(
		call.request.radius || 1,
		call.request.width_segments || 8,
		call.request.height_segments || 6,
		call.request.phi_start || 0,
		call.request.phi_length || 2 * Math.PI,
		call.request.theta_start || 0,
		call.request.theta_length || Math.PI,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function tetrahedronGeometry(call, callback) {
	const geometry = new THREE.TetrahedronGeometry(
		call.request.radius || 1,
		call.request.detail || 0,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function cylinderGeometry(call, callback) {
	const geometry = new THREE.CylinderGeometry(
		call.request.radius_top || 1,
		call.request.radius_bottom || 1,
		call.request.height || 1,
		call.request.radial_segments || 8,
		call.request.height_segments || 1,
		call.request.open_ended || false,
		call.request.theta_start || 0,
		call.request.theta_length || 2 * Math.PI,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function coneGeometry(call, callback) {
	const geometry = new THREE.ConeGeometry(
    call.request.radius || 1,
    call.request.height || 1,
    call.request.radialSegments || 8,
    call.request.heightSegments || 1,
    call.request.openEnded || false,
    call.request.thetaStart || 0,
    call.request.thetaLength || 2 * Math.PI,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function circleGeometry(call, callback) {
	const geometry = new THREE.CircleGeometry(
    call.request.radius || 1,
    call.request.segments || 8,
    call.request.thetaStart || 0,
    call.request.thetaLength || 2 * Math.PI,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function planeGeometry(call, callback) {
	const geometry = new THREE.PlaneGeometry(
    call.request.width || 1,
    call.request.height || 1,
    call.request.widthSegments || 1,
    call.request.heightSegments || 1,
	);
	callback(null, serializeGeometry(geometry, wireframe=call.request.wireframe));
}

function serializeGeometry(geometry, wireframe=false) {
	let response;
	if (wireframe) {
		let wireframe = new THREE.WireframeGeometry(geometry);
		response = {
			position: Array.from(wireframe.attributes.position.array),
		}
  } else {
		response = {
			position: Array.from(geometry.attributes.position.array),
			normal: Array.from(geometry.attributes.normal.array),
			uv: Array.from(geometry.attributes.uv.array),
		};
		if (geometry.index !== null) {
			response.index = Array.from(geometry.index.array);
		}
	}
	return response;
}

function geometry(call, callback) {
	const geo = new THREE.OctahedronGeometry();
	let resp = {
		position: Array.from(geo.attributes.position.array),
	};
	if (geo.index !== null) {
		resp.index = Array.from(geo.index.array);
	}
	callback(null, resp);
}

function getHello(call, callback) {
  callback(null, {response: "hello"});
}

global.MockBrowser = require('mock-browser').mocks.MockBrowser;
var mock = new MockBrowser();
global.document = MockBrowser.createDocument();
global.window = MockBrowser.createWindow();

const gl = require("gl")(200, 200);
gl.canvas = new Object()
gl.canvas.width = 200;
gl.canvas.height = 200;
let renderer = new THREE.WebGLRenderer({
    context: gl     // Use the headless-gl context for drawing offscreen
})

const geo = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const material = new THREE.MeshPhongMaterial({color: 0x00ff00, specular: 0x555555, shininess: 10});
const obj = new THREE.Mesh(geo, material);
scene.add(obj);

const light = new THREE.PointLight(0xffffff, 5, 100);
light.position.set(5, 5, 5);
scene.add(light);

// const light2 = new THREE.AmbientLight(0x404040); // soft white light
// scene.add(light2);

renderer.render(scene, orthographicCamera);

var testServer = getServer();
testServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  testServer.start();
});
