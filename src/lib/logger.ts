import prisma from "./prisma";

export async function logActivity(
  action: string,
  status: "SUCCESS" | "ERROR",
  details: any = {},
  options: { ip?: string; userAgent?: string } = {}
) {
  try {
    const detailsString = typeof details === "string" ? details : JSON.stringify(details);
    
    await prisma.activityLog.create({
      data: {
        action,
        status,
        details: detailsString,
        ip: options.ip || null,
        userAgent: options.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // We don't throw here to avoid crashing the main process due to a logging failure
  }
}
