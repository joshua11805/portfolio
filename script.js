document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio loaded.");

  // ─── Walkthrough Data ───────────────────────────────────────────────────────
  // Add your CLion screenshot paths and narration here.
  // Each step has: image (path), title, and description.

  const walkthroughs = {
    portal: {
      title: "Portal (C++)",
      subtitle: "C++ · SDL3 · 3D Graphics · OOP",
      steps: [
        {
          title: "Component System & OOP Architecture",
          description: "Game objects are represented by the base class Actor, which holds a transform and a list of components. This allows each actor to create the components it needs such as MeshComponent, CollisionComponent, CameraComponent, MovementComponents, and updates them every tick. This made it easy to mix and match behaviors without deep inheritance chains.",
          code:
`//Actor.h
#pragma once
#include "Transform.h"
#include <vector>
#include "Component.h"
#include "SDL3/SDL_mouse.h"
class Actor
{
public:
	Transform& GetTransform() { return mTransform; }
	const Transform& GetTransform() const { return mTransform; }
	bool GetIsActive() const { return mIsActive; }
	void SetIsActive(bool isActive) { mIsActive = isActive; }
	void Destroy();
	void Update(float deltaTime);
	void Input(const bool keys[], SDL_MouseButtonFlags mouseButtons, const Vector2& relativeMouse);

	//CreateComponent template function
	template <typename T>
	T* CreateComponent()
	{
		//create a new instance of type T, which should inherit from Component
		// it takes in "this" because every
		T* component = new T(this);

		//add this component to our component vector
		mComponents.emplace_back(component);
		return component;
	}

	template <typename T>
	T* GetComponent() const
	{
		//loop over all components
		for (auto c : mComponents)
		{
			T* t = dynamic_cast<T*>(c);
			if (t)
			{
				return t;
			}
		}
		return nullptr;
	}

protected:
	Transform mTransform;
	//constructor
	Actor() = default;
	//destructor
	virtual ~Actor()
	{
		for (Component* component : mComponents)
		{
			delete component;
		}
		mComponents.clear();
	}

	virtual void HandleUpdate(float deltaTime) {}
	virtual void HandleInput(const bool keys[], SDL_MouseButtonFlags mouseButtons,
							 const Vector2& relativeMouse)
	{
	}

private:
	std::vector<Component*> mComponents;
	bool mIsActive = true;
	friend class Game;
};
`
        },
        {
          title: "Cross-Portal Rendering",
          description: "CalcViewMatrix computes the virtual camera used to render what's visble through a portal. The core idea is that whatever the player sees through an try portal should look exactly as if they were standing at the exit portal. The function takes the player's world-space position and forward vector and maps them to where theyw ould be relative to the exit portal, preserving the spatial relationship. The up vector is taken directly from the exit portal's world transform so the virtual camera stays properly oriented.",
          code:
`void Portal::CalcViewMatrix(struct PortalData& portalData, Portal* exitPortal)
{
	//return if no exit portal exists
	if (exitPortal == nullptr)
	{
		portalData.mView = Matrix4::CreateScale(0.0f);
		return;
	}

	Player* player = gGame.GetPlayer();
	CameraComponent* playerCam = player->GetComponent<CameraComponent>();
	Vector3 playerPos = player->GetTransform().GetPosition();

	//transform player pos to portal
	Vector3 portalCamPos = GetPortalOutVector(playerPos, exitPortal, 1.0f);

	//transform player cam forward vec
	Vector3 portalCamForward = GetPortalOutVector(playerCam->GetCameraFoward(), exitPortal, 0.0f);

	//portal view camera up should be Z axis of exit portal world transform mat
	Vector3 portalCamUp = exitPortal->GetTransform().GetWorldTransform().GetZAxis();

	//compute look at 50 units in front of camera
	Vector3 lookAt = portalCamPos + portalCamForward * 50.0f;

	Matrix4 viewMat = Matrix4::CreateLookAt(portalCamPos, lookAt, portalCamUp);

	//asign portalData
	portalData.mView = viewMat;
	portalData.mCameraPos = portalCamPos;
	portalData.mCameraForward = portalCamForward;
	portalData.mCameraUp = portalCamUp;
}`
        },
      ]
    },
    shapeshifters:
    {
      title: "Shape Shifters (Unity)",
      subtitle: "Unity · C# ",
      steps: [
        {
        title: "Overview",
        description: "A semester-long project done with a partner for my Intermediate Game Design class. Our biggest strength and constraint was that my partner and I were both programmers, so we ended up creating a fighting game in which players can alternate between three shapes: Circle, Triangle, and Square. The main aim is to deplete your opponents health by hitting them or knocking them into environmental damage. I was responsible for programming the player's movement and special abilities, as well as the applying the glow shader. My partner was primarily responsible for the UI, Scene Logic, and programming the environment.",
        video: "videos/Shape Shifters Trailer.mp4"
        }
      ]
    },
    engine: {
      title: "Graphics Engine",
      subtitle: "C++ · SDL · Rendering Pipeline",
      steps: [
        {
          title: "Material System",
          description: "HLSL Shaders are compiled at startup and stored by name in a map within the AssetCache class. The Materials class holds a shader pointer, texture array, and Lighting Data. The Mesh class holds a Vertex buffer and Material and the rendering, and the draw function sets the material active and calls VertexBuffer::Draw()",
          code:
`//Material.h
#include <SDL3/SDL.h>
#include <EngineMath.h>

#include "Renderer.h"

class Renderer;
class Shader;
class Texture;

struct alignas(16) MaterialConstantsData
{
    Vector3 c_diffuseColor; //12 bytes
    float _pad0; //4 bytes

    Vector3 c_specularColor; // 12bytes
    float c_specularPower; //4 bytes
};

class Material
{
public:
    Material() = default;
    ~Material() = default; //do nothing in destructor
    MaterialConstantsData& GetConstants() { return m_constants; } //getters for data
    const MaterialConstantsData& GetConstants() const { return m_constants; }
    void SetActive(SDL_GPUCommandBuffer* commandBuffer, SDL_GPURenderPass* renderPass);
    void SetShader(Shader* shader) { m_shader = shader; }
    void SetTexture(int slot, const Texture* texture);
    void SetDiffuseColor (const Vector3& diffColor) { m_constants.c_diffuseColor = diffColor; }
    void SetSpecularColor(const Vector3& specColor) { m_constants.c_specularColor = specColor; }
    void SetSpecularPower(float power) { m_constants.c_specularPower = power; }

private:
    MaterialConstantsData m_constants{};
    Shader* m_shader = nullptr;
    std::array<const Texture*, Renderer::TEXTURE_SLOT_TOTAL> m_textures{};
};

//Mesh.h
#pragma once

class AssetManager;
class Material;
class Renderer;
class VertexBuffer;

class Mesh {
public:
    Mesh(VertexBuffer* vertexBuffer, Material* material);
    ~Mesh();

    bool Load(void* vertexData, uint32_t vertexDataSize, void* indexData, uint32_t numIndex, uint32_t indexStride, Material* material);
    bool Load(const char* fileName, AssetManager* pAssetManager);
    static Mesh* StaticLoad(const char* fileName, AssetManager* pAssetManager);
    bool IsSkinned() const { return m_isSkinned; }
    void Draw(SDL_GPUCommandBuffer* commandBuffer, SDL_GPURenderPass* renderPass);

protected:
    bool m_isSkinned = false;
    VertexBuffer* m_vertexBuffer = nullptr;
    Material* m_material = nullptr;
};

//Mesh Draw Function
void Mesh::Draw(SDL_GPUCommandBuffer* commandBuffer, SDL_GPURenderPass* renderPass)
{
    m_material->SetActive(commandBuffer, renderPass);
    m_vertexBuffer->Draw(commandBuffer, renderPass);
}
`
        },
        {
          title: "Lighting & Phong Shading",
          description: "Lighting is computed per-fragment using the Phong model — ambient, diffuse, and specular terms. Light position, color, and intensity are passed as uniforms each frame. The specular highlight uses the reflected ray against the view direction for a realistic glossy look.",
          code:
`//Phong Shader
#include "Constants.hlsl"

struct VIn
{
    float3 position : POSITION0;
    float3 normal : NORMAL0;
    float2 uv : TEXCOORD0;
};

struct VOut
{
    float4 position : SV_POSITION;
    float2 uv    : TEXCOORD0;
    float3 normalWS : TEXCOORD1;
    float3 worldPos : TEXCOORD2;
};


VOut VS(VIn vIn)
{
    VOut output;

    float4 localPos = float4(vIn.position, 1.0f);
    float4 worldPos = mul(localPos, c_modelToWorld);
    float4 cameraPos = mul(worldPos, c_viewProj);

    output.normalWS = mul(vIn.normal, (float3x3)c_modelToWorld);
    output.worldPos = worldPos.xyz;
    output.position = cameraPos;
    output.uv = vIn.uv;

    return output;
}

float4 PS(VOut pIn) : SV_TARGET
{
    float3 n = normalize(pIn.normalWS);
    float3 accum = c_ambient;

    for(int i = 0; i < MAX_POINT_LIGHTS; i++)
    {
        if(!c_pointLight[i].isEnabled)
            continue;

        float3 lToVec = pIn.worldPos - c_pointLight[i].position;
        float dist = length(lToVec);

        if(dist >= c_pointLight[i].outerRadius)
            continue;

        float3 lightDirection = -lToVec / max(dist, 0.0001f);
        //diffuse
        float nDotL = max(dot(n, lightDirection), 0.0f);

        //specular
        float3 viewDir = normalize(c_cameraPosition - pIn.worldPos);
        float3 halfVec = normalize(lightDirection + viewDir);
        float nDotH = max(dot(n, halfVec), 0.0f);
        float spec = pow(nDotH, c_specularPower);

        //attenuate
        float att = 1.0f - smoothstep(c_pointLight[i].innerRadius, c_pointLight[i].outerRadius, dist);

        accum += c_pointLight[i].lightColor * ((c_diffuseColor * nDotL + c_specularColor * spec) * att);
    }
    float4 tex = DiffuseTexture.Sample(DiffuseSampler, pIn.uv);
    return float4(accum * tex.rgb, tex.a);
}`
        },
      ]
    }
  };

  // ─── Project Cards ──────────────────────────────────────────────────────────
  const cards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('project-modal');
  const modalTitle = document.querySelector('#modal-body h3');
  const modalDesc = document.getElementById('modal-description');
  const closeBtn = document.querySelector('.close-btn');

  // Auto-generate title bars
  cards.forEach(card => {
    const title = card.dataset.title;
    const titleBar = document.createElement('div');
    titleBar.classList.add('project-title-bar');
    titleBar.textContent = title;
    card.appendChild(titleBar);
  });

  // Open correct modal per card
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const walkthroughKey = card.dataset.walkthrough;

      if (walkthroughKey && walkthroughs[walkthroughKey]) {
        openWalkthroughModal(walkthroughs[walkthroughKey]);
      } else {
        openStandardModal(card);
      }
    });
  });

  // ─── Standard Modal ─────────────────────────────────────────────────────────
  function openStandardModal(card) {
    modalTitle.textContent = card.dataset.title || 'No title';
    modalDesc.textContent = card.dataset.description || 'No description';

    const mediaContainer = document.getElementById('modal-media');
    const videoSrc = card.dataset.video;

    if (videoSrc) {
      if (videoSrc.includes('youtube') || videoSrc.includes('vimeo')) {
        mediaContainer.innerHTML = `
          <iframe src="${videoSrc}" width="100%" height="315" frameborder="0"
            allowfullscreen style="border-radius:8px;margin-top:1rem;"></iframe>`;
      } else {
        mediaContainer.innerHTML = `
          <video controls width="100%" style="border-radius:8px;margin-top:1rem;">
            <source src="${videoSrc}" type="video/mp4">
          </video>`;
      }
    } else {
      mediaContainer.innerHTML = `
        <img src="${card.dataset.img}" alt="Project"
             style="width:100%;border-radius:8px;margin-top:1rem;">`;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeStandardModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('modal-media').innerHTML = '';
  }

  closeBtn.addEventListener('click', closeStandardModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeStandardModal();
  });

  // ─── Walkthrough Modal ───────────────────────────────────────────────────────
  const walkthroughModal = document.getElementById('walkthrough-modal');
  const walkthroughClose = document.querySelector('.walkthrough-close');

  function openWalkthroughModal(data) {
    document.getElementById('walkthrough-title').textContent = data.title;
    document.getElementById('walkthrough-subtitle').textContent = data.subtitle;

    const body = document.querySelector('.walkthrough-body');
    body.innerHTML = '';

    data.steps.forEach((step, i) => {
      const stepEl = document.createElement('div');
      stepEl.classList.add('walkthrough-step');

      const hasMedia = !!(step.image || step.video);
      const escapedCode = step.code
        ? step.code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        : '';

      let mediaHTML = '';
      if (step.video) {
        if (step.video.includes('youtube.com') || step.video.includes('youtu.be')) {
          const videoId = step.video.includes('youtu.be')
            ? step.video.split('youtu.be/')[1].split('?')[0]
            : new URL(step.video).searchParams.get('v');
          mediaHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0"
            allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:6px;margin-top:0.4rem;"></iframe>`;
        } else {
          mediaHTML = `<video controls style="width:100%;border-radius:6px;margin-top:0.4rem;">
            <source src="${step.video}" type="video/mp4">
          </video>`;
        }
      } else if (step.image) {
        mediaHTML = `<img src="${step.image}" alt="${step.title}"
          onerror="this.parentElement.classList.add('img-placeholder')"
          style="width:100%;border-radius:6px;margin-top:0.4rem;">`;
      }

      stepEl.innerHTML = `
        <div class="step-header">
          <span class="step-number">${String(i + 1).padStart(2, '0')}</span>
          <h4>${step.title}</h4>
        </div>
        <div class="step-body ${hasMedia ? '' : 'no-media'}">
          <div class="step-code">
            <div class="code-label">CODE</div>
            <pre><code class="language-cpp">${escapedCode}</code></pre>
          </div>
          ${hasMedia ? `
          <div class="step-right">
            <div class="step-media">
              <div class="code-label">RESULT</div>
              ${mediaHTML}
            </div>
            <div class="step-description">
              <p>${step.description}</p>
            </div>
          </div>` : `
          <div class="step-right no-media-right">
            <div class="step-description">
              <p>${step.description}</p>
            </div>
          </div>`}
        </div>
      `;
      body.appendChild(stepEl);
    });

    if (window.Prism) Prism.highlightAllUnder(body);

    walkthroughModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Scroll to top on open
    document.querySelector('.walkthrough-content').scrollTop = 0;
  }

  function closeWalkthroughModal() {
    walkthroughModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  walkthroughClose.addEventListener('click', closeWalkthroughModal);
  window.addEventListener('click', (e) => {
    if (e.target === walkthroughModal) closeWalkthroughModal();
  });

  // ─── Scroll Fade-In ──────────────────────────────────────────────────────────
  const faders = document.querySelectorAll('.fade-in');
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  faders.forEach(fader => appearOnScroll.observe(fader));

  // ─── Splash Animation ────────────────────────────────────────────────────────
  const canvas = document.getElementById("splash-canvas");
  const ctx = canvas.getContext("2d");
  let width, height;
  let hue = 200;
  let mouse = { x: null, y: null, radius: 100 };
  const particles = [];
  const particleCount = 300;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 1,
        dy: (Math.random() - 0.5) * 1,
      });
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let distance = dx * dx + dy * dy;
        if (distance < 9000) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${1 - distance / 9000})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    hue += 0.3;
    for (let p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > width) p.dx *= -1;
      if (p.y < 0 || p.y > height) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.fill();
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        let angle = Math.atan2(dy, dx);
        let force = (mouse.radius - dist) / (mouse.radius * 0.3);
        p.x -= Math.cos(angle) * force;
        p.y -= Math.sin(angle) * force;
      }
    }
    drawLines();
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener("resize", () => { resize(); createParticles(); });
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });
  window.addEventListener("scroll", () => {
    const splash = document.getElementById("splash");
    let opacity = 1 - window.scrollY / (window.innerHeight * 0.8);
    splash.style.opacity = Math.max(opacity, 0);
  });
});