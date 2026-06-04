Here’s a clean, copy-and-paste ready Markdown version of your Header component documentation:

````markdown
# 🎯 Header Component Capabilities

## 🏗️ Core Features
- **Dynamic Title & Subtitle** – Configurable main heading and descriptive text  
- **Breadcrumb Navigation** – Automatic breadcrumb generation with separators  
- **Action Area** – Flexible container for buttons, search, and custom components  
- **Theme Integration** – Full dark/light mode support with semantic colors  
- **Responsive Design** – Adapts to different screen sizes automatically  

---

## 🔧 Built-in Components

### 1. **HeaderSearch**
```tsx
<HeaderSearch 
  placeholder="Search anything..."
  onSearch={(query) => handleSearch(query)}
/>
````

* **Features** – Search icon, focus states, form submission
* **Styling** – Theme-aware, backdrop blur, smooth transitions
* **Functionality** – Controlled input with search handler

---

### 2. **HeaderButton**

```tsx
<HeaderButton variant="primary|secondary|default" onClick={handleClick}>
  Action Text
</HeaderButton>
```

* **Variants** – Primary (green), Secondary, Default (card style)
* **Features** – Hover scaling, active states, backdrop blur
* **Styling** – Modern button design with shadows

---

### 3. **HeaderIconButton**

```tsx
<HeaderIconButton title="Tooltip" onClick={handleClick}>
  <YourIcon />
</HeaderIconButton>
```

* **Features** – Icon scaling on hover, tooltip support
* **Styling** – Card background, border effects, smooth animations

---

## 🚀 Easy Extension Examples

### 1. **Notification Bell**

```tsx
<HeaderIconButton title="Notifications">
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
</HeaderIconButton>
```

---

### 2. **User Profile Dropdown**

```tsx
<HeaderButton variant="default" onClick={() => setProfileOpen(!profileOpen)}>
  <div className="flex items-center space-x-2">
    <img src="/avatar.jpg" className="w-6 h-6 rounded-full" />
    <span>John Doe</span>
  </div>
</HeaderButton>
```

---

### 3. **Quick Filters**

```tsx
<HeaderButton variant="secondary" onClick={toggleFilters}>
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
  Filters
</HeaderButton>
```

---

### 4. **Custom Status Indicator**

```tsx
<div className="flex items-center space-x-2 px-3 py-2 bg-card rounded-lg border border-border/50">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
  <span className="text-sm text-card-foreground">System Online</span>
</div>
```

---

## 🎨 Advanced Customization

### 1. Multiple Headers for Different Pages

```tsx
// Dashboard Header
<Header 
  title="Dashboard"
  subtitle="Overview of all metrics"
  breadcrumbItems={["Home", "Dashboard"]}
  actions={<DashboardActions />}
/>

// Analytics Header  
<Header 
  title="Analytics"
  subtitle="Deep dive into model performance"
  breadcrumbItems={["Home", "Analytics", "Performance"]}
  actions={<AnalyticsActions />}
/>
```

---

### 2. Custom Action Components

```tsx
const CustomActions = () => (
  <>
    <HeaderSearch placeholder="Search analytics..." />
    <div className="flex items-center space-x-1 bg-card rounded-lg border border-border/50 p-1">
      <button className="px-3 py-1 rounded text-sm bg-primary text-primary-foreground">Day</button>
      <button className="px-3 py-1 rounded text-sm hover:bg-muted">Week</button>
      <button className="px-3 py-1 rounded text-sm hover:bg-muted">Month</button>
    </div>
    <HeaderButton variant="primary">Generate Report</HeaderButton>
  </>
);
```

---

### 3. Conditional Actions Based on User Role

```tsx
actions={
  <>
    <HeaderSearch />
    {user.role === 'admin' && (
      <HeaderButton variant="secondary">Admin Panel</HeaderButton>
    )}
    {user.permissions.includes('export') && (
      <HeaderButton variant="primary">Export</HeaderButton>
    )}
  </>
}
```

---

## 🔧 Extension Architecture

**Easy to Add**
✅ New Button Variants – Just add to the `variantClasses` object
✅ Custom Icons – Drop any SVG into `HeaderIconButton`
✅ Complex Components – Use the `actions` prop for anything
✅ Conditional Logic – Show/hide based on state or props

**Built-in Flexibility**
✅ Theme Aware – All components automatically follow your theme
✅ Responsive – Components adapt to screen size
✅ Accessible – Proper ARIA labels and keyboard navigation
✅ Performant – Optimized animations and transitions

---

## 🚀 Summary

The **Header** component is designed to be a flexible foundation that can grow with your application needs while maintaining consistent styling and behavior.

```

---

If you want, I can also **merge this Header markdown with your Pill markdown** into a single, well-structured `COMPONENTS.md` so your docs are unified. That way, all your component features live in one place for your dashboard library. Would you like me to do that?
```
