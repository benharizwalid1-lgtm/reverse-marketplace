import { notFound } from "next/navigation";
import { getProfile, profileStats } from "@/lib/queries";
import { ListingCard } from "@/components/listing-card";
import { initials } from "@/lib/format";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getProfile((await params).id);
  if (!user) notFound();
  const stats = profileStats(user);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex items-center gap-5">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[#7953A6] text-2xl">{initials(user.name)}</div>
        )}
        <div>
          <h1 className="display text-4xl">{user.name}</h1>
          <p className="text-[#B9B3C6]">
            {user.location}
            {user.verified ? " · Verified" : ""}
            {user.isDemo ? " · Demo data" : ""}
          </p>
          <p className="mt-2 text-sm">
            Trust score {stats.trust} · {stats.completed} completed exchanges · {user.reversePoints} Reverse points
            {stats.avgRating ? ` · ${stats.avgRating.toFixed(1)} rating` : ""}
          </p>
        </div>
      </div>
      {user.bio && <p className="mt-6 max-w-2xl text-[#B9B3C6]">{user.bio}</p>}

      <h2 className="display mt-12 text-3xl">Active publications</h2>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {user.listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <h2 className="display mt-12 text-3xl">Reviews</h2>
      <div className="mt-6 space-y-4">
        {user.reviewsReceived.length === 0 && <p className="empty">No reviews yet.</p>}
        {user.reviewsReceived.map((review) => (
          <article key={review.id} className="soft-panel hairline rounded-[1.6rem] p-5">
            <p className="text-sm text-[#A98BCB]">
              {review.fromUser.name} · {review.rating}/5
            </p>
            <p className="mt-2">{review.comment}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
