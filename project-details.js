const projects = {
  drenched: {
    title: "Drenched",
    subtitle: "Engineer/Technical Artist",
    team: "Team · 20-30",
    heroImage: "images/drenched.jpg",
    heroAlt: "Drenched game screenshot",
    description: "A 3D narrative game about a struggling artist. I worked as an Engineer and Technical Artist across the project's tools, gameplay, VFX, shaders, and performance. Expected to release in mid October 2026.",
    links: [
      { label: "Steam", href: "https://store.steampowered.com/app/4597820/DRENCHED/", icon: "fab fa-steam" }
    ],
    sections: [
      {
        title: "Ripple Effect",
        text: "Drenched's puddles needed to react to the player's footsteps, jumps, and landings without losing the game's stylized look. I built a real time ripple system in Unity's Universal Render Pipeline using a custom GPU simulation, Shader Graph integration, and a mask that keeps disconnected puddles from sharing waves.",
        detail: "The simulation is based on the classic 2D wave feedback scheme popularized by Hugo Elias. Each frame, a ping pong pair of render textures reads the previous two height fields, averages the neighboring cells, and subtracts the older frame to give the wave its momentum. A tunable damping term gradually removes energy so ripples fade instead of continuing forever. The height field is stored in a single channel floating point render texture, and footsteps, jumps, and landings disturb it by rendering particle sources from a top down orthographic camera into a separate buffer that is then added to the simulation. A second camera renders only the puddle surfaces into a mask texture. Multiplying the simulation by that mask makes waves die at each puddle's edge, while genuinely overlapping puddles merge into one connected body automatically.",
        extra: "The difficult part was keeping the simulation locked to the world while using one shared camera that follows the player across every puddle in the level. If the camera simply follows the player, the buffer moves with it and the ripples look glued to the character. I solved that by reprojecting the buffer every frame: the shader offsets its sample coordinates by the camera's movement so world space points stay pinned while the simulation texture scrolls underneath them. The camera snaps to whole texel boundaries, making the reprojection a clean copy rather than a constantly resampled image that would smear the ripples over time. Once the simulation is stable, I feed it into the puddle material with Shader Graph so the effect stays readable in the stylized water.",
        media: [
          { type: "video", src: "videos/DrenchedRippleFinal.mp4", caption: "The ripple system reacting to footsteps, jumps, and landings in the puddles." },
          { type: "image", src: "images/RipplePuddleMask.png", alt: "Puddle mask used to confine the ripple simulation", caption: "The puddle mask confines the simulation to connected water surfaces." },
          { type: "image", src: "images/RippleShaderGraph.png", alt: "Ripple shader graph", caption: "The ripple data is integrated into the stylized water shader." }
        ]
      },
      {
        title: "Dissolve Shader",
        text: "The dissolve works the same way in both shaders; only the lighting is different. One graph handles its own toon shading, while the other is a standard Lit surface. Keeping the dissolve logic the same lets the effect work across both materials.",
        detail: "It all comes down to alpha clipping. A Sample Texture 2D reads a pattern for each pixel and sends that value into the Fragment's Alpha, while _DissolveAmount feeds the Alpha Clip Threshold. URP discards any pixel whose alpha falls below that threshold. As _DissolveAmount moves from 0 to 1, pixels disappear in the order defined by the texture's brightness, which makes the surface look as though it is being eaten away. Using the painting's own illustrated image gives the reveal a shape that follows the artwork; a shared noise or gradient map would produce a more consistent sweep across all three paintings.",
        extra: "The glowing edge is a small side network. Adding _DissolveAmount and _DissolveWidth creates a second cutoff just ahead of the clip point, Step isolates the thin strip at the boundary, and Multiply tints that strip with _DissolveColor before sending it to Emission. That creates the rim glow, with _DissolveWidth controlling its thickness. If a single Step lights the wrong side of the edge, the band can be isolated more reliably with step(amount) - step(amount + width). The script animates _DissolveAmount from 0 to 1 when the level complete event fires. Because there are three separate paintings, I use a MaterialPropertyBlock per renderer instead of material.SetFloat, avoiding material clones and letting each painting dissolve independently. The paintings' colliders are disabled, or the path is enabled, after the animation reaches 1. Shader.PropertyToID is cached for the animated property as well.",
        media: [
          { type: "video", src: "videos/DrenchedDissolveVideo.mp4", caption: "The dissolve effect in the finished scene." },
          { type: "image", src: "images/DissolveShaderBase.png", alt: "Dissolve shader graph", caption: "The base dissolve network uses alpha clipping to remove pixels." },
          { type: "image", src: "images/ToonDissolveShaderReal.png", alt: "Toon dissolve shader graph", caption: "The toon version keeps the same dissolve logic while changing the lighting model." }
        ]
      },
      {
        title: "Profiling & Optimization",
        text: "The game had serious performance problems built into its architecture. Before I joined, nearly the entire game was stored in a single scene. The surface and underwater sections used duplicated assets, and screen space reflections were driving the puddles. The scene was carrying much more geometry, rendering work, and reflection cost than it needed.",
        detail: "Profiling was new to me when I started, so I brought in my Game Engine Programming professor to walk through the process properly instead of guessing at the cause. We used A/B testing: I placed the character at a fixed position so the camera and workload were identical between runs, then toggled specific objects and systems on and off while watching the Unity Profiler. Comparing those runs against a consistent baseline made it possible to isolate actual costs rather than chase symptoms.",
        extra: "Two major culprits came out of that process. First, the puddle reflections covered the entire scene, which cost more than the effect needed. I changed the render settings so the reflections included only the character layer and skybox. The player still reads clearly in the water, but the render cost is much lower. Second, the single scene kept both the surface and underwater worlds active even though the player could only be in one at a time. My first instinct was occlusion culling, but testing showed that its CPU overhead was not worth it for this layout. Instead, I wrote a form based switch that enables the surface world in Brie form and the underwater world in fish form. This was the biggest performance win, cutting draw calls and scene geometry by 30 to 40 percent, depending on whether the surface or underwater world is active. I am still working with the art director on shadow distance, light settings, and render scale, since each one trades performance for visual quality.",
        media: [
          { type: "image", src: "images/SurfaceOptimized.png", alt: "Surface world before optimization", caption: "Surface world before the WorldForm optimization." },
          { type: "image", src: "images/Surface_Unoptimized.png", alt: "Surface world after optimization", caption: "Surface world after the WorldForm optimization." },
          { type: "image", src: "images/Underwater_Unoptimized.png", alt: "Underwater world before optimization", caption: "Underwater world before the WorldForm optimization." },
          { type: "image", src: "images/UnderwaterOptimized.png", alt: "Underwater world after optimization", caption: "Underwater world after the WorldForm optimization." }
        ]
      },
      {
        title: "Tools",
        text: "I built a Level Skip tool after noticing that the team often had to replay the game from the beginning just to test a later section. The tool moves both the fish and Brie to the correct starting position for each level and provides an easy way to enable every mechanic without completing the tutorial first.",
        detail: "I also created a Material Replacer tool while updating the materials on a large group of fence objects with a new material built from my dissolve shader. Replacing each material by hand would have been tedious and easy to get wrong, so I wrote a script that takes a parent object, finds every instance of a selected material beneath it, and swaps those instances to a new material. Both tools reduced repetitive setup work and gave the team more time to test the parts of the game that mattered.",
        media: [
          { type: "video", src: "videos/LevelSkipTool.mp4", caption: "The Level Skip tool moves the player to a level's starting position and enables its mechanics for testing." },
          { type: "video", src: "videos/Material Replacer Demo.mp4", caption: "The Material Replacer tool swaps selected materials across a parent object's hierarchy." }
        ]
      },
      {
        title: "Fish Trail",
        text: "I made the fish's underwater motion trail to show its movement through the water. It uses one Shader Graph material across three stacked Trail Renderers. Each renderer has a different width and lifetime, giving the wake some depth instead of making it read as one flat stripe.",
        detail: "The motion comes from the UVs rather than the geometry. A Time node scrolls the texture down the length of the trail so the pattern flows instead of sitting still, and I exposed that speed as a TexSpeed parameter so it can be tuned per scene. The fade is built from a gradient ramp and a power falloff: the trail is brightest near the fish's head and gradually thins toward the tail. Color is a lerp between two exposed swatches, which makes it possible to retint the entire effect for a new environment without opening the graph.",
        extra: "There is also a noise dissolve branch using NoiseTex and DissolveSpeed that I prototyped early. The art director and I cut it during review because the cleaner ribbon held up better against the game's soft water. I left the branch wired up but switched off rather than deleting it, so the experiment and its controls are still available if the effect needs to change later.",
        media: [
          { type: "video", src: "videos/DrenchedFishTrailVideo.mp4", caption: "The fish trail moving through the water." },
          { type: "image", src: "images/FishTrailShader.png", alt: "Fish trail shader graph", caption: "The Shader Graph controls the trail's scrolling texture, fade, and color." }
        ]
      }
    ]
  },
  resolution: {
    title: "Resolution",
    subtitle: "Gameplay/Systems Engineer",
    team: "Team · 20-30",
    heroImage: "images/ResolutionLogo.png",
    heroAlt: "Resolution logo",
    description: "An experimental alternative control narrative experience built in Unity that uses up to four sewing related alternative controls. The project will be showcased at the USC Game Expo in May 2027.",
    links: [
      { label: "More Info", href: "https://docs.google.com/presentation/d/1WCyCupr3HePws-3P-DTBbWoSJBfaS78D2zTZ0fPQ91g/edit?usp=sharing", icon: "fas fa-info-circle" }
    ],
    sections: [
      {
        title: "Architecture",
        text: "I separated orchestration from presentation. WeaveSystem moves through a phase order set for each image, while a factory registry creates the active mechanic based on its phase type. Adding another phase only requires registering its class instead of changing the state machine.",
        detail: "Each phase reports progress through a small responder interface. Different images can use different shader behaviors without making the state machine aware of their implementation. One responder can drive a continuous threshold, while another can move through discrete stages. The configuration lives in a ScriptableObject and is split by mechanic, so values can be authored and reused separately from a scene's GameObject hierarchy. Scene specific references stay on a MonoBehaviour, where they point to the GameObjects for each stage.",
        extra: "Systems communicate through the project's existing event bus instead of direct references. UI and other listeners can react to phase changes without knowing how each mechanic works.",
        media: [
          { type: "video", src: "videos/ResolutionScene1.mp4", caption: "The phase based interaction system running on an image based scene." },
          { type: "image", src: "images/ResolutionWeaveSO.png", alt: "Weave Scriptable Object inspector in Unity", caption: "The Weave Image Scriptable Object configuration drives the phase progression by tuning the primary fabric shader's material properties." }
        ]
      },
      {
        title: "Limitations and Next Steps",
        text: "This was built to test the core ideas with one real art asset, not as a final architecture, and a few limitations remain. The current config model supports both continuous progress and discrete stages because we had not decided whether Weave should always use one model or the other.",
        detail: "The presentation layer is also closely tied to the shaders. The responder for the discrete stage path uses specific shader property names and accounts for the shader switching between two grid interpolation paths as the reveal changes. Mapping that behavior took several rounds of live testing. Object transitions originally happened as instant swaps. Later shader work exposed a transparency channel that allowed the discrete stages to crossfade, although that currently only works for the discrete stage path.",
        extra: "Input, the Erase mechanic, and save and checkpoint persistence are still stubbed. That is enough to prove the phase flow and architecture, but those systems need to be completed before this is production ready.",
        media: []
      }
    ]
  },
  dreamcatchers: {
    title: "DreamCatchers",
    subtitle: "Technical Artist",
    team: "Team · 50-60",
    heroImage: "images/DreamCatcherLogo.png",
    heroAlt: "DreamCatchers logo",
    description: "An Advanced Game Project at USC: an online co op horror game built in Unreal Engine 5, expected to release in May 2027.",
    links: [
      { label: "More Info", href: "https://docs.google.com/presentation/d/1G0SFChr6JbNeBVBw41wegrGqX3hm79Diz-plBh-DOUU/edit?usp=sharing", icon: "fas fa-info-circle" }
    ],
    sections: [
      {
        title: "Star Projector",
        text: "I authored the material in Unreal Engine 5's Light Function domain. It drives a projected texture through Emissive and is organized into separate node groups for rotation, the main projection, and flicker. The result is one point light that projects a moving starfield and crescent moon around the space without separate lights or decals.",
        detail: "The flicker uses three sine waves at coprime frequencies. Multiplying and remapping them creates a pulse that feels irregular instead of like an obvious loop, and an adjustable floor keeps the light from dropping completely to black. Rotation is animated inside the material, while a spherical projection wraps the pattern around the space surrounding the light.",
        media: [
          { type: "video", src: "videos/StarLightProjectorVideo.mp4", caption: "The finished star projector light function in motion." }
        ]
      },
      {
        title: "Projection Challenges",
        text: "The first challenge was distortion that changed with the camera. The projection warped and slid because it used a direction based on the view. I rebuilt it from a world space direction so the stars stay painted on the surfaces as the viewer moves.",
        detail: "The world position version initially produced nothing because the Light Function Atlas does not support sampling world position. Disabling the atlas restored the legacy path and fixed the projection. I also worked through the distortion from projecting a 2:1 equirectangular texture. The texture pinches at the poles, so I authored a custom star texture with latitude corrected star shapes and more even distribution before moving to a cubemap to remove the pole singularity.",
        extra: "Changing the projection also changed the data flowing through the graph, which broke the original spin logic. I rebuilt the rotation to operate directly on the direction vector. That fixed the type mismatch and let the material rotate around arbitrary axes instead of relying on the original projection.",
        media: [
          { type: "image", src: "images/StarProjectorMaterialGraph.png", alt: "Star projector material graph in Unreal Engine", caption: "The material graph separates the projection, rotation, and flicker logic into reusable groups." }
        ]
      }
    ]
  },
  "drive-horizon": {
    title: "Drive Horizon",
    subtitle: "Software Engineer",
    team: "Solo",
    heroImage: "images/RoadToNowhere.png",
    heroAlt: "Drive Horizon screenshot",
    description: "A fast driving browser prototype built in Three.js with responsive controls, a stylized world, and a strong sense of motion. Disclaimer: I did not create the car model or the background music. Requires Graphics Acceleration in browser settings to be enabled.",
    links: [
      { label: "Play", href: "https://joshua11805.github.io/three.js-Testing/", icon: "fas fa-play" },
      { label: "GitHub", href: "https://github.com/joshua11805/three.js-Testing", icon: "fab fa-github" }
    ],
    sections: [
      {
        title: "Background",
        text: "I had already built a custom game engine in C++ in my Game Engine Programming class, TAC 485, and I had recently started learning Three.js to help a friend with their portfolio. Much of the graphics work from that engine carried over to browser rendering, so I wanted to see how much of the pipeline I could rebuild in a browser game.",
        detail: "I wanted to capture the feel of a small custom engine in a browser. I worked on the systems that have the biggest effect on the game: physics, collisions, UI, and graphics. The project let me test which engine concepts transferred cleanly and which ones needed a different approach on the web.",
        extra: "I built a procedural terrain system driven by noise so the level could vary without hand authored meshes. I also created custom GLSL shaders, including a chromatic aberration effect for high speed play and a terrain shader that randomizes where generated mesh triangles spawn before lerping them into place for a smoother transition. It was a useful exercise in translating engine ideas into a small browser prototype.",
        media: []
      }
    ]
  }
};

function renderLinks(links = []) {
  return links.map(link => `
    <a class="project-detail-link" href="${link.href}" target="_blank" rel="noreferrer">
      <i class="${link.icon}" aria-hidden="true"></i>
      ${link.label}
    </a>
  `).join('');
}

function renderSections(sections = []) {
  return sections.map((section, index) => `
    <section class="detail-section">
      <div class="detail-section-heading">
        <h2>${section.title}</h2>
      </div>
      <div class="detail-story">
        ${section.title === 'Ripple Effect'
          ? `
            ${section.media?.[0] ? renderMedia(section.media[0], section.title) : ''}
            <div class="detail-story-row detail-story-row-text-only">
              <p>${section.text}</p>
            </div>
            ${section.media?.[1] ? renderMedia(section.media[1], section.title) : ''}
            ${[section.detail, section.extra].filter(Boolean).map(paragraph => `
              <div class="detail-story-row detail-story-row-text-only">
                <p>${paragraph}</p>
              </div>
            `).join('')}
            ${section.media?.[2] ? renderMedia(section.media[2], section.title) : ''}
          `
          : [section.text, section.detail, section.extra].filter(Boolean).map((paragraph, paragraphIndex) => `
            <div class="detail-story-row ${section.media?.[paragraphIndex] ? '' : 'detail-story-row-text-only'}">
              <p>${paragraph}</p>
              ${section.media?.[paragraphIndex] ? renderMedia(section.media[paragraphIndex], section.title) : ''}
            </div>
          `).join('')}
        ${section.media?.slice(3).length ? `
          <div class="detail-media-list">
            ${section.media.slice(3).map(media => renderMedia(media, section.title)).join('')}
          </div>
        ` : ''}
      </div>
    </section>
  `).join('');
}

function renderMedia(media, sectionTitle) {
  return `
    <figure class="detail-media">
      ${media.type === 'video'
        ? `<video controls preload="metadata"><source src="${media.src}" type="video/mp4"></video>`
        : `<img src="${media.src}" alt="${media.alt || sectionTitle}">`}
      ${media.caption ? `<figcaption>${media.caption}</figcaption>` : ''}
    </figure>
  `;
}

const projectKey = new URLSearchParams(window.location.search).get('project');
const project = projects[projectKey];

if (!project || !project.title || !project.description || !project.heroImage || !project.sections?.length) {
  document.title = 'Project Details | Joshua Shin';
  document.getElementById('project-detail').replaceChildren();
} else {
  document.title = `${project.title} | Joshua Shin`;

  const isDriveHorizon = project.title === 'Drive Horizon';

  document.getElementById('project-detail').innerHTML = `
  <a class="back-link" href="index.html"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to Projects</a>
  <article>
    <header class="detail-hero">
      <div class="detail-hero-copy">
        <h1>${project.title}</h1>
        <p class="detail-subtitle">${project.subtitle}</p>
        <span class="detail-team">${project.team}</span>
      </div>
      <img src="${project.heroImage}" alt="${project.heroAlt}">
    </header>
    <section class="detail-intro ${isDriveHorizon ? 'detail-intro-drive-horizon' : ''}">
      ${isDriveHorizon
        ? `
          <div class="detail-intro-callout-row">
            <p class="detail-intro-callout">Try it yourself:</p>
            ${project.links?.length ? `<div class="project-detail-links">${renderLinks(project.links)}</div>` : ''}
          </div>
          <p>${project.description}</p>
        `
        : `
          <p>${project.description}</p>
          ${project.links?.length ? `<div class="project-detail-links">${renderLinks(project.links)}</div>` : ''}
        `}
    </section>
    <div class="detail-sections">
      ${renderSections(project.sections)}
    </div>
  </article>
  `;
}
