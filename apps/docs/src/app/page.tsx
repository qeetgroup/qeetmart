import Link from "next/link";

export default function HomePage() {
  return (
    <div className="landing-root">
      <header className="landing-hero">
        <p className="eyebrow">qeetmart Platform Docs</p>
        <h1>Ship faster across Node, Spring Boot, Go, Next.js, and Expo.</h1>
        <p>
          This portal is the single source of truth for onboarding, architecture, APIs, local operations,
          and production deployment.
        </p>
        <div className="landing-cta-row">
          <Link className="btn btn-primary" href="/docs/v1/getting-started/quickstart">
            Start in 15 Minutes
          </Link>
          <Link className="btn" href="/docs/v1/architecture/system-overview">
            Explore Architecture
          </Link>
          <Link className="btn" href="/reference/v1">
            API Reference
          </Link>
        </div>
      </header>

      <section className="landing-grid">
        <article>
          <h2>Getting Started</h2>
          <p>Single-track onboarding flow with setup doctor, Docker stack, and smoke tests.</p>
        </article>
        <article>
          <h2>System Architecture</h2>
          <p>Service boundaries, dependency graph, data flow, and environment topology.</p>
        </article>
        <article>
          <h2>API Reference</h2>
          <p>Interactive OpenAPI references for auth, user, product, and inventory services.</p>
        </article>
        <article>
          <h2>DevOps</h2>
          <p>CI checks, deployment playbooks, rollback strategy, and Kubernetes rollout model.</p>
        </article>
      </section>

      <section className="role-cards">
        <h2>Choose your starting point</h2>
        <div className="landing-grid">
          <Link href="/docs/v1/getting-started/quickstart">Backend Engineer</Link>
          <Link href="/docs/v1/local-development/run-all-services">Frontend Engineer</Link>
          <Link href="/docs/v1/local-development/docker-workflow">Mobile Engineer</Link>
          <Link href="/docs/v1/devops/deployment">Platform / DevOps</Link>
        </div>
      </section>
    </div>
  );
}
