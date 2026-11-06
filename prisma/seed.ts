import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { estimateObjectValue } from "../src/lib/valuation";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.exchange.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("reverse123", 10);

  const sofia = await prisma.user.create({
    data: {
      email: "sofia@reverse.demo",
      passwordHash,
      name: "Sofia Ben Ali",
      location: "Tunis",
      bio: "Photographer. I borrow lenses, lend cameras, and hate unused gear gathering dust.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      verified: true,
      reversePoints: 180,
      isDemo: true,
    },
  });

  const karim = await prisma.user.create({
    data: {
      email: "karim@reverse.demo",
      passwordHash,
      name: "Karim Trabelsi",
      location: "Ariana",
      bio: "Architecture student. I swap tools, donate furniture, and trade tutoring for design help.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      verified: true,
      reversePoints: 120,
      isDemo: true,
    },
  });

  const leila = await prisma.user.create({
    data: {
      email: "leila@reverse.demo",
      passwordHash,
      name: "Leila Mansour",
      location: "La Marsa",
      bio: "Product designer. I give away home objects and exchange illustration for language practice.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
      verified: false,
      reversePoints: 90,
      isDemo: true,
    },
  });

  const nabil = await prisma.user.create({
    data: {
      email: "nabil@reverse.demo",
      passwordHash,
      name: "Nabil Gharbi",
      location: "Sousse",
      bio: "Musician and weekend fixer. If it still works, someone nearby can use it.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      verified: true,
      reversePoints: 240,
      isDemo: true,
    },
  });

  const listings = [
    {
      userId: sofia.id,
      type: "BORROW",
      needTitle: "A projector for 4 days",
      offerTitle: "Sony A7 III camera body",
      needDescription: "Need a compact projector for a gallery pop-up in Tunis.",
      offerDescription: "Well-kept Sony A7 III, 42k shutter, comes with strap and battery.",
      photos: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop",
      ],
      condition: "Good",
      category: "Cameras",
      brand: "Sony",
      model: "A7 III",
      ageYears: 3,
      originalPrice: 4500,
      userSuggestedValue: 2200,
      durationDays: 4,
      location: "Tunis",
    },
    {
      userId: karim.id,
      type: "BORROW",
      needTitle: "A camera for 5 days",
      offerTitle: "iPad Air",
      needDescription: "Need a stills camera for a site visit and portfolio shots.",
      offerDescription: "iPad Air 5th gen, 64GB, with folio case.",
      photos: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=800&fit=crop",
      ],
      condition: "Like new",
      category: "Computers",
      brand: "Apple",
      model: "iPad Air",
      ageYears: 2,
      originalPrice: 1800,
      userSuggestedValue: 1100,
      durationDays: 5,
      location: "Ariana",
    },
    {
      userId: nabil.id,
      type: "BORROW",
      needTitle: "A folding table for 3 days",
      offerTitle: "Yamaha acoustic guitar",
      needDescription: "Need a table for a small live session at a café.",
      offerDescription: "Yamaha F310, tuned, with gig bag.",
      photos: [
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=800&fit=crop",
      ],
      condition: "Good",
      category: "Music",
      brand: "Yamaha",
      model: "F310",
      ageYears: 6,
      originalPrice: 450,
      userSuggestedValue: 220,
      durationDays: 3,
      location: "Sousse",
    },
    {
      userId: leila.id,
      type: "GET",
      needTitle: "",
      offerTitle: "Office chair",
      needDescription: "",
      offerDescription: "No longer needed after switching to a stool. Clean, slight wear on armrests.",
      photos: [
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200&h=800&fit=crop",
      ],
      condition: "Good",
      category: "Furniture",
      location: "La Marsa",
    },
    {
      userId: nabil.id,
      type: "GET",
      needTitle: "",
      offerTitle: "Wooden crate set",
      needDescription: "",
      offerDescription: "Three crates from a move. Useful as shelves. Last chance before they go out.",
      photos: [
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&h=800&fit=crop",
      ],
      condition: "Fair",
      category: "Home",
      location: "Sousse",
      lastChance: true,
    },
    {
      userId: karim.id,
      type: "GET",
      needTitle: "",
      offerTitle: "Architecture books (box of 8)",
      needDescription: "",
      offerDescription: "Course leftovers. Free to a student who will actually read them.",
      photos: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=800&fit=crop",
      ],
      condition: "Good",
      category: "Books",
      location: "Ariana",
    },
    {
      userId: sofia.id,
      type: "GET",
      needTitle: "",
      offerTitle: "Desk lamp",
      needDescription: "",
      offerDescription: "Warm light, working switch. Taking too much space.",
      photos: [
        "https://images.unsplash.com/photo-1507473880760-e72add147ba0?w=1200&h=800&fit=crop",
      ],
      condition: "Like new",
      category: "Home",
      location: "Tunis",
      lastChance: true,
    },
    {
      userId: leila.id,
      type: "SWAP",
      needTitle: "A compact smartphone",
      offerTitle: "iPad mini",
      needDescription: "Want a smaller daily phone. Fine with a previous generation.",
      offerDescription: "iPad mini 6, 64GB, wifi, apple pencil not included.",
      photos: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=900&fit=crop",
      ],
      condition: "Good",
      category: "Computers",
      brand: "Apple",
      model: "iPad mini 6",
      ageYears: 3,
      originalPrice: 1600,
      userSuggestedValue: 850,
      location: "La Marsa",
    },
    {
      userId: karim.id,
      type: "SWAP",
      needTitle: "A drawing tablet",
      offerTitle: "Samsung Galaxy Tab S7",
      needDescription: "Need something with a pen for sketches and plans.",
      offerDescription: "Galaxy Tab S7, S Pen included, 128GB.",
      photos: [
        "https://images.unsplash.com/photo-1585790050230-5dd284dba1d0?w=1200&h=800&fit=crop",
      ],
      condition: "Good",
      category: "Computers",
      brand: "Samsung",
      model: "Tab S7",
      ageYears: 4,
      originalPrice: 1900,
      userSuggestedValue: 700,
      location: "Ariana",
    },
    {
      userId: nabil.id,
      type: "SWAP",
      needTitle: "A Bluetooth speaker",
      offerTitle: "Vintage radio",
      needDescription: "Want a portable speaker for rehearsals.",
      offerDescription: "Working vintage radio, warm sound, restored knob.",
      photos: [
        "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1200&h=800&fit=crop",
      ],
      condition: "Fair",
      category: "Music",
      brand: "Generic",
      ageYears: 12,
      originalPrice: 180,
      userSuggestedValue: 90,
      location: "Sousse",
      lastChance: true,
    },
    {
      userId: sofia.id,
      type: "SKILL",
      needTitle: "English conversation practice",
      offerTitle: "Portrait photography lessons",
      needDescription: "Want weekly spoken English, especially for client emails.",
      offerDescription: "Two-hour natural-light portrait sessions. Camera optional.",
      photos: [
        "https://images.unsplash.com/photo-1452587925148-ce544e77a2a3?w=1200&h=800&fit=crop",
      ],
      location: "Tunis",
      experienceLevel: "Professional",
      availability: "Weekends",
      meetingMode: "IN_PERSON",
    },
    {
      userId: leila.id,
      type: "SKILL",
      needTitle: "Website development",
      offerTitle: "Graphic design & brand systems",
      needDescription: "Need a simple Next.js portfolio built.",
      offerDescription: "Identity, layouts, and illustration for a small brand.",
      photos: [
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=800&fit=crop",
      ],
      location: "La Marsa",
      experienceLevel: "Professional",
      availability: "Evenings",
      meetingMode: "ONLINE",
    },
    {
      userId: karim.id,
      type: "SKILL",
      needTitle: "Video editing",
      offerTitle: "Mathematics tutoring",
      needDescription: "Need help cutting a 4-minute architecture reel.",
      offerDescription: "High-school and first-year university maths, in person or online.",
      photos: [
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop",
      ],
      location: "Ariana",
      experienceLevel: "Advanced",
      availability: "Weeknights",
      meetingMode: "ONLINE",
    },
    {
      userId: nabil.id,
      type: "SKILL",
      needTitle: "Photoshop lessons",
      offerTitle: "Guitar basics",
      needDescription: "Want to retouch gig posters without guessing.",
      offerDescription: "Beginner chords, rhythm, and a simple song in four sessions.",
      photos: [
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=800&fit=crop",
      ],
      location: "Sousse",
      experienceLevel: "Intermediate",
      availability: "Fridays",
      meetingMode: "IN_PERSON",
    },
    {
      userId: sofia.id,
      type: "BORROW",
      needTitle: "A tripod for 2 days",
      offerTitle: "Bose QC headphones",
      needDescription: "Need a sturdy tripod for a rooftop shoot.",
      offerDescription: "QuietComfort 45, original case included.",
      photos: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&h=800&fit=crop",
      ],
      condition: "Like new",
      category: "Electronics",
      brand: "Bose",
      model: "QC45",
      ageYears: 1,
      originalPrice: 900,
      userSuggestedValue: 550,
      durationDays: 2,
      location: "Tunis",
    },
    {
      userId: leila.id,
      type: "GET",
      needTitle: "",
      offerTitle: "Plant pots (set of 4)",
      needDescription: "",
      offerDescription: "Ceramic pots, no plants. Free pickup this week.",
      photos: [
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200&h=800&fit=crop",
      ],
      condition: "Good",
      category: "Home",
      location: "La Marsa",
    },
  ];

  for (const listing of listings) {
    const estimate =
      listing.type === "GET" || listing.type === "SKILL"
        ? null
        : estimateObjectValue({
            category: listing.category,
            brand: listing.brand,
            model: listing.model,
            ageYears: listing.ageYears,
            condition: listing.condition,
            originalPrice: listing.originalPrice,
            userSuggestedValue: listing.userSuggestedValue,
          });

    await prisma.listing.create({
      data: {
        ...listing,
        photos: JSON.stringify(listing.photos),
        estimatedValue: estimate?.estimatedValue ?? null,
        lastChance: listing.lastChance ?? false,
      },
    });
  }

  const borrowListing = await prisma.listing.findFirst({
    where: { offerTitle: "Sony A7 III camera body" },
  });
  const getListing = await prisma.listing.findFirst({
    where: { offerTitle: "Office chair" },
  });
  const swapListing = await prisma.listing.findFirst({
    where: { offerTitle: "iPad mini" },
  });

  if (borrowListing) {
    const proposal = await prisma.proposal.create({
      data: {
        listingId: borrowListing.id,
        fromUserId: karim.id,
        message:
          "I can offer the iPad Air for the four days. Happy to add a 200 DT refundable deposit.",
        counterOfferTitle: "iPad Air",
        proposedNeedValue: 180,
        proposedOfferValue: 1100,
        additionalPayment: 0,
        depositAmount: 200,
        durationDays: 4,
        status: "ACCEPTED",
      },
    });

    const exchange = await prisma.exchange.create({
      data: {
        listingId: borrowListing.id,
        proposalId: proposal.id,
        type: "BORROW",
        ownerId: sofia.id,
        partnerId: karim.id,
        status: "IN_PROGRESS",
        needTitle: borrowListing.needTitle,
        offerTitle: borrowListing.offerTitle,
        agreedNeedValue: 180,
        agreedOfferValue: 2200,
        additionalPayment: 0,
        depositAmount: 200,
        durationDays: 4,
        returnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        ownerHandover: true,
        partnerHandover: true,
      },
    });

    await prisma.message.create({
      data: {
        exchangeId: exchange.id,
        proposalId: proposal.id,
        fromUserId: karim.id,
        body: "I can meet at Avenue Habib Bourguiba tomorrow at 18:00.",
      },
    });
    await prisma.message.create({
      data: {
        exchangeId: exchange.id,
        proposalId: proposal.id,
        fromUserId: sofia.id,
        body: "Perfect. I'll bring the camera and a spare battery.",
      },
    });
  }

  if (getListing) {
    await prisma.proposal.create({
      data: {
        listingId: getListing.id,
        fromUserId: karim.id,
        message: "I can pick up the chair this weekend. It's for my studio desk.",
        status: "PENDING",
      },
    });
  }

  if (swapListing) {
    const proposal = await prisma.proposal.create({
      data: {
        listingId: swapListing.id,
        fromUserId: nabil.id,
        message: "I can offer a Pixel 7. Platform estimate puts the gap around 150 DT — happy to discuss.",
        counterOfferTitle: "Google Pixel 7",
        proposedNeedValue: 850,
        proposedOfferValue: 700,
        additionalPayment: 150,
        status: "PENDING",
      },
    });
    await prisma.message.create({
      data: {
        proposalId: proposal.id,
        fromUserId: nabil.id,
        body: "The Pixel is in good condition, original box, 128GB.",
      },
    });
  }

  console.log("Seeded REVERSE demo data.");
  console.log("Demo logins: sofia@reverse.demo, karim@reverse.demo, leila@reverse.demo, nabil@reverse.demo");
  console.log("Password: reverse123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
