import { jsPDF } from "jspdf";

// Color palette (RGB)
const COLORS = {
  primary: [45, 100, 80] as [number, number, number],
  dark: [30, 30, 30] as [number, number, number],
  text: [55, 55, 55] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  light: [245, 243, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  accent: [220, 90, 50] as [number, number, number],
  border: [220, 218, 215] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

class PDFBuilder {
  pdf: jsPDF;
  y: number;
  links: { url: string; x: number; y: number; w: number; h: number; page: number }[] = [];
  pageNum: number = 1;

  constructor() {
    this.pdf = new jsPDF("p", "mm", "a4");
    this.y = MARGIN;
  }

  checkPage(needed: number = 12) {
    if (this.y + needed > PAGE_H - 20) {
      this.addFooter();
      this.pdf.addPage();
      this.pageNum++;
      this.y = MARGIN;
    }
  }

  addFooter() {
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(...COLORS.muted);
    this.pdf.text("KroTravel — Your AI Travel Companion", MARGIN, PAGE_H - 8);
    this.pdf.text(`Page ${this.pageNum}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  }

  // Branded header bar
  addCover(title: string, subtitle: string, prefs: any) {
    // Background strip
    this.pdf.setFillColor(...COLORS.primary);
    this.pdf.rect(0, 0, PAGE_W, 70, "F");

    // Brand
    this.pdf.setTextColor(...COLORS.white);
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("KROTRAVEL", MARGIN, 18);
    this.pdf.setFontSize(7);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text("Your AI Travel Companion", MARGIN, 23);

    // Title
    this.pdf.setFontSize(24);
    this.pdf.setFont("helvetica", "bold");
    const titleLines = this.pdf.splitTextToSize(title, CONTENT_W);
    this.pdf.text(titleLines, MARGIN, 38);

    // Subtitle
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text(subtitle, MARGIN, 55);

    // Date generated
    this.pdf.setFontSize(7);
    this.pdf.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, MARGIN, 63);

    this.y = 80;

    // Preferences summary box
    if (prefs) {
      this.pdf.setFillColor(...COLORS.light);
      this.pdf.roundedRect(MARGIN, this.y, CONTENT_W, 32, 3, 3, "F");

      this.pdf.setFontSize(9);
      this.pdf.setFont("helvetica", "bold");
      this.pdf.setTextColor(...COLORS.dark);
      this.pdf.text("YOUR TRIP DETAILS", MARGIN + 6, this.y + 7);

      this.pdf.setFont("helvetica", "normal");
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(...COLORS.text);

      const details = [
        [`From: ${prefs.departure || "—"}`, `To: ${prefs.arrival || "—"}`],
        [`Dates: ${prefs.departureDate || "—"} → ${prefs.arrivalDate || "—"}`, `People: ${prefs.numPeople || "—"}`],
        [`Budget: ₹${prefs.budgetMin || "—"} – ₹${prefs.budgetMax || "—"}`, `Food: ${prefs.food || "Mixed"}`],
      ];

      let dy = this.y + 13;
      for (const row of details) {
        this.pdf.text(row[0], MARGIN + 6, dy);
        this.pdf.text(row[1], MARGIN + CONTENT_W / 2, dy);
        dy += 6;
      }

      this.y += 40;
    }
  }

  addSectionTitle(text: string, emoji?: string) {
    this.checkPage(16);
    this.y += 4;
    this.pdf.setFillColor(...COLORS.primary);
    this.pdf.rect(MARGIN, this.y, 1.5, 7, "F");
    this.pdf.setFontSize(13);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(...COLORS.dark);
    this.pdf.text(`${emoji ? emoji + "  " : ""}${text}`, MARGIN + 5, this.y + 5.5);
    this.y += 14;
  }

  addSubTitle(text: string) {
    this.checkPage(10);
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(...COLORS.primary);
    this.pdf.text(text, MARGIN, this.y + 4);
    this.y += 8;
  }

  addText(text: string, options?: { bold?: boolean; color?: [number, number, number]; size?: number; indent?: number }) {
    this.checkPage(8);
    const size = options?.size || 8.5;
    this.pdf.setFontSize(size);
    this.pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
    this.pdf.setTextColor(...(options?.color || COLORS.text));
    const x = MARGIN + (options?.indent || 0);
    const lines = this.pdf.splitTextToSize(text, CONTENT_W - (options?.indent || 0));
    for (const line of lines) {
      this.checkPage(5);
      this.pdf.text(line, x, this.y + 3.5);
      this.y += 4.5;
    }
    this.y += 1;
  }

  addLink(text: string, url: string, options?: { indent?: number }) {
    this.checkPage(8);
    this.pdf.setFontSize(8);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(...COLORS.primary);
    const x = MARGIN + (options?.indent || 0);
    const tw = this.pdf.getTextWidth(text);
    this.pdf.text(text, x, this.y + 3.5);
    this.pdf.link(x, this.y, tw, 4, { url });
    // Underline
    this.pdf.setDrawColor(...COLORS.primary);
    this.pdf.setLineWidth(0.2);
    this.pdf.line(x, this.y + 4, x + tw, this.y + 4);
    this.y += 6;
  }

  addDivider() {
    this.y += 2;
    this.pdf.setDrawColor(...COLORS.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 4;
  }

  addBullet(text: string, bullet: string = "•") {
    this.checkPage(7);
    this.pdf.setFontSize(8.5);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(...COLORS.text);
    this.pdf.text(bullet, MARGIN + 2, this.y + 3.5);
    const lines = this.pdf.splitTextToSize(text, CONTENT_W - 10);
    for (const line of lines) {
      this.checkPage(5);
      this.pdf.text(line, MARGIN + 8, this.y + 3.5);
      this.y += 4.5;
    }
    this.y += 1;
  }

  addTableRow(cols: { text: string; width: number; bold?: boolean; color?: [number, number, number]; align?: "left" | "right" | "center" }[], bg?: boolean) {
    this.checkPage(8);
    if (bg) {
      this.pdf.setFillColor(...COLORS.light);
      this.pdf.rect(MARGIN, this.y, CONTENT_W, 7, "F");
    }
    let x = MARGIN + 3;
    for (const col of cols) {
      this.pdf.setFontSize(8);
      this.pdf.setFont("helvetica", col.bold ? "bold" : "normal");
      this.pdf.setTextColor(...(col.color || COLORS.text));
      const align = col.align || "left";
      const tx = align === "right" ? x + col.width - 3 : x;
      this.pdf.text(col.text, tx, this.y + 5, { align });
      x += col.width;
    }
    this.y += 7;
  }

  addSpace(mm: number = 4) {
    this.y += mm;
  }

  save(filename: string) {
    this.addFooter();
    this.pdf.save(filename);
  }
}

export function generateItineraryPDF(itinerary: any, preferences: any) {
  const b = new PDFBuilder();
  const it = itinerary;

  // ── Cover ──
  b.addCover(
    it.cover_title || `Your Trip to ${preferences?.arrival || "—"}`,
    it.intro || `Personalized itinerary crafted just for you`,
    preferences
  );

  // ── Route Overview ──
  if (it.route_overview) {
    b.addSectionTitle("Route Overview", "🗺️");
    b.addText(it.route_overview);
    b.addSpace(4);
  }

  // ── Transport ──
  if (it.transport_options?.length > 0) {
    b.addSectionTitle("Transport Options", "🚆");
    b.addTableRow([
      { text: "MODE", width: 30, bold: true, color: COLORS.muted },
      { text: "ROUTE", width: 55, bold: true, color: COLORS.muted },
      { text: "DURATION", width: 30, bold: true, color: COLORS.muted },
      { text: "COST", width: 30, bold: true, color: COLORS.muted, align: "right" },
      { text: "STATUS", width: 29, bold: true, color: COLORS.muted, align: "right" },
    ], true);

    for (const opt of it.transport_options) {
      b.addTableRow([
        { text: opt.mode || "—", width: 30 },
        { text: (opt.route || "—").substring(0, 35), width: 55 },
        { text: opt.duration || "—", width: 30 },
        { text: opt.cost_per_person || "—", width: 30, align: "right" },
        { text: opt.feasibility || "—", width: 29, align: "right", color: opt.feasibility === "recommended" ? COLORS.primary : COLORS.text },
      ]);
    }

    if (it.selected_transport) {
      b.addSpace(3);
      if (it.selected_transport.outbound) {
        b.addText(`✅ Outbound: ${it.selected_transport.outbound.details || it.selected_transport.outbound.mode || "—"} (${it.selected_transport.outbound.cost || "—"})`, { bold: true, color: COLORS.primary });
      }
      if (it.selected_transport.return) {
        b.addText(`✅ Return: ${it.selected_transport.return.details || it.selected_transport.return.mode || "—"} (${it.selected_transport.return.cost || "—"})`, { bold: true, color: COLORS.primary });
      }
    }
    b.addSpace(4);
  }

  // Affiliate links
  b.addText("Book your transport:", { bold: true, size: 8 });
  b.addLink("Book Train (IRCTC) →", "https://www.irctc.co.in", { indent: 2 });
  b.addLink("Book Bus (RedBus) →", "https://www.redbus.in", { indent: 2 });
  b.addLink("Book Flight (MakeMyTrip) →", "https://www.makemytrip.com/flights", { indent: 2 });
  b.addSpace(4);

  // ── Hotels ──
  if (it.hotels?.length > 0) {
    b.addSectionTitle("Hotel Options", "🏨");
    for (const hotel of it.hotels) {
      b.addSubTitle(`${hotel.tier} — ${hotel.name}`);
      b.addText(`${hotel.description || ""}`, { indent: 2 });
      b.addText(`💰 ${hotel.price_per_night}/night · Total: ${hotel.total_cost}`, { indent: 2, bold: true });
      b.addText(`📍 Station: ${hotel.distance_station || "—"} · Tourist hub: ${hotel.distance_hub || "—"}`, { indent: 2 });
      if (hotel.breakfast_included) b.addText(`✅ Breakfast included`, { indent: 2, color: COLORS.primary });
      b.addText(`💡 ${hotel.why_choose || ""}`, { indent: 2, color: COLORS.muted });
      if (hotel.maps_url) b.addLink("View on Google Maps →", hotel.maps_url, { indent: 2 });
      b.addSpace(3);
    }
    b.addLink("Book Hotel (Booking.com) →", "https://www.booking.com");
    b.addSpace(4);
  }

  // ── Day-wise Itinerary ──
  if (it.days?.length > 0) {
    b.addSectionTitle("Day-by-Day Itinerary", "📋");

    for (const day of it.days) {
      b.checkPage(20);
      // Day header bar
      b.pdf.setFillColor(...COLORS.primary);
      b.pdf.roundedRect(MARGIN, b.y, CONTENT_W, 9, 2, 2, "F");
      b.pdf.setFontSize(10);
      b.pdf.setFont("helvetica", "bold");
      b.pdf.setTextColor(...COLORS.white);
      b.pdf.text(`${day.emoji || "📍"}  ${day.day_label}`, MARGIN + 4, b.y + 6.5);

      // Calculate day cost
      const dayCost = day.activities?.reduce((sum: number, act: any) => {
        return sum + (parseInt(String(act.cost || "0").replace(/[^\d]/g, "")) || 0);
      }, 0) || 0;
      if (dayCost > 0) {
        b.pdf.text(`₹${dayCost.toLocaleString("en-IN")}`, PAGE_W - MARGIN - 4, b.y + 6.5, { align: "right" });
      }
      b.y += 13;

      // Activities table
      if (day.activities?.length > 0) {
        b.addTableRow([
          { text: "TIME", width: 22, bold: true, color: COLORS.muted },
          { text: "ACTIVITY", width: 90, bold: true, color: COLORS.muted },
          { text: "DURATION", width: 28, bold: true, color: COLORS.muted },
          { text: "COST", width: 24, bold: true, color: COLORS.muted, align: "right" },
        ], true);

        for (let i = 0; i < day.activities.length; i++) {
          const act = day.activities[i];
          const activityText = (act.activity || "—").substring(0, 55);

          b.addTableRow([
            { text: act.time || "—", width: 22, bold: true, color: COLORS.primary },
            { text: activityText, width: 90 },
            { text: act.duration || "—", width: 28 },
            { text: act.cost || "Free", width: 24, align: "right", color: COLORS.primary },
          ], i % 2 === 1);

          // Note on next line
          if (act.note) {
            b.addText(`↳ ${act.note}`, { indent: 22, color: COLORS.muted, size: 7 });
          }

          // Maps link
          if (act.maps_url) {
            b.addLink("📍 View on Maps", act.maps_url, { indent: 22 });
          }
        }
      }

      // Day total
      if (dayCost > 0) {
        b.addSpace(1);
        b.pdf.setFillColor(...COLORS.light);
        b.pdf.roundedRect(MARGIN, b.y, CONTENT_W, 7, 1, 1, "F");
        b.pdf.setFontSize(8);
        b.pdf.setFont("helvetica", "bold");
        b.pdf.setTextColor(...COLORS.primary);
        b.pdf.text(`Day Total: ₹${dayCost.toLocaleString("en-IN")}`, PAGE_W - MARGIN - 4, b.y + 5, { align: "right" });
        b.y += 10;
      }

      b.addSpace(4);
    }
  }

  // ── Restaurants ──
  if (it.restaurants?.length > 0) {
    b.addSectionTitle("Restaurant Suggestions", "🍽️");
    for (const r of it.restaurants) {
      b.addText(`${r.name} — ${r.type} (${r.meal})`, { bold: true });
      b.addText(`${r.reason}`, { indent: 2, color: COLORS.muted });
      b.addText(`📍 Near ${r.near_landmark} · Avg: ${r.avg_cost}/person`, { indent: 2 });
      b.addSpace(2);
    }
  }

  // ── Budget Breakdown ──
  if (it.budget_breakdown) {
    b.addSectionTitle("Budget Breakdown", "💰");
    const bb = it.budget_breakdown;

    b.addTableRow([
      { text: "CATEGORY", width: 110, bold: true, color: COLORS.muted },
      { text: "AMOUNT", width: 64, bold: true, color: COLORS.muted, align: "right" },
    ], true);

    for (const item of bb.items || []) {
      b.addTableRow([
        { text: item.label, width: 110 },
        { text: item.amount, width: 64, align: "right", bold: true },
      ]);
    }

    if (bb.emergency_buffer) {
      b.addTableRow([
        { text: "🛡️ Emergency Buffer (10%)", width: 110, color: COLORS.accent },
        { text: bb.emergency_buffer, width: 64, align: "right", bold: true, color: COLORS.accent },
      ]);
    }

    b.addDivider();
    b.addTableRow([
      { text: "TOTAL ESTIMATED", width: 110, bold: true, color: COLORS.dark },
      { text: bb.total_estimated || "—", width: 64, align: "right", bold: true, color: COLORS.primary },
    ], true);

    if (bb.savings_message) {
      b.addSpace(3);
      b.addText(`✅ ${bb.savings_message}`, { color: COLORS.primary, bold: true });
    }
    b.addSpace(4);
  }

  // ── Travel Tips ──
  if (it.travel_tips?.length > 0) {
    b.addSectionTitle("Travel Tips", "💡");
    for (const tip of it.travel_tips) {
      b.addBullet(tip, "✅");
    }
    b.addSpace(3);
  }

  // ── Packing Checklist ──
  if (it.packing_checklist?.length > 0) {
    b.addSectionTitle("Packing Checklist", "🎒");
    for (const item of it.packing_checklist) {
      b.addBullet(item, "☐");
    }
    b.addSpace(3);
  }

  // ── Local Insights ──
  if (it.local_insights?.length > 0) {
    b.addSectionTitle("Local Insights", "🏘️");
    for (const insight of it.local_insights) {
      b.addBullet(insight, "📌");
    }
    b.addSpace(3);
  }

  // ── Closing ──
  if (it.closing_note) {
    b.checkPage(20);
    b.addSpace(6);
    b.pdf.setFillColor(...COLORS.primary);
    b.pdf.roundedRect(MARGIN, b.y, CONTENT_W, 22, 3, 3, "F");
    b.pdf.setFontSize(9);
    b.pdf.setFont("helvetica", "italic");
    b.pdf.setTextColor(...COLORS.white);
    const closeLines = b.pdf.splitTextToSize(it.closing_note, CONTENT_W - 16);
    b.pdf.text(closeLines, MARGIN + 8, b.y + 9);
    b.y += 28;
  }

  // Contact & Links
  b.addSpace(6);
  b.addText("Need Help?", { bold: true, size: 10, color: COLORS.dark });
  b.addLink("✉️ support@krotravel.com", "mailto:support@krotravel.com");
  b.addSpace(2);
  b.addText("Quick Booking Links:", { bold: true, size: 8 });
  b.addLink("IRCTC (Trains)", "https://www.irctc.co.in", { indent: 2 });
  b.addLink("RedBus (Buses)", "https://www.redbus.in", { indent: 2 });
  b.addLink("MakeMyTrip (Flights)", "https://www.makemytrip.com/flights", { indent: 2 });
  b.addLink("Booking.com (Hotels)", "https://www.booking.com", { indent: 2 });
  b.addLink("Uber (Cabs)", "https://www.uber.com", { indent: 2 });

  b.save(`KroTravel_${preferences?.arrival || "Itinerary"}.pdf`);
}
