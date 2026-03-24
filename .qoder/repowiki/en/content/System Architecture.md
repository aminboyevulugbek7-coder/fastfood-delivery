# System Architecture

<cite>
**Referenced Files in This Document**
- [config.php](file://config.php)
- [index.php](file://index.php)
- [admin.php](file://admin.php)
- [orders.php](file://orders.php)
- [checkout.php](file://checkout.php)
- [style.css](file://style.css)
- [database.sql](file://database.sql)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the architectural design of a Food Delivery System built with PHP and MySQL. The system follows a simplified Model-View-Controller (MVC) pattern with clear separation between:
- Data layer: centralized database configuration and utility functions
- Presentation layer: PHP-driven HTML templates with shared styles
- Business logic: request handling, validation, and data manipulation

Key architectural patterns include:
- Singleton-like database connection via a global utility function
- Session-based authentication for administrative access
- Centralized utility functions for database operations, formatting, and navigation
- Stateless presentation pages with minimal embedded logic

## Project Structure
The project consists of seven files organized around a flat MVC structure:
- config.php: central configuration, database connection, and utility functions
- index.php: customer-facing menu and shopping interface
- orders.php: customer order history/search page
- checkout.php: order placement form and confirmation
- admin.php: administrative panel for managing orders and food items
- style.css: shared presentation styling
- database.sql: database schema and sample data

```mermaid
graph TB
subgraph "Presentation Layer"
IDX["index.php"]
ORD["orders.php"]
CHK["checkout.php"]
ADM["admin.php"]
CSS["style.css"]
end
subgraph "Business Logic Layer"
CFG["config.php"]
end
subgraph "Data Layer"
DB["MySQL Database"]
end
IDX --> CFG
ORD --> CFG
CHK --> CFG
ADM --> CFG
CFG --> DB
IDX --> CSS
ORD --> CSS
CHK --> CSS
ADM --> CSS
```

**Diagram sources**
- [config.php:1-71](file://config.php#L1-L71)
- [index.php:1-203](file://index.php#L1-L203)
- [orders.php:1-137](file://orders.php#L1-L137)
- [checkout.php:1-127](file://checkout.php#L1-L127)
- [admin.php:1-312](file://admin.php#L1-L312)
- [style.css:1-610](file://style.css#L1-L610)

**Section sources**
- [config.php:1-71](file://config.php#L1-L71)
- [index.php:1-203](file://index.php#L1-L203)
- [orders.php:1-137](file://orders.php#L1-L137)
- [checkout.php:1-127](file://checkout.php#L1-L127)
- [admin.php:1-312](file://admin.php#L1-L312)
- [style.css:1-610](file://style.css#L1-L610)
- [database.sql:1-54](file://database.sql#L1-L54)

## Core Components
This section documents the primary components and their roles in the system.

- config.php
  - Provides database constants and a singleton-like connection function
  - Exposes utility functions for formatting prices, retrieving foods and categories, and session-based admin checks
  - Starts sessions automatically if not already started
  - Redirects users to specified URLs

- index.php
  - Customer menu page with category filtering and cart management
  - Uses localStorage for client-side cart persistence
  - Integrates with config.php for data retrieval and formatting

- orders.php
  - Allows customers to search their orders by phone number
  - Displays order details and associated items

- checkout.php
  - Processes order creation and payment submission
  - Calculates totals and persists order data to the database

- admin.php
  - Administrative login and session management
  - Manages order statuses and food inventory
  - Provides forms for adding, editing, and deleting food items

- style.css
  - Shared styling for all pages, including responsive design and UI components

**Section sources**
- [config.php:1-71](file://config.php#L1-L71)
- [index.php:1-203](file://index.php#L1-L203)
- [orders.php:1-137](file://orders.php#L1-L137)
- [checkout.php:1-127](file://checkout.php#L1-L127)
- [admin.php:1-312](file://admin.php#L1-L312)
- [style.css:1-610](file://style.css#L1-L610)

## Architecture Overview
The system implements a simplified MVC pattern:
- Model: represented by database tables and centralized utility functions in config.php
- View: PHP-generated HTML pages (index.php, orders.php, checkout.php, admin.php) styled by style.css
- Controller: PHP scripts handle requests, validate input, and orchestrate data retrieval and updates

```mermaid
graph TB
subgraph "Customer Flow"
CUST["Customer Browser"]
IDX["index.php"]
ORD["orders.php"]
CHK["checkout.php"]
end
subgraph "Admin Flow"
ADMIN["Admin Browser"]
ADM["admin.php"]
end
subgraph "Shared Services"
CFG["config.php"]
DB["MySQL Database"]
CSS["style.css"]
end
CUST --> IDX
CUST --> ORD
CUST --> CHK
ADMIN --> ADM
IDX --> CFG
ORD --> CFG
CHK --> CFG
ADM --> CFG
CFG --> DB
IDX --> CSS
ORD --> CSS
CHK --> CSS
ADM --> CSS
```

**Diagram sources**
- [config.php:1-71](file://config.php#L1-L71)
- [index.php:1-203](file://index.php#L1-L203)
- [orders.php:1-137](file://orders.php#L1-L137)
- [checkout.php:1-127](file://checkout.php#L1-L127)
- [admin.php:1-312](file://admin.php#L1-L312)
- [style.css:1-610](file://style.css#L1-L610)

## Detailed Component Analysis

### Database Connection Pattern (Singleton-like)
The system uses a centralized database connection function that behaves like a singleton:
- Ensures a single mysqli connection instance per request
- Sets UTF-8 character set for consistent data handling
- Handles connection errors by terminating execution with an error message

```mermaid
sequenceDiagram
participant Page as "PHP Page"
participant Config as "config.php"
participant DB as "MySQL Server"
Page->>Config : "getDB()"
Config->>Config : "Check if static connection exists"
alt "First call"
Config->>DB : "new mysqli(...)"
DB-->>Config : "Connection object"
Config->>Config : "Set charset utf8mb4"
else "Subsequent calls"
Config->>Config : "Return existing connection"
end
Config-->>Page : "mysqli connection"
```

**Diagram sources**
- [config.php:10-20](file://config.php#L10-L20)

**Section sources**
- [config.php:10-20](file://config.php#L10-L20)

### Session-Based Authentication System
Administrative access is controlled via session variables:
- Login sets a session flag indicating admin privileges
- Logout clears the session and redirects to the admin page
- Pages check for admin status before rendering admin-specific content

```mermaid
sequenceDiagram
participant Admin as "Admin Browser"
participant AdminPage as "admin.php"
participant Session as "PHP Session"
participant Config as "config.php"
Admin->>AdminPage : "POST login"
AdminPage->>AdminPage : "Validate password"
alt "Valid"
AdminPage->>Session : "Set admin=true"
AdminPage->>AdminPage : "Redirect to admin.php"
else "Invalid"
AdminPage->>AdminPage : "Show error"
end
Admin->>AdminPage : "GET orders/foods"
AdminPage->>Config : "isAdmin()"
Config-->>AdminPage : "true/false"
alt "Admin"
AdminPage->>AdminPage : "Render admin content"
else "Non-admin"
AdminPage->>AdminPage : "Render login form"
end
```

**Diagram sources**
- [admin.php:4-17](file://admin.php#L4-L17)
- [config.php:56-65](file://config.php#L56-L65)

**Section sources**
- [admin.php:4-17](file://admin.php#L4-L17)
- [config.php:56-65](file://config.php#L56-L65)

### Centralized Utility Functions Approach
Utility functions encapsulate common operations:
- Data retrieval: getFoods(), getFoodById(), getCategories()
- Formatting: formatPrice()
- Navigation: redirect()
- Authentication: isAdmin()

```mermaid
flowchart TD
Start(["Call Utility"]) --> Type{"Which utility?"}
Type --> |getFoods| GetFoods["Query foods with optional category filter"]
Type --> |getFoodById| GetFoodById["Query single food by ID"]
Type --> |getCategories| GetCategories["Return predefined categories"]
Type --> |formatPrice| FormatPrice["Format numeric price with currency"]
Type --> |isAdmin| IsAdmin["Check session admin flag"]
Type --> |redirect| Redirect["HTTP redirect to URL"]
GetFoods --> DB["Database"]
GetFoodById --> DB
GetCategories --> Static["Static array"]
FormatPrice --> Output["Formatted string"]
IsAdmin --> Session["Session state"]
Redirect --> HTTP["HTTP Location header"]
DB --> Return["Return result"]
Static --> Return
Session --> Return
HTTP --> End(["End"])
Output --> End
Return --> End
```

**Diagram sources**
- [config.php:27-54](file://config.php#L27-L54)
- [config.php:56-65](file://config.php#L56-L65)

**Section sources**
- [config.php:27-54](file://config.php#L27-L54)
- [config.php:56-65](file://config.php#L56-L65)

### Customer Interface Flow
The customer journey involves browsing menu items, managing a cart, and placing orders.

```mermaid
sequenceDiagram
participant Customer as "Customer Browser"
participant Index as "index.php"
participant Config as "config.php"
participant DB as "MySQL Database"
participant Checkout as "checkout.php"
Customer->>Index : "GET /index.php"
Index->>Config : "getFoods(category?)"
Config->>DB : "SELECT foods..."
DB-->>Config : "Result set"
Config-->>Index : "Foods array"
Index-->>Customer : "Menu HTML with cart controls"
Customer->>Index : "Add to cart (localStorage)"
Customer->>Index : "Open cart sidebar"
Customer->>Index : "Click checkout"
Index->>Checkout : "Redirect to checkout.php"
Customer->>Checkout : "POST order details"
Checkout->>DB : "Insert order + order_items"
DB-->>Checkout : "Success"
Checkout-->>Customer : "Confirmation + redirect"
```

**Diagram sources**
- [index.php:1-203](file://index.php#L1-L203)
- [config.php:27-54](file://config.php#L27-L54)
- [checkout.php:1-127](file://checkout.php#L1-L127)

**Section sources**
- [index.php:1-203](file://index.php#L1-L203)
- [checkout.php:1-127](file://checkout.php#L1-L127)

### Order Management Flow
Order management spans customer and administrative views.

```mermaid
sequenceDiagram
participant Customer as "Customer Browser"
participant Orders as "orders.php"
participant Config as "config.php"
participant DB as "MySQL Database"
Customer->>Orders : "GET /orders.php?phone=..."
Orders->>Config : "getDB()"
Config-->>Orders : "Connection"
Orders->>DB : "SELECT orders WHERE phone LIKE %phone%"
DB-->>Orders : "Orders list"
Orders->>Config : "getOrderItems(orderId)"
Config-->>Orders : "Order items"
Orders-->>Customer : "Order details HTML"
```

**Diagram sources**
- [orders.php:1-137](file://orders.php#L1-L137)
- [config.php:27-54](file://config.php#L27-L54)

**Section sources**
- [orders.php:1-137](file://orders.php#L1-L137)

### Administrative Functions Flow
Administrators can manage orders and food inventory.

```mermaid
sequenceDiagram
participant Admin as "Admin Browser"
participant AdminPage as "admin.php"
participant Config as "config.php"
participant DB as "MySQL Database"
Admin->>AdminPage : "POST login"
AdminPage->>AdminPage : "Set session admin"
Admin->>AdminPage : "GET /admin.php?tab=orders"
AdminPage->>Config : "isAdmin()"
Config-->>AdminPage : "true"
AdminPage->>DB : "SELECT orders"
AdminPage->>DB : "SELECT foods"
AdminPage-->>Admin : "Orders and food lists"
Admin->>AdminPage : "POST update_status"
AdminPage->>DB : "UPDATE orders SET status=? WHERE id=?"
AdminPage-->>Admin : "Redirect to orders tab"
Admin->>AdminPage : "POST save_food"
alt "Edit"
AdminPage->>DB : "UPDATE foods ..."
else "New"
AdminPage->>DB : "INSERT INTO foods ..."
end
AdminPage-->>Admin : "Redirect to foods tab"
Admin->>AdminPage : "GET delete_food"
AdminPage->>DB : "DELETE FROM foods WHERE id=?"
AdminPage-->>Admin : "Redirect to foods tab"
```

**Diagram sources**
- [admin.php:1-312](file://admin.php#L1-L312)
- [config.php:56-65](file://config.php#L56-L65)

**Section sources**
- [admin.php:1-312](file://admin.php#L1-L312)

## Dependency Analysis
The system exhibits a unidirectional dependency chain from presentation to business logic to data.

```mermaid
graph LR
IDX["index.php"] --> CFG["config.php"]
ORD["orders.php"] --> CFG
CHK["checkout.php"] --> CFG
ADM["admin.php"] --> CFG
CFG --> DB["MySQL Database"]
IDX --> CSS["style.css"]
ORD --> CSS
CHK --> CSS
ADM --> CSS
```

**Diagram sources**
- [index.php:1-203](file://index.php#L1-L203)
- [orders.php:1-137](file://orders.php#L1-L137)
- [checkout.php:1-127](file://checkout.php#L1-L127)
- [admin.php:1-312](file://admin.php#L1-L312)
- [config.php:1-71](file://config.php#L1-L71)
- [style.css:1-610](file://style.css#L1-L610)

**Section sources**
- [index.php:1-203](file://index.php#L1-L203)
- [orders.php:1-137](file://orders.php#L1-L137)
- [checkout.php:1-127](file://checkout.php#L1-L127)
- [admin.php:1-312](file://admin.php#L1-L312)
- [config.php:1-71](file://config.php#L1-L71)
- [style.css:1-610](file://style.css#L1-L610)

## Performance Considerations
- Database connections: The singleton-like connection reduces overhead but keeps connections open for the duration of the request lifecycle. Consider closing connections explicitly if scaling horizontally.
- Prepared statements: Used consistently for all dynamic queries, preventing SQL injection and improving performance through statement caching.
- Client-side cart: LocalStorage usage avoids server round-trips for cart operations, improving perceived responsiveness.
- Category filtering: Efficient server-side filtering with prepared statements and optional category parameterization.
- Admin operations: Batch operations (bulk order status updates) are handled server-side with minimal client interaction.

## Troubleshooting Guide
Common issues and resolutions:
- Database connectivity failures: Verify database credentials and availability; the connection function terminates execution on failure.
- Session-related problems: Ensure sessions are started before accessing session variables; the configuration file starts sessions automatically.
- Missing or invalid data: Input validation occurs on checkout; ensure required fields are present before submission.
- Admin access denied: Confirm correct password and that session admin flag is set upon successful login.
- Styling inconsistencies: All pages share style.css; verify the stylesheet path and browser cache clearing if styles appear outdated.

**Section sources**
- [config.php:10-20](file://config.php#L10-L20)
- [config.php:67-71](file://config.php#L67-L71)
- [checkout.php:4-36](file://checkout.php#L4-L36)
- [admin.php:5-11](file://admin.php#L5-L11)

## Conclusion
The Food Delivery System demonstrates a clean, educational architecture that separates concerns effectively:
- Data: centralized configuration and utilities
- Presentation: modular PHP templates with shared styling
- Business logic: focused request handling and data operations

The design choices—singleton-like database connection, session-based admin authentication, and centralized utilities—provide a practical foundation suitable for learning while maintaining real-world functionality. The system’s simplicity makes it easy to extend with additional features such as user accounts, payment processing, or advanced reporting.