import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { dashboard, profileStats } from "@/lib/queries";
import { findUserById, hydrateUser } from "@/lib/db";
import { StatusPill } from "@/components/status-pill";
import { NeedOffer } from "@/components/need-offer";
import { updateProfile } from "@/lib/actions";
import { formatDate } from "@/lib/format";

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const [{ tab }, board] = await Promise.all([searchParams, dashboard(session.id)]);
  const found = findUserById(session.id);
  const user = found ? hydrateUser(found) : null;
  if (!user) redirect("/login");
  const stats = profileStats(user);
  const current = tab || "publications";

  const tabs = [
    { id: "publications", label: "Publications", count: board.listings.length },
    { id: "received", label: "Received", count: board.received.length },
    { id: "sent", label: "Sent", count: board.sent.length },
    { id: "exchanges", label: "Exchanges", count: board.exchanges.length },
    { id: "profile", label: "Profile", count: 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#A98BCB]">My Reverse</p>
      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="display text-5xl">{user.name}</h1>
          <p className="mt-2 text-[#B9B3C6]">
            {user.location} · Trust {stats.trust} · {user.reversePoints} Reverse points
            {user.verified ? " · Verified" : ""}
            {user.isDemo ? " · Demo profile" : ""}
          </p>
        </div>
        <Link href="/publish/borrow" className="btn btn-primary">
          New publication
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/me?tab=${item.id}`}
            className={`rounded-full px-4 py-2 text-sm ${current === item.id ? "bg-[#7953A6]" : "bg-white/5"}`}
          >
            {item.label}
            {item.count ? ` ${item.count}` : ""}
          </Link>
        ))}
      </div>

      {current === "publications" && (
        <div className="mt-8 space-y-6">
          {board.listings.length === 0 && <p className="empty">You haven’t published yet.</p>}
          {board.listings.map((listing) => (
            <Link key={listing.id} href={`/listing/${listing.id}`} className="soft-panel hairline block rounded-[1.8rem] p-5">
              <div className="mb-3 flex items-center justify-between">
                <StatusPill status={listing.status} />
                <span className="text-sm text-[#B9B3C6]">{listing.type}</span>
              </div>
              <NeedOffer compact type={listing.type} needTitle={listing.needTitle} offerTitle={listing.offerTitle} durationDays={listing.durationDays} />
            </Link>
          ))}
        </div>
      )}

      {current === "received" && (
        <ProposalList items={board.received} empty="No incoming proposals yet." />
      )}
      {current === "sent" && <ProposalList items={board.sent} empty="You haven’t sent a proposal yet." />}

      {current === "exchanges" && (
        <div className="mt-8 space-y-4">
          {board.exchanges.length === 0 && <p className="empty">No exchanges yet.</p>}
          {board.exchanges.map((exchange) => (
            <Link key={exchange.id} href={`/exchange/${exchange.id}`} className="soft-panel hairline block rounded-[1.8rem] p-5">
              <div className="flex items-center justify-between">
                <StatusPill status={exchange.status} />
                <span className="text-sm text-[#B9B3C6]">{exchange.type}</span>
              </div>
              <p className="mt-3 display text-2xl">
                {exchange.needTitle || exchange.offerTitle}
              </p>
              <p className="mt-1 text-sm text-[#B9B3C6]">
                {exchange.owner.name} · {exchange.partner.name}
                {exchange.returnDate ? ` · Return ${formatDate(exchange.returnDate)}` : ""}
              </p>
            </Link>
          ))}
        </div>
      )}

      {current === "profile" && (
        <form action={updateProfile} className="mx-auto mt-8 max-w-xl space-y-4">
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={user.name} />
          </div>
          <div>
            <label htmlFor="location">Location</label>
            <input id="location" name="location" defaultValue={user.location} />
          </div>
          <div>
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={user.bio} />
          </div>
          <div>
            <label htmlFor="avatar">Profile picture URL</label>
            <input id="avatar" name="avatar" defaultValue={user.avatar ?? ""} />
          </div>
          <button className="btn btn-primary">Save profile</button>
        </form>
      )}
    </div>
  );
}

function ProposalList({
  items,
  empty,
}: {
  items: {
    id: string;
    status: string;
    message: string;
    fromUser: { name: string };
    listing: { type: string; offerTitle: string; needTitle: string };
  }[];
  empty: string;
}) {
  if (items.length === 0) return <p className="empty">{empty}</p>;
  return (
    <div className="mt-8 space-y-4">
      {items.map((item) => (
        <Link key={item.id} href={`/proposal/${item.id}`} className="soft-panel hairline block rounded-[1.8rem] p-5">
          <div className="flex items-center justify-between">
            <span>{item.fromUser.name}</span>
            <StatusPill status={item.status} />
          </div>
          <p className="mt-2 text-sm text-[#B9B3C6]">
            {item.listing.type} · {item.listing.needTitle || item.listing.offerTitle}
          </p>
          <p className="mt-2">{item.message}</p>
        </Link>
      ))}
    </div>
  );
}
