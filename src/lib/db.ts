import { estimateObjectValue } from "./valuation";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  location: string;
  bio: string;
  avatar: string | null;
  verified: boolean;
  reversePoints: number;
  isDemo: boolean;
  createdAt: Date;
};

export type Listing = {
  id: string;
  type: string;
  userId: string;
  needTitle: string;
  offerTitle: string;
  needDescription: string;
  offerDescription: string;
  photos: string;
  condition: string;
  category: string;
  brand: string;
  model: string;
  ageYears: number | null;
  originalPrice: number | null;
  userSuggestedValue: number | null;
  estimatedValue: number | null;
  durationDays: number | null;
  location: string;
  lastChance: boolean;
  experienceLevel: string;
  availability: string;
  meetingMode: string;
  status: string;
  createdAt: Date;
};

export type Proposal = {
  id: string;
  listingId: string;
  fromUserId: string;
  message: string;
  counterOfferTitle: string;
  proposedNeedValue: number | null;
  proposedOfferValue: number | null;
  additionalPayment: number | null;
  depositAmount: number | null;
  durationDays: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Exchange = {
  id: string;
  listingId: string;
  proposalId: string;
  type: string;
  ownerId: string;
  partnerId: string;
  status: string;
  needTitle: string;
  offerTitle: string;
  agreedNeedValue: number | null;
  agreedOfferValue: number | null;
  additionalPayment: number | null;
  depositAmount: number | null;
  durationDays: number | null;
  startDate: Date;
  returnDate: Date | null;
  ownerHandover: boolean;
  partnerHandover: boolean;
  ownerReturn: boolean;
  partnerReturn: boolean;
  createdAt: Date;
};

export type Message = {
  id: string;
  proposalId: string | null;
  exchangeId: string | null;
  fromUserId: string;
  body: string;
  createdAt: Date;
};

export type Review = {
  id: string;
  exchangeId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type Store = {
  users: User[];
  listings: Listing[];
  proposals: Proposal[];
  exchanges: Exchange[];
  messages: Message[];
  reviews: Review[];
};

const PASS = "$2b$10$tBU/4AohL9H6/XXyjn6f9e.J5dsMz5HXjdg5mU3dbVJKHfnfI.mmu";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createSeed(): Store {
  const sofia: User = {
    id: "user_sofia",
    email: "sofia@reverse.demo",
    passwordHash: PASS,
    name: "Sofia Ben Ali",
    location: "Tunis",
    bio: "Photographer. I borrow lenses, lend cameras, and hate unused gear gathering dust.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    verified: true,
    reversePoints: 180,
    isDemo: true,
    createdAt: new Date("2026-01-01"),
  };
  const karim: User = {
    id: "user_karim",
    email: "karim@reverse.demo",
    passwordHash: PASS,
    name: "Karim Trabelsi",
    location: "Ariana",
    bio: "Architecture student. I swap tools, donate furniture, and trade tutoring for design help.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    verified: true,
    reversePoints: 120,
    isDemo: true,
    createdAt: new Date("2026-01-01"),
  };
  const leila: User = {
    id: "user_leila",
    email: "leila@reverse.demo",
    passwordHash: PASS,
    name: "Leila Mansour",
    location: "La Marsa",
    bio: "Product designer. I give away home objects and exchange illustration for language practice.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    verified: false,
    reversePoints: 90,
    isDemo: true,
    createdAt: new Date("2026-01-01"),
  };
  const nabil: User = {
    id: "user_nabil",
    email: "nabil@reverse.demo",
    passwordHash: PASS,
    name: "Nabil Gharbi",
    location: "Sousse",
    bio: "Musician and weekend fixer. If it still works, someone nearby can use it.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    verified: true,
    reversePoints: 240,
    isDemo: true,
    createdAt: new Date("2026-01-01"),
  };

  const raw = [
    { id: "list_sony", userId: sofia.id, type: "BORROW", needTitle: "A projector for 4 days", offerTitle: "Sony A7 III camera body", needDescription: "Need a compact projector for a gallery pop-up in Tunis.", offerDescription: "Well-kept Sony A7 III, 42k shutter, comes with strap and battery.", photos: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop"], condition: "Good", category: "Cameras", brand: "Sony", model: "A7 III", ageYears: 3, originalPrice: 4500, userSuggestedValue: 2200, durationDays: 4, location: "Tunis" },
    { id: "list_ipad", userId: karim.id, type: "BORROW", needTitle: "A camera for 5 days", offerTitle: "iPad Air", needDescription: "Need a stills camera for a site visit and portfolio shots.", offerDescription: "iPad Air 5th gen, 64GB, with folio case.", photos: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=800&fit=crop"], condition: "Like new", category: "Computers", brand: "Apple", model: "iPad Air", ageYears: 2, originalPrice: 1800, userSuggestedValue: 1100, durationDays: 5, location: "Ariana" },
    { id: "list_yamaha", userId: nabil.id, type: "BORROW", needTitle: "A folding table for 3 days", offerTitle: "Yamaha acoustic guitar", needDescription: "Need a table for a small live session at a café.", offerDescription: "Yamaha F310, tuned, with gig bag.", photos: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=800&fit=crop"], condition: "Good", category: "Music", brand: "Yamaha", model: "F310", ageYears: 6, originalPrice: 450, userSuggestedValue: 220, durationDays: 3, location: "Sousse" },
    { id: "list_chair", userId: leila.id, type: "GET", needTitle: "", offerTitle: "Office chair", needDescription: "", offerDescription: "No longer needed after switching to a stool. Clean, slight wear on armrests.", photos: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200&h=800&fit=crop"], condition: "Good", category: "Furniture", location: "La Marsa" },
    { id: "list_crates", userId: nabil.id, type: "GET", needTitle: "", offerTitle: "Wooden crate set", needDescription: "", offerDescription: "Three crates from a move. Useful as shelves. Last chance before they go out.", photos: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&h=800&fit=crop"], condition: "Fair", category: "Home", location: "Sousse", lastChance: true },
    { id: "list_books", userId: karim.id, type: "GET", needTitle: "", offerTitle: "Architecture books (box of 8)", needDescription: "", offerDescription: "Course leftovers. Free to a student who will actually read them.", photos: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=800&fit=crop"], condition: "Good", category: "Books", location: "Ariana" },
    { id: "list_lamp", userId: sofia.id, type: "GET", needTitle: "", offerTitle: "Desk lamp", needDescription: "", offerDescription: "Warm light, working switch. Taking too much space.", photos: ["https://images.unsplash.com/photo-1507473880760-e72add147ba0?w=1200&h=800&fit=crop"], condition: "Like new", category: "Home", location: "Tunis", lastChance: true },
    { id: "list_mini", userId: leila.id, type: "SWAP", needTitle: "A compact smartphone", offerTitle: "iPad mini", needDescription: "Want a smaller daily phone. Fine with a previous generation.", offerDescription: "iPad mini 6, 64GB, wifi, apple pencil not included.", photos: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=900&fit=crop"], condition: "Good", category: "Computers", brand: "Apple", model: "iPad mini 6", ageYears: 3, originalPrice: 1600, userSuggestedValue: 850, location: "La Marsa" },
    { id: "list_tabs7", userId: karim.id, type: "SWAP", needTitle: "A drawing tablet", offerTitle: "Samsung Galaxy Tab S7", needDescription: "Need something with a pen for sketches and plans.", offerDescription: "Galaxy Tab S7, S Pen included, 128GB.", photos: ["https://images.unsplash.com/photo-1585790050230-5dd284dba1d0?w=1200&h=800&fit=crop"], condition: "Good", category: "Computers", brand: "Samsung", model: "Tab S7", ageYears: 4, originalPrice: 1900, userSuggestedValue: 700, location: "Ariana" },
    { id: "list_radio", userId: nabil.id, type: "SWAP", needTitle: "A Bluetooth speaker", offerTitle: "Vintage radio", needDescription: "Want a portable speaker for rehearsals.", offerDescription: "Working vintage radio, warm sound, restored knob.", photos: ["https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1200&h=800&fit=crop"], condition: "Fair", category: "Music", brand: "Generic", ageYears: 12, originalPrice: 180, userSuggestedValue: 90, location: "Sousse", lastChance: true },
    { id: "list_photo", userId: sofia.id, type: "SKILL", needTitle: "English conversation practice", offerTitle: "Portrait photography lessons", needDescription: "Want weekly spoken English, especially for client emails.", offerDescription: "Two-hour natural-light portrait sessions. Camera optional.", photos: ["https://images.unsplash.com/photo-1452587925148-ce544e77a2a3?w=1200&h=800&fit=crop"], location: "Tunis", experienceLevel: "Professional", availability: "Weekends", meetingMode: "IN_PERSON" },
    { id: "list_brand", userId: leila.id, type: "SKILL", needTitle: "Website development", offerTitle: "Graphic design & brand systems", needDescription: "Need a simple Next.js portfolio built.", offerDescription: "Identity, layouts, and illustration for a small brand.", photos: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=800&fit=crop"], location: "La Marsa", experienceLevel: "Professional", availability: "Evenings", meetingMode: "ONLINE" },
    { id: "list_math", userId: karim.id, type: "SKILL", needTitle: "Video editing", offerTitle: "Mathematics tutoring", needDescription: "Need help cutting a 4-minute architecture reel.", offerDescription: "High-school and first-year university maths, in person or online.", photos: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop"], location: "Ariana", experienceLevel: "Advanced", availability: "Weeknights", meetingMode: "ONLINE" },
    { id: "list_guitar", userId: nabil.id, type: "SKILL", needTitle: "Photoshop lessons", offerTitle: "Guitar basics", needDescription: "Want to retouch gig posters without guessing.", offerDescription: "Beginner chords, rhythm, and a simple song in four sessions.", photos: ["https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=800&fit=crop"], location: "Sousse", experienceLevel: "Intermediate", availability: "Fridays", meetingMode: "IN_PERSON" },
    { id: "list_bose", userId: sofia.id, type: "BORROW", needTitle: "A tripod for 2 days", offerTitle: "Bose QC headphones", needDescription: "Need a sturdy tripod for a rooftop shoot.", offerDescription: "QuietComfort 45, original case included.", photos: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&h=800&fit=crop"], condition: "Like new", category: "Electronics", brand: "Bose", model: "QC45", ageYears: 1, originalPrice: 900, userSuggestedValue: 550, durationDays: 2, location: "Tunis" },
    { id: "list_pots", userId: leila.id, type: "GET", needTitle: "", offerTitle: "Plant pots (set of 4)", needDescription: "", offerDescription: "Ceramic pots, no plants. Free pickup this week.", photos: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200&h=800&fit=crop"], condition: "Good", category: "Home", location: "La Marsa" },
  ];

  const listings: Listing[] = raw.map((item, index) => {
    const estimate =
      item.type === "GET" || item.type === "SKILL"
        ? null
        : estimateObjectValue({
            category: item.category,
            brand: item.brand,
            model: item.model,
            ageYears: item.ageYears,
            condition: item.condition,
            originalPrice: item.originalPrice,
            userSuggestedValue: item.userSuggestedValue,
          });
    return {
      id: item.id,
      type: item.type,
      userId: item.userId,
      needTitle: item.needTitle,
      offerTitle: item.offerTitle,
      needDescription: item.needDescription,
      offerDescription: item.offerDescription,
      photos: JSON.stringify(item.photos),
      condition: item.condition ?? "",
      category: item.category ?? "",
      brand: item.brand ?? "",
      model: item.model ?? "",
      ageYears: item.ageYears ?? null,
      originalPrice: item.originalPrice ?? null,
      userSuggestedValue: item.userSuggestedValue ?? null,
      estimatedValue: estimate?.estimatedValue ?? null,
      durationDays: item.durationDays ?? null,
      location: item.location,
      lastChance: item.lastChance ?? false,
      experienceLevel: item.experienceLevel ?? "",
      availability: item.availability ?? "",
      meetingMode: item.meetingMode ?? "",
      status: "ACTIVE",
      createdAt: new Date(Date.now() - index * 3600_000),
    };
  });

  const proposals: Proposal[] = [
    {
      id: "prop_borrow",
      listingId: "list_sony",
      fromUserId: karim.id,
      message: "I can offer the iPad Air for the four days. Happy to add a 200 DT refundable deposit.",
      counterOfferTitle: "iPad Air",
      proposedNeedValue: 180,
      proposedOfferValue: 1100,
      additionalPayment: 0,
      depositAmount: 200,
      durationDays: 4,
      status: "ACCEPTED",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "prop_chair",
      listingId: "list_chair",
      fromUserId: karim.id,
      message: "I can pick up the chair this weekend. It's for my studio desk.",
      counterOfferTitle: "",
      proposedNeedValue: null,
      proposedOfferValue: null,
      additionalPayment: null,
      depositAmount: null,
      durationDays: null,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "prop_swap",
      listingId: "list_mini",
      fromUserId: nabil.id,
      message: "I can offer a Pixel 7. Platform estimate puts the gap around 150 DT — happy to discuss.",
      counterOfferTitle: "Google Pixel 7",
      proposedNeedValue: 850,
      proposedOfferValue: 700,
      additionalPayment: 150,
      depositAmount: null,
      durationDays: null,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const exchanges: Exchange[] = [
    {
      id: "ex_borrow",
      listingId: "list_sony",
      proposalId: "prop_borrow",
      type: "BORROW",
      ownerId: sofia.id,
      partnerId: karim.id,
      status: "IN_PROGRESS",
      needTitle: "A projector for 4 days",
      offerTitle: "Sony A7 III camera body",
      agreedNeedValue: 180,
      agreedOfferValue: 2200,
      additionalPayment: 0,
      depositAmount: 200,
      durationDays: 4,
      startDate: new Date(),
      returnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      ownerHandover: true,
      partnerHandover: true,
      ownerReturn: false,
      partnerReturn: false,
      createdAt: new Date(),
    },
  ];

  const messages: Message[] = [
    { id: "msg_1", exchangeId: "ex_borrow", proposalId: "prop_borrow", fromUserId: karim.id, body: "I can meet at Avenue Habib Bourguiba tomorrow at 18:00.", createdAt: new Date() },
    { id: "msg_2", exchangeId: "ex_borrow", proposalId: "prop_borrow", fromUserId: sofia.id, body: "Perfect. I'll bring the camera and a spare battery.", createdAt: new Date() },
    { id: "msg_3", exchangeId: null, proposalId: "prop_swap", fromUserId: nabil.id, body: "The Pixel is in good condition, original box, 128GB.", createdAt: new Date() },
  ];

  return { users: [sofia, karim, leila, nabil], listings, proposals, exchanges, messages, reviews: [] };
}

const globalStore = globalThis as unknown as { __reverseStore?: Store };

function store(): Store {
  if (!globalStore.__reverseStore) globalStore.__reverseStore = createSeed();
  return globalStore.__reverseStore;
}

function userById(id: string) {
  return store().users.find((item) => item.id === id) ?? null;
}

export function db() {
  return store();
}

export function createId(prefix: string) {
  return uid(prefix);
}

export function findUserById(id: string) {
  return userById(id);
}

export function findUserByEmail(email: string) {
  return store().users.find((item) => item.email === email.toLowerCase()) ?? null;
}

export function createUser(data: Omit<User, "createdAt" | "bio" | "verified" | "reversePoints" | "isDemo" | "avatar"> & Partial<User>) {
  const user: User = {
    bio: "",
    avatar: null,
    verified: false,
    reversePoints: 0,
    isDemo: false,
    createdAt: new Date(),
    ...data,
  };
  store().users.push(user);
  return user;
}

export function updateUser(id: string, data: Partial<User>) {
  const user = userById(id);
  if (!user) return null;
  Object.assign(user, data);
  return user;
}

export function addPoints(id: string, amount: number) {
  const user = userById(id);
  if (user) user.reversePoints += amount;
}

export function withUser<T extends { userId: string }>(listing: T) {
  return { ...listing, user: userById(listing.userId)! };
}

export function hydrateUser(user: User) {
  const ownedExchanges = store().exchanges.filter((item) => item.ownerId === user.id);
  const partnerExchanges = store().exchanges.filter((item) => item.partnerId === user.id);
  const reviewsReceived = store().reviews.filter((item) => item.toUserId === user.id);
  return { ...user, ownedExchanges, partnerExchanges, reviewsReceived };
}
