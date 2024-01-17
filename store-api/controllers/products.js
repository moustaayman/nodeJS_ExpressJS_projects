const Product = require("../models/product");

const getProductsStatic = async (req, res) => {
  // const search = "ab";
  const products = await Product.find({ price: { $gt: 30 } })
    .sort("name")
    .select("name price");
  res.status(200).json({ nbHits: products.length, products });
};
const getProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};
  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = {
          [operator]: Number(value),
        };
      }
    });
  }
  console.log(queryObject);
  let result = Product.find(queryObject);
  //sort
  if (sort) {
    //splitting the sort array by replacing commas with space so that we can
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }
  if (fields) {
    //splitting the fields array by replacing commas with space so that we can
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const products = await result;
  // console.log(queryObject);
  res.status(200).json({ nbHits: products.length, products });
};

module.exports = { getProductsStatic, getProducts };
