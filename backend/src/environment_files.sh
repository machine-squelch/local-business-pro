# backend/.env.example
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/localbrand_pro
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:3000

# Adobe Express SDK
ADOBE_EXPRESS_API_KEY=your-adobe-express-api-key
ADOBE_EXPRESS_CLIENT_ID=your-adobe-express-client-id
ADOBE_EXPRESS_CLIENT_SECRET=your-adobe-express-client-secret

# Location Intelligence APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
WEATHER_API_KEY=your-weather-api-key
CENSUS_API_KEY=your-census-api-key

# Review Integration APIs
GOOGLE_PLACES_API_KEY=your-google-places-api-key
YELP_API_KEY=your-yelp-api-key

# Database Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
SIGNING_KEY=your-64-character-signing-key

# Email Service (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# frontend/.env.example
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ADOBE_EXPRESS_SDK_URL=https://cdn.adobe.io/express/1.0.0/express.min.js

# backend/.env.production
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/localbrand_pro
JWT_SECRET=production-super-secret-jwt-key
FRONTEND_URL=https://yourdomain.com

# Production Adobe Express SDK
ADOBE_EXPRESS_API_KEY=production-adobe-express-api-key
ADOBE_EXPRESS_CLIENT_ID=production-adobe-express-client-id
ADOBE_EXPRESS_CLIENT_SECRET=production-adobe-express-client-secret

# Production APIs
GOOGLE_MAPS_API_KEY=production-google-maps-api-key
WEATHER_API_KEY=production-weather-api-key
CENSUS_API_KEY=production-census-api-key
GOOGLE_PLACES_API_KEY=production-google-places-api-key
YELP_API_KEY=production-yelp-api-key

# Production Database Encryption
ENCRYPTION_KEY=production-32-character-encryption-key
SIGNING_KEY=production-64-character-signing-key