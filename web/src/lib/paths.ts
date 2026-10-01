// Linki do zasobów w /public muszą znać basePath (GitHub Pages: /<repo>/).
// <Link> z next/link robi to sam — ta funkcja jest dla <img>, <a download> itp.
export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;

export const REPO_URL = "https://github.com/adrianstando/2026Z-PJATK-TEG";
export const REPO_BLOB = `${REPO_URL}/blob/main`;
export const colabUrl = (path: string) =>
  `https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/${path}`;
