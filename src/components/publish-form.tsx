"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CONDITIONS, SKILL_LEVELS, TUNISIAN_CITIES, MODE_META, type Mode } from "@/lib/modes";
import { formatDt } from "@/lib/format";
import { estimateObjectValue, borrowDeposit } from "@/lib/valuation";
import { useStore } from "@/lib/store";

export function PublishForm({ mode }: { mode: Mode }) {
  const meta = MODE_META[mode];
  const { publish, session } = useStore();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<{ estimatedValue: number; deposit: number } | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    const form = new FormData(event.currentTarget);
    const needTitle = String(form.get("needTitle") || "").trim();
    const offerTitle = String(form.get("offerTitle") || "").trim();
    const location = String(form.get("location") || "").trim();
    if (!offerTitle || !location) {
      setError("Offer and location are required.");
      return;
    }
    if (mode !== "GET" && !needTitle) {
      setError("Tell us what you need.");
      return;
    }
    const category = String(form.get("category") || "");
    const brand = String(form.get("brand") || "");
    const model = String(form.get("model") || "");
    const ageYears = form.get("ageYears") ? Number(form.get("ageYears")) : null;
    const condition = String(form.get("condition") || "");
    const originalPrice = form.get("originalPrice") ? Number(form.get("originalPrice")) : null;
    const userSuggestedValue = form.get("userSuggestedValue") ? Number(form.get("userSuggestedValue")) : null;
    const computed =
      mode === "BORROW" || mode === "SWAP"
        ? estimateObjectValue({ category, brand, model, ageYears, condition, originalPrice, userSuggestedValue })
        : null;
    const id = publish({
      type: mode,
      userId: session.id,
      needTitle,
      offerTitle,
      needDescription: String(form.get("needDescription") || ""),
      offerDescription: String(form.get("offerDescription") || ""),
      photos: JSON.stringify(photos),
      condition,
      category,
      brand,
      model,
      ageYears,
      originalPrice,
      userSuggestedValue,
      estimatedValue: computed?.estimatedValue ?? null,
      durationDays: form.get("durationDays") ? Number(form.get("durationDays")) : null,
      location,
      lastChance: form.get("lastChance") === "on",
      experienceLevel: String(form.get("experienceLevel") || ""),
      availability: String(form.get("availability") || ""),
      meetingMode: String(form.get("meetingMode") || ""),
    });
    router.push(`/listing/${id}`);
  }

  function upload(files: FileList | null) {
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setPhotos((current) => [...current, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function refreshEstimate(form: HTMLFormElement) {
    if (mode !== "BORROW" && mode !== "SWAP") return;
    const data = new FormData(form);
    const computed = estimateObjectValue({
      category: String(data.get("category") || ""),
      brand: String(data.get("brand") || ""),
      model: String(data.get("model") || ""),
      ageYears: data.get("ageYears") ? Number(data.get("ageYears")) : null,
      condition: String(data.get("condition") || ""),
      originalPrice: data.get("originalPrice") ? Number(data.get("originalPrice")) : null,
      userSuggestedValue: data.get("userSuggestedValue") ? Number(data.get("userSuggestedValue")) : null,
    });
    setEstimate({ estimatedValue: computed.estimatedValue, deposit: borrowDeposit(computed.estimatedValue) });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8"
      onChange={(event) => refreshEstimate(event.currentTarget)}
    >
      <div>
        <p className="text-[12px] uppercase tracking-[0.22em]" style={{ color: meta.accent }}>
          Publish · {meta.label}
        </p>
        <h1 className="display mt-2 text-4xl">{meta.tagline}</h1>
      </div>
      {mode !== "GET" && (
        <fieldset className="space-y-4">
          <legend className="display text-2xl">What I need</legend>
          <div>
            <label htmlFor="needTitle">{mode === "SKILL" ? "Skill I want to learn" : "Object or need"}</label>
            <input id="needTitle" name="needTitle" required placeholder={mode === "BORROW" ? "A camera for 5 days" : "A smartphone"} />
          </div>
          <div>
            <label htmlFor="needDescription">Details</label>
            <textarea id="needDescription" name="needDescription" rows={3} />
          </div>
        </fieldset>
      )}
      <fieldset className="space-y-4">
        <legend className="display text-2xl">
          {mode === "GET" ? "What I want to give" : mode === "SKILL" ? "What I can offer" : "What I have"}
        </legend>
        <div>
          <label htmlFor="offerTitle">{mode === "GET" ? "Object name" : "Offer"}</label>
          <input id="offerTitle" name="offerTitle" required placeholder={mode === "GET" ? "Office chair" : "A tablet"} />
        </div>
        <div>
          <label htmlFor="offerDescription">Description</label>
          <textarea id="offerDescription" name="offerDescription" rows={4} />
        </div>
        <div>
          <label htmlFor="photos">Photos of what you offer</label>
          <input id="photos" type="file" accept="image/*" multiple onChange={(event) => upload(event.target.files)} />
          {photos.length > 0 && (
            <div className="mt-3 flex gap-3">
              {photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={photo.slice(0, 40)} src={photo} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              ))}
            </div>
          )}
        </div>
      </fieldset>
      {mode !== "SKILL" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="condition">Condition</label>
            <select id="condition" name="condition" defaultValue="Good">
              {CONDITIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="Other">
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {(mode === "BORROW" || mode === "SWAP") && (
        <fieldset className="space-y-4">
          <legend className="display text-2xl">Object details</legend>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="brand">Brand</label>
              <input id="brand" name="brand" />
            </div>
            <div>
              <label htmlFor="model">Model</label>
              <input id="model" name="model" />
            </div>
            <div>
              <label htmlFor="ageYears">Age (years)</label>
              <input id="ageYears" name="ageYears" type="number" min="0" />
            </div>
            <div>
              <label htmlFor="originalPrice">Original price (DT)</label>
              <input id="originalPrice" name="originalPrice" type="number" min="0" />
            </div>
            <div>
              <label htmlFor="userSuggestedValue">Your suggested value (DT)</label>
              <input id="userSuggestedValue" name="userSuggestedValue" type="number" min="0" />
            </div>
          </div>
          {estimate && (
            <div className="soft-panel hairline rounded-[1.5rem] p-5 text-sm">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#A98BCB]">Platform estimate</p>
              <p className="display mt-1 text-3xl">{formatDt(estimate.estimatedValue)}</p>
              {mode === "BORROW" && <p className="mt-2">Suggested refundable deposit: {formatDt(estimate.deposit)}</p>}
            </div>
          )}
        </fieldset>
      )}
      {mode === "BORROW" && (
        <div>
          <label htmlFor="durationDays">Required duration (days)</label>
          <input id="durationDays" name="durationDays" type="number" min="1" defaultValue={5} required />
        </div>
      )}
      {mode === "SKILL" && (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="experienceLevel">Experience</label>
            <select id="experienceLevel" name="experienceLevel">
              {SKILL_LEVELS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="availability">Availability</label>
            <input id="availability" name="availability" placeholder="Weekends" />
          </div>
          <div>
            <label htmlFor="meetingMode">Online or in person</label>
            <select id="meetingMode" name="meetingMode">
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In person</option>
            </select>
          </div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="location">Approximate location</label>
          <input id="location" name="location" list="cities" required placeholder="Tunis" />
          <datalist id="cities">
            {TUNISIAN_CITIES.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
        {mode !== "SKILL" && (
          <label className="mt-7 flex items-center gap-3 text-sm normal-case tracking-normal text-[#F7F5FA]">
            <input type="checkbox" name="lastChance" className="h-4 w-4" />
            Last chance — this might otherwise be thrown away
          </label>
        )}
      </div>
      {error && <p className="text-sm text-[#E7A0A0]">{error}</p>}
      <button className="btn btn-primary">{mode === "GET" ? "Offer it for free" : "Publish"}</button>
    </form>
  );
}
