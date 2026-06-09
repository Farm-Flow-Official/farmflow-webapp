import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-leaflet (and its core) ship as ESM; transpiling them avoids interop
  // issues when the GIS map chunk loads. Safe no-op if already handled.
  transpilePackages: ["react-leaflet", "@react-leaflet/core"],
};

export default nextConfig;
