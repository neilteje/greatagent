import { promises as fs } from "fs";
import path from "path";
import type { DemoDatabase, Interview } from "@/lib/types";
import { buildSeedInterviews } from "@/lib/demo-data";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "interviews.json");

async function ensureDatabase() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    const seed: DemoDatabase = { interviews: buildSeedInterviews() };
    await fs.writeFile(dbPath, JSON.stringify(seed, null, 2), "utf8");
  }
}

export async function readDatabase(): Promise<DemoDatabase> {
  await ensureDatabase();
  const raw = await fs.readFile(dbPath, "utf8");
  const parsed = JSON.parse(raw) as DemoDatabase;
  return {
    interviews: parsed.interviews ?? []
  };
}

export async function writeDatabase(database: DemoDatabase) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(database, null, 2), "utf8");
}

export async function listInterviews() {
  const database = await readDatabase();
  return database.interviews.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getInterview(id: string) {
  const database = await readDatabase();
  return database.interviews.find((interview) => interview.id === id) ?? null;
}

export async function upsertInterview(interview: Interview) {
  const database = await readDatabase();
  const index = database.interviews.findIndex((item) => item.id === interview.id);
  if (index >= 0) {
    database.interviews[index] = interview;
  } else {
    database.interviews.unshift(interview);
  }
  await writeDatabase(database);
  return interview;
}

export async function resetSeedData() {
  const database = { interviews: buildSeedInterviews() };
  await writeDatabase(database);
  return database.interviews;
}
