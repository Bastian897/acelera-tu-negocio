/**
 * Intro del logo ("aguja que calibra"). El isotipo entra como la aguja de un
 * instrumento: barre desde -70° y se asienta, mientras un arco de calibración
 * se dibuja detrás; «acelera» sube letra por letra y el logo viaja a su lugar
 * en el nav mientras la cortina se abre sobre el hero.
 *
 * Toda la animación es CSS (ver "Intro del logo" en styles.css), así no
 * depende de que React hidrate a tiempo. Solo corre si el script inline del
 * <head> (INTRO_HEAD_SCRIPT, en __root.tsx) marcó <html class="intro-active">:
 * primera visita de la sesión, en "/" sin #sección, sin prefers-reduced-motion. Sin esa
 * clase la cortina es display:none y la página se ve igual que siempre.
 *
 * El script inline de abajo corre durante el parseo (antes de hidratar):
 * calcula dónde está el ícono del nav para que el logo aterrice justo ahí, y
 * permite saltar la intro con clic, tecla, rueda o toque.
 */

// Paths del logo oficial (public/assets/brand/acelera-logo.svg, viewBox
// 0 0 200.14 68.66). Las letras de «acelera» van ordenadas de izquierda a
// derecha para que el escalonado siga la lectura.
const ISO_PATH =
  "M44.41,8.63l-4.26-3.88c-4.66,4.66-9.59,9.09-15.16,12.61-.19-.25-.38-.49-.57-.73-3.55-4.35-9.21-7-14.84-6.02C4.32,11.53.03,16.27,0,21.67c0,.12,0,.23.02.34h5.73c.01-.11.02-.22.02-.34,0-1.25.51-2.5,1.45-3.49,1.08-1.13,2.3-1.81,3.91-2.02,3.32-.42,6.59,1.51,8.78,4-3.82,1.75-7.99,2.94-11.4,5.38-4.14,2.97-6.92,7.6-5.64,12.81,2.57,10.53,17.59,12.38,24.2,4.62,4.84-5.68,4.03-14,.9-20.69,6.05-3.81,11.41-8.61,16.46-13.67ZM22.99,38.91c-2.1,2.64-6.15,3.64-9.34,2.87-3.19-.77-5.48-3.37-5.36-6.4.05-1.24.82-2.66,1.86-3.73,1.35-1.39,3.04-2.31,4.79-3.11,2.65-1.21,5.35-2.24,7.96-3.47.7,1.64,1.2,3.37,1.52,5.06.56,2.93.39,6.48-1.44,8.78Z";

const WORD_PATHS = [
  "M60.99,34.97h6.09c-1.93,7.5-7.89,11.99-15.92,11.99-9.56,0-16.64-7.25-16.64-16.98s7.25-16.98,16.64-16.98c8.06,0,14.03,4.52,15.94,12.06h-6.08c-1.67-4.15-5.02-6.26-9.87-6.26-6.14,0-10.78,4.81-10.78,11.19s4.52,11.19,10.78,11.19c4.82,0,8.16-2.09,9.84-6.19Z",
  "M101.58,29.1c0-9.51-6.72-16.12-15.77-16.12-9.57,0-16.93,7.42-16.93,17.1s7.25,16.87,16.46,16.87c7.43,0,13.06-3.82,15.41-10.35l.19-.57h0s.36-1.07.36-1.07h-6.14c-1.65,4.11-5.02,6.19-9.84,6.19-5.27,0-9.56-3.82-10.49-9.16h26.72v-2.9ZM75.32,26.2c1.51-4.46,5.68-7.42,10.49-7.42s8.35,2.84,9.51,7.42h-20Z",
  "M110.8,46.37h-5.85V0h5.85v46.37Z",
  "M146.56,29.1c0-9.51-6.72-16.12-15.77-16.12-9.57,0-16.93,7.42-16.93,17.1s7.25,16.87,16.46,16.87c7.43,0,13.06-3.82,15.41-10.35l.19-.57h0s.36-1.07.36-1.07h-6.14c-1.65,4.11-5.02,6.19-9.84,6.19-5.27,0-9.56-3.82-10.49-9.16h26.72v-2.9ZM120.3,26.2c1.51-4.46,5.68-7.42,10.49-7.42s8.35,2.84,9.51,7.42h-20Z",
  "M171.25,13.78c-.36.31-.71.65-1.05.99-1.19,1.21-2.22,2.56-3.06,4.03-.2-.01-.41-.02-.62-.02-6.38,0-10.32,4.06-10.32,10.61v16.99h-5.86V13.56h5.86v2.9c2.72-2.26,6.32-3.48,10.15-3.48,1.78,0,3.4.27,4.91.8Z",
  "M194.29,13.56v3.31c-2.9-2.49-6.72-3.88-10.78-3.88-9.62,0-16.69,7.19-16.69,16.98s7.07,16.98,16.69,16.98c4.06,0,7.88-1.39,10.78-3.88v3.31h5.86V13.56h-5.86ZM183.51,41.16c-6.38,0-10.84-4.64-10.84-11.19s4.47-11.19,10.84-11.19,10.78,4.81,10.78,11.19-4.64,11.19-10.78,11.19Z",
];

const TAG_PATHS = [
  "M4.26,63.16v-4.75h-1.68v-1.57h1.68v-2.57h1.58v2.57h2.98v1.57h-2.98c.09,1.44-.79,8.59,2.46,4.95l.96,1.3c-1.51,2.16-5.1,1.24-5-1.5Z",
  "M9.99,61.96v-5.11h1.58c.32,1.84-1.15,7.64,2.07,7.46,3.83.23,2.6-5.15,2.79-7.46h1.58v8.87h-1.58v-.78c-2.45,2.06-6.62.6-6.44-2.98Z",
  "M25.49,65.72h-1.58v-8.87h1.58v.78c6.5-3.65,6.81,3.5,6.44,8.08h-1.58c-.32-1.84,1.15-7.64-2.07-7.46-3.83-.23-2.6,5.15-2.79,7.46Z",
  "M32.68,61.31c-.09-6.27,9.78-5.93,8.84.52h-7.22c.35,2.96,4.92,3.4,5.61.47l1.47.53c-1.28,4.78-8.93,3.5-8.7-1.52ZM39.82,60.26c-.57-2.75-4.68-2.52-5.41,0h5.41Z",
  "M42.3,65.4l1.5-.58c.31,3.24,6.05,3.03,5.64-.45-9.32,5.02-9.34-11.76,0-6.74v-.78h1.58v7.76c.26,5.08-7.98,5.44-8.73.8ZM49.44,60.98c.14-3.6-5.76-3.5-5.59,0-.16,3.54,5.73,3.64,5.59,0Z",
  "M52.25,61.27c-.17-5.97,9.34-5.96,9.17,0,.16,6-9.33,6.01-9.17,0ZM59.83,61.27c.16-3.93-6.15-3.95-6,0-.14,3.98,6.14,3.97,6,0Z",
  "M62.32,61.28c-.25-5.16,7.71-6.34,8.81-1.33l-1.47.53c-.63-3.41-5.92-2.64-5.75.8-.2,3.46,5.12,4.2,5.75.8l1.47.53c-1.09,5-9.09,3.86-8.81-1.33Z",
  "M72.08,55.14c0-1.3,2.04-1.3,2.04,0,.02,1.3-2.06,1.3-2.04,0ZM73.9,65.72h-1.58v-8.87h1.58v8.87Z",
  "M75.03,61.27c-.17-5.97,9.34-5.96,9.17,0,.16,6-9.33,6.01-9.17,0ZM82.61,61.27c.16-3.93-6.15-3.95-6,0-.14,3.98,6.14,3.97,6,0Z",
];

// Arco de calibración de 240° (viewBox 0 0 200 200) con una marca cada 30°;
// la última marca (fin de escala) va en cyan.
const RING_ARC = "M23.79 144.0 A88 88 0 1 1 176.21 144.0";
const RING_TICKS: [number, number, number, number, boolean][] = [
  [30.72, 140.0, 23.79, 144.0, false],
  [16.0, 100.0, 12.0, 100.0, false],
  [30.72, 60.0, 23.79, 56.0, false],
  [58.0, 27.25, 56.0, 23.79, false],
  [100.0, 20.0, 100.0, 12.0, false],
  [142.0, 27.25, 144.0, 23.79, false],
  [169.28, 60.0, 176.21, 56.0, false],
  [184.0, 100.0, 188.0, 100.0, false],
  [169.28, 140.0, 176.21, 144.0, true],
];

const INTRO_INLINE_SCRIPT = `(function(){
var h=document.documentElement;if(!h.classList.contains("intro-active"))return;
var c=document.getElementById("logo-intro");var icon=document.querySelector("[data-nav-logo-icon]");
if(c&&icon){var iso=c.querySelector("[data-intro-iso]");var svg=c.querySelector("[data-intro-logo]");
var b=icon.getBoundingClientRect(),s=svg.getBoundingClientRect(),bb=iso.getBBox(),u=s.width/200.14;
if(u&&b.width){var k=Math.min(b.width/52.5,b.height/54.5);
var ox=(bb.x+bb.width/2)*u,oy=(bb.y+bb.height/2)*u;
var tx=b.left+(b.width-52.5*k)/2+(4+bb.x+bb.width/2)*k,ty=b.top+(b.height-54.5*k)/2+(4+bb.y+bb.height/2)*k;
c.style.setProperty("--intro-ox",ox+"px");c.style.setProperty("--intro-oy",oy+"px");
c.style.setProperty("--intro-dx",(tx-s.left-ox)+"px");c.style.setProperty("--intro-dy",(ty-s.top-oy)+"px");
c.style.setProperty("--intro-k",String(k/u));}}
function skip(){h.classList.add("intro-skip");off();}
function off(){["pointerdown","keydown","wheel","touchstart"].forEach(function(e){window.removeEventListener(e,skip)})}
["pointerdown","keydown","wheel","touchstart"].forEach(function(e){window.addEventListener(e,skip,{passive:true})});
setTimeout(off,2000);
})();`;

export function LogoIntro() {
  return (
    <>
      <div id="logo-intro" className="logo-intro" aria-hidden="true">
        <div className="logo-intro__stage">
          <svg className="logo-intro__ring" viewBox="0 0 200 200">
            <path className="logo-intro__arc" d={RING_ARC} pathLength={1} />
            {RING_TICKS.map(([x1, y1, x2, y2, end], i) => (
              <line
                key={i}
                className={end ? "logo-intro__tick logo-intro__tick--end" : "logo-intro__tick"}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                style={{ animationDelay: `${60 + i * 50}ms` }}
              />
            ))}
          </svg>
          <svg className="logo-intro__logo" viewBox="0 0 200.14 68.66" data-intro-logo="">
            <path className="logo-intro__iso" d={ISO_PATH} data-intro-iso="" />
            <g className="logo-intro__word">
              {WORD_PATHS.map((d, i) => (
                <path key={i} d={d} style={{ animationDelay: `${550 + i * 45}ms` }} />
              ))}
            </g>
            <g className="logo-intro__tag">
              {TAG_PATHS.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </svg>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: INTRO_INLINE_SCRIPT }} />
    </>
  );
}

/** Va en el <head>: decide antes del primer pintado si corre la intro, así la
 * cortina nunca parpadea. Una vez por sesión de navegador. */
export const INTRO_HEAD_SCRIPT = `try{if(location.pathname==="/"&&!location.hash&&!sessionStorage.getItem("acelera-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("intro-active");sessionStorage.setItem("acelera-intro","1")}}catch(e){}`;
