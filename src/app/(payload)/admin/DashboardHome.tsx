import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewServerProps } from "payload";
import { loadDashboardData } from "./dashboard-data.ts";

type DashboardLink = {
  description: string;
  href: string;
  title: string;
};

const buildAdminHref = (adminRoute: string, path = "") => {
  const normalizedAdminRoute =
    adminRoute === "/" ? "" : adminRoute.replace(/\/$/, "");

  if (!path) {
    return normalizedAdminRoute || "/";
  }

  return `${normalizedAdminRoute}${path.startsWith("/") ? path : `/${path}`}`;
};

export function DashboardHome(props: AdminViewServerProps) {
  const {
    initPageResult: {
      permissions,
      req: {
        i18n,
        payload: {
          config: {
            routes: { admin: adminRoute },
          },
        },
        payload,
        user,
      },
      req,
      locale,
      visibleEntities,
    },
  } = props;

  const templateProps = {
    i18n,
    locale,
    payload,
    permissions,
    req,
    user: user ?? undefined,
    viewType: "dashboard" as const,
    visibleEntities,
  };

  const quickLinks: DashboardLink[] = [
    {
      title: "Calculatoare",
      description: "Administreaza calculatoarele publicate si draft-urile din hub.",
      href: buildAdminHref(adminRoute, "/collections/calculators"),
    },
    {
      title: "Articole",
      description: "Revizuieste ghidurile, explicatiile si legaturile editoriale.",
      href: buildAdminHref(adminRoute, "/collections/articles"),
    },
    {
      title: "Categorii",
      description: "Ajusteaza paginile hub si ordinea verticalelor importante.",
      href: buildAdminHref(adminRoute, "/collections/calculator-categories"),
    },
    {
      title: "Homepage",
      description: "Editeaza mesajul principal si blocurile de pe pagina de start.",
      href: buildAdminHref(adminRoute, "/globals/homepage"),
    },
    {
      title: "404 Monitor",
      description: "Vezi URL-urile lipsa care merita redirect sau continut nou.",
      href: buildAdminHref(adminRoute, "/collections/not-found-events"),
    },
    {
      title: "Affiliate Clicks",
      description: "Monitorizeaza click-urile comerciale si ofertele care performeaza.",
      href: buildAdminHref(adminRoute, "/collections/affiliate-click-events"),
    },
  ].filter((link) => {
    if (link.href.includes("/collections/calculators")) {
      return visibleEntities.collections.includes("calculators");
    }

    if (link.href.includes("/collections/articles")) {
      return visibleEntities.collections.includes("articles");
    }

    if (link.href.includes("/collections/calculator-categories")) {
      return visibleEntities.collections.includes("calculator-categories");
    }

    if (link.href.includes("/globals/homepage")) {
      return visibleEntities.globals.includes("homepage");
    }

    if (link.href.includes("/collections/not-found-events")) {
      return visibleEntities.collections.includes("not-found-events");
    }

    if (link.href.includes("/collections/affiliate-click-events")) {
      return visibleEntities.collections.includes("affiliate-click-events");
    }

    return true;
  });

  return DashboardHomeInner(props, templateProps, quickLinks, adminRoute);
}

const formatDate = (value?: string) => {
  if (!value) {
    return "fara data";
  }

  return new Date(value).toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDocType = (value: "article" | "calculator") =>
  value === "article" ? "Articol" : "Calculator";

const formatWorkflowLabel = (value: string) => {
  const labels: Record<string, string> = {
    consumer: "Pentru persoane",
    business: "Pentru firme",
    both: "Pentru ambele",
    draft: "Draft",
    formula_validated: "Formula validated",
    content_in_progress: "Content in progress",
    ready_for_review: "Ready for review",
    approved: "Approved",
    scheduled: "Scheduled",
    published: "Published",
    morning: "08:00",
    evening: "17:00",
    "fara-batch": "Fara batch",
  };

  return labels[value] ?? value;
};

async function DashboardHomeInner(
  props: AdminViewServerProps,
  templateProps: {
    i18n: AdminViewServerProps["initPageResult"]["req"]["i18n"];
    locale: AdminViewServerProps["initPageResult"]["locale"];
    payload: AdminViewServerProps["initPageResult"]["req"]["payload"];
    permissions: AdminViewServerProps["initPageResult"]["permissions"];
    req: AdminViewServerProps["initPageResult"]["req"];
    user: NonNullable<AdminViewServerProps["initPageResult"]["req"]["user"]> | undefined;
    viewType: "dashboard";
    visibleEntities: AdminViewServerProps["initPageResult"]["visibleEntities"];
  },
  quickLinks: DashboardLink[],
  adminRoute: string,
) {
  const data = await loadDashboardData(
    props.initPageResult.req.payload,
    adminRoute,
  );
  const user = templateProps.user;

  return (
    <DefaultTemplate
      {...templateProps}
    >
      <div
        style={{
          display: "grid",
          gap: "1.5rem",
          margin: "0 auto",
          maxWidth: "1100px",
          padding: "2rem 0 3rem",
        }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
            borderRadius: "24px",
            color: "#f8fafc",
            padding: "2rem",
          }}
        >
          <p
            style={{
              color: "#86efac",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Toolnet CMS
          </p>
          <h1
            style={{
              fontSize: "2rem",
              lineHeight: 1.1,
              margin: "0.75rem 0 0",
            }}
          >
            Bine ai revenit{user?.email ? `, ${user.email}` : ""}.
          </h1>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "1rem",
              lineHeight: 1.7,
              margin: "1rem 0 0",
              maxWidth: "60ch",
            }}
          >
            Dashboard-ul implicit Payload a fost inlocuit cu o versiune mai sigura pentru
            deploy-ul actual. Acum ai si reperele operationale care ne ajuta sa vedem ce publicam,
            ce lipseste si ce monetizare incepe sa miste.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          {data.metrics.map((metric) => (
            <article
              key={metric.label}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "1.1rem 1.25rem",
              }}
            >
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {metric.label}
              </p>
              <p
                style={{
                  color: "#0f172a",
                  fontSize: "2rem",
                  fontWeight: 800,
                  margin: "0.6rem 0 0",
                }}
              >
                {metric.value}
              </p>
              <p
                style={{
                  color: "#475569",
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                  margin: "0.45rem 0 0",
                }}
              >
                {metric.detail}
              </p>
            </article>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                color: "#0f172a",
                display: "block",
                padding: "1.25rem",
                textDecoration: "none",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                {link.title}
              </strong>
              <span
                style={{
                  color: "#475569",
                  display: "block",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}
              >
                {link.description}
              </span>
            </a>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
        >
          {[
            {
              title: "Pe batch-uri",
              color: "#0f766e",
              items: data.workflowSlices.batches,
            },
            {
              title: "Pe audienta",
              color: "#1d4ed8",
              items: data.workflowSlices.audiences,
            },
            {
              title: "Pe status editorial",
              color: "#7c3aed",
              items: data.workflowSlices.statuses,
            },
            {
              title: "Pe slot scheduler",
              color: "#b45309",
              items: data.workflowSlices.slots,
            },
          ].map((group) => (
            <article
              key={group.title}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "1.15rem 1.2rem",
              }}
            >
              <p
                style={{
                  color: group.color,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {group.title}
              </p>
              <div style={{ display: "grid", gap: "0.55rem", marginTop: "0.9rem" }}>
                {group.items.length > 0 ? (
                  group.items.map((item) => (
                    <div
                      key={`${group.title}-${item.label}`}
                      style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#334155", fontSize: "0.9rem" }}>
                        {formatWorkflowLabel(item.label)}
                      </span>
                      <strong style={{ color: "#0f172a" }}>{item.count}</strong>
                    </div>
                  ))
                ) : (
                  <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    Nu exista inca suficiente date pentru gruparea aceasta.
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#0f766e",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Roadmap executie
            </p>
            <p
              style={{
                color: "#334155",
                fontSize: "0.92rem",
                lineHeight: 1.55,
                margin: "0.8rem 0 0",
              }}
            >
              Focus curent: <strong>{data.executionRoadmap.currentFocus}</strong>
            </p>
            <div style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
              {data.executionRoadmap.sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "0.9rem 0.95rem",
                  }}
                >
                  <strong style={{ color: "#0f172a", display: "block", fontSize: "0.94rem" }}>
                    {sprint.id} | {sprint.title}
                  </strong>
                  <span
                    style={{
                      color: "#475569",
                      display: "block",
                      fontSize: "0.84rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    status: {sprint.status}
                  </span>
                  <p
                    style={{
                      color: "#334155",
                      fontSize: "0.86rem",
                      lineHeight: 1.55,
                      margin: "0.55rem 0 0",
                    }}
                  >
                    {sprint.goal}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.65rem" }}>
                    {sprint.summary.map((item) => (
                      <span
                        key={`${sprint.id}-${item.label}`}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "999px",
                          color: "#1e293b",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          padding: "0.25rem 0.55rem",
                        }}
                      >
                        {item.label}: {item.value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#0f766e",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Sprint B pe clustere
            </p>
            <div style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
              {data.sprintB.clusters.map((cluster) => (
                <div
                  key={cluster.slug}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "0.9rem 0.95rem",
                  }}
                >
                  <strong style={{ color: "#0f172a", display: "block", fontSize: "0.95rem" }}>
                    {cluster.label}
                  </strong>
                  <span
                    style={{
                      color: "#475569",
                      display: "block",
                      fontSize: "0.84rem",
                      marginTop: "0.3rem",
                    }}
                  >
                    ready: {cluster.readyCount} | publicate: {cluster.publishedCount} | lipsuri nucleu: {cluster.missingCorePages}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
                    {cluster.nextPages.map((page) => (
                      <span
                        key={`${cluster.slug}-${page.slug}`}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "999px",
                          color: "#1e293b",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          padding: "0.25rem 0.55rem",
                        }}
                      >
                        {page.slug} | {page.status}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#7c3aed",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Roadmap urmatoarele pagini
            </p>
            <div style={{ display: "grid", gap: "0.7rem", marginTop: "1rem" }}>
              {data.sprintB.roadmap.map((page) => (
                <div
                  key={`${page.cluster}-${page.slug}`}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "0.75rem",
                  }}
                >
                  <strong style={{ color: "#0f172a", display: "block", fontSize: "0.92rem" }}>
                    {page.title}
                  </strong>
                  <span
                    style={{
                      color: "#475569",
                      display: "block",
                      fontSize: "0.84rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {page.cluster} | {page.kind} | {page.priorityTier} | {page.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#b45309",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Content gaps reale
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {data.sprintB.contentGaps.length > 0 ? (
                data.sprintB.contentGaps.map((gap) => (
                  <div
                    key={gap.path}
                    style={{
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: "14px",
                      padding: "0.85rem 0.95rem",
                    }}
                  >
                    <strong
                      style={{
                        color: "#9a3412",
                        display: "block",
                        fontSize: "0.9rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {gap.path}
                    </strong>
                    <span
                      style={{
                        color: "#7c2d12",
                        display: "block",
                        fontSize: "0.84rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {gap.hits} hit-uri | vazut ultima data {formatDate(gap.lastSeenAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                  Nu avem in top 404 un content gap real care sa ceara actiune imediata.
                </p>
              )}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#1d4ed8",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Urmatoarele mutari
            </p>
            <div style={{ display: "grid", gap: "0.65rem", marginTop: "1rem" }}>
              {data.executionRoadmap.nextMoves.length > 0 ? (
                data.executionRoadmap.nextMoves.map((item) => (
                  <div
                    key={item}
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "14px",
                      color: "#1d4ed8",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      padding: "0.8rem 0.9rem",
                    }}
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                  Nu exista inca suficiente date pentru urmatoarele mutari.
                </p>
              )}
            </div>
          </article>
        </section>

        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#0f766e",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Coada scheduler
            </p>
            <div style={{ display: "grid", gap: "0.9rem", marginTop: "1rem" }}>
              {[
                {
                  label: "08:00 articol",
                  item: data.morningArticle,
                },
                {
                  label: "08:00 calculator",
                  item: data.morningCalculator,
                },
                {
                  label: "17:00 calculator",
                  item: data.eveningCalculator,
                },
              ].map(({ label, item }) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "0.9rem 1rem",
                  }}
                >
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </p>
                  {item ? (
                    <>
                      <a
                        href={item.href}
                        style={{
                          color: "#0f172a",
                          display: "inline-block",
                          fontSize: "1rem",
                          fontWeight: 700,
                          marginTop: "0.45rem",
                          textDecoration: "none",
                        }}
                      >
                        {item.title}
                      </a>
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "0.92rem",
                          lineHeight: 1.5,
                          margin: "0.35rem 0 0",
                        }}
                      >
                        Prioritate {item.priority}
                        {item.batch ? ` | ${item.batch}` : ""}
                        {item.earliestAt ? ` | nu inainte de ${formatDate(item.earliestAt)}` : ""}
                      </p>
                    </>
                  ) : (
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.92rem",
                        lineHeight: 1.5,
                        margin: "0.45rem 0 0",
                      }}
                    >
                      Niciun document eligibil in acest moment.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#b45309",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              404 monitor
            </p>
            <div style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
              {data.topNotFound.length > 0 ? (
                data.topNotFound.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "0.85rem",
                    }}
                  >
                    <p
                      style={{
                        color: "#0f172a",
                        fontSize: "0.98rem",
                        fontWeight: 700,
                        margin: 0,
                        wordBreak: "break-all",
                      }}
                    >
                      {item.path}
                    </p>
                    <p
                      style={{
                        color: "#475569",
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        margin: "0.35rem 0 0",
                      }}
                    >
                      {item.hits} hituri | ultima data {formatDate(item.lastSeenAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    margin: "0.45rem 0 0",
                  }}
                >
                  Nu exista inca intrari in 404 monitor.
                </p>
              )}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#7c3aed",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Monetizare si publicari
            </p>
            <div style={{ marginTop: "1rem" }}>
              <p
                style={{
                  color: "#0f172a",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Affiliate clicks
              </p>
              <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.75rem" }}>
                {data.affiliateSummary.length > 0 ? (
                  data.affiliateSummary.map((item) => (
                    <div
                      key={item.offerKey}
                      style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#334155", fontSize: "0.92rem" }}>
                        {item.offerKey}
                      </span>
                      <strong style={{ color: "#0f172a" }}>{item.clicks}</strong>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.92rem",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    Inca nu avem click-uri affiliate logate.
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: "1.25rem" }}>
              <p
                style={{
                  color: "#0f172a",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Publicate recent
              </p>
              <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
                {data.recentPublished.length > 0 ? (
                  data.recentPublished.map((item) => (
                    <a
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        color: "#0f172a",
                        display: "block",
                        padding: "0.85rem 0.95rem",
                        textDecoration: "none",
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.94rem" }}>
                        {item.title}
                      </strong>
                      <span
                        style={{
                          color: "#475569",
                          display: "block",
                          fontSize: "0.85rem",
                          marginTop: "0.3rem",
                        }}
                      >
                        {item.type === "article" ? "Articol" : "Calculator"} •{" "}
                        {formatDate(item.publishedAt)}
                      </span>
                    </a>
                  ))
                ) : (
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.92rem",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    Nu exista publicari recente in ultimele 7 zile.
                  </p>
                )}
              </div>
            </div>
          </article>
        </section>

        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#0f766e",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Checklist azi
            </p>
            <div style={{ display: "grid", gap: "0.8rem", marginTop: "1rem" }}>
              {data.todayChecklist.map((entry) => (
                <div
                  key={entry.label}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "0.9rem 1rem",
                  }}
                >
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {entry.label}
                  </p>
                  {entry.item ? (
                    <>
                      <a
                        href={entry.item.href}
                        style={{
                          color: "#0f172a",
                          display: "inline-block",
                          fontSize: "0.98rem",
                          fontWeight: 700,
                          marginTop: "0.35rem",
                          textDecoration: "none",
                        }}
                      >
                        {entry.item.title}
                      </a>
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "0.88rem",
                          lineHeight: 1.5,
                          margin: "0.3rem 0 0",
                        }}
                      >
                        {entry.description}
                      </p>
                    </>
                  ) : (
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        margin: "0.35rem 0 0",
                      }}
                    >
                      {entry.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#0369a1",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Aproape gata
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {data.closeToReady.length > 0 ? (
                data.closeToReady.map((item) => (
                  <a
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      color: "#0f172a",
                      display: "block",
                      padding: "0.85rem 0.95rem",
                      textDecoration: "none",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: "0.94rem" }}>
                      {item.title}
                    </strong>
                    <span
                      style={{
                        color: "#475569",
                        display: "block",
                        fontSize: "0.84rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {formatDocType(item.type)} | {item.completion}% | lipseste:{" "}
                      {item.blockers.join(", ")}
                    </span>
                  </a>
                ))
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                  Nu exista documente aproape gata in acest moment.
                </p>
              )}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#b45309",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Review editorial
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {data.needsEditorialReview.length > 0 ? (
                data.needsEditorialReview.map((item) => (
                  <a
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      color: "#0f172a",
                      display: "block",
                      paddingBottom: "0.75rem",
                      textDecoration: "none",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: "0.94rem" }}>
                      {item.title}
                    </strong>
                    <span
                      style={{
                        color: "#475569",
                        display: "block",
                        fontSize: "0.84rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {item.completion}% | {item.blockers.join(", ")}
                    </span>
                  </a>
                ))
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                  Nu exista articole care asteapta review editorial imediat.
                </p>
              )}
            </div>
          </article>
        </section>

        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#0369a1",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Publish-ready acum
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {data.readyToPublish.length > 0 ? (
                data.readyToPublish.map((item) => (
                  <a
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      color: "#0f172a",
                      display: "block",
                      padding: "0.85rem 0.95rem",
                      textDecoration: "none",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: "0.94rem" }}>
                      {item.title}
                    </strong>
                    <span
                      style={{
                        color: "#475569",
                        display: "block",
                        fontSize: "0.85rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {formatDocType(item.type)} | {item.completion}% | prioritate {item.priority}
                      {item.batch ? ` | ${item.batch}` : ""}
                    </span>
                  </a>
                ))
              ) : (
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Inca nu avem documente draft care sa fie complet publish-ready.
                </p>
              )}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#be123c",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Blocaje editoriale
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {data.blockerSummary.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  {data.blockerSummary.map((item) => (
                    <span
                      key={item.label}
                      style={{
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        borderRadius: "999px",
                        color: "#9f1239",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        padding: "0.35rem 0.7rem",
                      }}
                    >
                      {item.label}: {item.count}
                    </span>
                  ))}
                </div>
              ) : null}

              {data.blockedDrafts.length > 0 ? (
                data.blockedDrafts.map((item) => (
                  <a
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      color: "#0f172a",
                      display: "block",
                      paddingBottom: "0.75rem",
                      textDecoration: "none",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: "0.94rem" }}>
                      {item.title}
                    </strong>
                    <span
                      style={{
                        color: "#475569",
                        display: "block",
                        fontSize: "0.85rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {formatDocType(item.type)} | {item.completion}% | {item.editorialStatus ?? "fara status"}
                    </span>
                    <span
                      style={{
                        color: "#9f1239",
                        display: "block",
                        fontSize: "0.84rem",
                        lineHeight: 1.5,
                        marginTop: "0.35rem",
                      }}
                    >
                      Lipseste: {item.blockers.slice(0, 3).join(", ")}
                    </span>
                  </a>
                ))
              ) : (
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Nu avem blocaje editoriale semnificative in drafturile cu progres bun.
                </p>
              )}
            </div>
          </article>

          <article
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                color: "#1d4ed8",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Pagini cu intentie comerciala
            </p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {data.topAffiliateSources.length > 0 ? (
                <>
                  {data.topAffiliateSources.map((item) => (
                    <div
                      key={item.sourcePath}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "0.85rem 0.95rem",
                      }}
                    >
                      <strong
                        style={{
                          color: "#0f172a",
                          display: "block",
                          fontSize: "0.93rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {item.sourcePath}
                      </strong>
                      <span
                        style={{
                          color: "#475569",
                          display: "block",
                          fontSize: "0.84rem",
                          marginTop: "0.3rem",
                        }}
                      >
                        {item.clicks} click-uri | {item.sourceType ?? "necunoscut"}
                      </span>
                      {item.offerKeys.length > 0 ? (
                        <span
                          style={{
                            color: "#1d4ed8",
                            display: "block",
                            fontSize: "0.84rem",
                            marginTop: "0.35rem",
                          }}
                        >
                          Oferte: {item.offerKeys.join(", ")}
                        </span>
                      ) : null}
                    </div>
                  ))}

                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "14px",
                      padding: "0.9rem 0.95rem",
                    }}
                  >
                    <p
                      style={{
                        color: "#1d4ed8",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        margin: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      Top categorii comerciale
                    </p>
                    <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.7rem" }}>
                      {data.topAffiliateCategories.length > 0 ? (
                        data.topAffiliateCategories.map((item) => (
                          <div
                            key={item.categorySlug}
                            style={{
                              alignItems: "center",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#1e3a8a", fontSize: "0.88rem" }}>
                              {item.categorySlug}
                              {item.audiences.length > 0
                                ? ` | ${item.audiences.join(", ")}`
                                : ""}
                            </span>
                            <strong style={{ color: "#0f172a" }}>{item.clicks}</strong>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: "#475569", fontSize: "0.86rem" }}>
                          Inca nu exista suficiente date pe categorii.
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Inca nu avem suficiente click-uri pentru a vedea paginile cele mai valoroase.
                </p>
              )}
            </div>
          </article>
        </section>
      </div>
    </DefaultTemplate>
  );
}

