## Testing Protocol

### Communication Guidelines with Testing Sub-agents
- Main agent must always read this file before invoking testing agents
- Testing agents should update this file with their findings
- Never edit the Testing Protocol section itself
- Follow the step-by-step approach for systematic testing

### Current Project Status
**Original Requirements**: Production-ready B2B blogging and tools platform with user management, admin controls, blog writing capabilities, AI integration, tool comparisons, and SEO features.

**Current Issues Being Fixed**:
1. Users cannot publish/save blogs (API endpoint mismatch)
2. Cannot add JSON-LD or meta tags/headers (missing UI components)
3. Cannot upload images inside blogs (path/directory issues)
4. Blog writing needs markdown format support
5. Preview shows HTML tags instead of rendered content
6. Need Medium.com-like UX for non-tech users

**Architecture**: FastAPI (Python) + React + SQLAlchemy + Local Storage
**Services**: Backend (port 8001), Frontend (port 3000), managed via supervisor

### Issues Identified
- API endpoint mismatch: Frontend calls `/user/blogs` but backend only has `/api/blogs`
- Missing user-specific blog routes in backend
- Image upload directory creation issues
- Poor markdown preview rendering
- Missing JSON-LD management UI
- No auto-save functionality

### Current Phase: Backend API Fixes
**Next Steps**: 
1. Fix API endpoint mismatches
2. Add user-specific blog routes 
3. Fix image upload functionality
4. Implement enhanced blog editor
5. Add JSON-LD management
6. Add auto-save functionality

### Backend Testing Instructions
Test the following endpoints after fixes:
- GET /api/user/blogs (list user's blogs)
- POST /api/user/blogs (create new blog)
- PUT /api/user/blogs/{id} (update blog)
- DELETE /api/user/blogs/{id} (delete blog)
- POST /api/user/blogs/{id}/publish (publish blog)
- POST /api/blogs/upload-image (upload image)

### Frontend Testing Instructions
Test the blog editor functionality:
- Create new blog
- Save as draft
- Publish blog
- Upload images
- Preview functionality
- SEO settings
- JSON-LD editor

### Incorporate User Feedback
- Users want best-of-both-worlds editor (rich text + markdown)
- Side-by-side real-time preview with close option
- Advanced JSON-LD raw editor
- Local image storage
- Medium.com-like UX for non-tech users