/* Ownerhound flagship (sections/ownerhound).
   Fades the card in, plays the phone video only while it is on screen and pauses it offscreen.
   Reduced motion: never autoplays; the poster shows with a play button. A small toggle under the phone
   pauses or plays at any time, and that choice sticks. Without JavaScript the video keeps native controls. */
(() => {
  const init = () => {
    const root = document.getElementById('ownerhound');
    if (!root) return;
    root.classList.add('oh-js');

    const card = root.querySelector('.oh-card');
    if (card) {
      const reveal = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { card.classList.add('is-in'); reveal.disconnect(); }
      }, { threshold: .15 });
      reveal.observe(card);
    }

    const video = root.querySelector('.oh-video');
    if (!video) return;
    const play = root.querySelector('.oh-play');
    const toggle = root.querySelector('.oh-toggle');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false, userPaused = false, userStarted = false;

    video.removeAttribute('controls');
    if (toggle) toggle.hidden = false;

    const sync = () => {
      const paused = video.paused;
      if (play) play.hidden = !(paused && (userPaused || (still.matches && !userStarted)));
      if (toggle) {
        toggle.classList.toggle('is-paused', paused);
        toggle.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' the Ownerhound demo');
      }
    };
    const start = () => {
      const p = video.play();
      // Autoplay can be refused (data saver, low power): fall back to the play button.
      if (p) p.catch(() => { userPaused = true; sync(); });
    };
    const decide = () => {
      if (inView && !userPaused && (userStarted || !still.matches)) start();
      else video.pause();
      sync();
    };
    const userToggle = () => {
      if (video.paused) { userPaused = false; userStarted = true; start(); }
      else { userPaused = true; video.pause(); }
      sync();
    };

    // Tint the status bar to the top edge of the current frame (sampled a few times a second while playing).
    const bar = root.querySelector('.oh-screen');
    const px = document.createElement('canvas'); px.width = px.height = 1;
    const ctx = px.getContext('2d', { willReadFrequently: true });
    const tint = () => {
      if (!bar || !ctx || video.readyState < 2) return;
      try {
        ctx.drawImage(video, 0, 0, 24, 6, 0, 0, 1, 1); // left edge, clear of the nav buttons
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        bar.style.setProperty('--oh-sb-bg', `rgb(${r} ${g} ${b})`);
        bar.style.setProperty('--oh-sb-fg', .299 * r + .587 * g + .114 * b > 150 ? '#0b0b0c' : '#fff');
      } catch { /* a cross-origin source would block reads; keep the default colors */ }
    };
    let tintTimer = 0;
    video.addEventListener('play', () => { clearInterval(tintTimer); tintTimer = setInterval(tint, 200); });
    video.addEventListener('pause', () => clearInterval(tintTimer));
    video.addEventListener('seeked', tint);

    new IntersectionObserver(([e]) => { inView = e.isIntersecting; decide(); }, { threshold: .35 }).observe(video);
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('click', userToggle);
    if (play) play.addEventListener('click', userToggle);
    if (toggle) toggle.addEventListener('click', userToggle);
    still.addEventListener('change', decide);
    sync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
