import RoutingAuthority from "../models/RoutingAuthority.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/routing/authority?crimeType=upi_fraud
const getAuthority = asyncHandler(async (req, res, next) => {
  const { crimeType } = req.query;
  if (!crimeType) {
    return res.status(400).json({ success: false, message: "crimeType query param is required" });
  }
  const authority = await RoutingAuthority.findOne({ crimeType: crimeType.toLowerCase() });
  if (!authority) {
    return res.status(404).json({ success: false, message: "No authority mapping found" });
  }
  res.json({ success: true, authority });
});

// GET /api/routing/categories
const listCategories = asyncHandler(async (req, res, next) => {
  const categories = await RoutingAuthority.find().select("crimeType authorityName");
  res.json({ success: true, categories });
});

export { getAuthority, listCategories };
