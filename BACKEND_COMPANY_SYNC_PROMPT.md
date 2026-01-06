# Backend Synchronization: Company Terminology Updates

## 🎯 **PURPOSE**
The frontend has been updated to use company-appropriate terminology instead of school-specific terms. The backend needs corresponding updates to maintain consistency.

## 📋 **TERMINOLOGY CHANGES REQUIRED**

### **1. Database Schema Updates**
**CRITICAL**: Update table names and column values to match new terminology.

#### **Table Renames**
```sql
-- Rename tables to match company terminology
ALTER TABLE students RENAME TO employees;
ALTER TABLE cohorts RENAME TO teams;
ALTER TABLE classes RENAME TO project_types;
```

#### **Role Enum Updates**
```sql
-- Update role values in users table
UPDATE users SET role = 'Employee' WHERE role = 'Student';
UPDATE users SET role = 'Manager' WHERE role = 'Manager'; -- Keep Admin as Manager

-- Update any role-based logic in your application
```

#### **Column References Updates**
```sql
-- Update foreign key column names if they reference renamed tables
-- Example: If you have project.cohort_id → project.team_id
ALTER TABLE projects RENAME COLUMN cohort_id TO team_id;
ALTER TABLE projects RENAME COLUMN class_id TO project_type_id;
```

### **2. API Endpoint Updates**
**IMPORTANT**: Update all API responses and database queries to use new terminology.

#### **User Roles API**
```javascript
// In user registration/login responses
// BEFORE:
{ role: 'Student' }

// AFTER:
{ role: 'Employee' }

// BEFORE:
{ role: 'Admin' }

// AFTER:
{ role: 'Manager' }
```

#### **Data Structure Changes**
```javascript
// Cohorts → Teams
// BEFORE:
{
  cohorts: [
    { id: 1, name: 'Web Development Cohort' }
  ]
}

// AFTER:
{
  teams: [
    { id: 1, name: 'Frontend Team' }
  ]
}

// Classes → Project Types
// BEFORE:
{
  classes: [
    { id: 1, name: 'Fullstack Development' }
  ]
}

// AFTER:
{
  project_types: [
    { id: 1, name: 'Web Application' }
  ]
}
```

### **3. API Route Updates**
**OPTIONAL but RECOMMENDED**: Update route names for clarity.

```javascript
// Current routes can stay, but consider updating for clarity:
/api/cohorts → /api/teams
/api/classes → /api/project-types

// But maintain backward compatibility if needed
```

### **4. Database Seed Data Updates**
**REQUIRED**: Update any default/seed data.

```sql
-- Update seed data to use company terminology
INSERT INTO teams (name, description) VALUES
('Frontend Team', 'React and Vue.js development'),
('Backend Team', 'Node.js and Python development'),
('DevOps Team', 'Infrastructure and deployment');

INSERT INTO project_types (name, description) VALUES
('Web Application', 'Full-stack web applications'),
('Mobile App', 'iOS and Android applications'),
('API Development', 'REST and GraphQL APIs'),
('Data Analytics', 'Business intelligence and reporting');
```

### **5. Authentication & Authorization Logic**
**CRITICAL**: Update role-based access control.

```javascript
// Update authorization checks throughout the application
// BEFORE:
if (user.role === 'Admin') { /* manager logic */ }
if (user.role === 'Student') { /* employee logic */ }

// AFTER:
if (user.role === 'Manager') { /* manager logic */ }
if (user.role === 'Employee') { /* employee logic */ }

// Keep backward compatibility during transition:
const isManager = (role) => role === 'Manager' || role === 'Admin';
const isEmployee = (role) => role === 'Employee' || role === 'Student';
```

### **6. Email Templates & Notifications**
**REQUIRED**: Update email content and notifications.

```javascript
// Update invitation emails
// BEFORE: "You've been invited to join the Fullstack Development class"
// AFTER:  "You've been invited to join the Web Development project type"

// BEFORE: "Join your cohort project"
// AFTER:  "Join your team project"
```

### **7. Frontend-Backend Contract Updates**
**CRITICAL**: Ensure API responses match frontend expectations.

#### **Dashboard Data Structure**
```javascript
// Projects response should include team/project_type info
{
  projects: [
    {
      id: 1,
      name: "E-commerce Platform",
      team: { id: 1, name: "Frontend Team" },  // formerly cohort
      project_type: { id: 1, name: "Web Application" },  // formerly class
      // ... other fields
    }
  ]
}
```

### **8. Migration Script**
**RECOMMENDED**: Create a database migration script.

```javascript
// migration.js - Run this to update existing data
const migrateToCompanyTerms = async () => {
  // 1. Update user roles
  await db.query("UPDATE users SET role = 'Employee' WHERE role = 'Student'");
  await db.query("UPDATE users SET role = 'Manager' WHERE role = 'Admin'");

  // 2. Rename tables (if supported by your DB)
  // ALTER TABLE statements...

  // 3. Update any stored references in JSON fields
  // Update project metadata, cached data, etc.
};
```

### **9. Testing Updates**
**REQUIRED**: Update all backend tests.

```javascript
// Update test data and assertions
// BEFORE:
expect(user.role).toBe('Student');

// AFTER:
expect(user.role).toBe('Employee');

// BEFORE:
expect(response.body.cohorts).toBeDefined();

// AFTER:
expect(response.body.teams).toBeDefined();
```

### **10. Documentation Updates**
**REQUIRED**: Update API documentation, README, and any other docs.

```markdown
# API Documentation Updates

## User Roles
- `Employee`: Regular team member with project access
- `Manager`: Administrative access to all resources

## Resources
- `teams`: Formerly cohorts - represents departments/teams
- `project_types`: Formerly classes - categorizes project types
- `projects`: Unchanged - individual project instances
```

## 🚨 **IMPLEMENTATION ORDER**

### **Phase 1: Database (REQUIRED)**
1. ✅ Create migration script
2. ✅ Backup database
3. ✅ Run role updates
4. ✅ Rename tables (optional)
5. ✅ Update seed data

### **Phase 2: API Layer (REQUIRED)**
1. ✅ Update role checking logic
2. ✅ Update response structures
3. ✅ Update route handlers
4. ✅ Update validation rules

### **Phase 3: External Systems (RECOMMENDED)**
1. ⏳ Update email templates
2. ⏳ Update notification messages
3. ⏳ Update documentation
4. ⏳ Update tests

## 🧪 **VERIFICATION CHECKLIST**

### **Database**
- [ ] User roles updated (Student→Employee, Admin→Manager)
- [ ] Table names updated (optional)
- [ ] Foreign key references updated
- [ ] Seed data reflects company terms

### **API Responses**
- [ ] User objects return correct role names
- [ ] Dashboard data uses teams/project_types
- [ ] All endpoints return consistent terminology

### **Authentication**
- [ ] Role-based access works with new role names
- [ ] Manager permissions work correctly
- [ ] Employee permissions work correctly

### **User Experience**
- [ ] Email invitations use company terminology
- [ ] Error messages are appropriate
- [ ] All UI labels match backend data

## 🔍 **BACKWARD COMPATIBILITY**

During transition, maintain backward compatibility:

```javascript
// Support both old and new role names temporarily
const normalizeRole = (role) => {
  const roleMap = {
    'Student': 'Employee',
    'Admin': 'Manager',
    'Employee': 'Employee',
    'Manager': 'Manager'
  };
  return roleMap[role] || 'Employee';
};
```

## ⚠️ **ROLLBACK PLAN**

If issues arise:
1. **Frontend**: Can rollback immediately (keeps backward compatibility)
2. **Backend**: Restore from backup if table renames caused issues
3. **Database**: Revert role updates if needed

## 📞 **QUESTIONS?**

If you need clarification on any of these changes or help implementing them, ask the frontend team. These changes ensure the entire application uses consistent company terminology.

**Estimated Implementation Time**: 2-4 hours
**Risk Level**: Medium (data migration involved)
**Testing Required**: Full integration testing + data migration testing