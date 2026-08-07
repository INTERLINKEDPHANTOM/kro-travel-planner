from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 16)
        self.cell(0, 10, 'OS for Travel Revamp - Implementation Tracker', 0, 1, 'C')
        self.ln(5)

    def chapter_title(self, label):
        self.set_font('Helvetica', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, label, 0, 1, 'L', True)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Helvetica', '', 10)
        self.multi_cell(0, 6, body)
        self.ln()

def generate_tracker_pdf():
    pdf = PDF()
    pdf.add_page()
    
    # Inventory Table
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 10, 'Complete Page Inventory', 0, 1, 'L')
    pdf.ln(2)
    
    pdf.set_font('Helvetica', 'B', 9)
    # Header
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(50, 8, 'Page', 1, 0, 'L', True)
    pdf.cell(70, 8, 'Route', 1, 0, 'L', True)
    pdf.cell(40, 8, 'Category', 1, 0, 'L', True)
    pdf.cell(30, 8, 'Status', 1, 1, 'L', True)
    
    pdf.set_font('Helvetica', '', 8)
    pages = [
        ("Index", "/", "Landing", "Completed (V1)"),
        ("PlanTrip", "/plan", "Engine", "In Progress"),
        ("PlanSelection", "/plans", "Engine", "Pending"),
        ("FreeItinerary", "/itinerary/:destination", "Engine", "Pending"),
        ("PaidItinerary", "/paid-itinerary", "Engine", "Pending"),
        ("Dashboard", "/dashboard", "Private", "Pending"),
        ("MyTrips", "/my-trips", "Private", "Pending"),
        ("CreatorStudio", "/creator-studio", "Private", "Pending"),
        ("TripGallery", "/trip-gallery/:tripId", "Social", "Pending"),
        ("Destinations", "/destinations", "Public", "Pending"),
        ("About", "/about", "Public", "Pending"),
        ("Founder", "/founder", "Public", "Pending"),
        ("Contact", "/contact", "Public", "Pending"),
        ("Legal", "/legal", "Public", "Pending"),
        ("Offers", "/offers", "Public", "Pending"),
        ("Checkout", "/checkout", "Engine", "Pending"),
        ("Auth", "/auth", "Public", "Pending"),
        ("Admin", "/admin", "Management", "Pending"),
        ("TripChat", "/trip-chat/:tripId", "Social", "Pending"),
        ("TravelPage", "/travel/:slug", "Public", "Pending"),
        ("TripWrapped", "/trip-wrapped/:tripId", "Multimedia", "Pending"),
        ("TravelMap", "/travel-map", "Intelligence", "Pending"),
        ("PackingChecklist", "/packing-checklist", "Intelligence", "Pending"),
        ("PostcardGenerator", "/postcard", "Multimedia", "Pending"),
        ("TripMontage", "/trip-montage/:tripId", "Multimedia", "Pending"),
        ("TravelYearbook", "/travel-yearbook", "Multimedia", "Pending"),
        ("Leaderboard", "/leaderboard", "Gamification", "Pending"),
        ("TravelBingo", "/travel-bingo", "Gamification", "Pending"),
        ("DuoTravel", "/duo-travel", "Social", "Pending"),
        ("PassportStamps", "/passport", "Gamification", "Pending"),
        ("SpendTracker", "/spend-tracker", "Financial", "Pending"),
        ("NotFound", "*", "Management", "Pending")
    ]
    
    for name, route, cat, status in pages:
        pdf.cell(50, 7, name, 1)
        pdf.cell(70, 7, route, 1)
        pdf.cell(40, 7, cat, 1)
        pdf.cell(30, 7, status, 1, 1)

    output_path = "/mnt/documents/revamp-tracker.pdf"
    pdf.output(output_path)
    print(f"PDF generated at {output_path}")

if __name__ == "__main__":
    generate_tracker_pdf()
