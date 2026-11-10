import fs from "node:fs";
import path from "node:path";
import { TREE } from "./tree";

// Czytane w czasie builda (komponent serwerowy), nie w przeglądarce.
const ROOT = path.join(process.cwd(), "..");
export const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/** Drzewo z podglądem plików: zawartość z repo albo `inline`. */
export const TREE_WITH_FILES = TREE.map((n) => ({ ...n, preview: n.source ? read(n.source) : (n.inline ?? "") }));
