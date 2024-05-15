const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;
const FLIPKART_API_URL =
  "https://1.rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false";

app.get("/product", async (req, res) => {
  try {
    const { url } = req.query;

    const response = await axios.post(
      FLIPKART_API_URL,
      {
        pageUri: url,
        pageContext: {
          trackingContext: {
            context: {
              eVar51: "productRecommendation/similar_PMUCallout_VIRTUAL_COMBO",
              eVar61: "reco",
            },
          },
          networkSpeed: 10000,
        },
      },
      {
        headers: {
          "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
          "Content-Type": "application/json",
          Origin: "https://www.flipkart.com",
          Referer: "https://www.flipkart.com/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
          "X-User-Agent":
            "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 FKUA/msite/0.0.3/msite/Mobile",
          flipkart_secure: "true",
        },
      }
    );

    const responseData = response.data;

    if (
      responseData &&
      responseData.RESPONSE &&
      responseData.RESPONSE.pageData &&
      responseData.RESPONSE.pageData.pageContext &&
      responseData.RESPONSE.pageData.pageContext.analyticsData &&
      responseData.RESPONSE.pageData.pageContext.fdpEventTracking &&
      responseData.RESPONSE.pageData.pageContext.fdpEventTracking.events &&
      responseData.RESPONSE.pageData.pageContext.fdpEventTracking.events.psi &&
      responseData.RESPONSE.pageData.pageContext.fdpEventTracking.events.psi.pr
    ) {
      const productContext = responseData.RESPONSE.pageData.pageContext;
      const parameterRatings =
        productContext.fdpEventTracking.events.psi.pr.parameterRating;

      const individualRatings =
        productContext.fdpEventTracking.events.psi.pr.individualRatingsCount;
      const offersummery =
        productContext.fdpEventTracking.events.psi.os.offerSummary;
      const feature = productContext.fdpEventTracking.events.psi.swa;

      const product = {
        id: productContext.analyticsData.productId,
        productLink: url,
        title: productContext.analyticsData.category,
        price: productContext.analyticsData.productPrice,
        currency: productContext.analyticsData.currency,
        originalPrice: productContext.analyticsData.productMRP,
        image: productContext.imageUrl,
        reviews:
          responseData.RESPONSE.pageData.pageContext.fdpEventTracking.events.psi
            .pr.reviewsCount,

        parameterRatings: parameterRatings.map((item) => ({
          parameter: item.parameter,
          rating: item.rating,
        })),

        individualRatings: individualRatings.map((item) => ({
          ratingValue: item.ratingValue,
          ratingCount: item.ratingCount,
        })),

        overallRating: productContext.fdpEventTracking.events.psi.pr.rating,
        allRatingsCount:
          productContext.fdpEventTracking.events.psi.pr.ratingsCount,
        allReviewsCount:
          productContext.fdpEventTracking.events.psi.pr.reviewsCount,

        offers: offersummery.map((item) => ({
          type: item.type,
        })),
        offerCounts: productContext.fdpEventTracking.events.psi.os.offerCount,

        finalPrice: productContext.fdpEventTracking.events.psi.ppd.fsp,
        return: productContext.fdpEventTracking.events.psi.pi.returnPolicy,
        deliveryFees:
          productContext.fdpEventTracking.events.psi.pi.deliveryFeePolicy,
        features: feature.map((item) => {
          switch (item.attributeName) {
            case "color":
              return { color: item.attributeValue };
            case "storage":
              return { storage: item.attributeValue };
            case "ram":
              return { ram: item.attributeValue };
            default:
              return {};
          }
        }),
      };

      res.json(product);
    } else {
      console.log("No product data found in the response:", responseData);
      throw new Error("No product data found in the response");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data from API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
