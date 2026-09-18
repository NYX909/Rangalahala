/* =========================================================
   RANGAHALA — event ticket booking demo
   -----------------------------------------------------
   This one file powers all three pages:
     index.html        -> shows the list of events
     event.html         -> shows one event + booking form
     confirmation.html -> shows the finished ticket

   There is no server here. We use the browser's
   localStorage as a pretend database, so bookings only
   live on YOUR computer/browser. That's normal for a
   learning project — a real site would send this data
   to a backend instead.
   ========================================================= */

// ---------- 1. THE "DATABASE" ----------
// An array of plain objects. Each object is one event.
// tiers = the different ticket types you can buy for that event.
const EVENTS = [
  {
    id: "e1",
    title: "Colombo Nights: Live Music Fest",
    category: "Music",
    venue: "Viharamahadevi Open Air Theatre, Colombo",
    date: "2026-11-14",
    time: "6:30 PM",
    blurb: "Four local bands, one open-air stage, a night of live sets.",
    tiers: [
      { name: "General", price: 1500 },
      { name: "VIP (front rows)", price: 4000 }
    ]
  },
  {
    id: "e2",
    title: "Void Walker — Premiere Screening",
    category: "Film",
    venue: "Savoy Cinema, Wellawatte",
    date: "2026-10-02",
    time: "8:00 PM",
    blurb: "A sci-fi premiere with a Q&A with the director after the credits.",
    tiers: [
      { name: "Standard", price: 900 },
      { name: "Recliner", price: 1800 }
    ]
  },
  {
    id: "e3",
    title: "Laugh Lanka: Stand-Up Night",
    category: "Comedy",
    venue: "Lionel Wendt Theatre, Colombo",
    date: "2026-10-25",
    time: "7:00 PM",
    blurb: "Five comedians, one mic, zero rehearsed material.",
    tiers: [
      { name: "General", price: 1200 },
      { name: "Front Row", price: 2200 }
    ]
  },
  {
    id: "e4",
    title: "Battle of the Bands: School Edition",
    category: "School",
    venue: "School Auditorium",
    date: "2026-11-28",
    time: "3:00 PM",
    blurb: "Six school bands compete for the trophy. Judged by staff and a guest musician.",
    tiers: [
      { name: "Student", price: 300 },
      { name: "Guest", price: 500 }
    ]
  },
  {
    id: "e5",
    title: "Kandy Perahera: Cultural Night",
    category: "Culture",
    venue: "Kandy City Centre Grounds",
    date: "2026-12-05",
    time: "6:00 PM",
    blurb: "Traditional dance, drumming, and a recreated procession under the lights.",
    tiers: [
      { name: "Standing", price: 800 },
      { name: "Seated", price: 1600 }
    ]
  }
];

// ---------- 2. SMALL HELPERS ----------

// Turns "2026-11-14" into "Sat, 14 Nov 2026"
function formatDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Formats a number as Sri Lankan Rupees, e.g. 1500 -> "Rs. 1,500"
function formatPrice(amount) {
  return "Rs. " + amount.toLocaleString("en-LK");
}

// Reads a value from the URL, e.g. event.html?id=e2 -> getParam("id") = "e2"
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Generates a short, ticket-style reference code like RNG-7F3K-92LX
function generateReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1, easy to read
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `RNG-${block()}-${block()}`;
}

// ---------- 3. PAGE: index.html (event listing) ----------

function initHomePage() {
  const grid = document.getElementById("event-grid");
  const filterBar = document.getElementById("filter-bar");
  if (!grid) return; // we're not on the home page, skip

  const categories = ["All", ...new Set(EVENTS.map((e) => e.category))];

  function render(activeCategory) {
    grid.innerHTML = "";
    const list =
      activeCategory === "All" ? EVENTS : EVENTS.filter((e) => e.category === activeCategory);

    list.forEach((event) => {
      const cheapest = Math.min(...event.tiers.map((t) => t.price));
      const card = document.createElement("a");
      card.className = "ticket-card";
      card.href = `event.html?id=${event.id}`;
      card.innerHTML = `
        <div class="ticket-card__main">
          <span class="ticket-card__category">${event.category}</span>
          <h3 class="ticket-card__title">${event.title}</h3>
          <p class="ticket-card__venue">${event.venue}</p>
          <p class="ticket-card__date">${formatDate(event.date)} · ${event.time}</p>
        </div>
        <div class="ticket-card__stub">
          <span class="ticket-card__from">From</span>
          <span class="ticket-card__price">${formatPrice(cheapest)}</span>
          <span class="ticket-card__cta">Book →</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Build the filter buttons once
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = cat;
    if (cat === "All") btn.classList.add("is-active");
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render(cat);
    });
    filterBar.appendChild(btn);
  });

  render("All");
}

// ---------- 4. PAGE: event.html (event detail + booking form) ----------

function initEventPage() {
  const container = document.getElementById("event-detail");
  if (!container) return;

  const id = getParam("id");
  const event = EVENTS.find((e) => e.id === id);

  if (!event) {
    container.innerHTML = `<p class="empty-state">We couldn't find that event. <a href="index.html">Back to all events</a>.</p>`;
    return;
  }

  document.title = `${event.title} — Rangahala`;

  // Fill in the static details
  document.getElementById("event-category").textContent = event.category;
  document.getElementById("event-title").textContent = event.title;
  document.getElementById("event-venue").textContent = event.venue;
  document.getElementById("event-datetime").textContent = `${formatDate(event.date)} · ${event.time}`;
  document.getElementById("event-blurb").textContent = event.blurb;

  // Build the ticket-tier radio options
  const tierList = document.getElementById("tier-list");
  event.tiers.forEach((tier, index) => {
    const label = document.createElement("label");
    label.className = "tier-option";
    label.innerHTML = `
      <input type="radio" name="tier" value="${index}" ${index === 0 ? "checked" : ""} />
      <span class="tier-option__name">${tier.name}</span>
      <span class="tier-option__price">${formatPrice(tier.price)}</span>
    `;
    tierList.appendChild(label);
  });

  const qtyInput = document.getElementById("qty");
  const totalEl = document.getElementById("total-price");

  function recalcTotal() {
    const selectedIndex = Number(document.querySelector('input[name="tier"]:checked').value);
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    const total = event.tiers[selectedIndex].price * qty;
    totalEl.textContent = formatPrice(total);
  }

  tierList.addEventListener("change", recalcTotal);
  qtyInput.addEventListener("input", recalcTotal);
  recalcTotal();

  // Handle the booking form submit
  const form = document.getElementById("booking-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("buyer-name").value.trim();
    const emailOrPhone = document.getElementById("buyer-contact").value.trim();
    const selectedIndex = Number(document.querySelector('input[name="tier"]:checked').value);
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    const tier = event.tiers[selectedIndex];

    if (!name || !emailOrPhone) return; // HTML "required" already guards this, this is a second safety check

    const booking = {
      reference: generateReference(),
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      date: event.date,
      time: event.time,
      tierName: tier.name,
      quantity: qty,
      total: tier.price * qty,
      buyerName: name,
      buyerContact: emailOrPhone
    };

    // "Save" the booking. In a real app this would be a fetch() to a server.
    localStorage.setItem("rangahala_last_booking", JSON.stringify(booking));

    window.location.href = "confirmation.html";
  });
}

// ---------- 5. PAGE: confirmation.html (the finished ticket) ----------

function initConfirmationPage() {
  const container = document.getElementById("ticket-result");
  if (!container) return;

  const raw = localStorage.getItem("rangahala_last_booking");
  if (!raw) {
    container.innerHTML = `<p class="empty-state">No booking found. <a href="index.html">Browse events</a> to book one.</p>`;
    return;
  }

  const b = JSON.parse(raw);

  document.getElementById("ticket-event").textContent = b.eventTitle;
  document.getElementById("ticket-venue").textContent = b.venue;
  document.getElementById("ticket-datetime").textContent = `${formatDate(b.date)} · ${b.time}`;
  document.getElementById("ticket-tier").textContent = `${b.tierName} × ${b.quantity}`;
  document.getElementById("ticket-buyer").textContent = b.buyerName;
  document.getElementById("ticket-total").textContent = formatPrice(b.total);
  document.getElementById("ticket-reference").textContent = b.reference;
}

// ---------- 6. Run the right setup for whichever page loaded ----------
document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
  initEventPage();
  initConfirmationPage();
});
