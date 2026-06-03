import { vercelPreset } from "@vercel/react-router";
import type { Config } from "@react-router/dev/config";

export default {
  preset: vercelPreset(),
} satisfies Config;
