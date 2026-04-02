import { ArticleCard } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import {
  buildAuthorPath,
  getPublicAuthorBySlug,
  listArticlesByAuthor,
} from "@/lib/content";
import {
  buildBreadcrumbJsonLd,
  buildMetadata,
  buildPersonJsonLd,
  buildProfilePageJsonLd,
} from "@/lib/seo";
import { organizationConfig } from "@/lib/site";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const author = await getPublicAuthorBySlug(slug);

  if (!author) {
    return buildMetadata({
      title: "Autor inexistent",
      description: "Profilul de autor cautat nu a fost gasit.",
      path: `/autori/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${author.name} - profil autor`,
    description:
      author.bio ??
      `${author.name} contribuie editorial la ${organizationConfig.projectName} prin continut explicativ si verificat.`,
    path: buildAuthorPath(author),
  });
}

export default async function AuthorProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const author = await getPublicAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const articles = await listArticlesByAuthor({ authorID: author.id, limit: 24 });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildProfilePageJsonLd({
            name: `Profil autor ${author.name}`,
            description:
              author.bio ??
              `${author.name} contribuie editorial la ${organizationConfig.projectName}.`,
            path: buildAuthorPath(author),
          }),
          buildPersonJsonLd({
            name: author.name,
            path: buildAuthorPath(author),
            description: author.bio,
            jobTitle: author.jobTitle,
            imageURL: author.avatarURL,
            expertise: author.expertise,
          }),
          buildBreadcrumbJsonLd([
            { name: "Acasa", path: "/" },
            { name: "Autori", path: "/echipa-editoriala" },
            { name: author.name, path: buildAuthorPath(author) },
          ]),
        ]}
      />

      <section className="paper-panel rounded-[2.4rem] p-6 sm:p-8">
        <p className="section-kicker">Profil autor</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
          {author.name}
        </h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
          {author.jobTitle ? <span>{author.jobTitle}</span> : null}
          <span>{organizationConfig.projectName}</span>
        </div>
        <p className="mt-5 max-w-4xl text-base leading-8 text-slate-700">
          {author.bio ??
            `${author.name} contribuie la biblioteca editoriala a platformei prin continut orientat spre claritate, context si utilizare corecta a calculatoarelor.`}
        </p>
        {author.expertise.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {author.expertise.map((item) => (
              <span
                key={item}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <p className="section-kicker">Articole publicate</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">
            Ghiduri semnate sau revizuite de {author.name}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
