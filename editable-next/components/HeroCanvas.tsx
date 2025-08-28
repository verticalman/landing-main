"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// monopo.vn repo shaders (inline)
const VERT_BG = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const FRAG_BG = `
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

// Helper macro to convert 0-255 RGB to normalized vec3
#define HEX(r,g,b) vec3(float(r)/255.0, float(g)/255.0, float(b)/255.0)

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);} 

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float lines(vec2 uv, float offset){
  return smoothstep(
    0., 0.5 + offset*0.5,
    0.5*abs((sin(uv.x*45.) + offset*2.)) // denser highlights
  );
}

mat2 rotate2D(float angle){
  return mat2(
    cos(angle),-sin(angle),
    sin(angle),cos(angle)
  );
}

void main(){
  // Monochromatic palette (tweak here)
  // COLOR_BG: full black background
  // COLOR_DARK: dark gray nuance
  // COLOR_LIGHT: white accent
  vec3 COLOR_BG    = HEX(7, 7,10);    // ~#07070A
vec3 COLOR_DARK  = HEX(18,18,23);   // ~#121217 (cards, panels)
vec3 COLOR_LIGHT = HEX(236,232,223);// ~#ECE8DF (text/UI)
vec3 COLOR_ACCENT= HEX(199,168,109);// ~#C7A86D (muted gold)
  float n = noise(vPosition + time);
  vec2 baseUV = rotate2D(n)*vPosition.xy*0.06; // larger features (less white area)
  float basePattern = lines(baseUV, 0.5);
  float secondPattern = lines(baseUV, 0.1);
  // Start from strict background color, then layer subtle white accents
  vec3 baseColor = COLOR_BG;
  vec3 secondBaseColor = mix(baseColor, COLOR_LIGHT, secondPattern * 0.22);
  gl_FragColor = vec4(secondBaseColor, 1.0);
}`;

const VERT_FRESNEL = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels; 
float PI = 3.141592653589793238;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

uniform float mRefractionRatio;
uniform float mFresnelBias ;
uniform float mFresnelScale;
uniform float mFresnelPower;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  vec3 I = worldPosition.xyz - cameraPosition;
  vReflect = reflect( I, worldNormal );
  vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
  vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );
  gl_Position = projectionMatrix * mvPosition;
}`;

const FRAG_FRESNEL = `
uniform samplerCube tCube;
varying vec3 vPosition;
varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
void main(){
  vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  vec4 refractedColor = vec4( 1.0 );
  refractedColor.r = textureCube( tCube, vec3( vRefract[0].x, vRefract[0].yz ) ).r;
  refractedColor.g = textureCube( tCube, vec3( vRefract[1].x, vRefract[1].yz ) ).g;
  refractedColor.b = textureCube( tCube, vec3( vRefract[2].x, vRefract[2].yz ) ).b;
  gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
}`;

// Postprocessing grain shader from repo's CustomShader.js
const DotScreenShader = {
  uniforms: {
    tDiffuse: { value: null },
    tSize: { value: new THREE.Vector2(256, 256) },
    center: { value: new THREE.Vector2(0.5, 0.5) },
    angle: { value: 1.57 },
    scale: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform vec2 center; 
    uniform float angle; 
    uniform float scale; 
    uniform vec2 tSize; 
    uniform sampler2D tDiffuse; 
    varying vec2 vUv; 
    float pattern(){
      float s = sin(angle), c = cos(angle);
      vec2 tex = vUv * tSize - center;
      vec2 point = vec2(c*tex.x - s*tex.y, s*tex.x + c*tex.y) * scale;
      return (sin(point.x) * sin(point.y)) * 4.0;
    }
    float random(vec2 p){
      vec2 k1 = vec2(23.14069263277926, 2.665144142690225);
      return fract(cos(dot(p,k1)) * 12345.6789);
    }
    void main(){
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uvrandom = vUv; 
      uvrandom.y *= random(vec2(uvrandom.y, 0.4));
      color.rgb += random(uvrandom) * 0.03; // subtle grain
      gl_FragColor = color;
    }
  `,
};

export default function HeroCanvas({ fixed = false, phase = 'hero', onReady, onCanvasReady, pixelRatio }: { fixed?: boolean; phase?: 'loading' | 'hero'; onReady?: () => void; onCanvasReady?: (canvas: HTMLCanvasElement) => void; pixelRatio?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<'loading' | 'hero'>(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 2, 0.001, 1000);
    camera.position.set(0, 0, 1.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    const pr = typeof pixelRatio === 'number' ? pixelRatio : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    // sRGB output (three r160+)
    // @ts-ignore - types may lag behind
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(new THREE.Color("#07070A"), 1);
    container.appendChild(renderer.domElement);
    try { onCanvasReady?.(renderer.domElement); } catch {}

    // Postprocessing composer with grain
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const grainPass = new ShaderPass(DotScreenShader as any);
    (grainPass.uniforms as any)["scale"].value = 4;
    composer.addPass(grainPass);

    // Cube camera for reflections/refractions
    const cubeRT = new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      // @ts-ignore
      encoding: THREE.sRGBEncoding,
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRT);

    // Background large sphere (fills view)
    const bgMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
      },
      vertexShader: VERT_BG,
      fragmentShader: FRAG_BG,
    });
    const bgGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const bgSphere = new THREE.Mesh(bgGeo, bgMaterial);
    scene.add(bgSphere);

    // Small Fresnel sphere (hero orb)
    const fresnelMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        tCube: { value: null },
        mRefractionRatio: { value: 1.02 },
        mFresnelBias: { value: 0.1 },
        mFresnelScale: { value: 4.0 },
        mFresnelPower: { value: 2.0 },
        resolution: { value: new THREE.Vector4() },
      },
      vertexShader: VERT_FRESNEL,
      fragmentShader: FRAG_FRESNEL,
      transparent: false,
    });
    const smallGeo = new THREE.SphereGeometry(0.7, 48, 48); // base size
    const smallSphere = new THREE.Mesh(smallGeo, fresnelMat);
    const basePos = new THREE.Vector3(-0.45, 0.05, 0.0);
    const centerPos = new THREE.Vector3(0, 0, 0);
    const loadingCenterPos = new THREE.Vector3(0, 0, -0.35); // push back during loading
    // initial placement depends on phase
    if (phaseRef.current === 'loading') {
      // Centered during loading, slightly larger but still outside camera frustum
      smallSphere.position.copy(centerPos);
      smallSphere.scale.setScalar(1.8);
    } else {
      smallSphere.position.copy(basePos);
      smallSphere.scale.setScalar(1.6);
    }
    scene.add(smallSphere);

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    // Pointer-driven parallax (subtle)
    const pointerN = new THREE.Vector2(0, 0); // normalized -1..1 relative to container
    function onPointerMove(e: PointerEvent) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      pointerN.set(x * 2 - 1, -(y * 2 - 1)); // -1..1 with +y up
    }
    window.addEventListener("pointermove", onPointerMove);
    resize();

    let raf = 0;
    let firstFrame = true;
    function animate() {
      // Background behavior per phase
      // Keep background sphere visible in all phases so the shader is always rendering
      if (!bgSphere.visible) bgSphere.visible = true;
      // During loading, just disable grain but do not black out the scene
      if (phaseRef.current === 'loading') {
        grainPass.enabled = false;
      } else {
        grainPass.enabled = true;
      }
      // Use the dark background clear color consistently
      renderer.setClearColor(new THREE.Color("#07070A"), 1);

      // Slow down background evolution
      bgMaterial.uniforms.time.value += 0.004;
      // Determine target based on phase
      if (phaseRef.current === 'loading') {
        // Stay centered with a slightly larger scale that remains safe
        const tPos = centerPos;
        // Slower easing towards center
        smallSphere.position.lerp(tPos, 0.02);
        const targetScale = 1.8;
        // Slower scale easing
        const s = smallSphere.scale.x + (targetScale - smallSphere.scale.x) * 0.02;
        smallSphere.scale.setScalar(s);
      } else {
        // hero: slower eased travel to base with subtle pointer influence
        const target = new THREE.Vector3(
          basePos.x + pointerN.x * 0.05,
          basePos.y + pointerN.y * 0.03,
          basePos.z + pointerN.x * 0.008
        );
        // Slower easing toward target
        smallSphere.position.lerp(target, 0.02);
        // lerp scale to normal hero scale a bit slower
        const targetScale = 1.6;
        const s = smallSphere.scale.x + (targetScale - smallSphere.scale.x) * 0.03;
        smallSphere.scale.setScalar(s);
      }
      // Update cube env from scene without small sphere self-visibility
      smallSphere.visible = false;
      cubeCamera.position.copy(smallSphere.position); // track sphere position
      cubeCamera.update(renderer, scene);
      smallSphere.visible = true;
      fresnelMat.uniforms.tCube.value = cubeRT.texture;

      if (firstFrame) {
        firstFrame = false;
        try { onReady?.(); } catch {}
      }
      raf = requestAnimationFrame(animate);
      composer.render();
    }
    animate();

    return () => {
      try { cancelAnimationFrame(raf); } catch {}
      try { window.removeEventListener("resize", onResize); } catch {}
      try { window.removeEventListener("pointermove", onPointerMove as any); } catch {}
      try { composer?.dispose?.(); } catch {}
      try { bgGeo?.dispose?.(); } catch {}
      try { smallGeo?.dispose?.(); } catch {}
      try { (bgMaterial as any)?.dispose?.(); } catch {}
      try { (fresnelMat as any)?.dispose?.(); } catch {}
      try { (cubeRT as any)?.dispose?.(); } catch {}
      try { renderer?.dispose?.(); } catch {}
      try {
        if (renderer?.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      } catch {}
    };
  }, []);

  return <div style={{ position: fixed ? "fixed" : "absolute", inset: 0, zIndex: 0 }} ref={mountRef} />;
}
