import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      id: true,
      email: true,
      fullName: true,
      profilePictureUrl: true,
      gender: true,
      dateOfBirth: true,
      phoneNumber: true,
      aboutBio: true,
      role: true,
      specialization: true,
      consultationFee: true,
      experienceYears: true,
      licenseNumber: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...user,
    consultationFee: user.consultationFee != null ? Number(user.consultationFee) : null,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
  })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const userId = Number(session.user.id)

  const base: {
    fullName?: string
    profilePictureUrl?: string | null
    phoneNumber?: string | null
    dateOfBirth?: Date | null
    aboutBio?: string | null
  } = {}

  if (typeof body.fullName === "string") base.fullName = body.fullName
  if (body.profilePictureUrl !== undefined) base.profilePictureUrl = body.profilePictureUrl ?? null
  if (body.phoneNumber !== undefined) base.phoneNumber = body.phoneNumber || null
  if (body.aboutBio !== undefined) base.aboutBio = body.aboutBio || null
  if (body.dateOfBirth !== undefined) {
    base.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const updateData: Parameters<typeof prisma.user.update>[0]["data"] = { ...base }

  if (user.role === "therapist") {
    if (typeof body.specialization === "string") updateData.specialization = body.specialization
    if (body.consultationFee !== undefined) {
      updateData.consultationFee = body.consultationFee === "" || body.consultationFee == null
        ? null
        : Number(body.consultationFee)
    }
    if (body.experienceYears !== undefined) {
      updateData.experienceYears =
        body.experienceYears === "" || body.experienceYears == null
          ? null
          : Number(body.experienceYears)
    }
    if (typeof body.licenseNumber === "string") updateData.licenseNumber = body.licenseNumber || null
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      profilePictureUrl: true,
      phoneNumber: true,
      aboutBio: true,
      dateOfBirth: true,
      specialization: true,
      consultationFee: true,
      experienceYears: true,
      licenseNumber: true,
    },
  })

  return NextResponse.json({
    ...updated,
    consultationFee: updated.consultationFee != null ? Number(updated.consultationFee) : null,
    dateOfBirth: updated.dateOfBirth ? updated.dateOfBirth.toISOString().slice(0, 10) : null,
  })
}
