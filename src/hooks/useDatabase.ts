import Database from "@tauri-apps/plugin-sql";

let dbInstance: Awaited<ReturnType<typeof Database.load>> | null = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:$APPDATA/app.db");
  }
  console.log(dbInstance);
  return dbInstance;
}
