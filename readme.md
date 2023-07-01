# E-Commerce RESTful API

---

## Project Overview

This project showcases a robust architecture that follows the Monolithic architecture with MVC architecture Pattern, providing seamless interaction for three main users: admin, seller, and user.

---
## Key features

✅User Management: Users can register with email verification, request another verification email if needed, reset their passwords via email, and even change their passwords (using access and refresh JSON Web Tokens stored in cookies).

✅Seller Onboarding: Users looking to become sellers can send personalized emails to a random admin, expressing their interest. Admins can easily review and approve or reject these requests.

✅Organized Categories: Admins have the authority to add and manage categories and subcategories creating a well-organized product catalog.

✅Product Showcasing: Sellers can add their products. while users can add products to their cart or wishlist, making it easy to keep track of their preferred items.

✅Seamless Ordering: Users can add delivery locations and complete the payment orders using cash or card payments (via Stripe payment gateway integration).

✅Resource Management: implemented full CRUD operations with filtering, pagination, and sorting capabilities for essential resources, including users, addresses, carts, orders, categories, subcategories, products, reviews, and wishlists.

✅ Image uploading: image uploads for categories, subcategories, products, and even user profile pictures are handled (using Multer).

✅ Validation and Error Handling: To guarantee data integrity, both request-level and database-level validation layers are implemented with comprehensive error handling. This ensures that users receive accurate and informative responses.

---

## How to run and test

1. rename `.env.example` file to `.env`
1. run `npm i` followed by `npm start`
1. import `ecommerce.postman_collection.json` file into `postman`
1. for recieving emails, haed into [Ethereal](https://ethereal.email/) and login with the given testing account credintials in the `.env.example`

---
