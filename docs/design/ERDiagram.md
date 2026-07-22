# CampusConnect ER Diagram

## Relationships

College (1) --------< (Many) Users

College (1) --------< (Many) Clubs

College (1) --------< (Many) Events

Roles (1) ----------< (Many) Users

Categories (1) -----< (Many) Events

Users (1) ----------< (Many) Registrations >-------- (1) Events

Users (1) ----------< (Many) Notifications

Users (1) ----------< (Many) Bookmarks >------------ (1) Events

Users (1) ----------< (Many) Feedback >------------- (1) Events

Users (1) ----------< (Many) Discussions >---------- (1) Events

Users (1) ----------< (Many) Attendance >----------- (1) Events

Users (1) ----------< (Many) Certificates >--------- (1) Events

Users (1) ----------< (Many) EventImages

Users (1) ----------< (Many) ClubMembers >---------- (1) Clubs

Users (1) ----------< (Many) UserInterests >-------- (1) Categories