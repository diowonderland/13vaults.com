import { defaultLocale, supportedLocales } from "@/lib/locales";
import { buildNav, Navigation } from "@/lib/navigation";
import Head from "next/head";
import {
  allAncestries,
  allRulesDocuments,
  allClassItems,
  allBlogPosts,
  BlogPost,
} from "@/.contentlayer/generated";
import { map, get, filter, pick, size } from "lodash";
import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { getI18nProperties } from "@/lib/get-static";
import { useTranslation } from "next-i18next";
import BasicLayout from "@/layouts/basic";
import Container from "@/components/container";
import CompendiumTitle from "@/components/compendium-title";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { PickPartial } from "@/utils";

type BlogPostItem = PickPartial<
  BlogPost,
  "excerpt" | "date" | "title" | "slug"
>;

interface BlogIndexPageP {
  blogPosts: BlogPostItem[];
  navigation: Navigation;
}

export default function BlogIndexPage({
  blogPosts,
  navigation,
}: BlogIndexPageP) {
  const router = useRouter();
  const { locale = defaultLocale } = router.query;
  const localeString = String(locale);
  const { t } = useTranslation("blog");

  return (
    <>
      <Head>
        <title>{t("html-title")}</title>
      </Head>

      <BasicLayout navigation={navigation}>
        <div className="p-4 lg:p-8 flex-1">
          <Container className="flex flex-col gap-8">
            <CompendiumTitle className="mt-2 mb-6">
              {t("title")}
            </CompendiumTitle>
            <div>
              {size(blogPosts) > 0 ? (
                <ol role="list">
                  {map(blogPosts, (post) => (
                    <li role="listitem" key={post.slug}>
                      <div className="flex flex-col gap-4 shadow p-4 rounded text-stone-900 dark:text-stone-50 bg-stone-50 dark:bg-stone-800">
                        <div className="flex flex-col">
                          <h2 className="font-display font-bold text-2xl">
                            <Link href={`/${localeString}/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h2>
                          <time className="text-xs">
                            {t("published-on-label", {
                              date: dayjs(post.date).format("YYYY-MM-DD"),
                            })}
                          </time>
                        </div>
                        <div className="text-sm">
                          <p>{post.excerpt}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div>{t("no-posts")}</div>
              )}
            </div>
          </Container>
        </div>
      </BasicLayout>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: map(supportedLocales, (locale) => `/${locale}/blog`),
    fallback: false,
  };
}

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<BlogIndexPageP>> {
  return {
    props: {
      blogPosts: map(
        process.env.NODE_ENV === "production"
          ? filter(allBlogPosts, ["published", true])
          : allBlogPosts,
        (post) => pick(post, ["title", "date", "excerpt", "slug"])
      ),
      navigation: buildNav({
        locale: String(get(context, "params.locale")),
        rulesDocuments: allRulesDocuments,
        classItems: allClassItems,
        ancestries: allAncestries,
      }),
      ...(await getI18nProperties(context, ["common", "blog"])),
    },
  };
}
