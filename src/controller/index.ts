import fs = require("node:fs/promises");
import path = require("node:path");

export = class extends think.Controller {
  /** @internal */
  indexAction() {
    return this.display("index");
  }

  /** @internal */
  async openapiAction() {
    const document = await fs.readFile(
      path.join(think.ASSETS_PATH, "openapi.json"),
      "utf8",
    );
    return this.json(JSON.parse(document));
  }
};
