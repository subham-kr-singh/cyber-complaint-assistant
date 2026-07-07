import RoutingAuthority from "../models/RoutingAuthority.js";

// GET /api/routing/authority?crimeType=upi_fraud
const getAuthority = async (req, res, next) => {
  try {
    const { crimeType } = req.query;
    if (!crimeType) {
      return res.status(400).json({ success: false, message: "crimeType query param is required" });
    }
    const authority = await RoutingAuthority.findOne({ crimeType: crimeType.toLowerCase() });
    if (!authority) {
      return res.status(404).json({ success: false, message: "No authority mapping found" });
    }
    res.json({ success: true, authority });
  } catch (err) {
    next(err);
  }
}

// GET /api/routing/categories
const listCategories = async (req, res, next) => {
  try {
    const categories = await RoutingAuthority.find().select("crimeType authorityName");
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export {  getAuthority, listCategories  };
