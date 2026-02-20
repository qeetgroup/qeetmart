import Link from "next/link";

export default function HomePage() {
  return (
    <div className="landing-root">
      <div className="landing-proof-bar">
        <span className="proof-chip">Polyglot Platform</span>
        <span className="proof-chip">10+ Engineers</span>
        <span className="proof-chip">Versioned Contracts</span>
        <span className="proof-chip">Production SaaS Ready</span>
      </div>

      <header className="landing-hero">
        <div>
          <p className="landing-eyebrow">qeetmart Platform Documentation</p>
          <h1>Build, ship, and operate qeetmart without onboarding guesswork.</h1>
          <p className="landing-subtitle">
            One docs portal for first-day setup, architecture reasoning, production operations, and API integration
            across Node.js, Spring Boot, Go, Next.js, and Expo.
          </p>
          <div className="landing-cta-row">
            <Link className="btn btn-primary" href="/docs/v1/getting-started/quickstart">
              Start in 15 Minutes
            </Link>
            <Link className="btn" href="/reference/v1">
              Explore APIs
            </Link>
            <Link className="btn" href="/docs/v1/devops/deployment">
              Deployment Guide
            </Link>
          </div>
        </div>

        <aside className="quickstart-panel">
          <h2>Quickstart path</h2>
          <p>Complete these in order. You are done when all health checks return green.</p>
          <ol>
            <li>Validate toolchain and clone workspace</li>
            <li>Create all service `.env` files</li>
            <li>Boot stack with `pnpm docker:up`</li>
            <li>Run contracts and smoke checks</li>
            <li>Open API Reference + run first call</li>
          </ol>
          <div className="landing-cta-row">
            <Link className="btn btn-primary" href="/docs/v1/getting-started/quickstart">
              Open Guided Onboarding
            </Link>
            <Link className="btn" href="/docs/v1/runbooks/common-incidents">
              Troubleshoot Startup
            </Link>
          </div>
        </aside>
      </header>

      <section>
        <h2 className="landing-section-title">What you can do here</h2>
        <div className="landing-grid">
          <article className="landing-card">
            <h3>Ship safely</h3>
            <p>Use versioned API contracts, change governance, and runbooks before merging risky updates.</p>
          </article>
          <article className="landing-card">
            <h3>Debug quickly</h3>
            <p>Follow incident-first runbooks with concrete commands for gateway, services, and Docker health failures.</p>
          </article>
          <article className="landing-card">
            <h3>Understand boundaries</h3>
            <p>Read topology, dependency graphs, and service ownership without digging through code first.</p>
          </article>
          <article className="landing-card">
            <h3>Integrate confidently</h3>
            <p>Test endpoints interactively with environment-aware base URLs and operation-level discoverability.</p>
          </article>
        </div>
      </section>

      <section>
        <h2 className="landing-section-title">Choose your starting path</h2>
        <div className="landing-grid">
          <Link className="role-card" href="/docs/v1/getting-started/quickstart">
            <h3>Backend Engineer</h3>
            <p>Start with setup, contracts, and service-level validation flow.</p>
          </Link>
          <Link className="role-card" href="/docs/v1/local-development/run-all-services">
            <h3>Frontend Engineer</h3>
            <p>Run full stack locally, then connect web/admin apps safely.</p>
          </Link>
          <Link className="role-card" href="/reference/v1">
            <h3>External Integrator</h3>
            <p>Go directly to API reference with environment-aware request testing.</p>
          </Link>
          <Link className="role-card" href="/docs/v1/devops/deployment">
            <h3>Platform / DevOps</h3>
            <p>Use deployment model, environment matrix, and rollback blueprint.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
