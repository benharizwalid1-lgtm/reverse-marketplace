"use client";

import { useState } from "react";
import { publishListing, estimateAction } from "@/lib/actions";
import { CATEGORIES, CONDITIONS, SKILL_LEVELS, TUNISIAN_CITIES, MODE_META, type Mode } from "@/lib/modes";
import { formatDt } from "@/lib/format";

export function PublishForm({ mode }: { mode: Mode }) {
  const meta = MODE_META[mode];
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<{
    estimatedValue: number;
    notes: string[];
    deposit: number;
  } | null>(null);

  async function onSubmit(formData: FormData) {
    formData.set("type", mode);
    formData.set("photos", JSON.stringify(photos));
    const result = await publishListing(formData);
    if (result?.error) setError(result.error);
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const json = await response.json();
      if (json.url) uploaded.push(json.url);
    }
    setPhotos((current) => [...current, ...uploaded]);
  }

  async function refreshEstimate(form: HTMLFormElement) {
    const data = new FormData(form);
    const result = await estimateAction({
      mode,
      category: String(data.get("category") || ""),
      brand: String(data.get("brand") || ""),
      model: String(data.get("model") || ""),
      ageYears: data.get("ageYears") ? Number(data.get("ageYears")) : null,
      condition: String(data.get("condition") || ""),
      originalPrice: data.get("originalPrice") ? Number(data.get("originalPrice")) : null,
      userSuggestedValue: data.get("userSuggestedValue") ? Number(data.get("userSuggestedValue")) : null,
    });
    setEstimate(result);
  }

  return (
    <form action={onSubmit} className="space-y-8" onChange={(event) => {
      if (mode === "BORROW" || mode === "SWAP") {
        void refreshEstimate(event.currentTarget);
      }
    }}>
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
          <input id="photos" type="file" accept="image/*" multiple onChange={(event) => void upload(event.target.files)} />
          {photos.length > 0 && (
            <div className="mt-3 flex gap-3">
              {photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={photo} src={photo} alt="" className="h-20 w-20 rounded-2xl object-cover" />
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
              <p className="mt-2 text-[#B9B3C6]">Not a guaranteed market price. Clearly separate from your suggested value.</p>
              {mode === "BORROW" && (
                <p className="mt-2">Suggested refundable deposit: {formatDt(estimate.deposit)}</p>
              )}
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
