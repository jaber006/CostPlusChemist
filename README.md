# CostPlus Chemist

**Australia's first transparent-pricing online pharmacy.**

Every product shows the exact wholesale cost + 15% margin + postage. No hidden markups. No loyalty games. Just the lowest honest price.

## The Model

```
Your Price = Sigma Wholesale Cost × 1.15 + Postage
```

That's it. We show you exactly what we pay, add 15%, and charge you the real shipping cost. No inflated RRPs, no fake "savings", no member-only pricing tiers.

## Architecture

See [docs/architecture/](docs/architecture/) for the full system architecture overview, including:
- Competitive position map
- Pricing model comparison
- 6-layer system architecture (Data Ingestion → Product DB → Web App → Order Fulfillment → Compliance → AI)
- Tech stack recommendations
- S2/S3/S4 compliance flows
- MVP roadmap

## Tech Stack (Planned)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes + Python (FastAPI) for Sigma sync |
| Database | PostgreSQL (Supabase) |
| Search | Meilisearch |
| Payments | Stripe |
| Shipping | Australia Post API + Sendle |
| Auth | NextAuth.js |
| Hosting | Vercel + Railway |
| AI | OpenAI API (product enrichment, chatbot, search) |

## MVP Phases

1. **Phase 1 (8-12 weeks):** General sale products, Sigma sync, transparent pricing, Stripe checkout, Australia Post shipping
2. **Phase 2 (+4-6 weeks):** S2 medicines with questionnaire flow, user accounts, order history
3. **Phase 3 (+4-6 weeks):** S3 pharmacist-only flow, eScript/S4 prescriptions, "Meet MJ" consult booking
4. **Phase 4 (ongoing):** AI chatbot, auto-reorder subscriptions, mobile app

## Regulatory

- Registered Australian pharmacy (Legana, TAS)
- QCPP accredited
- S2/S3 compliance with Pharmacy Board guidelines
- eScript integration via NPDS
- TGA advertising compliance

## License

Proprietary — all rights reserved.
