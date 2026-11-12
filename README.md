# Liliw Virtual Guide

**An AI-Driven Progressive Web Application for Cultural Heritage and Tourism Information Management for the Liliw Culture, History, Arts, and Tourism Office (CHATO)**

A Capstone Project presented to the Faculty of the College of Computer Studies, Laguna State Polytechnic University, in partial fulfillment of the requirements for the degree of Bachelor of Science in Information Technology.

| | |
|---|---|
| 🌐 **Live System** | https://visitliliw.vercel.app/ |
| 📄 **Project Website** | https://tyrcoder.github.io/Liliw-Virtual-Guide/ |
| 🎬 **Demo Videos** | [Google Drive folder](https://drive.google.com/drive/folders/1gpR9a9xsTlU48Gd2N7FCAcRHVi3CrFcb?usp=sharing) |
| 📊 **Diagrams & System Flows** | https://tyrcoder.github.io/Liliw-Virtual-Guide/liliw-virtual-guide/docs/flowchart.html |

![Liliw Virtual Guide homepage](screenshots/ai-virtual-guide.jpg)

## Team

| Name | Role |
|---|---|
| Timothy Kyl Q. Balbieran | Researcher |
| Razeel V. Cabela | Researcher |
| Ashley May M. Martinez | Researcher |
| **Mia V. Villarica** | **Research Adviser** |

## About the Project

Tourism and cultural heritage information about Liliw, Laguna is spread across separate channels, and CHATO has limited digital tools for collecting, reviewing and publishing it. The Liliw Virtual Guide brings this together in one CHATO-managed platform.

**Key features**

- 360° virtual tours of landmarks and destinations
- AI-assisted virtual guide (chat assistant)
- Analytics dashboard
- Content management system (CMS)
- Cultural heritage and tourism information module
- Interactive tourist map and itinerary builder
- Local Business Owner submission and CHATO review workflow
- Media gallery and cultural storytelling
- Progressive Web App: mobile-responsive, offline access to previously loaded content
- QR code-based tourist arrival recording
- Visitor feedback management

**User roles:** Admin, Editors (CHATO), Local Business Owners, and Tourists/Visitors.

**Built with:** Next.js, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Groq AI, Mapbox, Cloudinary, deployed on Vercel.

## Repository Contents

| Folder | Contents |
|---|---|
| [`liliw-virtual-guide/`](liliw-virtual-guide/) | Complete source code of the web application (see its README for setup) |
| [`liliw-virtual-guide/docs/`](liliw-virtual-guide/docs/) | System documentation: architecture, flowcharts, ERDs, use case diagram, DFD, testing logs |
| [`setup-and-user-guides/`](setup-and-user-guides/) | [User Manual](setup-and-user-guides/Liliw-Virtual-Guide-User-Manual.pdf) and [System / Setup Manual](setup-and-user-guides/Liliw-Virtual-Guide-System-Manual.pdf) (PDF) |
| [`screenshots/`](screenshots/) | Screenshots of the system's key features and modules |
| [`system-documentation/`](system-documentation/) | Index of the system documentation and diagrams |
| [`manuscript/`](manuscript/) | Research manuscript |
| [`links/`](links/) | Project links |
| `index.html` | Source of the GitHub Pages project website |

## Running the System Locally

```bash
git clone https://github.com/TyrCoder/Liliw-Virtual-Guide.git
cd Liliw-Virtual-Guide/liliw-virtual-guide
npm install
npm run dev
```

Requires Node.js 20+ and a `.env.local` file with the service keys. Full instructions are in [`liliw-virtual-guide/README.md`](liliw-virtual-guide/README.md) and the [System Manual](setup-and-user-guides/Liliw-Virtual-Guide-System-Manual.pdf).

---

College of Computer Studies · Laguna State Polytechnic University · Santa Cruz, Laguna
