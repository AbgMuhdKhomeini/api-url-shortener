export function checkHealth(req, res) {
  res.status(200).json({ health: "ok" });
}
