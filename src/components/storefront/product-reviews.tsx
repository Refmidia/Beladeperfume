import Link from "next/link";
import { BadgeCheck, MessageSquareText } from "lucide-react";
import { getProductReviews, REVIEWS_PAGE_SIZE } from "@/lib/reviews/server";
import { copy } from "@/lib/storefront/copy";
import { Stars } from "./ui";
import { ReviewDialog } from "./review-form";

const date = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

/** PDP reviews: summary, 5→1 distribution, approved reviews, "Write a review". Flag-gated by the loader. */
export async function ProductReviews({
  product,
  page,
}: {
  product: { id: string; name: string; slug: string };
  page: number;
}) {
  const data = await getProductReviews(product.id, page);
  if (!data) return null;
  const { summary, reviews, hasMore } = data;
  return (
    <section id="reviews" className="reviews-section" aria-labelledby="reviews-title">
      <div className="reviews-summary panel">
        <h2 id="reviews-title">{copy.reviews.title}</h2>
        {summary.count ? (
          <>
            <div className="reviews-score">
              <strong>{summary.average.toFixed(1)}</strong>
              <div>
                <Stars value={summary.average} size={18} />
                <span className="muted">{copy.reviews.basedOn(summary.count)}</span>
              </div>
            </div>
            <ul className="reviews-bars" aria-label={copy.product.ratingDistribution}>
              {summary.distribution.map((row) => (
                <li key={row.stars}>
                  <span className="reviews-bar-label">{copy.reviews.starLabel(row.stars)}</span>
                  <span className="reviews-bar" aria-hidden>
                    <i style={{ width: `${row.percent}%` }} />
                  </span>
                  <span className="reviews-bar-count">
                    {row.count}
                    <span className="sr-only">
                      {" "}
                      {copy.product.review(row.count)}, {row.percent}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="muted">{copy.reviews.emptyPrompt(product.name)}</p>
        )}
        <ReviewDialog productId={product.id} productName={product.name} />
        <p className="reviews-policy">{copy.reviews.policy}</p>
      </div>
      <div className="reviews-list">
        {reviews.length ? (
          <>
            <ol>
              {reviews.map((r) => (
                <li key={r.id} className="review">
                  <div className="review-head">
                    <Stars value={r.rating} label={copy.reviews.starsOutOf(r.rating)} />
                    {r.verified && (
                      <span className="review-verified">
                        <BadgeCheck size={15} aria-hidden /> {copy.product.verified}
                      </span>
                    )}
                  </div>
                  {r.title && <h3>{r.title}</h3>}
                  <p className="review-body">{r.body}</p>
                  <p className="review-meta">
                    <strong>{r.name}</strong> · <time dateTime={r.createdAt.toISOString()}>{date(r.createdAt)}</time>
                  </p>
                </li>
              ))}
            </ol>
            {hasMore && (
              <Link
                className="button"
                href={`/products/${product.slug}?reviews=${Math.floor(reviews.length / REVIEWS_PAGE_SIZE) + 1}#reviews`}
                scroll={false}
                replace
              >
                {copy.reviews.showMore}
                <span className="muted">{copy.reviews.ofTotal(reviews.length, summary.count)}</span>
              </Link>
            )}
          </>
        ) : (
          <div className="reviews-empty">
            <span className="icon-tile lg">
              <MessageSquareText size={22} aria-hidden />
            </span>
            <p>{copy.reviews.beFirst}</p>
          </div>
        )}
      </div>
    </section>
  );
}
