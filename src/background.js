import * as THREE from 'https://cdn.skypack.dev/three@v0.122.0';

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rgb(r, g, b) {
    return new THREE.Vector3(r, g, b);
}

// Global reference to mesh for controls
let globalMesh = null;

// Global color control variables (accessible from outside modules)
window.colorControls = {
    setColorOverride: function(r, g, b) {
        window.colorControls.controlColorR = r;
        window.colorControls.controlColorG = g;
        window.colorControls.controlColorB = b;
        console.log('🎨 Color override set:', r, g, b);
    },
    unsetColorOverride: function() {
        window.colorControls.controlColorR = null;
        window.colorControls.controlColorG = null;
        window.colorControls.controlColorB = null;
        console.log('🎨 Color override unset');
    },
    controlColorR: null,
    controlColorG: null,
    controlColorB: null
};

// Control function for external access
window.backgroundControls = {
    setBackgroundColor: function(r, g, b) {
        if (globalMesh && globalMesh.material.uniforms.u_bg) {
            globalMesh.material.uniforms.u_bg.value = rgb(r, g, b);
            console.log('🎨 Set background color:', r, g, b);
        } else {
            console.log('❌ Background color not set - mesh not ready');
        }
    },
    setColor1: function(r, g, b) {
        // Set both direct uniform and animation override
        if (globalMesh && globalMesh.material.uniforms.u_color1) {
            globalMesh.material.uniforms.u_color1.value = rgb(r, g, b);

            // Also set the animation override so it persists
            window.colorControls.controlColorR = r;
            window.colorControls.controlColorG = g;
            window.colorControls.controlColorB = b;

            console.log('🎨 Set color1:', r, g, b, '(with animation override)');
        } else {
            console.log('❌ Color1 not set - mesh not ready');
        }
    },
    setColor2: function(r, g, b) {
        if (globalMesh && globalMesh.material.uniforms.u_color2) {
            globalMesh.material.uniforms.u_color2.value = rgb(r, g, b);
            console.log('🎨 Set color2:', r, g, b);
        } else {
            console.log('❌ Color2 not set - mesh not ready');
        }
    },
    setPosition: function(x, y, z) {
        if (globalMesh) {
            globalMesh.position.set(x, y, z);
            console.log('🎨 Set position:', x, y, z);
        } else {
            console.log('❌ Position not set - mesh not ready');
        }
    },
    setRotation: function(rx, ry, rz) {
        if (globalMesh) {
            globalMesh.rotation.x = rx;
            globalMesh.rotation.y = ry;
            globalMesh.rotation.z = rz;
            console.log('🎨 Set rotation:', rx, ry, rz);
        } else {
            console.log('❌ Rotation not set - mesh not ready');
        }
    },
    setScale: function(scale) {
        if (globalMesh) {
            globalMesh.scale.setScalar(scale);
            console.log('🎨 Set scale:', scale);
        } else {
            console.log('❌ Scale not set - mesh not ready');
        }
    },
    setAnimationSpeed: function(timeSpeed, posSpeed) {
        window.timeIncrement = timeSpeed;
        window.posIncrement = posSpeed;
        console.log('🎨 Set animation speed:', timeSpeed, posSpeed);
    },
    updateBackgroundDistortion: function(distortionValue) {
        if (globalMesh && globalMesh.material.uniforms.u_distortion) {
            globalMesh.material.uniforms.u_distortion.value = distortionValue;
            console.log('🌊 Background distortion updated via shader uniform:', distortionValue);
            return true;
        } else {
            console.log('❌ Background distortion not available - u_distortion uniform not found');
            return false;
        }
    },
    updateBackgroundFrequency: function(frequencyValue) {
        // Update time increment based on frequency
        window.timeIncrement = frequencyValue * 0.01; // Scale frequency to animation speed
        console.log('🌊 Background frequency updated - new time increment:', window.timeIncrement);
        return true;
    },
    updateBackgroundPhase: function(phaseValue) {
        // Set initial time offset for the animation phase
        window.phaseOffset = phaseValue;
        console.log('🌊 Background phase offset updated to:', phaseValue);

        // Immediately update the current time with the phase offset
        if (typeof window.currentAnimationTime !== 'undefined') {
            window.baseTime = window.phaseOffset;
        }
        return true;
    },
    reset: function() {
        if (globalMesh) {
            // Reset to original values
            globalMesh.position.set(-200, 270, -280);
            globalMesh.rotation.x = -1.0;
            globalMesh.rotation.y = 0.0;
            globalMesh.rotation.z = 0.1;
            globalMesh.scale.setScalar(4);

            globalMesh.material.uniforms.u_bg.value = rgb(23, 27, 34);
            globalMesh.material.uniforms.u_color1.value = rgb(23, 27, 34);
            globalMesh.material.uniforms.u_color2.value = rgb(0, 17, 34);

            // Reset animation speeds
            window.timeIncrement = 0.01;
            window.posIncrement = 0.005;

            // Reset color overrides to let procedural animation work again
            window.colorControls.unsetColorOverride();

            console.log('🎨 Reset applied - animation will return to procedural mode');
        } else {
            console.log('❌ Reset failed - mesh not ready');
        }
    }
};
document.addEventListener("DOMContentLoaded", function(e) {
   
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 100, 500 );
  
    // responsive resizing handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onWindowResize, false);

    // 
    
    let vCheck = false;

    camera.position.z = 5;

    var randomisePosition = new THREE.Vector2(1, 2);

    var R = function(x, y, t) {
        return( Math.floor(192 + 64*Math.cos( (x*x-y*y)/3000 + t )) );
    }
     
    var G = function(x, y, t) {
        return( Math.floor(192 + 64*Math.sin( (x*x*Math.cos(t/4)+y*y*Math.sin(t/3))/3000 ) ) );
    }
      
    var B = function(x, y, t) {
        return( Math.floor(192 + 64*Math.sin( 5*Math.sin(t/9) + ((x-10)*(x-10)+(y-10)*(y-10))/110) ));
    }
    let sNoise = document.querySelector('#snoise-function').textContent
    let geometry = new THREE.PlaneGeometry(window.innerWidth / 2, 400, 100, 100);
    let material = new THREE.ShaderMaterial({
        uniforms: {
            u_bg: {type: 'v3', value: rgb(23, 27, 34)},
            u_bgMain: {type: 'v3', value: rgb(23, 27, 34)},
            u_color1: {type: 'v3', value: rgb(23, 27, 34)},
            u_color2: {type: 'v3', value: rgb(0, 17, 34)},
            u_time: {type: 'f', value: 10},
            u_randomisePosition: { type: 'v2', value: randomisePosition },
            u_distortion: {type: 'f', value: 3.5}
        },
        fragmentShader: sNoise + document.querySelector('#fragment-shader').textContent,
        vertexShader: sNoise + document.querySelector('#vertex-shader').textContent,
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-200, 270, -280);
    mesh.scale.multiplyScalar(4);
    mesh.rotationX = -1.0;
    mesh.rotationY = 0.0;
    mesh.rotationZ = 0.1;
    scene.add(mesh);

    // Make mesh globally available for controls
    globalMesh = mesh;
    console.log('🎯 Mesh initialized and assigned to globalMesh');

    renderer.render( scene, camera );
    let t = 0;
    let j = 0;
    let x = randomInteger(0, 32);
    let y = randomInteger(0, 32);

    // Initialize animation speeds and control variables
    window.timeIncrement = 0.01;
    window.posIncrement = 0.005;
    window.phaseOffset = 0; // Initialize phase offset

    // Override color functions to use control values
    let originalR = R, originalG = G, originalB = B;
    let controlColorR = null, controlColorG = null, controlColorB = null;

    // Create controllable color functions that use global control variables
    function controllableR(x, y, t) {
        return window.colorControls.controlColorR !== null ? window.colorControls.controlColorR : originalR(x, y, t);
    }
    function controllableG(x, y, t) {
        return window.colorControls.controlColorG !== null ? window.colorControls.controlColorG : originalG(x, y, t);
    }
    function controllableB(x, y, t) {
        return window.colorControls.controlColorB !== null ? window.colorControls.controlColorB : originalB(x, y, t);
    }

    const animate = function () {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
        mesh.material.uniforms.u_randomisePosition.value = new THREE.Vector2(j, j);

        mesh.material.uniforms.u_color1.value = new THREE.Vector3(
            controllableR(x,y,t/2), controllableG(x,y,t/2), controllableB(x,y,t/2)
        );

        // Apply phase offset to the time value
        mesh.material.uniforms.u_time.value = t + (window.phaseOffset || 0);
        if(t % 0.1 == 0) {
            if(vCheck == false) {
                x -= 1;
                if(x <= 0) {
                    vCheck = true;
                }
            } else {
                x += 1;
                if(x >= 32) {
                    vCheck = false;
                }

            }
        }

        // Use controllable increment values
        j = j + (window.posIncrement || 0.005);
        t = t + (window.timeIncrement || 0.01);
    };
    animate();
  
});
