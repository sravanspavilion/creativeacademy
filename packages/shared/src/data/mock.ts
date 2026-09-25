import type { AcademyInfo, Course } from "../types";

/**
 * Single source of truth for sample schedule data.
 * Consumed by the dashboard (mock fallback) and by the built-in API's
 * in-memory repository, so replacing it later with Prisma/PostgreSQL data
 * happens in exactly one place.
 */

export const mockCourses: Course[] = [
  {
    id: "photoshop",
    name: "Adobe Photoshop",
    category: "Graphic Design",
    emblem: "ps",
    tools: ["Photoshop", "Generative Fill", "Retouching"],
  },
  {
    id: "premiere",
    name: "Adobe Premiere Pro",
    category: "Video Editing",
    emblem: "pr",
    tools: ["Premiere Pro", "Color Grading", "Audio Mix"],
  },
  {
    id: "after-effects",
    name: "Adobe After Effects",
    category: "Motion Graphics",
    emblem: "ae",
    tools: ["After Effects", "Keyframes", "VFX"],
  },
  {
    id: "illustrator",
    name: "Adobe Illustrator",
    category: "Graphic Design",
    emblem: "ai",
    tools: ["Illustrator", "Vector Art", "Branding"],
  },
  {
    id: "lightroom",
    name: "Adobe Lightroom",
    category: "Photography",
    emblem: "lr",
    tools: ["Lightroom", "Presets", "Photo Editing"],
  },
  {
    id: "ai-creative-tools",
    name: "AI Creative Tools",
    category: "AI Workflows",
    emblem: "ai-spark",
    tools: ["ChatGPT", "Midjourney", "Canva AI", "AI Video"],
  },
  {
    id: "express",
    name: "Adobe Express",
    category: "Quick Content",
    emblem: "ax",
    tools: ["Express", "Social Templates"],
  },
  {
    id: "video-editing",
    name: "Video Editing Pro",
    category: "Video Editing",
    emblem: "pr",
    tools: ["Premiere Pro", "DaVinci Basics", "Export Workflows"],
  },
  {
    id: "graphic-design",
    name: "Graphic Design Master",
    category: "Graphic Design",
    emblem: "ps",
    tools: ["Photoshop", "Illustrator", "Composition"],
  },
  {
    id: "motion-graphics",
    name: "Motion Graphics Studio",
    category: "Motion Graphics",
    emblem: "ae",
    tools: ["After Effects", "Expressions", "Kinetic Type"],
  },
];

const courseById = (id: string): Course =>
  mockCourses.find((course) => course.id === id) ?? mockCourses[0];

export const mockAcademy: AcademyInfo = {
  id: "creative-ai-academy",
  name: "CREATIVE AI ACADEMY",
  tagline: "EDITING • DESIGN • AI",
  hoursLabel: "9:00 AM — 6:00 PM",
  schedule: [
    {
      id: "shift-1",
      name: "Morning Shift",
      label: "MORNING",
      status: "Morning Shift",
      start: "09:00",
      end: "12:00",
      durationHours: 3,
      course: courseById("premiere"),
      instructor: "Priya Nair",
      room: "Editing Lab 01",
      batchName: "Batch A",
      batchStatus: "Enrolling",
      enabled: true,
      theme: { accent: "#A855F7", from: "#833AB4", to: "#E1306C" },
    },
    {
      id: "shift-2",
      name: "Afternoon Shift",
      label: "AFTERNOON",
      status: "Afternoon Shift",
      start: "12:00",
      end: "15:00",
      durationHours: 3,
      course: courseById("photoshop"),
      instructor: "Rahul Verma",
      room: "Design Lab 01",
      batchName: "Batch B",
      batchStatus: "Active",
      enabled: true,
      theme: { accent: "#EC4899", from: "#E1306C", to: "#F77737" },
    },
    {
      id: "shift-3",
      name: "Evening Shift",
      label: "EVENING",
      status: "Evening Shift",
      start: "15:00",
      end: "18:00",
      durationHours: 3,
      course: courseById("ai-creative-tools"),
      instructor: "Ananya Iyer",
      room: "AI Lab 01",
      batchName: "Batch C",
      batchStatus: "Limited Seats",
      enabled: true,
      theme: { accent: "#F59E0B", from: "#F77737", to: "#FCAF45" },
    },
  ],
};