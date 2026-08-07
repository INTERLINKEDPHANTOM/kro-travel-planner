from fpdf import FPDF

class TrackerPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 16)
        self.cell(0, 10, 'OS for Travel - Revamp Tracker', 0, 1, 'C')
        self.ln(5)

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 14)
        self.set_fill_color(240, 240, 240)
        self.cell(0, 10, title, 0, 1, 'L', True)
        self.ln(2)

    def item(self, text, status):
        self.set_font('helvetica', '', 12)
        mark = "[X]" if status else "[ ]"
        self.multi_cell(0, 8, f"{mark} {text}")
        self.ln(1)

pdf = TrackerPDF()
pdf.add_page()

# Phase 1
pdf.chapter_title("Phase 1: Foundation (Design System)")
pdf.item("Core Palette: Deep Emerald & Monochrome", True)
pdf.item("Typography Scale: Inter & Geist", True)
pdf.item("UI Components: Glass & Bento", True)
pdf.item("Global Command Menu (CMD+K)", False)
pdf.item("High-fidelity toast notifications", False)

# Phase 2
pdf.chapter_title("Phase 2: Landing Page")
pdf.item("Hero Section: Bento-grid AI Preview", True)
pdf.item("Navigation: Precision-blur Navbar", True)
pdf.item("How It Works & Discovery Grids", True)
pdf.item("Announcement Banner", True)
pdf.item("Scroll-linked animations", False)

# Full Inventory
pdf.chapter_title("Page Inventory Status")
pages = [
    ("Index", "Completed"), ("PlanTrip", "In Progress"), ("PlanSelection", "Pending"),
    ("FreeItinerary", "Pending"), ("PaidItinerary", "Pending"), ("Dashboard", "Pending"),
    ("CreatorStudio", "Pending"), ("MyTrips", "Pending"), ("Admin", "Pending"),
    ("Auth", "Pending"), ("TravelMap", "Pending")
]

pdf.set_font('helvetica', 'B', 10)
pdf.cell(90, 8, "Page", 1)
pdf.cell(90, 8, "Status", 1)
pdf.ln()
pdf.set_font('helvetica', '', 10)
for p, s in pages:
    pdf.cell(90, 8, p, 1)
    pdf.cell(90, 8, s, 1)
    pdf.ln()

pdf.output("/mnt/documents/revamp-tracker.pdf")
