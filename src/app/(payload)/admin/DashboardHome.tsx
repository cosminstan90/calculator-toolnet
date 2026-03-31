import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewServerProps } from "payload";

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

    return true;
  });

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
            deploy-ul actual. Mai jos ai scurtaturile catre zonele pe care le folosim zilnic.
          </p>
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
      </div>
    </DefaultTemplate>
  );
}
