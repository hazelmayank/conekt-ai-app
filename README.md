# Conekt Mobile App

A React Native mobile application for managing truck campaigns and video content.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your actual API keys:

```env
# Google Maps API Keys
# Get your API keys from: https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY_ANDROID=your_actual_android_api_key
GOOGLE_MAPS_API_KEY_IOS=your_actual_ios_api_key

# Backend API Configuration
API_BASE_URL=https://your-backend-url.com
```

### 3. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
4. Create API keys for both Android and iOS
5. Add the keys to your `.env` file

### 4. Run the Application

```bash
# Start the development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

## Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file contains sensitive API keys and should remain local
- Use `.env.example` as a template for other developers
- Make sure your Google Maps API keys have proper restrictions set up

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── navigation/      # Navigation configuration
├── screens/        # Screen components
├── services/       # API and external services
├── theme/          # Theme configuration
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Technologies Used

- React Native
- Expo
- TypeScript
- Google Maps API
- AsyncStorage
- React Navigation
