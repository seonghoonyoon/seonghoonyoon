async function probeUrl(url){
  try{
    const res = await fetch(url, {method:'HEAD'});
    return res && res.ok;
  }catch(e){
    return false;
  }
}

function stripAssetsPrefix(src){
  // remove leading /assets/img/ if present
  return src.replace(/^\/assets\/img\//, '');
}

async function findOptimizedCandidate(originalSrc, preferredWidths=[1600,800,400]){
  if(!originalSrc || typeof originalSrc !== 'string') return null;
  const rel = stripAssetsPrefix(originalSrc);
  const relNoExt = rel.replace(/\.[^.]+$/, '');
  const candidates = [];
  // common locations produced by optimizer: assets/img/optimized/webp/[maybe subfolder]/name-{w}.webp
  for(const w of preferredWidths){
    candidates.push(`/assets/img/optimized/webp/${relNoExt}-${w}.webp`);
  }
  // also try full-size
  candidates.push(`/assets/img/optimized/webp/${relNoExt}-full.webp`);

  for(const c of candidates){
    if(await probeUrl(c)) return c;
  }
  return null;
}

async function loadManifest(){
  try{
    const res = await fetch('/assets/data/manifest.json');
    if(!res.ok) throw new Error('Manifest fetch failed');
    const data = await res.json();

    // Populate projects list (gallery) with optional tag filters
    const list = document.getElementById('projects-list');
    const filtersContainer = document.getElementById('filters');

    // build available tags from manifest
    const tagSet = new Set();
    for(const p of data.projects || []){
      if(Array.isArray(p.tags)){
        for(const t of p.tags) tagSet.add(t);
      } else if(p.id){
        tagSet.add(p.id);
      }
    }
    const tags = Array.from(tagSet);

    // render filter buttons
    function setActiveFilterButton(activeTag){
      if(!filtersContainer) return;
      const buttons = filtersContainer.querySelectorAll('.filter-btn');
      buttons.forEach(b => b.classList.toggle('active', b.dataset.tag === activeTag));
    }

    async function renderProjects(filterTag='all'){
      if(!list || !Array.isArray(data.projects)) return;
      list.innerHTML = '';
      for(const p of data.projects){
        const hasTags = Array.isArray(p.tags) ? p.tags : [p.id];
        if(filterTag !== 'all' && !hasTags.includes(filterTag)) continue;

        const a = document.createElement('a');
        a.className = 'project-card';
        a.href = p.page || '#';

        const img = document.createElement('img');
        img.alt = p.title + ' thumbnail';
        img.loading = 'lazy';
        const optimized = await findOptimizedCandidate(p.thumbnail, [400,800,1600]);
        img.src = optimized || p.thumbnail;
        a.appendChild(img);

        const meta = document.createElement('div');
        meta.className = 'proj-meta';
        const h = document.createElement('h3'); h.textContent = p.title; meta.appendChild(h);
        const d = document.createElement('p'); d.className='muted'; d.textContent = p.description || ''; meta.appendChild(d);
        a.appendChild(meta);

        list.appendChild(a);
      }
    }

    if(filtersContainer){
      filtersContainer.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'filter-btn active';
      allBtn.dataset.tag = 'all';
      allBtn.textContent = 'All';
      allBtn.addEventListener('click', ()=>{ setActiveFilterButton('all'); renderProjects('all'); });
      filtersContainer.appendChild(allBtn);

      tags.sort().forEach(t => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'filter-btn';
        b.dataset.tag = t;
        // humanize: capitalize first letter
        b.textContent = t.charAt(0).toUpperCase() + t.slice(1);
        b.addEventListener('click', ()=>{ setActiveFilterButton(t); renderProjects(t); });
        filtersContainer.appendChild(b);
      });
    }

    // initial render
    await renderProjects('all');

    // If on a project page, render images for that project
    const main = document.querySelector('main[data-project]');
    if(main && Array.isArray(data.projects)){
      const projectId = main.getAttribute('data-project');
      const project = data.projects.find(x => x.id === projectId);
      if(project){
        // update hero if needed
        const heroTitle = main.querySelector('.project-hero h1');
        const heroLead = main.querySelector('.project-hero .lead');
        if(heroTitle) heroTitle.textContent = project.title;
        if(heroLead) heroLead.textContent = project.description;

        const grid = main.querySelector('.project-grid');
        if(grid){
          grid.innerHTML = '';
          for(const imgObj of project.images){
            const fig = document.createElement('figure'); fig.className='art';
            const img = document.createElement('img'); img.alt = imgObj.alt || '';
            img.loading='lazy';

            // choose optimized size based on viewport
            const target = Math.max(window.innerWidth || 800, 800) * (window.devicePixelRatio || 1);
            const candidates = [Math.ceil(target), 1600, 800, 400];
            const optimized = await findOptimizedCandidate(imgObj.src, candidates);
            img.src = optimized || imgObj.src;

            fig.appendChild(img);
            if(imgObj.caption){
              const cap = document.createElement('figcaption'); cap.textContent = imgObj.caption; fig.appendChild(cap);
            }
            grid.appendChild(fig);
          }
        }
      }
    }

  }catch(err){
    console.error('Error loading manifest:', err);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', loadManifest);
} else { loadManifest(); }
