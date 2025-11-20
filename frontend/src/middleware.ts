// 🔒 Locked middleware scope: ΜΟΝΟ /ops/* — public & βασικά API μένουν εκτός
export const config = {
  matcher: ['/ops/:path*'],
};
// Καμία λογική εδώ — αν χρειαστεί προστασία για άλλα paths, θα μπει ρητά σε νέο pass.
