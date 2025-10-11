import { registerRoute } from "../../core/router.js";

registerRoute("/", async () => {
  const view = await import("./view.js");
  return view.default();
});

registerRoute("/dashboard", async () => {
  const view = await import("./view.js");
  return view.default();
});
