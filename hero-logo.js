(function () {
  'use strict';

  var host = document.querySelector('[data-logo-interactive]');
  if (!host) return;
  var image = host.querySelector('.hero-brand-fallback');
  var canvas = host.querySelector('.hero-logo-canvas');
  if (!image || !canvas) return;
  var context = canvas.getContext('2d');
  if (!context) return;

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = motionQuery.matches;
  var visible = true;
  var ready = false;
  var frame = 0;
  var lastTime = 0;
  var width = 0;
  var height = 0;
  var scale = 1;
  var offsetX = 0;
  var offsetY = 0;
  var mask;
  var crop;
  var particles = [];
  var active = [];
  var lastPointer = null;

  function setMotion(value) {
    if (host.dataset.logoMotion !== value) host.dataset.logoMotion = value;
  }

  function drawLogo() {
    context.clearRect(0, 0, width, height);
    context.drawImage(mask, crop.x, crop.y, crop.width, crop.height,
      offsetX, offsetY, crop.width * scale, crop.height * scale);
  }

  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    active.forEach(function (particle) {
      particle.dx = particle.dy = particle.vx = particle.vy = 0;
      particle.active = false;
    });
    active.length = 0;
    lastPointer = null;
    if (ready && width && height) drawLogo();
    setMotion(reducedMotion ? 'reduced' : 'idle');
  }

  function resize() {
    var nextWidth = host.clientWidth;
    var nextHeight = host.clientHeight;
    if (!nextWidth || !nextHeight || !ready) return;
    settle();
    width = nextWidth;
    height = nextHeight;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    scale = Math.min(width * 0.88 / crop.width, height * 0.82 / crop.height);
    offsetX = (width - crop.width * scale) / 2;
    offsetY = (height - crop.height * scale) / 2;
    drawLogo();
    host.dataset.logoReady = '';
  }

  function animate(time) {
    frame = 0;
    if (reducedMotion || !visible || document.hidden) {
      settle();
      return;
    }
    var dt = lastTime ? Math.min((time - lastTime) / 1000, 0.032) : 1 / 60;
    lastTime = time;
    var limit = Math.min(width * 0.2, 110);
    active = active.filter(function (particle) {
      particle.vx += (-particle.dx * 52 - particle.vx * 11) * dt;
      particle.vy += (-particle.dy * 52 - particle.vy * 11) * dt;
      particle.dx += particle.vx * dt;
      particle.dy += particle.vy * dt;
      var distance = Math.hypot(particle.dx, particle.dy);
      if (distance > limit) {
        particle.dx *= limit / distance;
        particle.dy *= limit / distance;
        particle.vx *= 0.6;
        particle.vy *= 0.6;
      }
      if (Math.abs(particle.dx) + Math.abs(particle.dy) < 0.12 &&
          Math.abs(particle.vx) + Math.abs(particle.vy) < 0.6) {
        particle.active = false;
        particle.dx = particle.dy = particle.vx = particle.vy = 0;
        return false;
      }
      return true;
    });

    drawLogo();
    // Remove each moving fragment from its original position before drawing it.
    active.forEach(function (particle) {
      context.clearRect(offsetX + particle.x * scale, offsetY + particle.y * scale,
        particle.width * scale, particle.height * scale);
    });
    active.forEach(function (particle) {
      var size = Math.min(particle.width, particle.height) * scale;
      var distance = Math.hypot(particle.dx, particle.dy);
      var scatter = Math.min(1, distance / Math.max(size * 1.4, 3));
      var x = offsetX + particle.x * scale + particle.dx;
      var y = offsetY + particle.y * scale + particle.dy;
      if (scatter < 1) {
        context.globalAlpha = 1 - scatter;
        context.drawImage(mask, crop.x + particle.x, crop.y + particle.y,
          particle.width, particle.height, x, y,
          particle.width * scale, particle.height * scale);
      }
      context.globalAlpha = scatter * (1 - Math.min(distance / 180, 0.28));
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(x + particle.width * scale / 2, y + particle.height * scale / 2,
        Math.max(0.65, size * 0.47 * Math.sqrt(particle.coverage)), 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    if (active.length) {
      frame = requestAnimationFrame(animate);
    } else {
      lastTime = 0;
      setMotion('idle');
    }
  }

  function disturb(x, y, burst) {
    if (!ready || reducedMotion || !visible || document.hidden || !width || !height) return;
    var radius = burst ? Math.min(width * 0.36, 180) : Math.min(Math.max(width * 0.15, 42), 100);
    particles.forEach(function (particle) {
      var dx = offsetX + (particle.x + particle.width / 2) * scale + particle.dx - x;
      var dy = offsetY + (particle.y + particle.height / 2) * scale + particle.dy - y;
      var distance = Math.hypot(dx, dy);
      if (distance >= radius) return;
      if (!particle.active) {
        particle.active = true;
        active.push(particle);
      }
      var angle = distance > 1 ? Math.atan2(dy, dx) : particle.angle;
      var strength = (1 - distance / radius) * (burst ? 560 : 340);
      particle.vx += Math.cos(angle) * strength + Math.sin(particle.angle) * strength * 0.25;
      particle.vy += Math.sin(angle) * strength + Math.cos(particle.angle) * strength * 0.25;
      var speed = Math.hypot(particle.vx, particle.vy);
      if (speed > 800) {
        particle.vx *= 800 / speed;
        particle.vy *= 800 / speed;
      }
    });
    if (active.length && !frame) {
      lastTime = 0;
      setMotion('active');
      frame = requestAnimationFrame(animate);
    }
  }

  function pointerPosition(event) {
    var bounds = host.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * width / bounds.width,
      y: (event.clientY - bounds.top) * height / bounds.height };
  }

  function prepare() {
    if (ready || !image.naturalWidth || !image.naturalHeight) return;
    try {
      mask = document.createElement('canvas');
      mask.width = image.naturalWidth;
      mask.height = image.naturalHeight;
      var maskContext = mask.getContext('2d', { willReadFrequently: true });
      if (!maskContext) return;
      maskContext.drawImage(image, 0, 0);
      var pixels = maskContext.getImageData(0, 0, mask.width, mask.height);
      var data = pixels.data;
      var left = mask.width, top = mask.height, right = -1, bottom = -1;
      for (var y = 0; y < mask.height; y++) {
        for (var x = 0; x < mask.width; x++) {
          var index = (y * mask.width + x) * 4;
          var red = data[index], green = data[index + 1], blue = data[index + 2];
          var high = Math.max(red, green, blue);
          var saturation = high ? (high - Math.min(red, green, blue)) / high : 0;
          var brandColor = (blue - red > 18 && blue - green > 4) ||
            (red - blue > 28 && red - green > 20);
          var alpha = brandColor ? Math.max(0, Math.min(1, (saturation - 0.17) / 0.13)) : 0;
          data[index + 3] = Math.round(alpha * data[index + 3]);
          if (data[index + 3] > 48) {
            left = Math.min(left, x); top = Math.min(top, y);
            right = Math.max(right, x); bottom = Math.max(bottom, y);
          }
        }
      }
      if (right <= left || bottom <= top) return;
      maskContext.putImageData(pixels, 0, 0);
      crop = { x: Math.max(0, left - 4), y: Math.max(0, top - 4),
        width: Math.min(mask.width - Math.max(0, left - 4), right - left + 9),
        height: Math.min(mask.height - Math.max(0, top - 4), bottom - top + 9) };
      var cell = Math.max(7, Math.ceil(Math.sqrt(crop.width * crop.height / 5600)));
      for (var cy = 0; cy < crop.height; cy += cell) {
        for (var cx = 0; cx < crop.width; cx += cell) {
          var cellWidth = Math.min(cell, crop.width - cx);
          var cellHeight = Math.min(cell, crop.height - cy);
          var alphaSum = 0, redSum = 0, greenSum = 0, blueSum = 0;
          for (var py = 0; py < cellHeight; py++) {
            for (var px = 0; px < cellWidth; px++) {
              var pixel = ((crop.y + cy + py) * mask.width + crop.x + cx + px) * 4;
              var weight = data[pixel + 3] / 255;
              alphaSum += weight;
              redSum += data[pixel] * weight;
              greenSum += data[pixel + 1] * weight;
              blueSum += data[pixel + 2] * weight;
            }
          }
          if (!alphaSum) continue;
          particles.push({ x: cx, y: cy, width: cellWidth, height: cellHeight,
            dx: 0, dy: 0, vx: 0, vy: 0, active: false,
            angle: Math.random() * Math.PI * 2,
            coverage: alphaSum / (cellWidth * cellHeight),
            color: 'rgb(' + Math.round(redSum / alphaSum) + ',' +
              Math.round(greenSum / alphaSum) + ',' + Math.round(blueSum / alphaSum) + ')' });
        }
      }
      ready = true;
      resize();
      setMotion(reducedMotion ? 'reduced' : 'idle');
    } catch (error) {
      // Image loading or canvas security failure leaves the original image visible.
      ready = false;
      delete host.dataset.logoReady;
    }
  }

  host.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch' || reducedMotion || !ready) return;
    var point = pointerPosition(event);
    if (lastPointer && Math.hypot(point.x - lastPointer.x, point.y - lastPointer.y) < 3) return;
    lastPointer = point;
    disturb(point.x, point.y, false);
  }, { passive: true });
  host.addEventListener('pointerleave', function () { lastPointer = null; }, { passive: true });
  host.addEventListener('click', function (event) {
    var point = event.detail === 0 ? { x: width / 2, y: height / 2 } : pointerPosition(event);
    disturb(point.x, point.y, true);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) settle();
  });
  function motionChanged(event) {
    reducedMotion = event.matches;
    settle();
  }
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', motionChanged);
  else if (motionQuery.addListener) motionQuery.addListener(motionChanged);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (!visible) settle();
    }, { threshold: 0 }).observe(host);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
  window.addEventListener('resize', resize, { passive: true });
  image.addEventListener('load', prepare, { once: true });
  if (image.complete) prepare();
}());
