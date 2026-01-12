# Ntumai Delivery - Implementation Roadmap

Based on the comprehensive Workflow States Audit, this document outlines a prioritized implementation plan for building the Ntumai Delivery app with proper state handling.

---

## 🎯 Implementation Strategy

### Approach: **Vertical Slice Development**
Build one complete user flow at a time, implementing all states for that flow before moving to the next. This ensures each feature is production-ready before moving forward.

### Priority Order:
1. **Phase 1**: Authentication & Onboarding Flow (CURRENT - 90% COMPLETE)
2. **Phase 2**: Customer Browse & Order Flow (NEXT)
3. **Phase 3**: Order Tracking & Delivery Flow
4. **Phase 4**: Tasker Job Acceptance & Delivery Flow
5. **Phase 5**: Vendor Order Management Flow
6. **Phase 6**: Payment & Loan Flow
7. **Phase 7**: Profile & Settings

---

## Phase 1: Authentication & Onboarding Flow ✅ 90% Complete

### Status: Nearly Complete
- ✅ Splash screen with white logo
- ✅ Onboarding carousel (3 slides)
- ✅ Role selection (Customer/Tasker)
- ✅ Phone input with country code picker
- ✅ OTP verification
- ✅ Role confirmation
- ✅ All screens wrapped with ScreenContainer
- ✅ Portrait mode locked

### Remaining Tasks:
- [ ] Test complete auth flow end-to-end
- [ ] Add loading states during OTP send/verify
- [ ] Add error states for failed OTP
- [ ] Add "Resend OTP" functionality
- [ ] Persist auth state to AsyncStorage
- [ ] Create AuthGuard component for protected routes

**Estimated Time**: 2-3 hours

---

## Phase 2: Customer Browse & Order Flow 🔄 NEXT PRIORITY

### Goal: Customer can browse vendors, add items to cart, and place an order

### 2.1 State Management Setup (Priority: CRITICAL)
**Estimated Time**: 3-4 hours

#### Create Zustand Stores:
```typescript
// stores/auth-store.ts
- isAuthenticated: boolean
- user: User | null
- role: 'customer' | 'tasker' | 'vendor' | null
- login(), logout(), setRole()

// stores/cart-store.ts
- items: CartItem[]
- vendor: Vendor | null
- total: number
- addItem(), removeItem(), updateQuantity(), clearCart()

// stores/orders-store.ts
- orders: Order[]
- activeOrder: Order | null
- addOrder(), updateOrderStatus(), getOrderById()

// stores/ui-store.ts
- isLoading: boolean
- error: string | null
- showOfflineBanner: boolean
- setLoading(), setError(), clearError()
```

**Tasks**:
- [ ] Create auth-store.ts with AsyncStorage persistence
- [ ] Create cart-store.ts with validation logic
- [ ] Create orders-store.ts with state transitions
- [ ] Create ui-store.ts for global UI state
- [ ] Test all stores in isolation

---

### 2.2 Customer Dashboard/Home Screen (Priority: HIGH)
**Estimated Time**: 4-5 hours

#### States to Implement:
1. **Loading State** - Show skeleton loaders
2. **Empty State** - "No vendors nearby" with location prompt
3. **Full Data State** - Featured vendors, recent orders, search
4. **Error State** - "Failed to load" with retry button
5. **Offline State** - Show cached data with offline banner

#### Components Needed:
- `VendorCard` - Display vendor info, rating, delivery time
- `SearchBar` - Search vendors/products
- `CategoryFilter` - Filter by food category
- `RecentOrderCard` - Show recent order summary
- `SkeletonLoader` - Loading placeholder

**Tasks**:
- [ ] Create customer dashboard layout with bottom tabs
- [ ] Implement skeleton loaders for home screen
- [ ] Create VendorCard component
- [ ] Implement empty state UI
- [ ] Add error boundary and error state
- [ ] Test all states (loading, empty, full, error, offline)

---

### 2.3 Marketplace/Vendor List Screen (Priority: HIGH)
**Estimated Time**: 3-4 hours

#### States to Implement:
1. **Loading** - Skeleton grid of vendor cards
2. **Empty** - "No vendors found" with filters reset
3. **Filtered** - Show filtered results
4. **Vendor Closed** - Show "Closed" badge on cards
5. **Vendor Busy** - Show "Long wait" warning

#### Components Needed:
- `VendorGrid` - Grid layout of vendors
- `VendorFilter` - Filter by cuisine, rating, delivery time
- `VendorStatusBadge` - Open/Closed/Busy indicator

**Tasks**:
- [ ] Create marketplace screen with grid layout
- [ ] Implement vendor filtering logic
- [ ] Add vendor status badges (open/closed/busy)
- [ ] Handle empty state with filter reset
- [ ] Test all vendor states

---

### 2.4 Vendor Detail & Menu Screen (Priority: HIGH)
**Estimated Time**: 5-6 hours

#### States to Implement:
1. **Loading** - Skeleton menu items
2. **Vendor Closed** - Show "Closed" overlay with hours
3. **Vendor Open** - Show full menu
4. **Item Out of Stock** - Disable item, show badge
5. **Item Low Stock** - Show "Only X left" warning

#### Components Needed:
- `MenuItemCard` - Product card with image, price, add button
- `MenuCategory` - Category sections (Appetizers, Mains, etc.)
- `VendorHeader` - Vendor info, rating, hours
- `AddToCartButton` - Add item with quantity selector
- `OutOfStockBadge` - Show stock status

**Tasks**:
- [ ] Create vendor detail screen with menu
- [ ] Implement menu categories and sections
- [ ] Create MenuItemCard with add-to-cart
- [ ] Handle out-of-stock items
- [ ] Show vendor closed overlay
- [ ] Test all menu item states

---

### 2.5 Shopping Cart Screen (Priority: CRITICAL)
**Estimated Time**: 4-5 hours

#### States to Implement:
1. **Empty Cart** - "Your cart is empty" with shop button
2. **Items Added** - Show items, subtotal, fees
3. **Minimum Not Met** - Show "Add $X more" warning
4. **Minimum Met** - Enable checkout button
5. **Item Out of Stock** - Show warning, disable checkout
6. **Vendor Closed** - Show warning, disable checkout

#### Components Needed:
- `CartItem` - Item row with quantity controls
- `CartSummary` - Subtotal, fees, total
- `MinimumOrderWarning` - Show when minimum not met
- `CheckoutButton` - Proceed to checkout

**Tasks**:
- [ ] Create cart screen with item list
- [ ] Implement quantity controls (+ / -)
- [ ] Calculate subtotal, fees, total
- [ ] Add minimum order validation
- [ ] Handle empty cart state
- [ ] Show warnings for out-of-stock/closed vendor
- [ ] Test all cart states

---

### 2.6 Checkout Screen (Priority: HIGH)
**Estimated Time**: 6-7 hours

#### States to Implement:
1. **Loading** - Show "Processing..." spinner
2. **Address Selection** - Select delivery address
3. **No Address** - Prompt to add address
4. **Payment Method** - Select payment method
5. **Order Placing** - Show "Placing order..." spinner
6. **Order Placed** - Navigate to order tracking
7. **Order Failed** - Show error, allow retry

#### Components Needed:
- `AddressSelector` - Select or add delivery address
- `PaymentMethodSelector` - Select payment method
- `OrderSummary` - Final order review
- `PlaceOrderButton` - Submit order
- `CheckoutSkeleton` - Loading state

**Tasks**:
- [ ] Create checkout screen layout
- [ ] Implement address selection
- [ ] Add payment method selection
- [ ] Create order placement logic
- [ ] Handle order placement errors
- [ ] Navigate to order tracking on success
- [ ] Test all checkout states

---

### 2.7 Empty States Component Library (Priority: HIGH)
**Estimated Time**: 2-3 hours

Create reusable empty state components for all screens:

```typescript
<EmptyState
  icon="shopping-bag"
  title="Your cart is empty"
  description="Add items from the marketplace"
  actionLabel="Browse Marketplace"
  onAction={() => router.push('/marketplace')}
/>
```

**Tasks**:
- [ ] Create EmptyState component with variants
- [ ] Add icons for each empty state type
- [ ] Create empty states for:
  - Empty cart
  - No orders
  - No vendors nearby
  - No search results
  - No addresses
  - No payment methods
- [ ] Test all empty states

---

## Phase 3: Order Tracking & Delivery Flow

### Goal: Customer can track order status and delivery in real-time

### 3.1 Order Tracking Screen (Priority: HIGH)
**Estimated Time**: 6-8 hours

#### States to Implement:
1. **Pending** - "Waiting for vendor confirmation..."
2. **Confirmed** - "Vendor is preparing your order"
3. **Preparing** - Show progress bar with estimated time
4. **Ready** - "Order ready, finding tasker..."
5. **Assigned** - "Tasker assigned" with tasker details
6. **Picked Up** - "Tasker picked up your order"
7. **In Transit** - Show live map with ETA
8. **Delivered** - "Order delivered!" with rating prompt
9. **Cancelled** - Show cancellation reason
10. **Failed** - Show failure reason with support contact

#### Components Needed:
- `OrderStatusTimeline` - Visual timeline of order progress
- `OrderStatusCard` - Current status with icon and message
- `TaskerCard` - Tasker photo, name, rating, contact
- `LiveTrackingMap` - Real-time delivery tracking
- `ETACounter` - Countdown to estimated arrival
- `OrderCancelButton` - Cancel order (if allowed)

**Tasks**:
- [ ] Create order tracking screen
- [ ] Implement order status timeline
- [ ] Show tasker details when assigned
- [ ] Add live tracking map integration
- [ ] Implement ETA countdown
- [ ] Handle all order states
- [ ] Add cancel order functionality
- [ ] Test all order state transitions

---

### 3.2 Live Delivery Tracking (Priority: MEDIUM)
**Estimated Time**: 8-10 hours

#### States to Implement:
1. **Location Unavailable** - "Waiting for location..."
2. **Location Updating** - Show "Updating..." spinner
3. **Location Updated** - Show marker on map
4. **Location Stale** - "Last update X min ago"
5. **Delivery Complete** - Show "Delivered" marker

#### Components Needed:
- `DeliveryMap` - Map with customer and tasker markers
- `TaskerMarker` - Animated marker for tasker location
- `RoutePolyline` - Show route from tasker to customer
- `LocationRefreshButton` - Manual refresh location
- `OfflineMapNotice` - Show when offline

**Tasks**:
- [ ] Integrate Expo Maps
- [ ] Implement real-time location updates (Socket.IO or polling)
- [ ] Add customer and tasker markers
- [ ] Draw route polyline
- [ ] Calculate and show ETA
- [ ] Handle location unavailable state
- [ ] Implement offline map caching
- [ ] Test all tracking states

---

### 3.3 Order History Screen (Priority: MEDIUM)
**Estimated Time**: 3-4 hours

#### States to Implement:
1. **Loading** - Skeleton list of orders
2. **Empty** - "No orders yet" with shop button
3. **Full List** - Show all past orders
4. **Filtered** - Filter by status (completed, cancelled)
5. **Error** - "Failed to load" with retry

#### Components Needed:
- `OrderHistoryCard` - Order summary card
- `OrderStatusBadge` - Status indicator
- `OrderFilterTabs` - Filter by status
- `ReorderButton` - Reorder same items

**Tasks**:
- [ ] Create order history screen
- [ ] Implement order list with pagination
- [ ] Add status filter tabs
- [ ] Create reorder functionality
- [ ] Handle empty state
- [ ] Test all history states

---

## Phase 4: Tasker Job Acceptance & Delivery Flow

### Goal: Tasker can accept jobs, pick up orders, and complete deliveries

### 4.1 Tasker Dashboard (Priority: HIGH)
**Estimated Time**: 4-5 hours

#### States to Implement:
1. **Offline** - "You're offline" with go online button
2. **Online Idle** - "Waiting for jobs..."
3. **On Task** - Show active task details
4. **On Break** - "On break" with resume button
5. **No Jobs Available** - "No jobs nearby"

#### Components Needed:
- `OnlineToggle` - Toggle online/offline status
- `EarningsCard` - Today's earnings summary
- `ActiveTaskCard` - Current task details
- `AvailableJobsList` - List of available jobs

**Tasks**:
- [ ] Create tasker dashboard layout
- [ ] Implement online/offline toggle
- [ ] Show earnings summary
- [ ] Display active task
- [ ] List available jobs
- [ ] Test all tasker states

---

### 4.2 Available Jobs Screen (Priority: HIGH)
**Estimated Time**: 4-5 hours

#### States to Implement:
1. **Loading** - Skeleton list of jobs
2. **No Jobs** - "No jobs available"
3. **Jobs Available** - List of jobs with details
4. **Job Accepted** - Navigate to task details
5. **Job Expired** - Show "Job no longer available"

#### Components Needed:
- `JobCard` - Job details with earnings, distance
- `AcceptJobButton` - Accept job
- `JobDetailsModal` - Show full job details

**Tasks**:
- [ ] Create available jobs screen
- [ ] Implement job list with real-time updates
- [ ] Add job acceptance logic
- [ ] Handle job expiration
- [ ] Show earnings and distance
- [ ] Test all job states

---

### 4.3 Active Task Screen (Priority: CRITICAL)
**Estimated Time**: 8-10 hours

#### States to Implement:
1. **Accepted** - Show pickup location, navigate button
2. **Navigating to Pickup** - Show map with route
3. **Arrived at Pickup** - "Confirm pickup" button
4. **Picked Up** - Show delivery location
5. **Navigating to Delivery** - Show map with route
6. **Arrived at Delivery** - "Confirm delivery" button
7. **Delivered** - Show earnings, next task
8. **Failed** - Report issue (customer not home, etc.)

#### Components Needed:
- `TaskMap` - Map with pickup/delivery markers
- `NavigateButton` - Open navigation app
- `ConfirmPickupButton` - Confirm pickup
- `ConfirmDeliveryButton` - Confirm delivery with proof
- `ReportIssueButton` - Report delivery failure
- `TaskEarningsCard` - Show earnings for completed task

**Tasks**:
- [ ] Create active task screen
- [ ] Implement task map with markers
- [ ] Add navigation integration (Google Maps/Apple Maps)
- [ ] Implement pickup confirmation
- [ ] Implement delivery confirmation with proof (photo/signature)
- [ ] Handle delivery failure reporting
- [ ] Show earnings on completion
- [ ] Test all task states

---

## Phase 5: Vendor Order Management Flow

### Goal: Vendor can receive, accept, and manage orders

### 5.1 Vendor Dashboard (Priority: MEDIUM)
**Estimated Time**: 4-5 hours

#### States to Implement:
1. **Closed** - "Your store is closed" with open button
2. **Open** - Show pending orders, sales summary
3. **Busy** - "You're busy" warning
4. **No Orders** - "No orders yet"

#### Components Needed:
- `OpenCloseToggle` - Toggle store open/closed
- `PendingOrdersCard` - Count of pending orders
- `SalesTodayCard` - Today's sales summary
- `OrderNotification` - New order alert

**Tasks**:
- [ ] Create vendor dashboard
- [ ] Implement open/close toggle
- [ ] Show pending orders count
- [ ] Display sales summary
- [ ] Add new order notifications
- [ ] Test all vendor states

---

### 5.2 Vendor Orders Screen (Priority: HIGH)
**Estimated Time**: 5-6 hours

#### States to Implement:
1. **New Order** - Show "Accept/Reject" buttons
2. **Accepted** - Show "Start preparing" button
3. **Preparing** - Show "Mark ready" button
4. **Ready** - "Waiting for tasker pickup"
5. **Picked Up** - "Order picked up"
6. **Completed** - Show completed status

#### Components Needed:
- `VendorOrderCard` - Order details with actions
- `AcceptOrderButton` - Accept order
- `RejectOrderButton` - Reject with reason
- `MarkReadyButton` - Mark order ready
- `OrderTimerBadge` - Show prep time countdown

**Tasks**:
- [ ] Create vendor orders screen
- [ ] Implement order acceptance/rejection
- [ ] Add order preparation workflow
- [ ] Show prep time countdown
- [ ] Handle all order states
- [ ] Test vendor order flow

---

## Phase 6: Payment & Loan Flow

### Goal: Customer can manage payments and apply for loans

### 6.1 Payment Methods Screen (Priority: MEDIUM)
**Estimated Time**: 3-4 hours

#### States to Implement:
1. **No Payment Methods** - "Add payment method"
2. **Payment Methods Added** - List of methods
3. **Default Method** - Show default badge
4. **Adding Method** - Show form
5. **Method Added** - Show success message

#### Components Needed:
- `PaymentMethodCard` - Display payment method
- `AddPaymentMethodButton` - Add new method
- `SetDefaultButton` - Set as default
- `DeleteMethodButton` - Remove method

**Tasks**:
- [ ] Create payment methods screen
- [ ] Implement add payment method
- [ ] Set default payment method
- [ ] Delete payment method
- [ ] Test all payment states

---

### 6.2 Loan Application Flow (Priority: LOW)
**Estimated Time**: 6-8 hours

#### States to Implement:
1. **Not Eligible** - Show requirements
2. **Eligible** - Show "Apply" button
3. **Pending Review** - "Application pending..."
4. **Approved** - Show loan offer
5. **Declined** - Show reason
6. **Active Loan** - Show balance, due date
7. **Overdue** - Show penalty warning

#### Components Needed:
- `LoanEligibilityCard` - Show eligibility status
- `ApplyForLoanButton` - Start application
- `LoanOfferCard` - Show approved loan details
- `LoanBalanceCard` - Show active loan balance
- `MakePaymentButton` - Make loan payment
- `PaymentSchedule` - Show payment schedule

**Tasks**:
- [ ] Create loan eligibility check
- [ ] Implement loan application form
- [ ] Show loan offer details
- [ ] Display active loan balance
- [ ] Implement payment schedule
- [ ] Handle overdue payments
- [ ] Test all loan states

---

## Phase 7: Profile & Settings

### Goal: User can manage profile, addresses, and settings

### 7.1 Profile Screen (Priority: MEDIUM)
**Estimated Time**: 3-4 hours

#### States to Implement:
1. **Incomplete Profile** - Show "Complete profile" prompt
2. **Complete Profile** - Show all details
3. **Editing** - Show edit form
4. **Saving** - Show "Saving..." spinner
5. **Saved** - Show success message

#### Components Needed:
- `ProfileHeader` - Photo, name, role
- `ProfileField` - Editable field
- `EditProfileButton` - Enter edit mode
- `SaveProfileButton` - Save changes

**Tasks**:
- [ ] Create profile screen
- [ ] Implement profile editing
- [ ] Add photo upload
- [ ] Handle incomplete profile state
- [ ] Test all profile states

---

### 7.2 Address Management (Priority: HIGH)
**Estimated Time**: 4-5 hours

#### States to Implement:
1. **No Addresses** - "Add your first address"
2. **Addresses Added** - List of addresses
3. **Adding Address** - Show form with map
4. **Address Pending** - "Verifying..."
5. **Address Verified** - Show checkmark
6. **Address Invalid** - Show error

#### Components Needed:
- `AddressCard` - Display address with actions
- `AddAddressButton` - Add new address
- `AddressForm` - Form with map picker
- `SetDefaultButton` - Set as default
- `DeleteAddressButton` - Remove address

**Tasks**:
- [ ] Create address management screen
- [ ] Implement add address with map picker
- [ ] Add address verification
- [ ] Set default address
- [ ] Delete address
- [ ] Test all address states

---

## Implementation Priorities Summary

### 🔴 CRITICAL (Must implement first)
1. ✅ Auth flow (90% complete)
2. State management stores (auth, cart, orders, UI)
3. Shopping cart with validation
4. Checkout flow
5. Active task screen (for taskers)

### 🟡 HIGH (Implement next)
1. Customer dashboard/home
2. Marketplace/vendor list
3. Vendor detail & menu
4. Order tracking
5. Tasker dashboard
6. Available jobs
7. Vendor orders management
8. Address management

### 🟢 MEDIUM (Implement after core flows work)
1. Order history
2. Live delivery tracking
3. Vendor dashboard
4. Payment methods
5. Profile screen

### 🔵 LOW (Nice to have, implement last)
1. Loan application flow
2. Notifications management
3. Settings & preferences
4. Analytics & reports

---

## Development Workflow

### For Each Feature:
1. **Define States** - List all possible states from audit
2. **Create Components** - Build reusable UI components
3. **Implement Store** - Add state management logic
4. **Build UI** - Create screen with all states
5. **Add Error Handling** - Error boundaries and recovery
6. **Test States** - Manually test all state transitions
7. **Commit & Push** - Commit to GitHub after testing

### Testing Checklist for Each Screen:
- [ ] Loading state works (skeleton loaders)
- [ ] Empty state shows correct message and action
- [ ] Full data state displays correctly
- [ ] Error state shows with retry button
- [ ] Offline state shows cached data or message
- [ ] All buttons and interactions work
- [ ] Navigation works correctly
- [ ] State persists across app restarts (if needed)

---

## Next Immediate Steps (Today)

### 1. Complete Auth Flow Testing (30 min)
- [ ] Test splash → onboarding → role selection
- [ ] Test phone input → OTP → role confirmation
- [ ] Verify all screens display correctly

### 2. Create State Management Stores (3-4 hours)
- [ ] Create `stores/auth-store.ts`
- [ ] Create `stores/cart-store.ts`
- [ ] Create `stores/orders-store.ts`
- [ ] Create `stores/ui-store.ts`
- [ ] Test all stores

### 3. Build Customer Dashboard (4-5 hours)
- [ ] Create dashboard layout with bottom tabs
- [ ] Implement skeleton loaders
- [ ] Add empty state
- [ ] Test all states

### 4. Commit & Save Checkpoint (15 min)
- [ ] Commit all changes to GitHub
- [ ] Save checkpoint with description
- [ ] Document progress

---

## Estimated Timeline

| Phase | Features | Estimated Time | Priority |
|-------|----------|----------------|----------|
| Phase 1 | Auth & Onboarding | ✅ 90% Complete | CRITICAL |
| Phase 2 | Browse & Order | 30-35 hours | CRITICAL |
| Phase 3 | Order Tracking | 15-20 hours | HIGH |
| Phase 4 | Tasker Flow | 20-25 hours | HIGH |
| Phase 5 | Vendor Flow | 15-20 hours | MEDIUM |
| Phase 6 | Payment & Loan | 10-15 hours | LOW |
| Phase 7 | Profile & Settings | 10-12 hours | MEDIUM |
| **Total** | **Full App** | **100-130 hours** | - |

---

## Success Metrics

### For Each Phase:
- ✅ All screens load without errors
- ✅ All states are implemented and tested
- ✅ Empty states show helpful messages
- ✅ Error states have recovery paths
- ✅ Loading states use skeleton loaders
- ✅ Offline mode works with cached data
- ✅ Navigation flows work end-to-end
- ✅ Code is committed to GitHub

---

## Conclusion

This roadmap provides a clear, prioritized path to building the Ntumai Delivery app with proper state handling. By following the vertical slice approach and implementing all states for each feature, we ensure production-ready quality at every step.

**Next Action**: Begin Phase 2 by creating the state management stores.
