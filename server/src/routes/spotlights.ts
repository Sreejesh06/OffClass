import { Router } from "express";
import { prisma } from "../lib/db.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { z } from "zod";

const router = Router();

const SpotlightSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  cashPrize: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  links: z.any().optional(),
  taggedStudentIds: z.array(z.string()).default([])
});

router.get("/", async (req, res) => {
  try {
    const spotlights = await prisma.spotlight.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, house: true, role: true } },
        taggedStudents: { select: { id: true, name: true, house: true, avatar: true } }
      }
    });
    res.json({ spotlights });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch spotlights" });
  }
});


router.get("/students", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, house: true, avatar: true },
      orderBy: { name: 'asc' }
    });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

router.post("/", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req, res) => {
  try {
    const data = SpotlightSchema.parse(req.body);
    const spotlight = await prisma.spotlight.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        cashPrize: data.cashPrize,
        department: data.department,
        year: data.year,
        links: data.links,
        authorId: req.user!.userId,
        taggedStudents: {
          connect: data.taggedStudentIds.map(id => ({ id }))
        }
      },
      include: {
        author: { select: { name: true, house: true, role: true } },
        taggedStudents: { select: { id: true, name: true, house: true, avatar: true } }
      }
    });
    res.json(spotlight);
  } catch (error) {
    res.status(500).json({ error: "Failed to create spotlight" });
  }
});

router.delete("/:id", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req, res) => {
  try {
    await prisma.spotlight.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete spotlight" });
  }
});

export default router;
