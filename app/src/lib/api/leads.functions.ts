import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

const contactSchema = z.object({
  email: z.string().email(),
  industry: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  revenue: z.string().min(1),
});

export const submitContact = createServerFn({ method: "POST" })
  .validator(contactSchema)
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) {
      throw new Error("Base de datos no disponible");
    }
    await DB.prepare(
      "INSERT INTO leads (kind, name, email, phone, industry, revenue) VALUES ('contact', ?, ?, ?, ?, ?)"
    )
      .bind(data.name, data.email, data.phone, data.industry, data.revenue)
      .run();
    return { ok: true as const };
  });

const notifySchema = z.object({
  email: z.string().email(),
});

export const submitNotify = createServerFn({ method: "POST" })
  .validator(notifySchema)
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) {
      throw new Error("Base de datos no disponible");
    }
    await DB.prepare("INSERT INTO leads (kind, email) VALUES ('notify', ?)")
      .bind(data.email)
      .run();
    return { ok: true as const };
  });
