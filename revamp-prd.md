# Product Requirements Document (PRD): KroTravel Visual & UX Revamp

## 1. Vision
Transform KroTravel from a standard travel planner into a high-end, AI-first platform inspired by the visual language of Stripe, Vercel, and modern AI startups (Linear, OpenAI). The interface should feel like an "operating system for travel"—precise, powerful, and aesthetically superior.

## 2. Core Design Principles
*   **Bento-Grid Layouts**: Move away from standard lists to structured, modular grids for itineraries and dashboards.
*   **Depth & Layering**: Use sophisticated glassmorphism with dynamic light sources and realistic shadows (z-indexing depth).
*   **Precision Typography**: Shift to a combination of high-precision sans-serif (Inter/Geist) and elegant, modern serif for contrast.
*   **Micro-Interactions**: Implement physics-based animations (Framer Motion) for state transitions and feedback.
*   **AI-First Aesthetics**: Use monochromatic dark/light modes with surgical pops of color (like the current emerald, but more refined).

## 3. Visual Roadmap
### Phase 1: Foundation (Design System Update)
*   **Typography**: Transition to a more precise type scale.
*   **Colors**: Define a "Deep Emerald" palette with higher contrast ratios and sophisticated grays.
*   **Components**: Revamp buttons, inputs, and cards to match the "Stripe-like" aesthetic (border-radius, subtle gradients, border-glow).

### Phase 2: Landing Page Overhaul
*   **Hero**: High-impact animation, possibly a 3D or SVG-based interactive globe or route visualization.
*   **Social Proof**: Marquee-style logos and testimonials.
*   **Feature Grid**: Bento-style showcase of AI capabilities.

### Phase 3: Itinerary Engine UI
*   **Modular View**: Days represented as expandable bento blocks.
*   **Interactive Maps**: Integrated, seamless map transitions.
*   **AI Insights**: Floating "intelligence" widgets for weather, crowd data, and cost optimization.

### Phase 4: Dashboard & Creator Studio
*   **Personalization**: A command-center feel for the user's travel history and planned trips.
*   **Real-time Activity**: Live streams of trip generation or updates.

## 4. Next Steps
1.  **Approval**: Verify the PRD alignment with the user's vision.
2.  **Theme Implementation**: Update `index.css` and `tailwind.config.ts` with the new design tokens.
3.  **Global Components**: Refactor `Navbar` and `Footer`.
4.  **Page Revamps**: Start with `Index.tsx` as the North Star for the new look.
