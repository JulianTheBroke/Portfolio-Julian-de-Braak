(function () {
  // ---- Lightbox (carousel gallery + optional video) ----
  var lb = document.createElement("div");
  lb.className = "lb";
  lb.innerHTML =
    '<button class="lb-close" aria-label="Close">\u2715</button>' +
    '<button class="car-btn prev lb-car" aria-label="Previous image">&#8249;</button>' +
    '<button class="car-btn next lb-car" aria-label="Next image">&#8250;</button>' +
    '<div class="lb-counter" aria-live="polite"></div>' +
    '<div class="lb-stage"></div>';
  var stage = lb.querySelector(".lb-stage");
  var closeBtn = lb.querySelector(".lb-close");
  var lbPrev = lb.querySelector(".lb-car.prev");
  var lbNext = lb.querySelector(".lb-car.next");
  var lbCounter = lb.querySelector(".lb-counter");
  var gallery = null;

  function close() {
    lb.classList.remove("open");
    stage.innerHTML = "";
    gallery = null;
    lbPrev.style.display = "none";
    lbNext.style.display = "none";
    lbCounter.style.display = "none";
  }

  function renderGallerySlide() {
    if (!gallery) return;
    var img = gallery.images[gallery.index];
    stage.innerHTML = "";
    var clone = document.createElement("img");
    clone.src = img.src;
    clone.alt = img.alt || "";
    stage.appendChild(clone);
    lbCounter.textContent = gallery.index + 1 + " / " + gallery.images.length;
    lbCounter.style.display = gallery.images.length > 1 ? "block" : "none";
    lbPrev.style.display = gallery.images.length > 1 ? "flex" : "none";
    lbNext.style.display = gallery.images.length > 1 ? "flex" : "none";
  }

  function openGallery(images, index) {
    gallery = { images: images, index: index };
    renderGallerySlide();
    lb.classList.add("open");
  }

  function stepGallery(delta) {
    if (!gallery) return;
    gallery.index = (gallery.index + delta + gallery.images.length) % gallery.images.length;
    renderGallerySlide();
  }

  function showPlaceholder(el, label) {
    var ph = document.createElement("div");
    ph.className = "ph";
    ph.textContent = label;
    el.replaceWith(ph);
  }

  function initMediaFallbacks() {
    document.querySelectorAll("img[data-ph]").forEach(function (img) {
      img.addEventListener("error", function () {
        showPlaceholder(img, img.getAttribute("data-ph"));
      });
    });
    document.querySelectorAll("video[data-ph]").forEach(function (video) {
      video.addEventListener("error", function () {
        showPlaceholder(video, video.getAttribute("data-ph"));
      });
    });
  }

  function initAutoplayVideos() {
    document.querySelectorAll(".media-main video").forEach(function (video) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      var play = function () {
        video.play().catch(function () {});
      };
      play();
      video.addEventListener("canplay", play, { once: true });
    });
  }

  // ---- Image carousel (in-page) ----
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (c) {
      var track = c.querySelector(".carousel-track");
      if (!track) return;
      var slides = Array.prototype.slice.call(track.children);
      var dotsWrap = c.querySelector(".carousel-dots");
      var prev = c.querySelector(".prev");
      var next = c.querySelector(".next");
      var i = 0;

      if (slides.length <= 1) {
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
        return;
      }

      function update() {
        track.style.transform = "translateX(" + (-i * 100) + "%)";
        if (dotsWrap) {
          Array.prototype.slice.call(dotsWrap.children).forEach(function (d, idx) {
            d.classList.toggle("on", idx === i);
          });
        }
      }
      function go(n) {
        i = (n + slides.length) % slides.length;
        update();
      }

      if (dotsWrap) {
        slides.forEach(function (_, idx) {
          var b = document.createElement("button");
          b.setAttribute("aria-label", "Go to slide " + (idx + 1));
          if (idx === 0) b.className = "on";
          b.addEventListener("click", function (e) {
            e.stopPropagation();
            go(idx);
          });
          dotsWrap.appendChild(b);
        });
      }
      if (prev) {
        prev.addEventListener("click", function (e) {
          e.stopPropagation();
          go(i - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function (e) {
          e.stopPropagation();
          go(i + 1);
        });
      }
    });
  }

  function initLightbox() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var imgs = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-track img"));
      if (!imgs.length) return;
      imgs.forEach(function (img, idx) {
        img.addEventListener("click", function (e) {
          e.stopPropagation();
          openGallery(imgs, idx);
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(lb);
    closeBtn.addEventListener("click", close);
    lbPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      stepGallery(-1);
    });
    lbNext.addEventListener("click", function (e) {
      e.stopPropagation();
      stepGallery(1);
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") stepGallery(-1);
      if (e.key === "ArrowRight") stepGallery(1);
    });

    initMediaFallbacks();
    initAutoplayVideos();
    initCarousels();
    initLightbox();
  });
})();
