# Ntumai Delivery - Project TODO

## Project Setup
- [x] Initialize Expo project with TypeScript
- [x] Install all dependencies from package.json
- [x] Clone GitHub repository for code reference
- [x] Copy app structure, components, and assets
- [x] Create design document
- [ ] Fix TypeScript and Firebase configuration errors
- [ ] Verify dev server is running without errors

## Authentication Flow
- [x] Phone Input Screen - Phone number entry with country code picker
- [x] OTP Verification Screen - SMS-based OTP verification
- [x] Role Confirmation Screen - Customer vs Tasker role selection
- [ ] AuthGuard component - Route protection for authenticated screens
- [ ] Auth state management with Zustand
- [ ] Persist auth state to AsyncStorage

## Customer - Home & Navigation
- [x] Tab-based navigation structure (Home, Orders, Profile)
- [x] Home Screen - Featured vendors, recent orders, search
- [ ] Tab bar styling and icons
- [ ] Safe area handling for tab bar
- [ ] Navigation between tabs

## Customer - Marketplace
- [x] Marketplace Screen - Vendor/restaurant list
- [x] Restaurant/Vendor Detail Screen - Menu and vendor info
- [x] Product Detail Screen - Item details with add-to-cart
- [ ] Search and filtering functionality
- [ ] Vendor ratings and reviews display
- [ ] Delivery time and minimum order display
- [ ] Category-based filtering

## Customer - Cart & Checkout
- [x] Shopping Cart Screen - Review and manage items
- [x] Checkout Screen - Payment method selection
- [ ] Cart state management (Zustand)
- [ ] Quantity adjustment in cart
- [ ] Remove items from cart
- [ ] Apply promo codes
- [ ] Order summary and total calculation
- [ ] Payment method selection UI
- [ ] Order confirmation screen

## Customer - Order Management
- [x] Orders Screen - Order history with status
- [x] Order Tracking Screen - Real-time tracking with map
- [x] Delivery Tracking Screen - Live delivery agent location
- [x] Rate Order Screen - Post-delivery rating and review
- [ ] Order history with pagination
- [ ] Order status indicators (pending, confirmed, delivering, completed)
- [ ] Real-time order status updates via Socket.IO
- [ ] Map integration with Expo Maps
- [ ] Delivery agent location tracking
- [ ] Estimated arrival time display
- [ ] Rating and review submission

## Customer - Profile & Settings
- [x] Profile Screen - User information and preferences
- [x] Add Location Screen - Manage saved addresses
- [ ] Profile information editing
- [ ] Saved addresses CRUD operations
- [ ] Payment methods management
- [ ] Order history access
- [ ] Settings and preferences
- [ ] Logout functionality

## Customer - Additional Features
- [x] Send Parcel Screen - Parcel delivery service
- [x] Shopping Lists Screen - Create and manage shopping lists
- [ ] Parcel tracking functionality
- [ ] Shopping list item management
- [ ] Reorder from previous orders

## Tasker - Dashboard & Navigation
- [x] Tasker Dashboard Screen - Available tasks overview
- [ ] Tab-based navigation for tasker (Dashboard, Profile)
- [ ] Available tasks list with earnings
- [ ] Active task management
- [ ] Earnings summary and history

## Tasker - Task Management
- [x] Available Jobs Screen - Browse delivery tasks
- [x] Do Task Screen - Active task details and completion
- [ ] Task acceptance workflow
- [ ] Task details display (pickup, delivery locations)
- [ ] Navigation to pickup location
- [ ] Navigation to delivery location
- [ ] Proof of delivery (photo/signature)
- [ ] Task completion and earnings confirmation

## UI Components & Design System
- [x] Button component - Primary, secondary, tertiary variants
- [x] Input component - Text input with validation
- [x] Card component - Container for grouped content
- [x] Text component - Typography with semantic variants
- [x] Avatar component - User profile images
- [x] Badge component - Status and category indicators
- [x] Skeleton component - Loading placeholders
- [x] HeaderBar component - Top navigation
- [x] OfflineBanner component - Network status
- [x] ErrorBoundary component - Error handling
- [x] PhoneInput component - Phone number input
- [x] CountryCodePicker component - Country selection
- [x] EmptyState component - No data placeholders
- [x] Spinner component - Loading indicator
- [x] ScreenContainer component - SafeArea wrapper
- [ ] Modal/Dialog component
- [ ] Toast/Snackbar component
- [ ] DatePicker component (global)
- [ ] TimePicker component
- [ ] Select/Dropdown component

## State Management & Data
- [ ] Zustand store setup for auth state
- [ ] Zustand store setup for cart state
- [ ] Zustand store setup for orders
- [ ] Zustand store setup for user profile
- [ ] React Query setup for API calls
- [ ] AsyncStorage persistence for offline mode
- [ ] Socket.IO integration for real-time updates
- [ ] Error handling and retry logic
- [ ] Loading states across all screens

## Maps & Location
- [ ] Expo Maps integration
- [ ] Map marker clustering for vendors
- [ ] Real-time delivery tracking on map
- [ ] Offline map tile caching
- [ ] Location permissions handling
- [ ] Route directions display
- [ ] Estimated delivery time calculation

## Notifications
- [ ] Push notification setup
- [ ] Order status notifications
- [ ] Task assignment notifications
- [ ] Delivery arrival notifications
- [ ] In-app notification handling

## Offline Support
- [ ] AsyncStorage caching for critical data
- [ ] Offline mode detection and UI
- [ ] Queue actions while offline
- [ ] Sync queued actions when online
- [ ] Offline indicator banner

## Testing & Quality
- [ ] TypeScript type checking (tsc)
- [ ] ESLint configuration and linting
- [ ] Web environment testing
- [ ] Native environment testing (iOS/Android)
- [ ] Error boundary testing
- [ ] Offline mode testing
- [ ] Performance profiling

## Build & Deployment
- [ ] EAS build configuration
- [ ] Android build (APK) with com.ntumai.app
- [ ] iOS build (IPA)
- [ ] App icon and splash screen setup
- [ ] Firebase configuration for notifications
- [ ] Environment variables setup (.env)

## Bug Fixes & Improvements
- [ ] Fix Firebase module resolution errors
- [ ] Fix Drizzle ORM import errors
- [ ] Resolve TypeScript compilation errors
- [ ] Handle edge cases in authentication
- [ ] Improve error messages and user feedback
- [ ] Optimize list rendering performance
- [ ] Add proper loading states
- [ ] Improve accessibility

## Documentation
- [x] Design document created
- [ ] Component documentation
- [ ] API integration documentation
- [ ] Development workflow guide
- [ ] Deployment instructions


## Current Critical Issues (Added Jan 12, 2025)

- [ ] Fix missing @/screens directory - many tab files reference screens that don't exist
- [ ] Create stub components for all missing screen imports
- [ ] Fix react-native-maps web compatibility (stub created, needs testing)
- [ ] Verify splash screen assets exist (splash-background.png, Logo component)
- [ ] Test launch flow works (splash → onboarding → role-selection)
- [ ] Re-enable auth screens after launch flow works
- [ ] Re-enable customer screens after auth works
- [ ] Re-enable tasker screens after customer works
- [ ] Re-enable vendor screens after tasker works
- [ ] All complex screens temporarily disabled (renamed to _disabled_*)


## Current Focus (Jan 12, 2025 - 4:40 AM)

- [x] Restore auth folder from _backup_screens
- [x] Check all auth screen files for missing imports
- [x] Create stub components for any missing dependencies
- [ ] Test each auth screen loads without errors
- [ ] Verify auth flow navigation works (phone → OTP → role selection)
- [x] Splash screen loads successfully with logo and loading indicator
- [ ] Test onboarding screen navigation from splash
- [ ] Test role-selection screen
