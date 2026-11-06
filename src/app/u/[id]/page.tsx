"use client";

import { useParams } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { initials, trustScore } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useStore();
  const user = data.users.find((item) => item.id === id);
  if (!user) return <p className="empty">This profile is gone.</p>;
  const listings = data.listings.filter((item) => item.userId === user.id && item.status === "ACTIVE");
  const reviews = data.reviews.filter((item) => item.toUserId === user.id);
  const completed = data.exchanges.filter(
    (item) => (item.ownerId === user.id || item.partnerId === user.id) && item.status === "COMPLETED",
  ).length;
  const avgRating = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : null;
  const trust = trustScore({ verified: user.verified, completed, avgRating, reversePoints: user.reversePoints });

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
          </p>
          <p className="mt-2 text-sm">
            Trust score {trust} · {completed} completed exchanges · {user.reversePoints} Reverse points
          </p>
        </div>
      </div>
      {user.bio && <p className="mt-6 max-w-2xl text-[#B9B3C6]">{user.bio}</p>}
      <h2 className="display mt-12 text-3xl">Active publications</h2>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={{ ...listing, user }} />
        ))}
      </div>
      <h2 className="display mt-12 text-3xl">Reviews</h2>
      <div className="mt-6 space-y-4">
        {reviews.length === 0 && <p className="empty">No reviews yet.</p>}
        {reviews.map((review) => {
          const from = data.users.find((item) => item.id === review.fromUserId);
          return (
            <article key={review.id} className="soft-panel hairline rounded-[1.6rem] p-5">
              <p className="text-sm text-[#A98BCB]">
                {from?.name} · {review.rating}/5
              </p>
              <p className="mt-2">{review.comment}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
