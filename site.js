/* Draws the fan site from the press kit's content.js (window.EPK) and fan.js (window.FAN).
   You shouldn't need to edit this file. */
(function () {
  "use strict";
  var C = window.EPK, F = window.FAN || {};
  if (!C) return;
  var EPK = "/epk/";

  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function asset(p) { return !p ? "" : /^(https?:|\/)/.test(p) ? p : EPK + p; }
  function ext(url, text, cls) { return el("a", { href: url, class: cls, target: "_blank", rel: "noopener" }, [text]); }
  function get(path, obj) { return path.split(".").reduce(function (o, k) { return o && o[k]; }, obj); }
  function each(list, fn) { (list || []).forEach(fn); }

  document.querySelectorAll("[data-k]").forEach(function (n) { var v = get(n.getAttribute("data-k"), C); if (v != null) n.textContent = v; });
  document.querySelectorAll("[data-fan]").forEach(function (n) { var v = get(n.getAttribute("data-fan"), F); if (v != null) n.textContent = v; else n.remove(); });

  // ── Hero
  var R = C.release || {};
  if (R.cover) { $("hero-cover").src = asset(R.cover); $("hero-cover").alt = R.coverAlt || ""; }
  var release = new Date("2027-02-02T00:00:00");
  if (R.date) { var d = /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/.exec(R.date); if (d) release = new Date(2000 + +d[3], +d[2] - 1, +d[1]); }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var days = Math.round((release - today) / 86400000);
  if (days > 0) { $("countdown-n").textContent = days; $("countdown-w").textContent = days === 1 ? "day to go" : "days to go"; $("countdown").hidden = false; }
  else if (days === 0) { $("countdown-n").textContent = "out today"; $("countdown").hidden = false; }
  if (R.presaveUrl) $("hero-cta").prepend(ext(R.presaveUrl, R.presaveLabel || "pre-save", "btn btn--brick"));

  // ── Free song (text and form number from the press kit's giveaway block)
  var G = C.giveaway || {};
  if (F.freeSong === false) {
    $("free-song").remove();
    document.querySelectorAll('a[href="#free-song"]').forEach(function (a) { (a.closest("li") || a).remove(); });
  } else {
    $("free-text").textContent = G.text || "An unreleased song from the Music To Sit Down To sessions, free to the first 250 people who sign up.";
    if (G.small) $("free-small").textContent = G.small; else $("free-small").remove();
    if (G.kitFormId) $("free-form").action = "https://app.kit.com/forms/" + G.kitFormId + "/subscriptions";
  }

  // ── Listen: Spotify players
  function spotifyEmbed(url) {
    var m = /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|artist)\/([A-Za-z0-9]+)/.exec(url || "");
    return m ? { src: "https://open.spotify.com/embed/" + m[1] + "/" + m[2] + "?utm_source=generator&theme=0", tall: m[1] !== "track" } : null;
  }
  each(C.listen, function (t) {
    var e = spotifyEmbed(t.spotify); if (!e) return;
    $("listen-list").appendChild(el("div", { class: "player" }, [
      el("h3", { text: t.title }), el("p", { class: "soft", text: t.note || "" }),
      el("iframe", { src: e.src, title: "Spotify: " + t.title, height: e.tall ? "352" : "152", loading: "lazy",
        allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" })
    ]));
  });
  each(C.profiles, function (p) { if (p.url && !/linktr/.test(p.url)) $("listen-links").appendChild(el("li", {}, [ext(p.url, p.name)])); });

  // ── Videos: load only when clicked
  function yt(url) {
    var y = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/))([\w-]{11})/.exec(url || "");
    return y ? { src: "https://www.youtube-nocookie.com/embed/" + y[1] + "?autoplay=1&rel=0", thumb: "https://i.ytimg.com/vi/" + y[1] + "/hqdefault.jpg" } : null;
  }
  var nVid = 0;
  each(C.videos, function (v) {
    var s = yt(v.url); if (!s) return; nVid++;
    var btn = el("button", { type: "button", class: "video", "aria-label": "Play video: " + v.title }, [
      el("img", { src: s.thumb, alt: "", loading: "lazy", onerror: v.poster ? "this.onerror=null;this.src='" + asset(v.poster) + "'" : null }),
      el("span", { class: "video__play", "aria-hidden": "true", text: "▶" })
    ]);
    btn.addEventListener("click", function () {
      var f = el("iframe", { src: s.src, title: v.title, allow: "autoplay; fullscreen; picture-in-picture", allowfullscreen: "" });
      btn.replaceWith(el("div", { class: "video video--on" }, [f])); f.focus();
    });
    $("video-list").appendChild(el("figure", { class: "vid" }, [btn, el("figcaption", {}, [el("b", { text: v.title }), el("span", { class: "soft", text: " " + (v.note || "") })])]));
  });
  if (!nVid) { $("videos").remove(); var nv = document.querySelector('.bar a[href="#videos"]'); if (nv) nv.parentNode.remove(); }

  // ── Records
  each(C.albums, function (a) {
    var first = (a.links || [])[0];
    var year = (/(\d{4})/.exec(a.meta || "") || [])[1] || "";
    var art = a.cover ? el("img", { src: asset(a.cover), alt: a.title + " cover", loading: "lazy" }) : el("div", { class: "records__blank", text: a.title });
    var links = el("p", { class: "records__links" });
    each(a.links, function (l, i) { if (i) links.appendChild(document.createTextNode(" · ")); links.appendChild(ext(l.url, l.name)); });
    $("records").appendChild(el("li", {}, [
      first ? ext(first.url, "", "records__art") : el("div", { class: "records__art" }),
      el("h3", { text: a.title }),
      el("p", { class: "soft", text: [a.with, year].filter(Boolean).join(" · ") }),
      links
    ]));
    var artLink = $("records").lastChild.firstChild; artLink.appendChild(art); if (first) artLink.setAttribute("aria-label", a.title + " on " + first.name);
  });

  // ── Live
  each(C.shows, function (s) {
    if (!s.date) return;
    $("shows").appendChild(el("li", {}, [el("span", { class: "shows__date", text: s.date }), el("span", { class: "shows__venue", text: s.venue }), el("span", { class: "soft", text: s.city || "" })]));
  });
  each((C.livePhotos || []).slice(0, 6), function (p) { $("live-photos").appendChild(el("li", {}, [el("img", { src: asset(p.src), alt: p.alt || "", loading: "lazy" })])); });

  // ── About
  var ph = (C.photos || [])[3] || (C.photos || [])[0];
  if (ph) { $("about-photo").src = asset(ph.src); $("about-photo").alt = ph.alt || ""; }
  var pl = $("press-line");
  if (F.pressLine) { pl.appendChild(document.createTextNode(F.pressLine + " ")); pl.appendChild(el("a", { href: EPK }, ["Open the press kit →"])); } else pl.remove();
  var pc = C.photosCredit || {};
  if (pc.name) { $("photo-credit").appendChild(document.createTextNode("Photos: ")); $("photo-credit").appendChild(pc.instagram ? ext("https://www.instagram.com/" + pc.instagram + "/", pc.name) : document.createTextNode(pc.name)); }
  else $("photo-credit").remove();

  // ── Shop
  var nShop = 0;
  each(F.shop, function (s) {
    if (!s.url) return; nShop++;
    $("shop-list").appendChild(el("li", {}, [ext(s.url, "", "shop__item")]));
    var a = $("shop-list").lastChild.firstChild;
    a.appendChild(el("b", { text: s.title })); a.appendChild(el("span", { class: "soft", text: s.note || "" })); a.appendChild(el("span", { class: "shop__go", "aria-hidden": "true", text: "→" }));
  });
  if (!nShop) { $("shop").remove(); var ns = document.querySelector('.bar a[href="#shop"]'); if (ns) ns.parentNode.remove(); }

  // ── Footer
  var K = C.contact || {};
  if (K.email) { $("contact-email").textContent = K.email; $("contact-email").href = "mailto:" + K.email; }
  if (K.instagram) { var ig = $("contact-ig"); ig.textContent = "instagram @" + K.instagram; ig.href = "https://www.instagram.com/" + K.instagram + "/"; ig.target = "_blank"; ig.rel = "noopener"; }
  each(C.profiles, function (p) { if (p.url) $("profiles").appendChild(el("li", {}, [ext(p.url, p.name)])); });
})();
