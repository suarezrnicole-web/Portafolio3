(function(){
  const root = document.documentElement;

  // reveal on scroll
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduced){
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  // index rail
  const sections = document.querySelectorAll('section.block, header.cover');
  const rail = document.getElementById('indexRail');
  sections.forEach(function(sec){
    const dot = document.createElement('button');
    dot.addEventListener('click', function(){ sec.scrollIntoView({behavior: reduced ? 'auto' : 'smooth'}); });
    rail.appendChild(dot);
  });
  const dots = rail.querySelectorAll('button');
  if('IntersectionObserver' in window){
    const io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        const idx = Array.prototype.indexOf.call(sections, e.target);
        if(e.isIntersecting){ dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); }); }
      });
    }, { threshold: 0.5 });
    sections.forEach(function(s){ io2.observe(s); });
  }

  // weave figure (static interlace grid built with divs)
  const fig = document.getElementById('weaveFigure');
  const N = 10;
  for(let i=0;i<N;i++){
    const h = document.createElement('div');
    h.className='h';
    h.style.cssText = 'left:0;right:0;height:1px;top:' + ((i+0.5)/N*100) + '%;';
    fig.appendChild(h);
    const v = document.createElement('div');
    v.className='v';
    v.style.cssText = 'top:0;bottom:0;width:1px;left:' + ((i+0.5)/N*100) + '%;';
    fig.appendChild(v);
  }

  // canvas thread animation
  const canvas = document.getElementById('thread-canvas');
  const ctx = canvas.getContext('2d');
  let w,h,t=0;
  function resize(){ w = canvas.width = canvas.offsetWidth * devicePixelRatio; h = canvas.height = canvas.offsetHeight * devicePixelRatio; }
  resize();
  window.addEventListener('resize', resize);

  function color(){ return getComputedStyle(root).getPropertyValue('--accent').trim() || '#C1432A'; }

  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = color();
    ctx.lineWidth = 1 * devicePixelRatio;
    const cols = 14, rows = 9;
    const gx = w/cols, gy = h/rows;
    ctx.globalAlpha = 0.35;
    for(let i=0;i<=cols;i++){
      ctx.beginPath();
      for(let y=0;y<=h;y+=gy/4){
        const offset = Math.sin((y/h)*Math.PI*4 + t + i*0.4) * gx*0.18;
        ctx.lineTo(i*gx + offset, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.2;
    for(let j=0;j<=rows;j++){
      ctx.beginPath();
      for(let x=0;x<=w;x+=gx/4){
        const offset = Math.sin((x/w)*Math.PI*4 + t*1.3 + j*0.4) * gy*0.18;
        ctx.lineTo(x, j*gy + offset);
      }
      ctx.stroke();
    }
  }

  if(!reduced){
    function loop(){ t += 0.006; draw(); requestAnimationFrame(loop); }
    loop();
  } else {
    draw();
  }

  // count-up animation for real metrics
  (function(){
    var counters = document.querySelectorAll('[data-count]');
    if(!counters.length) return;
    function animateCounter(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 900, start = null;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts-start)/dur, 1);
        var eased = 1 - Math.pow(1-p, 3);
        el.textContent = prefix + Math.round(target*eased) + suffix;
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if('IntersectionObserver' in window && !reduced){
      var ioCount = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ animateCounter(e.target); ioCount.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function(el){ ioCount.observe(el); });
    }
  })();

  // boton "ver portafolio": desplazamiento suave sin dejar #portafolio en la URL
  (function(){
    var ctaBtn = document.getElementById('ctaPortafolio');
    var target = document.getElementById('portafolio');
    if(!ctaBtn || !target) return;
    ctaBtn.addEventListener('click', function(e){
      e.preventDefault();
      target.scrollIntoView({behavior: reduced ? 'auto' : 'smooth'});
    });
  })();

  // lightbox: ampliar imagenes del portafolio al tocarlas/hacer click
  (function(){
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightboxImg');
    var lbClose = document.getElementById('lightboxClose');
    if(!lb || !lbImg || !lbClose) return;
    var lastFocused = null;
    function openLightbox(img){
      lastFocused = document.activeElement;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }
    function closeLightbox(){
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
      if(lastFocused && lastFocused.focus){ lastFocused.focus(); }
    }
    document.querySelectorAll('.media-columns img').forEach(function(img){
      img.addEventListener('click', function(){ openLightbox(img); });
    });
    lb.addEventListener('click', function(e){ if(e.target === lb){ closeLightbox(); } });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && lb.classList.contains('open')){ closeLightbox(); } });
  })();

})();