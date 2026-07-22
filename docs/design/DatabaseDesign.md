# Database Design

---

# Table: Colleges

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Unique college ID |
| name | VARCHAR(150) | NOT NULL | College name |
| code | VARCHAR(20) | UNIQUE | College join code |
| email | VARCHAR(100) | UNIQUE | Official email |
| phone | VARCHAR(15) | NULL | Contact number |
| website | VARCHAR(255) | NULL | College website |
| logo | TEXT | NULL | Logo URL |
| address | TEXT | NULL | College address |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(100) | NOT NULL | State |
| country | VARCHAR(100) | NOT NULL | Country |
| status | ENUM | Active/Inactive | College status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Created date |
| updatedAt | TIMESTAMP | | Last updated |

---

# Table: Roles

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Role ID |
| roleName | VARCHAR(50) | UNIQUE | Student/Admin/etc |
| description | TEXT | NULL | Role description |

Student

Faculty

Club Coordinator

College Admin

Super Admin

---

# Table: Users

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | User ID |
| collegeId | UUID | FK | Colleges.id |
| roleId | UUID | FK | Roles.id |
| firstName | VARCHAR(100) | NOT NULL | First Name |
| lastName | VARCHAR(100) | NOT NULL | Last Name |
| email | VARCHAR(255) | UNIQUE | Email |
| password | TEXT | NOT NULL | Hashed Password |
| phone | VARCHAR(15) | NULL | Mobile Number |
| profileImage | TEXT | NULL | Profile photo |
| bio | TEXT | NULL | About user |
| department | VARCHAR(100) | NULL | Department |
| year | INTEGER | NULL | Study year |
| isVerified | BOOLEAN | DEFAULT FALSE | Email verification |
| status | ENUM | Active/Blocked | Account status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Created date |
| updatedAt | TIMESTAMP | | Updated date |

---

Colleges
    │
    │ 1
    │
    ▼
Users
    ▲
    │
    │ Many
    │
Roles

---

# Table: Categories

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Category ID |
| name | VARCHAR(100) | UNIQUE | Category Name |
| description | TEXT | NULL | Category Description |
| icon | TEXT | NULL | Category Icon |

ex. Technical
    Workshop
    Hackathon
    Sports
    Cultural
    Seminar
    Placement
    Competition

---

# Table: Events

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Event ID |
| collegeId | UUID | FK | Colleges.id |
| categoryId | UUID | FK | Categories.id |
| createdBy | UUID | FK | Users.id |
| title | VARCHAR(255) | NOT NULL | Event Title |
| description | TEXT | NOT NULL | Event Description |
| venue | VARCHAR(255) | NOT NULL | Event Venue |
| startDate | TIMESTAMP | NOT NULL | Start Date |
| endDate | TIMESTAMP | NOT NULL | End Date |
| registrationDeadline | TIMESTAMP | NULL | Last Registration Date |
| maxParticipants | INTEGER | NULL | Registration Limit |
| requiresApproval | BOOLEAN | DEFAULT FALSE | Manual Approval |
| qrAttendance | BOOLEAN | DEFAULT TRUE | QR Attendance |
| featured | BOOLEAN | DEFAULT FALSE | Featured Event |
| status | ENUM | Upcoming/Ongoing/Completed/Cancelled |
| coverImage | TEXT | NULL | Event Poster |
| createdAt | TIMESTAMP | DEFAULT NOW() | Created Date |
| updatedAt | TIMESTAMP | | Updated Date |

---

# Table: Registrations

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Registration ID |
| eventId | UUID | FK | Events.id |
| userId | UUID | FK | Users.id |
| status | ENUM | Pending/Approved/Rejected/Cancelled |
| qrCode | TEXT | NULL | QR Code |
| registeredAt | TIMESTAMP | DEFAULT NOW() | Registration Date |

---

# Table: EventImages

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Image ID |
| eventId | UUID | FK | Events.id |
| imageUrl | TEXT | NOT NULL | Image URL |
| uploadedBy | UUID | FK | Users.id |

---

College
   │
   └────── Events
               │
               ├──── Category
               │
               ├──── Event Images
               │
               └──── Registrations
                        │
                        └──── Users

                        
---

# Table: Notifications

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Notification ID |
| userId | UUID | FK | Users.id |
| title | VARCHAR(255) | NOT NULL | Notification Title |
| message | TEXT | NOT NULL | Notification Message |
| type | ENUM | Event/System/Reminder |
| isRead | BOOLEAN | DEFAULT FALSE | Read Status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Created Date |

---

# Table: Certificates

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Certificate ID |
| eventId | UUID | FK | Events.id |
| userId | UUID | FK | Users.id |
| certificateUrl | TEXT | NOT NULL | PDF URL |
| issuedAt | TIMESTAMP | DEFAULT NOW() | Issue Date |

---

# Table: Bookmarks

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Bookmark ID |
| userId | UUID | FK | Users.id |
| eventId | UUID | FK | Events.id |
| createdAt | TIMESTAMP | DEFAULT NOW() | Saved Date |

---

# Table: Feedback

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Feedback ID |
| eventId | UUID | FK | Events.id |
| userId | UUID | FK | Users.id |
| rating | INTEGER | CHECK (1-5) | Rating |
| comment | TEXT | NULL | Feedback |
| createdAt | TIMESTAMP | DEFAULT NOW() | Created Date |

---

# Table: Discussions

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Discussion ID |
| eventId | UUID | FK | Events.id |
| userId | UUID | FK | Users.id |
| message | TEXT | NOT NULL | Question/Comment |
| createdAt | TIMESTAMP | DEFAULT NOW() | Created Date |

---

# Table: Attendance

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Attendance ID |
| eventId | UUID | FK | Events.id |
| userId | UUID | FK | Users.id |
| status | ENUM | Present/Absent |
| scannedAt | TIMESTAMP | NULL | QR Scan Time |

---

# Table: Clubs

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Club ID |
| collegeId | UUID | FK | Colleges.id |
| name | VARCHAR(255) | NOT NULL | Club Name |
| description | TEXT | NULL | Club Description |
| logo | TEXT | NULL | Club Logo |

---

# Table: ClubMembers

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Membership ID |
| clubId | UUID | FK | Clubs.id |
| userId | UUID | FK | Users.id |
| role | VARCHAR(100) | Member/Coordinator |
| joinedAt | TIMESTAMP | DEFAULT NOW() | Join Date |

---

# Table: UserInterests

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Interest ID |
| userId | UUID | FK | Users.id |
| categoryId | UUID | FK | Categories.id |
