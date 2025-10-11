import { registerRoute } from "../../core/router.js";

registerRoute("/measurements", async () => {
  const view = await import("./view.js");
  return view.default();
});
