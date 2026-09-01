import { notFound } from "next/navigation";

import { MarkdownViewer } from "@/src/components/til/MarkdownViewer";
import { TilSidebar } from "@/src/components/til/TilSidebar";
import { getPost } from "@/src/lib/til/post";
import { getMemberTree } from "@/src/lib/til/tree";
import { study } from "@/study.config";

type TilPageProps = {
  params: Promise<{
    github: string;
    slug?: string[];
  }>;
};

function decodeRouteSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export default async function TilPage({ params }: TilPageProps) {
  const { github, slug } = await params;
  const currentGithub = decodeRouteSegment(github);
  const memberTree = await getMemberTree(currentGithub);

  if (!memberTree) {
    notFound();
  }

  const activeSlug = slug?.length
    ? slug.map(decodeRouteSegment).join("/")
    : undefined;
  const post = activeSlug ? await getPost(currentGithub, activeSlug) : null;

  if (activeSlug && !post) {
    notFound();
  }

  return (
    <main className="flex flex-1 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex min-h-full w-full max-w-[90rem] flex-1 flex-col bg-white md:flex-row dark:bg-zinc-900">
        <TilSidebar
          key={currentGithub}
          members={study.members}
          currentGithub={currentGithub}
          tree={memberTree.children}
          activeSlug={activeSlug}
        />

        <section className="min-w-0 flex-1">
          {post ? (
            <article className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-16">
              <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
                  {post.title}
                </h1>
                {post.description ? (
                  <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                    {post.description}
                  </p>
                ) : null}
                <time
                  className="mt-5 block text-sm font-medium text-zinc-500 dark:text-zinc-400"
                  dateTime={post.date}
                >
                  {post.date}
                </time>
              </header>

              <div className="pt-8 text-zinc-800 dark:text-zinc-200">
                <MarkdownViewer
                  content={post.content}
                  github={post.github}
                  postPath={post.path}
                />
              </div>
            </article>
          ) : (
            <div className="flex min-h-[24rem] items-center justify-center px-6 py-16 text-center md:min-h-screen">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {memberTree.name}
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  TIL
                </h1>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
