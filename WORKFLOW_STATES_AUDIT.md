# Ntumai Delivery - Workflow States Audit

This document identifies all possible states for each workflow and screen in the Ntumai Delivery app. Understanding these states is critical for proper UI/UX design and business logic implementation.

---

## 1. Customer Dashboard States

### 1.1 User Account States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **New User** | Just created account, no profile data | Show onboarding, empty dashboard | Complete profile, add address |
| **Active User** | Fully onboarded with profile | Show dashboard with recent orders | Browse marketplace, place order |
| **Inactive User** | No activity for 30+ days | Show re-engagement banner | Browse marketplace, special offers |
| **Suspended User** | Account suspended (violation) | Show suspension notice | Contact support, appeal |
| **Deleted User** | Account marked for deletion | Show deletion confirmation | Restore or confirm deletion |

### 1.2 Home Screen States
| State | Description | UI Behavior | Data Shown |
|-------|-------------|------------|-----------|
| **Loading** | Fetching home data | Show skeleton loaders | N/A |
| **Empty** | No vendors/orders available | Show "No restaurants nearby" message | Suggestion to change location |
| **Partial Data** | Some data loaded, some failed | Show available data + error for failed sections | Retry buttons for failed sections |
| **Full Data** | All data loaded successfully | Show featured vendors, recent orders, promotions | All home screen content |
| **Offline** | No internet connection | Show cached data or offline message | Retry when online |
| **Error** | API error occurred | Show error message with retry button | Retry or go back |

### 1.3 Location/Address States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **No Address** | User hasn't added any address | Show "Add Address" prompt | Add first address |
| **One Address** | User has one saved address | Show address, allow add more | Use or add another |
| **Multiple Addresses** | User has 2+ saved addresses | Show list, allow select default | Select, edit, or add new |
| **Address Pending** | Address verification in progress | Show "Verifying..." status | Wait or edit |
| **Address Verified** | Address verified and active | Show address with checkmark | Use for orders |
| **Address Invalid** | Address failed verification | Show error, allow re-enter | Re-enter or delete |

---

## 2. Order & Cart Workflow States

### 2.1 Shopping Cart States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Empty Cart** | No items in cart | Show empty state with "Start Shopping" | Browse marketplace |
| **Items Added** | 1+ items in cart | Show items, total, checkout button | Add more, remove, checkout |
| **Minimum Not Met** | Items total < minimum order | Show warning "Min order: $X" | Add more items |
| **Minimum Met** | Items total >= minimum order | Enable checkout button | Proceed to checkout |
| **Item Out of Stock** | Item no longer available | Show "Out of Stock" badge | Remove or replace |
| **Vendor Closed** | Vendor closed for day | Show "Vendor Closed" message | Select different vendor |
| **Cart Expired** | Items in cart > 30 min old | Show "Cart expired, refresh?" | Refresh or clear |

### 2.2 Order States
| State | Description | UI Behavior | Duration | Next Actions |
|-------|-------------|------------|----------|--------------|
| **Pending** | Order placed, awaiting vendor confirmation | Show "Confirming..." status | 1-5 min | Cancel or wait |
| **Confirmed** | Vendor accepted the order | Show "Confirmed" with prep time | 5-30 min | Track or cancel |
| **Preparing** | Vendor preparing the order | Show "Preparing..." with timer | 10-45 min | Track or wait |
| **Ready** | Order ready for pickup/delivery | Show "Ready for pickup" | 1-5 min | Tasker pickup |
| **Assigned** | Tasker assigned to delivery | Show "Tasker assigned" with details | 2-10 min | Track delivery |
| **Picked Up** | Tasker picked up the order | Show "On the way" with ETA | 5-30 min | Track delivery |
| **In Transit** | Tasker delivering the order | Show live tracking on map | 5-30 min | Track or contact |
| **Delivered** | Order delivered successfully | Show "Delivered" with timestamp | 0 min | Rate order |
| **Cancelled** | Order cancelled by user/vendor | Show "Cancelled" with reason | 0 min | Reorder or browse |
| **Failed** | Delivery failed (customer not home) | Show "Delivery failed" with reason | 0 min | Reschedule or refund |
| **Completed** | Order completed and rated | Show "Completed" with rating | 0 min | Reorder |

### 2.3 Payment States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Payment Pending** | Waiting for payment | Show "Processing payment..." | Wait or retry |
| **Payment Authorized** | Payment authorized but not captured | Show "Payment authorized" | Proceed or cancel |
| **Payment Captured** | Payment successfully captured | Show "Payment confirmed" | Order confirmed |
| **Payment Failed** | Payment declined/failed | Show error message with reason | Retry with different method |
| **Payment Refunded** | Payment refunded to customer | Show "Refunded" with amount | N/A |
| **Partial Refund** | Partial refund issued | Show "Partial refund" with amount | N/A |

---

## 3. Loan/Credit Workflow States

### 3.1 Loan Eligibility States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Not Eligible** | User doesn't meet loan requirements | Show "Not eligible" message | View requirements |
| **Eligible** | User meets all loan requirements | Show "Apply for loan" button | Apply for loan |
| **Pending Review** | Loan application under review | Show "Application pending..." | Wait or check status |
| **Approved** | Loan application approved | Show "Approved" with amount | Accept or decline |
| **Declined** | Loan application declined | Show "Declined" with reason | Appeal or reapply later |
| **Expired** | Loan offer expired | Show "Offer expired" | Reapply |

### 3.2 Active Loan States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **No Loan** | User has no active loan | Show "No active loans" | Apply for loan |
| **Loan Active** | User has active loan | Show loan details, balance, due date | Make payment, view schedule |
| **Partially Paid** | Loan partially paid (50-99%) | Show progress bar, remaining balance | Make final payment |
| **Fully Paid** | Loan fully paid | Show "Loan completed" | Apply for new loan |
| **Overdue** | Loan payment overdue | Show "Payment overdue" with penalty | Pay immediately |
| **Default** | Loan in default (30+ days overdue) | Show "Account in default" | Contact support, pay |
| **Suspended** | Loan suspended (missed payments) | Show "Loan suspended" | Catch up on payments |

### 3.3 Loan Payment Schedule States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Not Started** | Payment schedule not started | Show schedule with start date | Wait for start date |
| **On Track** | All payments made on time | Show "On track" with next due date | Continue payments |
| **Behind** | 1-2 payments missed | Show "Behind" with catch-up option | Make missed payments |
| **Severely Behind** | 3+ payments missed | Show "Severely behind" warning | Contact support |
| **Completed** | All payments completed | Show "Schedule completed" | N/A |

---

## 4. Marketplace & Vendor States

### 4.1 Vendor/Restaurant States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Closed** | Vendor not open for business | Show "Closed" badge, disabled | Check opening hours |
| **Opening Soon** | Vendor opening in <1 hour | Show "Opening soon" with timer | Set reminder |
| **Open** | Vendor actively taking orders | Show "Open" badge, enabled | Browse menu |
| **Busy** | Vendor at capacity | Show "Busy - long wait" warning | Choose different vendor |
| **Closing Soon** | Vendor closing in <30 min | Show "Closing soon" warning | Hurry or choose other |
| **Temporarily Closed** | Vendor temporarily closed | Show "Temporarily closed" | Check back later |
| **Permanently Closed** | Vendor no longer operating | Show "Permanently closed" | N/A |

### 4.2 Product/Menu Item States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Available** | Item in stock and available | Show normal, enabled | Add to cart |
| **Low Stock** | Item has <5 units left | Show "Only X left" warning | Add quickly |
| **Out of Stock** | Item not available | Show "Out of stock" disabled | Choose alternative |
| **Coming Soon** | Item coming to menu soon | Show "Coming soon" | Set reminder |
| **Discontinued** | Item no longer available | Show "Discontinued" | Choose alternative |
| **On Sale** | Item on promotional sale | Show discount badge | Add to cart |
| **Limited Time** | Item available for limited time | Show "Limited time" timer | Hurry |

---

## 5. Delivery & Tracking States

### 5.1 Delivery Assignment States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **No Tasker** | No tasker assigned yet | Show "Finding tasker..." | Wait |
| **Tasker Assigned** | Tasker assigned to delivery | Show tasker details, photo | Track or contact |
| **Tasker Accepted** | Tasker accepted the delivery | Show "Accepted" status | Track |
| **Tasker Rejected** | Tasker rejected delivery | Show "Finding new tasker..." | Wait |
| **Tasker Cancelled** | Tasker cancelled mid-delivery | Show "Finding new tasker..." | Wait |

### 5.2 Real-Time Tracking States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Location Unavailable** | GPS not available | Show "Location unavailable" | Wait or refresh |
| **Location Updating** | Fetching live location | Show "Updating location..." | Wait |
| **Location Updated** | Live location available | Show map with marker, ETA | Track |
| **Location Stale** | Last update >5 min ago | Show "Last update X min ago" | Refresh |
| **Delivery Complete** | Delivery arrived | Show "Delivered" with time | Rate |

---

## 6. Tasker/Driver Workflow States

### 6.1 Tasker Availability States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Offline** | Tasker app closed/logged out | Show "Offline" | Log in |
| **Online Idle** | Tasker online, no active task | Show "Online" with available jobs | Accept job |
| **On Task** | Tasker actively delivering | Show "On task" with details | Complete task |
| **Break** | Tasker on scheduled break | Show "On break" with timer | Resume when ready |
| **Offline Break** | Tasker offline on break | Show "On break" | Resume when ready |

### 6.2 Tasker Task States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Available** | Task available for acceptance | Show task details, accept button | Accept or skip |
| **Accepted** | Tasker accepted the task | Show "Accepted" with pickup details | Navigate to pickup |
| **Picked Up** | Tasker picked up delivery | Show "Picked up" with delivery details | Navigate to delivery |
| **In Transit** | Tasker in transit to delivery | Show "In transit" with ETA | Continue delivery |
| **Arrived** | Tasker arrived at delivery | Show "Arrived" with confirmation | Complete delivery |
| **Completed** | Task completed successfully | Show "Completed" with earnings | Next task |
| **Cancelled** | Task cancelled by system/user | Show "Cancelled" with reason | Accept new task |
| **Failed** | Task failed (customer not home) | Show "Failed" with reason | Report issue |

### 6.3 Earnings States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **No Earnings** | Tasker hasn't completed any tasks | Show "$0.00 earned today" | Accept tasks |
| **Earnings Pending** | Earnings from completed tasks | Show "Pending" with amount | Wait for settlement |
| **Earnings Settled** | Earnings transferred to wallet | Show settled amount | Withdraw or use |
| **Earnings Held** | Earnings held due to dispute | Show "On hold" with reason | Resolve dispute |

---

## 7. Authentication & Account States

### 7.1 Authentication States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Not Authenticated** | User not logged in | Show login/signup screens | Log in or sign up |
| **Phone Entered** | Phone number entered, awaiting OTP | Show "Sending OTP..." | Wait for OTP |
| **OTP Sent** | OTP sent to phone | Show OTP input field | Enter OTP |
| **OTP Verified** | OTP verified successfully | Show role selection | Select role |
| **Role Selected** | User selected role (customer/tasker) | Show dashboard | Start using app |
| **Authenticated** | User logged in and active | Show full app | Use app |
| **Session Expired** | User session expired | Show "Session expired" | Log in again |
| **Logged Out** | User logged out | Show login screen | Log in again |

### 7.2 Profile Completion States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Incomplete** | Profile missing required fields | Show "Complete profile" prompt | Fill missing fields |
| **Partially Complete** | Profile has some fields | Show "Update profile" prompt | Add more details |
| **Complete** | All required profile fields filled | Show "Profile complete" | Use app |
| **Verified** | Profile verified (ID, etc.) | Show "Verified" badge | N/A |
| **Pending Verification** | Awaiting ID verification | Show "Pending verification..." | Wait or upload docs |
| **Verification Failed** | ID verification failed | Show "Verification failed" | Resubmit or contact support |

---

## 8. Notification & Alert States

### 8.1 Notification States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Unread** | Notification not yet seen | Show badge, highlight | Read notification |
| **Read** | Notification seen by user | Show normal, no badge | Archive or delete |
| **Archived** | Notification archived | Show in archive folder | Restore or delete |
| **Deleted** | Notification deleted | Not visible | N/A |

### 8.2 Notification Types
| Type | Example | Trigger | Action |
|------|---------|---------|--------|
| **Order Status** | "Order confirmed" | Order state change | View order |
| **Delivery Update** | "Tasker arriving in 5 min" | Delivery progress | Track delivery |
| **Promotion** | "20% off today only" | New promotion | View offer |
| **Payment** | "Payment failed" | Payment error | Retry payment |
| **Loan** | "Loan approved" | Loan decision | View details |
| **System** | "Maintenance scheduled" | System event | Acknowledge |

---

## 9. Error & Exception States

### 9.1 Network Error States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **No Internet** | Device offline | Show offline banner | Reconnect |
| **Slow Connection** | Network very slow | Show "Slow connection" warning | Wait or retry |
| **Connection Lost** | Connection dropped mid-request | Show "Connection lost" | Retry |
| **Server Error** | Server returned 5xx error | Show "Server error" | Retry later |
| **API Timeout** | Request timed out | Show "Request timed out" | Retry |

### 9.2 Validation Error States
| State | Description | UI Behavior | Next Actions |
|-------|-------------|------------|--------------|
| **Invalid Input** | User entered invalid data | Show field error message | Correct input |
| **Missing Field** | Required field empty | Show "Required field" | Fill field |
| **Duplicate Entry** | Entry already exists | Show "Already exists" | Use existing or modify |
| **Format Error** | Input format incorrect | Show "Invalid format" | Correct format |

---

## 10. Loading & Skeleton States

### 10.1 Loading States
| State | Description | UI Behavior | Duration |
|-------|-------------|------------|----------|
| **Initial Load** | First time loading screen | Show skeleton loaders | 1-3 sec |
| **Refreshing** | User pulled to refresh | Show refresh spinner | 1-2 sec |
| **Pagination** | Loading next page of results | Show loading indicator at bottom | 1-2 sec |
| **Infinite Scroll** | Auto-loading more items | Show loading spinner | 1-2 sec |
| **Search** | Searching for results | Show search spinner | 2-5 sec |

---

## Summary: State Management Strategy

### Key Principles:
1. **Every screen must handle all possible states** - Don't assume happy path
2. **Empty states are important** - Show helpful messages, not blank screens
3. **Error states need recovery paths** - Always provide retry or alternative actions
4. **Loading states need feedback** - Use skeletons or spinners, not blank screens
5. **State transitions should be clear** - Show progress indicators for long operations
6. **Offline support is critical** - Cache data and show offline state
7. **Error messages should be actionable** - Tell users what went wrong and how to fix it

### Implementation Checklist:
- [ ] Define all states for each screen
- [ ] Create UI mockups for each state
- [ ] Implement state management (Zustand stores)
- [ ] Add error boundaries and fallbacks
- [ ] Test all state transitions
- [ ] Add loading indicators
- [ ] Implement offline caching
- [ ] Create error recovery flows
