import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ALLOWED_ROLES = ["ADMIN", "EDITOR"];

async function assertAllowed() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const caller = await prisma.user.findUnique({ where: { email: session.user.email } });
  const role = (caller?.variableUserType || caller?.userType) as string | undefined;
  return role ? ALLOWED_ROLES.includes(role) : false;
}

// POST: Create a new UserDetails
export async function POST(req: NextRequest) {
  if (!(await assertAllowed())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { email, userType } = body;

  if (!email || !Object.values(UserType).includes(userType)) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    const existing = await prisma.userDetails.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const entry = await prisma.userDetails.create({
      data: { email, userType },
    });

    return NextResponse.json({entry,message:"New User Created Successfully"}, { status: 200});
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete one or multiple UserDetails by email(s)
export async function DELETE(req: NextRequest) {
  if (!(await assertAllowed())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { emails } = body;

  if (!emails || (typeof emails !== "string" && !Array.isArray(emails))) {
    return NextResponse.json({ message: "Invalid email(s) provided" }, { status: 400 });
  }

  try {
    let result;

    if (Array.isArray(emails)) {
      result = await prisma.userDetails.deleteMany({
        where: { email: { in: emails } },
      });
    } else {
      result = await prisma.userDetails.delete({
        where: { email: emails },
      });
    }

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// GET: Return merged list of UserDetails + User records (REVIEWER / EDITOR / ADMIN)
export async function GET() {
  if (!(await assertAllowed())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const specialRoles = [UserType.REVIEWER, UserType.ADMIN, UserType.EDITOR];

    // Fetch all pre-auth entries and all registered users in parallel
    const [allUserDetails, registeredUsers] = await Promise.all([
      prisma.userDetails.findMany({
        where: { userType: { in: specialRoles } },
      }),
      prisma.user.findMany({
        where: { userType: { in: specialRoles } },
        include: {
          reviews: {
            select: {
              id: true,
              reviewerStatus: true,
              rating: true,
              reviewText: true,
            },
          },
        },
      }),
    ]);

    // Build a lookup map for registered users by email for O(1) access
    const registeredByEmail = new Map(registeredUsers.map((u) => [u.email, u]));

    // Build a set of emails already covered by UserDetails
    const detailsEmails = new Set(allUserDetails.map((d) => d.email));

    // Also include registered users whose email is NOT in UserDetails
    // (e.g. role was set directly on User table without a UserDetails entry)
    const extraUsers = registeredUsers.filter((u) => !detailsEmails.has(u.email));

    type MergedEntry = {
      id: string;
      email: string;
      userType: string;
      isAuthenticated: boolean;
      name: string | null;
      affiliation: string | null;
      stats: {
        activeReviews: number;
        completedReviews: number;
        averageRating: number;
        expertise: string[];
      };
    };

    const computeStats = (reviews: { reviewText: string; rating: number | null; reviewerStatus: string | null }[]) => {
      const completed = reviews.filter((r) => r.reviewText?.trim());
      const active = reviews.filter(
        (r) => r.reviewerStatus === "PENDING" || r.reviewerStatus === "ACCEPTED_FOR_REVIEW"
      );
      const ratings = completed.map((r) => r.rating).filter((r): r is number => r !== null);
      return {
        activeReviews: active.length,
        completedReviews: completed.length,
        averageRating: ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0,
      };
    };

    // Merge: each UserDetails entry as the source of truth for role intent
    const mergedFromDetails: MergedEntry[] = allUserDetails.map((detail) => {
      const registeredUser = registeredByEmail.get(detail.email);
      const reviews = registeredUser?.reviews ?? [];
      const stats = computeStats(reviews);

      return {
        id: detail.id,
        email: detail.email,
        userType: detail.userType,
        isAuthenticated: !!registeredUser,
        name: registeredUser?.name ?? null,
        affiliation: registeredUser?.affiliation ?? null,
        profileImage: registeredUser?.profileImage ?? null,
        stats: {
          ...stats,
          expertise: registeredUser?.areaOfInterest ?? [],
        },
      };
    });

    // Extra registered users not in UserDetails (already authenticated)
    const mergedFromExtra: MergedEntry[] = extraUsers.map((user) => {
      const stats = computeStats(user.reviews);
      return {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isAuthenticated: true,
        name: user.name,
        affiliation: user.affiliation ?? null,
        profileImage: user.profileImage ?? null,
        stats: {
          ...stats,
          expertise: user.areaOfInterest ?? [],
        },
      };
    });

    const result = [...mergedFromDetails, ...mergedFromExtra];

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update UserDetails (and User if exists)
export async function PUT(req: NextRequest) {
  if (!(await assertAllowed())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { email, userType } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Invalid email provided" }, { status: 400 });
  }

  if (!Object.values(UserType).includes(userType)) {
    return NextResponse.json({ message: "Invalid user type provided" }, { status: 400 });
  }

  try {
    const userDetailsExists = await prisma.userDetails.findUnique({ where: { email } });

    if (!userDetailsExists) {
      return NextResponse.json({ message: "UserDetails not found" }, { status: 404 });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      await prisma.user.update({
        where: { email },
        data: { userType },
      });
    }

    const result = await prisma.userDetails.update({
      where: { email },
      data: { userType },
    });

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
