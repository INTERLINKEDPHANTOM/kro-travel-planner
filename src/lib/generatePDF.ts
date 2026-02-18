import { jsPDF } from "jspdf";

// ── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary:   [34, 110, 80]   as [number, number, number], // deep green
  dark:      [18, 42, 30]    as [number, number, number], // near-black green
  text:      [40, 60, 48]    as [number, number, number], // body text
  muted:     [110, 135, 118] as [number, number, number], // muted
  light:     [240, 248, 244] as [number, number, number], // section bg
  white:     [255, 255, 255] as [number, number, number],
  accent:    [215, 100, 40]  as [number, number, number], // orange accent
  border:    [208, 230, 218] as [number, number, number],
  rowEven:   [246, 252, 249] as [number, number, number],
};

const PW   = 210; // A4 width mm
const PH   = 297; // A4 height mm
const ML   = 16;  // left margin
const MR   = 16;  // right margin
const CW   = PW - ML - MR; // content width
const BOT  = PH - 14;      // bottom safe line

// ── PDF Builder ──────────────────────────────────────────────────────────────
class PDF {
  doc: jsPDF;
  y  = ML;
  pg = 1;

  constructor() {
    this.doc = new jsPDF("p", "mm", "a4");
    this.y   = ML;
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  need(h: number) {
    if (this.y + h > BOT) {
      this._footer();
      this.doc.addPage();
      this.pg++;
      this.y = ML + 4;
    }
  }

  _footer() {
    this.doc.setFontSize(6.5);
    this.doc.setTextColor(...C.muted);
    this.doc.text("KroTravel — Your AI Travel Companion  •  krotravel.in", ML, PH - 6);
    this.doc.text(`Page ${this.pg}`, PW - MR, PH - 6, { align: "right" });
    // footer line
    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.25);
    this.doc.line(ML, PH - 9, PW - MR, PH - 9);
  }

  // ── Cover Page ────────────────────────────────────────────────────────────
  cover(title: string, subtitle: string, prefs: any) {
    // Full-width green header band
    this.doc.setFillColor(...C.primary);
    this.doc.rect(0, 0, PW, 80, "F");

    // Brand
    this.doc.setTextColor(...C.white);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("KROTRAVEL", ML, 14);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(6.5);
    this.doc.text("Your AI Travel Companion", ML, 19);

    // Divider
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(0.4);
    this.doc.line(ML, 22, PW - MR, 22);

    // Trip title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(22);
    const titleLines = this.doc.splitTextToSize(
      title.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim(),
      CW
    );
    this.doc.text(titleLines, ML, 36);

    // Subtitle
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(200, 235, 218);
    const subLines = this.doc.splitTextToSize(subtitle || "", CW);
    this.doc.text(subLines, ML, 36 + titleLines.length * 8 + 3);

    // Generated date (right-aligned)
    this.doc.setFontSize(6.5);
    this.doc.setTextColor(...C.white);
    const dt = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    this.doc.text(`Generated: ${dt}`, PW - MR, 74, { align: "right" });

    this.y = 90;

    // Preferences box
    if (prefs) {
      this.doc.setFillColor(...C.light);
      this.doc.roundedRect(ML, this.y, CW, 44, 3, 3, "F");
      this.doc.setDrawColor(...C.border);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(ML, this.y, CW, 44, 3, 3, "S");

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...C.dark);
      this.doc.text("YOUR TRIP DETAILS", ML + 6, this.y + 8);

      this.doc.setDrawColor(...C.border);
      this.doc.setLineWidth(0.3);
      this.doc.line(ML + 6, this.y + 10, ML + CW - 6, this.y + 10);

      const half = CW / 2;
      const rows = [
        [`From: ${prefs.departure || "—"}`,     `To: ${prefs.arrival || "—"}`],
        [`Dates: ${prefs.departureDate?.split("T")[0] || "—"} → ${prefs.arrivalDate?.split("T")[0] || "—"}`,
         `People: ${prefs.numPeople || "—"}`],
        [`Budget: ₹${prefs.budgetMin || "—"} – ₹${prefs.budgetMax || "—"}`,
         `Food: ${prefs.food || "Mixed"}`],
        [`Transport: ${prefs.transport || "Mixed"}`,
         `Type: ${prefs.travelType || "Leisure"}`],
      ];

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.setTextColor(...C.text);
      let ry = this.y + 17;
      for (const [a, b] of rows) {
        this.doc.text(a, ML + 6, ry);
        this.doc.text(b, ML + 6 + half, ry);
        ry += 6.5;
      }

      this.y += 52;
    }
  }

  // ── Section Title (large, with coloured left bar) ─────────────────────────
  sectionTitle(text: string, emoji = "") {
    this.need(18);
    this.y += 5;

    // Background pill
    this.doc.setFillColor(...C.light);
    this.doc.roundedRect(ML, this.y, CW, 11, 2, 2, "F");

    // Left accent bar
    this.doc.setFillColor(...C.primary);
    this.doc.roundedRect(ML, this.y, 3, 11, 1, 1, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(...C.dark);
    // Strip emoji from PDF text (jsPDF can't render them)
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
    this.doc.text(`${emoji ? "" : ""}${clean}`, ML + 8, this.y + 7.8);

    this.y += 16;
  }

  // ── Sub-heading ───────────────────────────────────────────────────────────
  subTitle(text: string) {
    this.need(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...C.primary);
    this.doc.text(text, ML, this.y + 3.5);
    this.y += 8;
  }

  // ── Body text with word-wrap ──────────────────────────────────────────────
  text(content: string, opts?: {
    bold?: boolean; color?: [number, number, number]; size?: number; indent?: number; center?: boolean;
  }) {
    const size   = opts?.size   || 8.5;
    const indent = opts?.indent || 0;
    const x      = ML + indent;
    const width  = CW - indent;

    this.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...(opts?.color || C.text));

    // Strip emoji characters that jsPDF can't render
    const safe = content.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                        .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "")
                        .trim();
    const lines = this.doc.splitTextToSize(safe, width);

    for (const line of lines) {
      this.need(5);
      if (opts?.center) {
        this.doc.text(line, PW / 2, this.y + 3.5, { align: "center" });
      } else {
        this.doc.text(line, x, this.y + 3.5);
      }
      this.y += 4.8;
    }
    this.y += 1;
  }

  // ── Clickable link ────────────────────────────────────────────────────────
  link(label: string, url: string, indent = 0) {
    this.need(7);
    const x  = ML + indent;
    const tw = this.doc.getTextWidth(label);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...C.primary);
    this.doc.text(label, x, this.y + 3.5);
    this.doc.link(x, this.y, tw, 5, { url });
    this.doc.setDrawColor(...C.primary);
    this.doc.setLineWidth(0.2);
    this.doc.line(x, this.y + 4.5, x + tw, this.y + 4.5);
    this.y += 7;
  }

  // ── Bullet point ──────────────────────────────────────────────────────────
  bullet(content: string, sym = "-") {
    this.need(7);
    const safe = content.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                        .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...C.text);
    this.doc.text(sym, ML + 3, this.y + 3.5);
    const lines = this.doc.splitTextToSize(safe, CW - 12);
    for (const line of lines) {
      this.need(5);
      this.doc.text(line, ML + 10, this.y + 3.5);
      this.y += 5;
    }
    this.y += 0.5;
  }

  // ── Horizontal rule ───────────────────────────────────────────────────────
  rule() {
    this.y += 2;
    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.3);
    this.doc.line(ML, this.y, PW - MR, this.y);
    this.y += 4;
  }

  // ── Thin spacer ───────────────────────────────────────────────────────────
  gap(mm = 4) { this.y += mm; }

  // ── Table header row ──────────────────────────────────────────────────────
  tableHeader(cols: { label: string; w: number; align?: "left" | "right" | "center" }[]) {
    this.need(9);
    this.doc.setFillColor(...C.primary);
    this.doc.rect(ML, this.y, CW, 8, "F");
    let x = ML + 3;
    for (const col of cols) {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7);
      this.doc.setTextColor(...C.white);
      const tx = col.align === "right" ? x + col.w - 3 : x;
      this.doc.text(col.label, tx, this.y + 5.5, { align: col.align || "left" });
      x += col.w;
    }
    this.y += 8;
  }

  // ── Table data row ────────────────────────────────────────────────────────
  tableRow(
    cols: { text: string; w: number; bold?: boolean; color?: [number, number, number]; align?: "left" | "right" | "center" }[],
    shade = false
  ) {
    this.need(8);
    if (shade) {
      this.doc.setFillColor(...C.rowEven);
      this.doc.rect(ML, this.y, CW, 7, "F");
    }
    let x = ML + 3;
    for (const col of cols) {
      this.doc.setFont("helvetica", col.bold ? "bold" : "normal");
      this.doc.setFontSize(7.8);
      this.doc.setTextColor(...(col.color || C.text));
      const safe = String(col.text || "—")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
        .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "")
        .substring(0, 58);
      const tx = col.align === "right" ? x + col.w - 3 : x;
      this.doc.text(safe, tx, this.y + 5, { align: col.align || "left" });
      x += col.w;
    }
    this.y += 7;
  }

  // ── Summary/Total row ─────────────────────────────────────────────────────
  totalRow(label: string, value: string) {
    this.need(10);
    this.doc.setFillColor(...C.primary);
    this.doc.rect(ML, this.y, CW, 9, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...C.white);
    this.doc.text(label, ML + 4, this.y + 6.2);
    this.doc.text(value, PW - MR - 3, this.y + 6.2, { align: "right" });
    this.y += 9;
  }

  // ── Info card (coloured box with text) ───────────────────────────────────
  infoCard(lines: string[], bgColor: [number, number, number] = C.light) {
    const lineCount = lines.length;
    const h = 8 + lineCount * 5.5;
    this.need(h);
    this.doc.setFillColor(...bgColor);
    this.doc.roundedRect(ML, this.y, CW, h, 2, 2, "F");
    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.25);
    this.doc.roundedRect(ML, this.y, CW, h, 2, 2, "S");
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...C.text);
    let ly = this.y + 6;
    for (const l of lines) {
      const safe = l.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                    .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
      this.doc.text(safe, ML + 5, ly);
      ly += 5.5;
    }
    this.y += h + 3;
  }

  // ── Day header bar ────────────────────────────────────────────────────────
  dayHeader(label: string, cost: number) {
    this.need(14);
    this.doc.setFillColor(...C.primary);
    this.doc.roundedRect(ML, this.y, CW, 10, 2, 2, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...C.white);
    const cleanLabel = label.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                            .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
    this.doc.text(cleanLabel, ML + 5, this.y + 7);
    if (cost > 0) {
      this.doc.text(`Rs. ${cost.toLocaleString("en-IN")}`, PW - MR - 3, this.y + 7, { align: "right" });
    }
    this.y += 13;
  }

  // ── Hotel card ────────────────────────────────────────────────────────────
  hotelCard(hotel: any) {
    const lines = [
      `${hotel.tier || "Hotel"} — ${hotel.name || "—"}`,
      `${hotel.description || ""}`,
      `Rate: ${hotel.price_per_night || "—"}/night  |  Total: ${hotel.total_cost || "—"}  |  Breakfast: ${hotel.breakfast_included ? "Yes" : "No"}`,
      `Location: ${hotel.distance_station ? hotel.distance_station + " from station" : "—"}  |  Area: ${hotel.area || "—"}`,
    ];
    const h = 8 + lines.length * 5.5;
    this.need(h);
    this.doc.setFillColor(...C.light);
    this.doc.roundedRect(ML, this.y, CW, h, 2, 2, "F");
    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.25);
    this.doc.roundedRect(ML, this.y, CW, h, 2, 2, "S");
    // Accent left strip
    this.doc.setFillColor(...C.primary);
    this.doc.roundedRect(ML, this.y, 3, h, 1, 1, "F");

    let ly = this.y + 6;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...C.dark);
    const safeName = lines[0].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "");
    this.doc.text(safeName, ML + 6, ly);
    ly += 5.5;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7.8);
    this.doc.setTextColor(...C.text);
    for (let i = 1; i < lines.length; i++) {
      const safeL = lines[i].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                            .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
      this.doc.text(safeL, ML + 6, ly);
      ly += 5.5;
    }
    this.y += h + 3;
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  save(filename: string) {
    this._footer();
    this.doc.save(filename);
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function generateItineraryPDF(itinerary: any, preferences: any) {
  const p   = new PDF();
  const it  = itinerary;
  const arr = preferences?.arrival || "Your Destination";

  // ══ COVER ══════════════════════════════════════════════════════════════════
  p.cover(
    it.cover_title || `Trip to ${arr}`,
    it.intro       || `A personalised itinerary crafted just for you.`,
    preferences
  );

  // ══ ROUTE OVERVIEW ═════════════════════════════════════════════════════════
  if (it.route_overview) {
    p.sectionTitle("Route Overview");
    p.text(it.route_overview);
    p.gap(4);
  }

  // ══ TRANSPORT OPTIONS ══════════════════════════════════════════════════════
  if (it.transport_options?.length > 0) {
    p.sectionTitle("Transport Options");
    p.tableHeader([
      { label: "MODE",     w: 28 },
      { label: "ROUTE",    w: 56 },
      { label: "DURATION", w: 30 },
      { label: "COST",     w: 30, align: "right" },
      { label: "STATUS",   w: 30, align: "right" },
    ]);
    it.transport_options.forEach((opt: any, i: number) => {
      p.tableRow([
        { text: opt.mode || "—", w: 28, bold: true, color: C.primary },
        { text: (opt.route || "—").substring(0, 38), w: 56 },
        { text: opt.duration || "—", w: 30 },
        { text: opt.cost_per_person || "—", w: 30, align: "right" },
        { text: opt.feasibility || "—", w: 30, align: "right",
          color: opt.feasibility === "recommended" ? C.primary : C.muted },
      ], i % 2 === 0);
    });

    if (it.selected_transport) {
      p.gap(4);
      if (it.selected_transport.outbound) {
        p.text(
          `Outbound: ${it.selected_transport.outbound.details || it.selected_transport.outbound.mode || "—"} — ${it.selected_transport.outbound.cost || "—"}`,
          { bold: true, color: C.primary }
        );
      }
      if (it.selected_transport.return) {
        p.text(
          `Return:   ${it.selected_transport.return.details || it.selected_transport.return.mode || "—"} — ${it.selected_transport.return.cost || "—"}`,
          { bold: true, color: C.primary }
        );
      }
    }

    p.gap(3);
    p.text("Book your transport:", { bold: true, size: 8 });
    p.link("Train — IRCTC",            "https://www.irctc.co.in", 4);
    p.link("Bus — RedBus",             "https://www.redbus.in", 4);
    p.link("Flight — MakeMyTrip",      "https://www.makemytrip.com/flights", 4);
    p.gap(4);
  }

  // ══ HOTELS ═════════════════════════════════════════════════════════════════
  if (it.hotels?.length > 0) {
    p.sectionTitle("Hotel Options");
    for (const hotel of it.hotels) {
      p.hotelCard(hotel);
      if (hotel.maps_url) p.link("View on Google Maps", hotel.maps_url, 4);
    }
    p.link("Book Hotel — Booking.com", "https://www.booking.com");
    p.gap(4);
  }

  // ══ DAY-BY-DAY ITINERARY ═══════════════════════════════════════════════════
  if (it.days?.length > 0) {
    p.sectionTitle("Day-by-Day Itinerary");

    for (const day of it.days) {
      const dayCost = day.activities?.reduce((s: number, a: any) => {
        const n = parseInt(String(a.cost || "0").replace(/[^\d]/g, "")) || 0;
        return s + n;
      }, 0) || 0;

      p.dayHeader(day.day_label || "Day", dayCost);

      if (day.activities?.length > 0) {
        // Column header
        p.tableHeader([
          { label: "TIME",     w: 22 },
          { label: "ACTIVITY", w: 90 },
          { label: "DURATION", w: 30 },
          { label: "COST",     w: 32, align: "right" },
        ]);

        day.activities.forEach((act: any, ai: number) => {
          p.tableRow([
            { text: act.time || "—", w: 22, bold: true, color: C.primary },
            { text: (act.activity || "—").substring(0, 52), w: 90 },
            { text: act.duration || "—", w: 30 },
            { text: act.cost || "Free", w: 32, align: "right", bold: true, color: C.primary },
          ], ai % 2 === 0);

          // Note on its own line
          if (act.note) {
            p.need(5);
            p.doc.setFont("helvetica", "italic");
            p.doc.setFontSize(7);
            p.doc.setTextColor(...C.muted);
            const safeNote = act.note.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "").trim();
            const noteLines = p.doc.splitTextToSize(`  Note: ${safeNote}`, CW - 24);
            for (const nl of noteLines) {
              p.need(4.5);
              p.doc.text(nl, ML + 22, p.y + 3.5);
              p.y += 4.5;
            }
          }

          if (act.maps_url) p.link("View on Map", act.maps_url, 22);
        });

        // Day total
        if (dayCost > 0) {
          p.need(8);
          p.doc.setFillColor(...C.rowEven);
          p.doc.rect(ML, p.y, CW, 7, "F");
          p.doc.setFont("helvetica", "bold");
          p.doc.setFontSize(8);
          p.doc.setTextColor(...C.primary);
          p.doc.text(
            `Day Total:  Rs. ${dayCost.toLocaleString("en-IN")}`,
            PW - MR - 3, p.y + 5, { align: "right" }
          );
          p.y += 7;
        }
      }
      p.gap(5);
    }
  }

  // ══ RESTAURANTS ════════════════════════════════════════════════════════════
  if (it.restaurants?.length > 0) {
    p.sectionTitle("Restaurant Suggestions");
    p.tableHeader([
      { label: "NAME",          w: 52 },
      { label: "TYPE",          w: 28 },
      { label: "MEAL",          w: 28 },
      { label: "AVG COST",      w: 28, align: "right" },
      { label: "NEAR",          w: 38 },
    ]);
    it.restaurants.forEach((r: any, i: number) => {
      p.tableRow([
        { text: r.name || "—",                         w: 52, bold: true },
        { text: r.type || "—",                         w: 28 },
        { text: r.meal || "—",                         w: 28 },
        { text: r.avg_cost || "—",                     w: 28, align: "right", color: C.primary },
        { text: (r.near_landmark || "—").substring(0, 20), w: 38, color: C.muted },
      ], i % 2 === 0);
    });
    p.gap(4);
  }

  // ══ BUDGET BREAKDOWN ═══════════════════════════════════════════════════════
  if (it.budget_breakdown) {
    p.sectionTitle("Budget Breakdown");
    const bb = it.budget_breakdown;

    p.tableHeader([
      { label: "CATEGORY", w: 120 },
      { label: "AMOUNT",   w: 54, align: "right" },
    ]);

    (bb.items || []).forEach((item: any, i: number) => {
      const cleanLabel = (item.label || "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                                           .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
      const cleanAmt   = String(item.amount || "—").replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
      p.tableRow([
        { text: cleanLabel, w: 120 },
        { text: cleanAmt,   w: 54, align: "right", bold: true },
      ], i % 2 === 0);
    });

    if (bb.emergency_buffer) {
      p.tableRow([
        { text: "Emergency Buffer (10%)", w: 120, color: C.accent },
        { text: String(bb.emergency_buffer).replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim(),
          w: 54, align: "right", bold: true, color: C.accent },
      ]);
    }

    p.rule();
    p.totalRow("TOTAL ESTIMATED", String(bb.total_estimated || "—").replace(/[^\d₹,\s]/g, "").trim());

    if (bb.savings_message) {
      p.gap(3);
      const cleanMsg = bb.savings_message.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                                         .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
      p.infoCard([cleanMsg], C.light);
    }
    p.gap(4);
  }

  // ══ TRAVEL TIPS ════════════════════════════════════════════════════════════
  if (it.travel_tips?.length > 0) {
    p.sectionTitle("Travel Tips");
    for (const tip of it.travel_tips) p.bullet(tip, ">");
    p.gap(3);
  }

  // ══ PACKING CHECKLIST ══════════════════════════════════════════════════════
  if (it.packing_checklist?.length > 0) {
    p.sectionTitle("Packing Checklist");
    const mid = Math.ceil(it.packing_checklist.length / 2);
    const left  = it.packing_checklist.slice(0, mid);
    const right = it.packing_checklist.slice(mid);

    // Two-column layout
    const colW = (CW - 8) / 2;
    const startY = p.y;
    let leftY  = startY;
    let rightY = startY;

    for (let i = 0; i < Math.max(left.length, right.length); i++) {
      if (left[i]) {
        p.need(6);
        p.y = leftY;
        const safe = left[i].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                             .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
        p.doc.setFont("helvetica", "normal");
        p.doc.setFontSize(8);
        p.doc.setTextColor(...C.text);
        p.doc.text(`[ ] ${safe}`, ML, leftY + 4);
        leftY += 6;
      }
      if (right[i]) {
        p.need(6);
        const safe = right[i].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                              .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
        p.doc.setFont("helvetica", "normal");
        p.doc.setFontSize(8);
        p.doc.setTextColor(...C.text);
        p.doc.text(`[ ] ${safe}`, ML + colW + 8, rightY + 4);
        rightY += 6;
      }
    }
    p.y = Math.max(leftY, rightY) + 4;
    p.gap(3);
  }

  // ══ LOCAL INSIGHTS ═════════════════════════════════════════════════════════
  if (it.local_insights?.length > 0) {
    p.sectionTitle("Local Insights");
    for (const insight of it.local_insights) p.bullet(insight, "*");
    p.gap(3);
  }

  // ══ CLOSING ════════════════════════════════════════════════════════════════
  if (it.closing_note) {
    p.need(24);
    p.gap(5);
    p.doc.setFillColor(...C.primary);
    p.doc.roundedRect(ML, p.y, CW, 20, 3, 3, "F");
    p.doc.setFont("helvetica", "italic");
    p.doc.setFontSize(8.5);
    p.doc.setTextColor(...C.white);
    const safe = it.closing_note.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1FFFF}]/gu, "")
                                 .replace(/[✅☐📍💰🏨🍽️🚆🎒💡🗺️📋🏘️✈️🛡️]/g, "").trim();
    const clines = p.doc.splitTextToSize(safe, CW - 12);
    p.doc.text(clines, PW / 2, p.y + 8, { align: "center" });
    p.y += 24;
  }

  // ══ CONTACT & BOOKING LINKS ════════════════════════════════════════════════
  p.gap(5);
  p.sectionTitle("Booking Links & Support");
  p.text("Quick access to all booking platforms:", { bold: true, size: 8.5 });
  p.gap(2);
  p.link("IRCTC — Book Trains",              "https://www.irctc.co.in", 4);
  p.link("RedBus — Book Buses",              "https://www.redbus.in", 4);
  p.link("MakeMyTrip — Book Flights",        "https://www.makemytrip.com/flights", 4);
  p.link("Booking.com — Book Hotels",        "https://www.booking.com", 4);
  p.link("Uber — Book Cabs",                 "https://www.uber.com/in/en/ride/", 4);
  p.gap(3);
  p.link("support@krotravel.com — Contact Us", "mailto:support@krotravel.com");

  p.save(`KroTravel_${arr.replace(/\s+/g, "_")}.pdf`);
}
