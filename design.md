# Ntumai Delivery App - Design Plan

## Overview
Ntumai Delivery is a mobile delivery application that connects customers with delivery services. The app follows Apple Human Interface Guidelines (HIG) and mainstream iOS mobile app design standards, optimized for mobile portrait orientation (9:16) and one-handed usage.

## Brand Identity
- **Primary Color**: Teal/Turquoise (#1ABAA6 - extracted from logo)
- **App Name**: Ntumai Delivery
- **Logo**: Custom green "NTUMAI" wordmark with Africa continent symbol

## Screen List

### 1. Home Screen
**Primary Content:**
- Hero section with app branding
- Quick action buttons (Order Delivery, Track Order)
- Recent orders list
- Service categories (Food, Packages, Groceries)

**Functionality:**
- Browse available delivery services
- Quick access to order placement
- View order history

### 2. Order Placement Screen
**Primary Content:**
- Pickup location input with map
- Delivery location input with map
- Package details form (size, weight, description)
- Delivery time selection
- Price estimate display

**Functionality:**
- Location selection via map or search
- Package information entry
- Real-time price calculation
- Order confirmation

### 3. Track Order Screen
**Primary Content:**
- Live map showing delivery route
- Delivery driver information (name, photo, rating)
- Order status timeline
- Estimated arrival time
- Contact driver button

**Functionality:**
- Real-time location tracking
- Driver communication
- Order status updates
- Cancel order option

### 4. Orders History Screen
**Primary Content:**
- List of past orders with status
- Order cards showing date, locations, price
- Filter options (completed, cancelled, in-progress)

**Functionality:**
- View order details
- Reorder functionality
- Download receipts

### 5. Profile Screen
**Primary Content:**
- User information (name, phone, email)
- Saved addresses
- Payment methods
- Settings and preferences

**Functionality:**
- Edit profile information
- Manage saved locations
- Update payment methods
- App settings

## Key User Flows

### Flow 1: Place New Delivery Order
1. User taps "Order Delivery" on Home screen
2. Order Placement screen opens
3. User selects pickup location (map or search)
4. User selects delivery location
5. User enters package details
6. System shows price estimate
7. User confirms order
8. Order confirmation sheet appears
9. Navigate to Track Order screen

### Flow 2: Track Active Delivery
1. User taps active order from Home screen
2. Track Order screen opens with live map
3. User sees driver location and route
4. User can contact driver via call/message
5. Receive real-time status updates
6. Order completion notification

### Flow 3: View Order History
1. User taps "Orders" tab in bottom navigation
2. Orders History screen displays
3. User scrolls through past orders
4. User taps order card to view details
5. Order detail modal appears
6. User can reorder or download receipt

## Navigation Structure

**Bottom Tab Navigation:**
- Home (house icon)
- Orders (list icon)
- Track (location icon)
- Profile (person icon)

## Design Principles

### Visual Design
- Clean, minimal interface with ample whitespace
- Card-based layout for content grouping
- Rounded corners (12-16px) for modern feel
- Subtle shadows for depth
- System font (SF Pro on iOS)

### Interaction Design
- Large tap targets (minimum 44x44pt)
- Haptic feedback on button presses
- Smooth transitions between screens
- Pull-to-refresh on list views
- Swipe gestures for common actions

### Color Usage
- Primary (Teal): CTAs, active states, important actions
- Background: White (#FFFFFF) in light mode
- Surface: Light gray (#F5F5F5) for cards
- Foreground: Dark gray (#11181C) for text
- Muted: Medium gray (#687076) for secondary text
- Border: Light gray (#E5E7EB) for dividers

### Typography
- Headings: Bold, 24-32pt
- Body: Regular, 16pt
- Captions: Regular, 14pt
- Line height: 1.4-1.5x font size

## Component Library

### Core Components
- **Button**: Primary (filled), Secondary (outlined), Text
- **Input**: Text input with label and validation
- **Card**: Container with shadow and rounded corners
- **ListItem**: Row with icon, text, and chevron
- **Modal**: Bottom sheet for actions
- **Avatar**: Circular user/driver photo
- **Rating**: Star rating display
- **Badge**: Status indicators
- **Map**: Interactive map component

### Screen Layouts
- All screens use `ScreenContainer` for safe area handling
- Tab bar automatically handles bottom safe area
- Status bar style: dark content on light background

## Technical Considerations

### State Management
- Use Zustand for global state (user, active orders)
- AsyncStorage for local persistence
- TanStack Query for server data caching

### Data Flow
- Real-time updates via WebSocket (for order tracking)
- REST API for CRUD operations
- Optimistic updates for better UX

### Performance
- Lazy load order history
- Image optimization for driver photos
- Debounce location search
- Cache map tiles

## Accessibility
- Minimum font size: 14pt
- Color contrast ratio: 4.5:1 minimum
- VoiceOver support for all interactive elements
- Descriptive labels for icons
- Haptic feedback for confirmations
