const tabs = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll("[data-panel]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === target);
    });
  });
});

document.querySelectorAll("[data-replay]").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.closest(".case-card").querySelector("img");
    const source = image.src;
    image.src = "";
    requestAnimationFrame(() => {
      image.src = source;
    });
  });
});

const stepSlider = document.querySelector("#step-slider");
const stepOutput = document.querySelector("#step-output");
const fullTokenCount = document.querySelector("#full-token-count");
const recapTokenCount = document.querySelector("#recap-token-count");
const fullMeter = document.querySelector("#full-meter");
const recapMeter = document.querySelector("#recap-meter");
const fullBlocks = document.querySelector("#full-blocks");
const recapBlocks = document.querySelector("#recap-blocks");
const demoTakeaway = document.querySelector("#demo-takeaway");
const playContext = document.querySelector("[data-play-context]");
let contextTimer;

function memoryBlock(label, className) {
  return `<span class="memory-block ${className}">${label}</span>`;
}

function renderFullBlocks(step) {
  const blocks = [memoryBlock("Scene anchor", "anchor")];
  if (step <= 7) {
    for (let index = 1; index <= step; index += 1) {
      blocks.push(memoryBlock(`B${index}`, index < step - 1 ? "stale" : "recent"));
    }
  } else {
    blocks.push(memoryBlock("B1", "stale"));
    blocks.push(`<span class="evicted-blocks">${step - 4} accumulated old blocks</span>`);
    for (let index = step - 2; index <= step; index += 1) {
      blocks.push(memoryBlock(`B${index}`, "recent"));
    }
  }
  return blocks.join("");
}

function renderRecapBlocks(step) {
  const blocks = [memoryBlock("Scene anchor", "anchor")];
  blocks.push(memoryBlock("B1", "dynamic"));
  if (step > 7) {
    blocks.push(`<span class="evicted-blocks">${step - 7} stale blocks evicted</span>`);
  }
  const recentStart = Math.max(2, step - 5);
  for (let index = recentStart; index <= step; index += 1) {
    blocks.push(memoryBlock(`B${index}`, "recent"));
  }
  return blocks.join("");
}

function updateContextDemo() {
  if (!stepSlider) return;
  const step = Number(stepSlider.value);
  const fullTokens = 1280 + 93 * step;
  const recapTokens = 1280 + 93 * Math.min(step, 7);
  const maxTokens = 1280 + 93 * 64;
  const reduction = 100 * (1 - recapTokens / fullTokens);
  stepOutput.value = step;
  stepOutput.textContent = step;
  fullTokenCount.textContent = `${fullTokens.toLocaleString()} tokens`;
  recapTokenCount.textContent = `${recapTokens.toLocaleString()} tokens`;
  fullMeter.style.width = `${(100 * fullTokens) / maxTokens}%`;
  recapMeter.style.width = `${(100 * recapTokens) / maxTokens}%`;
  fullBlocks.innerHTML = renderFullBlocks(step);
  recapBlocks.innerHTML = renderRecapBlocks(step);
  demoTakeaway.textContent =
    step < 8
      ? "Before the recent window fills, Full Context and ReCAP use the same visual–action history."
      : `At step ${step}, ReCAP uses ${reduction.toFixed(1)}% fewer active tokens while preserving complete visual–action blocks.`;
}

stepSlider?.addEventListener("input", updateContextDemo);
playContext?.addEventListener("click", () => {
  if (contextTimer) {
    window.clearInterval(contextTimer);
    contextTimer = undefined;
    playContext.textContent = "Play growth";
    return;
  }
  stepSlider.value = "1";
  updateContextDemo();
  playContext.textContent = "Pause";
  contextTimer = window.setInterval(() => {
    const next = Number(stepSlider.value) + 1;
    if (next > 64) {
      window.clearInterval(contextTimer);
      contextTimer = undefined;
      playContext.textContent = "Replay growth";
      return;
    }
    stepSlider.value = String(next);
    updateContextDemo();
  }, 90);
});
updateContextDemo();

const copyButton = document.querySelector("[data-copy]");
copyButton?.addEventListener("click", async () => {
  const text = document.querySelector("#bibtex-code").textContent;
  await navigator.clipboard.writeText(text);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1400);
});

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");
menuButton?.addEventListener("click", () => {
  const open = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll("main section[id]")];
const links = [...document.querySelectorAll(".site-nav a")];
const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => {
      link.classList.toggle("is-current", link.hash === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.25] }
);
sections.forEach((section) => navObserver.observe(section));
